package model

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UserSolvedModel = (*customUserSolvedModel)(nil)

type (
	// UserSolvedModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUserSolvedModel.
	UserSolvedModel interface {
		userSolvedModel
	}

	customUserSolvedModel struct {
		*defaultUserSolvedModel
	}
)

// NewUserSolvedModel returns a model for the database table.
func NewUserSolvedModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) UserSolvedModel {
	return &customUserSolvedModel{
		defaultUserSolvedModel: newUserSolvedModel(conn, c, opts...),
	}
}
