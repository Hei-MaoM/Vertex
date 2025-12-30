// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"

	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type SetStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSetStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SetStatusLogic {
	return &SetStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SetStatusLogic) SetStatus(req *types.SetStatusReq) (resp *types.SetStatusResp, err error) {
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uint64(req.Id))
	if err != nil {
		return &types.SetStatusResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	user.Status = req.Status
	_ = l.svcCtx.UserModel.Update(l.ctx, user)
	return &types.SetStatusResp{
		Status: errno.Success,
		Msg:    errno.GetMsg(errno.Success),
		Data:   "修改成功",
	}, nil
}
