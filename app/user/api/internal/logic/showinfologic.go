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

type ShowInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewShowInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ShowInfoLogic {
	return &ShowInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ShowInfoLogic) ShowInfo(req *types.UserInfoReq) (resp *types.UserInfoResp, err error) {
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uint64(req.Id))
	if err != nil {
		return &types.UserInfoResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	user.Email = "不告诉你"
	return &types.UserInfoResp{
		Status: errno.Success,
		Msg:    "ok",
		Data: types.UserInfo{
			Id:        int64(user.Id),
			Username:  user.Username,
			Email:     user.Email,
			Authority: user.Authority,
			Status:    user.Status,
			Avatar:    user.Avatar,
			CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
		},
	}, nil
}
