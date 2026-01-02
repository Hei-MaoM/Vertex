package cron

import (
	"Vertex/app/user/api/internal/svc"
	"context"
	"encoding/json"

	"github.com/zeromicro/go-zero/core/logx"
)

type LeaderboardJob struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLeaderboardJob(ctx context.Context, svcCtx *svc.ServiceContext) *LeaderboardJob {
	return &LeaderboardJob{
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (j *LeaderboardJob) Run() {
	logx.Info("开始执行排行榜更新任务...")

	users, err := j.svcCtx.UserModel.FindTopCollect(j.ctx)
	if err != nil {
		logx.Errorf("排行榜任务查询数据库失败: %v", err)
		return
	}

	var rankList []map[string]interface{}

	for i, u := range users {
		rankList = append(rankList, map[string]interface{}{
			"rank":       i + 1,
			"id":         u.Id,
			"username":   u.Username,
			"avatar":     u.Avatar,
			"CollectCnt": u.CollectCnt,
		})
	}

	data, err := json.Marshal(rankList)
	if err != nil {
		logx.Errorf("序列化排行榜失败: %v", err)
		return
	}

	err = j.svcCtx.Redis.Set("biz:leaderboard", string(data))
	if err != nil {
		logx.Errorf("更新 Redis 排行榜失败: %v", err)
		return
	}

	logx.Infof("排行榜更新成功，共更新 %d 条数据", len(rankList))
}
