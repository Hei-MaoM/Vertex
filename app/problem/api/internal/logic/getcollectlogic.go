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

type GetCollectLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCollectLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCollectLogic {
	return &GetCollectLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCollectLogic) GetCollect(req *types.GetProblemIdReq) (resp *types.CommonResp, err error) {
	userId, err := l.ctx.Value("id").(json.Number).Int64()
	if err != nil {
		return &types.CommonResp{
			Status: 500,
			Msg:    "错误",
			Error:  err.Error(),
		}, nil
	}
	problemId := req.Id
	_, err = l.svcCtx.UserCollectModel.FindOneByUserIdTargetId(l.ctx, uint64(userId), uint64(problemId))
	if err != nil {
		logx.Error(err.Error())
		return &types.CommonResp{
			Status: 200,
			Msg:    "ok",
			Data:   false,
		}, nil
	} else {
		return &types.CommonResp{
			Status: 200,
			Msg:    "ok",
			Data:   true,
		}, nil
	}

}
