// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetRecommendLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetRecommendLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetRecommendLogic {
	return &GetRecommendLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetRecommendLogic) GetRecommend(req *types.RecommendReq) (resp *types.ListResp, err error) {
	var userId int64
	if uidJson, ok := l.ctx.Value("id").(json.Number); ok {
		userId, _ = uidJson.Int64()
	}
	rand.Seed(time.Now().UnixNano())
	var resultIds []int64
	mp := make(map[int64]bool)
	if userId > 0 {
		key := fmt.Sprintf("user:pref:%d", userId)
		userPrefs, err := l.svcCtx.Redis.HgetallCtx(l.ctx, key)
		if err == nil && len(userPrefs) > 0 {
			finalWeights := make(map[string]float64)
			allCategories := []string{"数据结构", "动态规划", "图论", "数学", "搜索", "字符串", "杂项", "基础算法", "计算几何"}
			for _, cat := range allCategories {
				w := 0.1
				if valStr, ok := userPrefs[cat]; ok {
					val, _ := strconv.ParseFloat(valStr, 64)
					w += val
				}
				finalWeights[cat] = w
			}
			for myCat, myWeight := range finalWeights {
				if myWeight < 2.0 {
					continue
				}

				for targetCat := range finalWeights {
					if myCat == targetCat {
						continue
					}

					simKey := fmt.Sprintf("%s:%s", myCat, targetCat)
					simStr, _ := l.svcCtx.Redis.HgetCtx(l.ctx, "rec:similarity", simKey)

					if simStr != "" {
						sim, _ := strconv.ParseFloat(simStr, 64)
						boost := myWeight * sim * 0.5
						finalWeights[targetCat] += boost
					}
				}
			}
			var cnt int
			for float64(len(resultIds)) < float64(req.Count)/4.0*3 && cnt < 40 {
				cnt += 1
				var totalW float64
				for _, w := range finalWeights {
					totalW += w
				}

				r := rand.Float64() * totalW
				var cur float64
				var selectedCat string

				for cat, w := range finalWeights {
					cur += w
					if r <= cur {
						selectedCat = cat
						break
					}
				}
				tag, _ := l.svcCtx.TagModel.FindByCategory(l.ctx, selectedCat)

				rr := rand.Intn(len(tag))
				var cntt int
				if *tag[rr] != "" {
					log.Println(*tag[rr])
					ids, _ := l.svcCtx.ProblemPostModel.FindByTag(l.ctx, *tag[rr], req.Count)
					if len(ids) > 0 {
						for _, p := range ids {
							if mp[*p] == false {
								resultIds = append(resultIds, *p)
								mp[*p] = true
								cntt += 1
								if cntt >= 5 {
									break
								}
							}

						}
					}
				}
			}

		}
	}
	if len(resultIds) < req.Count {
		ids, _ := l.svcCtx.ProblemPostModel.FindRecentIds(l.ctx, req.Count-len(resultIds))
		for _, p := range ids {
			if mp[*p] == false && len(resultIds) < req.Count {
				resultIds = append(resultIds, *p)
				mp[*p] = true
			}
		}
	}

	if len(resultIds) < req.Count {
		pairs, _ := l.svcCtx.Redis.ZrevrangeWithScoresCtx(l.ctx, "rec:hot_rank", 0, int64(req.Count-len(resultIds)-1))
		for _, p := range pairs {
			id, _ := strconv.ParseInt(p.Key, 10, 64)
			if mp[id] == false && len(resultIds) < req.Count {
				resultIds = append(resultIds, id)
				mp[id] = true
			}
		}
	}

	var posts []types.ProblemPost

	for _, id := range resultIds {
		post, err := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(id))
		problem, err := l.svcCtx.ProblemModel.FindOne(l.ctx, post.ProblemId)
		if err == nil {
			posts = append(posts, types.ProblemPost{
				Id:       int64(post.Id),
				Title:    post.Title,
				Source:   problem.Source,
				Tags:     post.TagsStr,
				AuthorId: int64(post.UserId),
			})
		}
	}

	return &types.ListResp{
		Status: 0,
		Msg:    "success",
		Total:  int64(len(posts)),
		Data:   posts,
	}, nil
}
