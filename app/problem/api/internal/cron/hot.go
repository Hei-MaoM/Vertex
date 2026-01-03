package cron

import (
	"Vertex/app/problem/api/internal/svc"
	"context"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/zeromicro/go-zero/core/logx"
)

type HotJob struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewHotJob(ctx context.Context, svcCtx *svc.ServiceContext) *HotJob {
	return &HotJob{
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

const getAndDelScript = `
    local data = redis.call('HGETALL', KEYS[1])
    redis.call('DEL', KEYS[1])
    return data
`
const getScoreAndDelScript = `
            local s = redis.call('HGET', KEYS[1], 'score')
            redis.call('DEL', KEYS[1])
            return s
        `

func (j *HotJob) Run() {
	logx.Info("开始帖子热度维护")
	problemIds, _ := j.svcCtx.Redis.SpopCtx(j.ctx, "task:ripple:problems")
	for _, pid := range problemIds {
		activeKey := fmt.Sprintf("active_problem:%d", pid)
		resp, err := j.svcCtx.Redis.EvalCtx(j.ctx, getScoreAndDelScript, []string{activeKey})
		if err != nil {
			logx.Errorf("Ripple Lua error: %v", err)
			continue
		}

		// 解析返回值 (可能为 nil)
		if resp == nil {
			continue
		}

		scoreStr, ok := resp.(string)
		if !ok {
			continue
		}

		res, _ := strconv.ParseFloat(scoreStr, 64)

		if res > 0 {
			postIds, _ := j.svcCtx.ProblemPostModel.FindPostsByProblemId(j.ctx, int64(pid))
			for _, postid := range postIds {
				key := fmt.Sprintf("problem:score:%d", postid)
				j.svcCtx.Redis.HincrbyFloatCtx(j.ctx, key, "solve", res)
			}
		}
	}
	items, _ := j.svcCtx.Redis.ZrangebyscoreWithScoresByFloatCtx(j.ctx, "rec:hot_rank", 0, -1)
	decayFactor := 0.99
	for _, item := range items {
		newScore := item.Score * decayFactor
		j.svcCtx.Redis.ZaddFloatCtx(j.ctx, "rec:hot_rank", newScore, item.Key)
	}
	cursor := uint64(0)
	for {
		keys, next, err := j.svcCtx.Redis.ScanCtx(
			j.ctx, cursor, "problem:score:*", 50)
		if err != nil {
			break
		}
		for _, key := range keys {
			parts := strings.Split(key, ":")
			if len(parts) < 3 {
				continue
			}
			postId := parts[2]
			resp, err := j.svcCtx.Redis.EvalCtx(j.ctx, getAndDelScript, []string{key})
			if err != nil {
				logx.Errorf("Lua GetDel error: %v", err)
				continue
			}
			dataList, ok := resp.([]interface{})
			if !ok || len(dataList) == 0 {
				continue
			}
			var deltaScore float64
			for i := 0; i < len(dataList); i += 2 {
				field := dataList[i].(string)
				valueStr := dataList[i+1].(string)
				val, _ := strconv.ParseFloat(valueStr, 64)

				switch field {
				case "view":
					deltaScore += math.Log10(val + 1)
				case "collect":
					deltaScore += val
				case "solve":
					deltaScore += val
				}
			}
			v, err := j.svcCtx.Redis.ZscoreByFloatCtx(
				j.ctx,
				"rec:hot_rank",
				postId,
			)
			if err != nil {
				continue
			}
			j.svcCtx.Redis.ZaddFloatCtx(j.ctx, "rec:hot_rank", deltaScore+v, postId)
			pid, _ := strconv.ParseInt(postId, 10, 64)
			j.svcCtx.ProblemPostModel.UpdateScore(j.ctx, uint64(pid), deltaScore+v)
		}
		if next == 0 {
			break
		}
		cursor = next
	}
	key := "rec:hot_rank"
	maxKeep := int64(20000)

	total, err := j.svcCtx.Redis.ZcardCtx(j.ctx, key)
	if err == nil && int64(total) > maxKeep {
		// ZREMRANGEBYRANK 是按分数从低到高排名的 (0 是最低分)
		// 我们要移除：从 0 到 (total - maxKeep - 1)
		// 比如 total=20001, keep=20000. remove 0~0 (移除了最低分的那个)
		removeEnd := int64(total) - maxKeep - 1

		j.svcCtx.Redis.ZremrangebyrankCtx(j.ctx, key, 0, removeEnd)

		logx.Infof("Triggered Cap: Removed %d cold posts from Redis", removeEnd+1)
	}
	logx.Info("帖子热度成功")
}
