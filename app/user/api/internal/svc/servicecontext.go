// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package svc

import (
	"Vertex/app/user/api/internal/config"
	"Vertex/app/user/api/internal/middleware"
	"Vertex/app/user/model"
	"Vertex/pkg/email"

	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config          config.Config
	UserModel       model.UsersModel
	Redis           *redis.Redis
	EmailSender     *email.EmailSender
	AdminCheck      rest.Middleware
	SuperAdminCheck rest.Middleware
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	rds := redis.MustNewRedis(c.Redis)
	emailConf := &email.Config{
		Host:     c.Email.SmtpHost,
		Port:     c.Email.SmtpPort,
		Username: c.Email.SmtpEmail,
		Password: c.Email.SmtpPass,
		From:     c.Email.FromName,
	}

	return &ServiceContext{
		Config:          c,
		UserModel:       model.NewUsersModel(conn, c.CacheRedis),
		Redis:           rds,
		EmailSender:     email.NewEmailSender(emailConf),
		AdminCheck:      middleware.NewAdminCheckMiddleware().Handle,
		SuperAdminCheck: middleware.NewSuperAdminCheckMiddleware().Handle,
	}
}
