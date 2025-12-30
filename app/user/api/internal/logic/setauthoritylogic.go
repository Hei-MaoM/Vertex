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

type SetAuthorityLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSetAuthorityLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SetAuthorityLogic {
	return &SetAuthorityLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SetAuthorityLogic) SetAuthority(req *types.SetAuthorityReq) (resp *types.SetAuthorityResp, err error) {
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uint64(req.Id))
	if err != nil {
		return &types.SetAuthorityResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	if req.Authority != 1 && req.Authority != 2 {
		return &types.SetAuthorityResp{
			Status: errno.Error,
			Msg:    "参数错误",
		}, nil
	}
	user.Authority = req.Authority
	_ = l.svcCtx.UserModel.Update(l.ctx, user)
	return &types.SetAuthorityResp{
		Status: errno.Success,
		Msg:    errno.GetMsg(errno.Success),
		Data:   "修改成功",
	}, nil

	return
}
