// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"Vertex/app/problem/model"
	"Vertex/pkg/errno"
	"context"
	"encoding/json"

	"github.com/zeromicro/go-zero/core/logx"
)

type CollectLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCollectLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CollectLogic {
	return &CollectLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CollectLogic) Collect(req *types.CollectReq) (resp *types.CommonResp, err error) {
	userId, err := l.ctx.Value("id").(json.Number).Int64()
	if err != nil {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	if req.Action == "add" {
		_, err = l.svcCtx.UserCollectModel.Insert(l.ctx, &model.UserCollect{
			UserId:   uint64(userId),
			TargetId: uint64(req.Id),
		})
		if err != nil {
			return &types.CommonResp{
				Status: errno.ErrorDatabase,
				Msg:    errno.GetMsg(errno.ErrorDatabase),
				Error:  err.Error(),
			}, nil
		}
		l.svcCtx.ProblemPostModel.UpdateCollectCount(l.ctx, uint64(req.Id), 1)
	} else {
		collect, err := l.svcCtx.UserCollectModel.FindOneByUserIdTargetId(l.ctx, uint64(userId), uint64(req.Id))
		if err != nil {
			return &types.CommonResp{
				Status: 500,
				Msg:    "错误",
				Error:  err.Error(),
			}, nil
		}
		err = l.svcCtx.UserCollectModel.Delete(l.ctx, collect.Id)
		if err != nil {
			return &types.CommonResp{
				Status: errno.ErrorDatabase,
				Msg:    errno.GetMsg(errno.ErrorDatabase),
				Error:  err.Error(),
			}, nil
		}
		l.svcCtx.ProblemPostModel.UpdateCollectCount(l.ctx, uint64(req.Id), -1)
	}
	streamKey := "stream:collection"
	problem, _ := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(req.Id))

	message := map[string]interface{}{
		"user_id": problem.UserId,
		"action":  req.Action, // "add" or "remove"

	}
	_, err = l.svcCtx.Redis.XAddCtx(l.ctx, streamKey, false, "*", message)
	return &types.CommonResp{
		Status: 200,
		Msg:    "ok",
	}, nil
}
