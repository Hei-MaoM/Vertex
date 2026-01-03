// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"Vertex/app/problem/model"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type SolveLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSolveLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SolveLogic {
	return &SolveLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SolveLogic) Solve(req *types.ProblemIdReq) (resp *types.CommonResp, err error) {
	userId, err := l.ctx.Value("id").(json.Number).Int64()
	if err != nil {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	problem := req.Id
	l.svcCtx.UserSolvedModel.Insert(l.ctx, &model.UserSolved{
		UserId:    uint64(userId),
		ProblemId: uint64(problem),
		CreatedAt: time.Time{},
	})
	streamKey := "stream:solve"
	m := make(map[string]struct{}, 0)
	tags := make([]string, 0)
	pro, err := l.svcCtx.ProblemModel.FindOne(l.ctx, uint64(problem))
	if err != nil {
		logx.Error(err.Error())
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	tag := strings.Split(pro.TagsStr, ",")
	for _, res := range tag {
		ttag, _ := l.svcCtx.TagModel.FindOneByName(l.ctx, res)
		if _, ok := m[ttag.Category]; !ok {
			m[ttag.Category] = struct{}{}
			tags = append(tags, ttag.Category)
		}

	}
	message := map[string]interface{}{
		"user_id": userId,
		"action":  "add",
		"tag":     tags,
	}
	_, err = l.svcCtx.Redis.XAddCtx(l.ctx, streamKey, false, "*", message)
	l.svcCtx.ProblemModel.UpdateSolveCount(l.ctx, uint64(problem), 1)
	key := fmt.Sprintf("problem:score:%d", req.PostId)
	l.svcCtx.Redis.HincrbyFloatCtx(l.ctx, key, "solve", 25.0)
	key = fmt.Sprintf("task:ripple:problems")
	l.svcCtx.Redis.SaddCtx(l.ctx, key, req.Id)
	key = fmt.Sprintf("active_problem:%d", req.Id)
	// 每次打卡，给这个题目积攒 1.0 分的活跃值
	l.svcCtx.Redis.HincrbyFloatCtx(l.ctx, key, "solve", 5.0)
	return &types.CommonResp{
		Status: 200,
		Msg:    "ok",
	}, nil
}
