// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"context"
	"encoding/json"

	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DeletePostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDeletePostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeletePostLogic {
	return &DeletePostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DeletePostLogic) DeletePost(req *types.DeleProblemIdReq) (resp *types.CommonResp, err error) {
	userId, err := l.ctx.Value("id").(json.Number).Int64()
	if err != nil {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	problem, err := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(req.Id))
	if err != nil {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	if uint64(userId) != problem.UserId {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	l.svcCtx.ProblemPostModel.Delete(l.ctx, uint64(req.Id))
	if problem.Status == 1 {
		streamKey := "stream:post"
		message := map[string]interface{}{
			"user_id": problem.UserId,
			"action":  "remove",
		}
		_, err = l.svcCtx.Redis.XAddCtx(l.ctx, streamKey, false, "*", message)
	}
	return &types.CommonResp{
		Status: 200,
		Msg:    "ok",
	}, nil
}
