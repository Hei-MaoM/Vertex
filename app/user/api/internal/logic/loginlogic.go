// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/user/api/internal/config"
	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"
	"Vertex/pkg/errno"
	"Vertex/pkg/util"
	"context"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	// todo: add your logic here and delete this line
	code := errno.Success
	fmt.Println(req.UserName)
	if req.UserName == "" || req.Password == "" {
		code = errno.ErrorParameter
		return &types.LoginResp{
			Status: errno.ErrorParameter,
			Msg:    errno.GetMsg(code),
			Error:  "参数有误",
		}, nil
	}
	user, err := l.svcCtx.UserModel.FindOneByUsername(l.ctx, req.UserName)
	if err != nil {
		code = errno.ErrorUserNotFound
		return &types.LoginResp{
			Status: errno.ErrorParameter,
			Msg:    errno.GetMsg(code),
			Error:  "用户不存在",
		}, nil
	}
	if !util.CheckPassword(req.Password, user.Password) {
		code = errno.ErrorPasswordIncorrect
		return &types.LoginResp{
			Status: errno.ErrorParameter,
			Msg:    errno.GetMsg(code),
			Error:  "密码错误",
		}, nil
	}
	token, err := util.GenerateToken(uint(user.Id), user.Username, int(user.Authority), l.svcCtx.Config.Auth.AccessSecret, l.svcCtx.Config.Auth.AccessExpire)
	if err != nil {
		code = errno.ErrorTokenGenerate
		return &types.LoginResp{
			Status: errno.ErrorParameter,
			Msg:    errno.GetMsg(code),
			Error:  err.Error(),
		}, nil
	}
	expireDuration := config.TokenExpireDuration * time.Hour
	expiresAt := time.Now().Add(expireDuration).Unix()
	return &types.LoginResp{
		Status: errno.Success,
		Msg:    "登录成功",
		Data: types.TokenPayload{
			Token: token,
			User: types.User{
				Id:        int64(user.Id),
				UserName:  user.Username,
				Email:     user.Email,
				Avatar:    user.Avatar,
				Status:    int32(user.Status),
				Authority: int32(user.Authority),
				CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
			},
			ExpiresIn: expiresAt,
		},
	}, nil
}
