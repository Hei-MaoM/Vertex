// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/user/api/internal/config"
	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"
	"Vertex/pkg/errno"
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/logx"
)

type SendEmailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSendEmailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SendEmailLogic {
	return &SendEmailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SendEmailLogic) SendEmail(req *types.SendEmailReq) (resp *types.CommonResp, err error) {
	// todo: add your logic here and delete this line
	limitKey := fmt.Sprintf("Vertex:Email:Limit:%s", req.Email)
	exist, _ := l.svcCtx.Redis.Exists(limitKey)
	if exist {
		return &types.CommonResp{Status: errno.Error, Msg: "发送过于频繁"}, nil
	}
	code := l.svcCtx.EmailSender.CreateCode(req.Email)
	authKey := fmt.Sprintf("Vertex:Email:Auth:%s", req.Email)
	err = l.svcCtx.Redis.Setex(authKey, code, 15*60)
	if err != nil {
		l.Logger.Errorf("Redis set error: %v", err)
		return &types.CommonResp{Status: errno.ErrorDatabase, Msg: "系统错误"}, nil
	}
	typeKey := fmt.Sprintf("Vertex:Email:Type:%s", req.Email)
	err = l.svcCtx.Redis.Setex(typeKey, fmt.Sprintf("%d", req.OperationType), 15*60)
	if err != nil {
		l.Logger.Errorf("Redis set error: %v", err)
		return &types.CommonResp{Status: errno.ErrorDatabase, Msg: "系统错误"}, nil
	}
	err = l.svcCtx.Redis.Setex(limitKey, "1", 60)
	if err != nil {
		l.Logger.Errorf("Redis set error: %v", err)
		return &types.CommonResp{Status: errno.ErrorDatabase, Msg: "系统错误"}, nil
	}
	var Type string
	switch req.OperationType {
	case 1:
		Type = "注册账号"
	case 2:
		Type = "换绑邮箱"
	case 3:
		Type = "修改密码"
	}
	body := fmt.Sprintf(config.EmailTemplate, Type, code)
	err = l.svcCtx.EmailSender.SendCode(req.Email, body)
	if err != nil {
		l.Logger.Errorf("Send email error: %v", err)
		return &types.CommonResp{Status: 500, Msg: "邮件发送失败", Error: err.Error()}, nil
	}
	return &types.CommonResp{
		Status: errno.Success,
		Msg:    "验证码发送成功",
	}, nil

}
