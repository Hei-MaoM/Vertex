// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateInfoLogic {
	return &UpdateInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateInfoLogic) UpdateInfo(req *types.UpdateInfoReq) (resp *types.UpdateInfoResp, err error) {
	val := l.ctx.Value("id")
	usernum, ok := val.(json.Number)
	if !ok {
		return nil, errors.New(fmt.Sprintf("密钥错误"))
	}
	userid, _ := usernum.Int64()
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uint64(userid))
	if err != nil {
		return &types.UpdateInfoResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	user.Avatar = req.Avatar
	_ = l.svcCtx.UserModel.Update(l.ctx, user)
	return &types.UpdateInfoResp{
		Status: errno.Success,
		Msg:    errno.GetMsg(errno.Success),
		Data:   "修改成功",
	}, nil
}
