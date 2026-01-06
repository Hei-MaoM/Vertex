package cron

import (
	"Vertex/app/problem/api/internal/svc"
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/zeromicro/go-zero/core/logx"
)

type SimilarityJob struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSimilarityJob(ctx context.Context, svcCtx *svc.ServiceContext) *SimilarityJob {
	return &SimilarityJob{
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}
func unique(arr []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range arr {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
func (j *SimilarityJob) Run() {
	logx.Info("开始计算关联矩阵")
	logs, _ := j.svcCtx.UserSolvedModel.FindRecentUserHistory(j.ctx)
	userInterests := make(map[int64]map[string]bool)
	for _, log := range logs {
		if _, ok := userInterests[log.UserId]; !ok {
			userInterests[log.UserId] = make(map[string]bool)
		}

		tags := strings.Split(log.TagsStr, ",")
		for _, t := range tags {
			cat := strings.TrimSpace(t)
			if cat != "" {
				userInterests[log.UserId][cat] = true
			}
		}
	}
	mp := make(map[string]map[string]int)

	for _, interestSet := range userInterests {
		var cats []string
		for c := range interestSet {
			cats = append(cats, c)
		}
		cats = unique(cats)
		for i := 0; i < len(cats); i++ {
			u := cats[i]
			for k := i + 1; k < len(cats); k++ {
				v := cats[k]

				if mp[u] == nil {
					mp[u] = make(map[string]int)
				}
				if mp[v] == nil {
					mp[v] = make(map[string]int)
				}

				mp[u][v]++
				mp[v][u]++
			}
		}
	}
	allKeys, _ := j.svcCtx.Redis.HgetallCtx(j.ctx, "rec:similarity")
	for field, valStr := range allKeys {
		val, _ := strconv.ParseFloat(valStr, 64)
		decayedVal := val * 0.99
		if decayedVal < 0.01 {
			j.svcCtx.Redis.HdelCtx(j.ctx, "rec:similarity", field)
		} else {
			j.svcCtx.Redis.HsetCtx(j.ctx, "rec:similarity", field, fmt.Sprintf("%.4f", decayedVal))
		}
	}
	for catA, related := range mp {
		for catB, count := range related {
			field := fmt.Sprintf("%s:%s", catA, catB)

			increment := float64(count) / float64(len(userInterests))

			j.svcCtx.Redis.HincrbyFloatCtx(j.ctx, "rec:similarity", field, increment)
		}
	}

	logx.Info("关联矩阵更新完成")
}
