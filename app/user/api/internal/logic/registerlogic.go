// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"
	model2 "Vertex/app/user/model"
	"Vertex/pkg/errno"
	"Vertex/pkg/util"
	"context"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type RegisterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRegisterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RegisterLogic {
	return &RegisterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RegisterLogic) Register(req *types.RegisterReq) (resp *types.RegisterResp, err error) {
	authKey := fmt.Sprintf("Vertex:Email:Auth:%s", req.Email)
	code, err := l.svcCtx.Redis.Get(authKey)
	if err != nil || code != req.Code {
		return &types.RegisterResp{Status: errno.ErrorCodeInvalid, Msg: errno.GetMsg(errno.ErrorCodeInvalid)}, nil
	}
	_, err = l.svcCtx.UserModel.FindOneByEmail(l.ctx, req.Email)
	if err == nil {
		return &types.RegisterResp{Status: errno.ErrorEmailExist, Msg: errno.GetMsg(errno.ErrorEmailExist)}, nil
	} else if err != model2.ErrNotFound {
		return nil, err // 数据库报错
	}
	_, err = l.svcCtx.UserModel.FindOneByUsername(l.ctx, req.UserName)
	if err == nil {
		return &types.RegisterResp{Status: errno.ErrorNameExist, Msg: errno.GetMsg(errno.ErrorNameExist)}, nil
	} else if err != model2.ErrNotFound {
		return nil, err // 数据库报错
	}
	pwd, err := util.HashPassword(req.Password)
	if err != nil {
		return &types.RegisterResp{Status: errno.Error, Msg: "密码加密失败"}, nil
	}
	newUser := &model2.Users{
		Username:  req.UserName,
		Password:  pwd,
		Email:     req.Email,
		Avatar:    "",
		Authority: 1,
		Status:    1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	res, err := l.svcCtx.UserModel.Insert(l.ctx, newUser)
	if err != nil {
		return &types.RegisterResp{Status: errno.ErrorDatabase, Msg: errno.GetMsg(errno.ErrorDatabase), Error: err.Error()}, nil
	}
	_, _ = l.svcCtx.Redis.Del(authKey)
	nID, _ := res.LastInsertId()
	return &types.RegisterResp{
		Status: errno.Success,
		Msg:    "注册成功",
		Data: types.User{
			Id:        nID,
			UserName:  newUser.Username,
			Email:     newUser.Email,
			Avatar:    newUser.Avatar,
			Authority: int32(newUser.Authority),
			Status:    int32(newUser.Status),
			CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
		},
	}, nil
}
