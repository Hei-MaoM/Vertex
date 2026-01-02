// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/model"
	"context"
	"encoding/json"
	"time"

	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"

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

	message := map[string]interface{}{
		"user_id": userId,
		"action":  "add",
	}
	_, err = l.svcCtx.Redis.XAddCtx(l.ctx, streamKey, false, "*", message)
	return &types.CommonResp{
		Status: 200,
		Msg:    "ok",
	}, nil
}
