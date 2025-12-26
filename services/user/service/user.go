package service

import (
	"Vertex/pkg/database"
	email2 "Vertex/pkg/email"
	"Vertex/pkg/errno"
	"Vertex/pkg/serializer"
	"Vertex/services/user/config"
	//"Vertex/services/user/model"
	"context"
	"fmt"
	"time"
)

type UserService struct {
	UserName string `form:"user_name" json:"user_name" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
	Email    string `form:"email" json:"email" binding:"required"`
}

type SendEmailService struct {
	Email         string `json:"email" form:"email"`
	OperationType uint   `json:"operation_type" form:"operation_type"`
	//1.绑定邮箱 2.解绑邮箱 3.改密码
}

func (service *SendEmailService) SendEmail(ctx context.Context) serializer.Response {
	code := errno.Success
	if service.Email == "" {
		code = errno.ErrorParameter
		return serializer.Response{
			Status: code,
			Msg:    errno.GetMsg(code),
		}
	}
	email := email2.NewEmailSender(&email2.Config{
		Host:     config.Con.Email.SmtpHost,
		Port:     config.Con.Email.SmtpPort,
		Username: config.Con.Email.SmtpEmail,
		Password: config.Con.Email.SmtpPass,
		From:     config.Con.Email.FromName,
	})
	limitKey := fmt.Sprintf("Vertex:Email:Limit:%s", service.Email)
	if database.RDB.Exists(ctx, limitKey).Val() > 0 {
		code = errno.Error
		return serializer.Response{
			Status: code,
			Msg:    "验证码已发送，请稍后再试",
		}
	}
	eCode := email.CreateCode(service.Email)
	AuthEmail := fmt.Sprintf("Vertex:Email:Auth:%s", service.Email)
	err := database.RDB.Set(ctx, AuthEmail, eCode, 15*60*time.Second).Err()
	if err != nil {
		code = errno.Error
		return serializer.Response{
			Status: code,
			Msg:    errno.GetMsg(code),
		}
	}
	var Type string
	switch service.OperationType {
	case 1:
		Type = "绑定邮箱"
	case 2:
		Type = "解绑邮箱"
	case 3:
		Type = "修改密码"
	}
	body := "您正在" + Type + "您的验证码是：" + eCode + "，请勿泄露给他人使用，如非本人操作，请忽略本邮件,验证码十五分钟有效。"

	err = email.SendCode(service.Email, body)
	if err != nil {
		fmt.Println("send mail err:", err)
		code = errno.ErrorSendEmail
		return serializer.Response{
			Status: code,
			Msg:    errno.GetMsg(code),
			Error:  error.Error(err),
		}
	}

	database.RDB.Set(ctx, limitKey, "1", 60*time.Second)
	TypeEmail := fmt.Sprintf("Vertex:Email:Type:%s", service.Email)
	database.RDB.Set(ctx, TypeEmail, service.OperationType, 15*60*time.Second)
	return serializer.Response{
		Status: code,
		Msg:    "验证码发送成功",
	}

}
