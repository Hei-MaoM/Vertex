// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package svc

import (
	"Vertex/app/problem/api/internal/config"
	"Vertex/app/problem/api/internal/middleware"
	"Vertex/app/problem/model"

	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config           config.Config
	AdminCheck       rest.Middleware
	Redis            *redis.Redis
	ProblemModel     model.ProblemModel
	ProblemPostModel model.ProblemPostModel
	TagModel         model.TagModel
	ProblemTagModel  model.ProblemTagModel
	UserCollectModel model.UserCollectModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	rds := redis.MustNewRedis(c.Redis)

	return &ServiceContext{
		Config:           c,
		Redis:            rds,
		ProblemModel:     model.NewProblemModel(conn, c.CacheRedis),
		ProblemPostModel: model.NewProblemPostModel(conn, c.CacheRedis),
		TagModel:         model.NewTagModel(conn, c.CacheRedis),
		ProblemTagModel:  model.NewProblemTagModel(conn, c.CacheRedis),
		UserCollectModel: model.NewUserCollectModel(conn, c.CacheRedis),
		AdminCheck:       middleware.NewAdminCheckMiddleware().Handle,
	}
}
