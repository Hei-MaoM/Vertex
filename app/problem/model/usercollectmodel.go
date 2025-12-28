package model

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UserCollectModel = (*customUserCollectModel)(nil)

type (
	// UserCollectModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUserCollectModel.
	UserCollectModel interface {
		userCollectModel
	}

	customUserCollectModel struct {
		*defaultUserCollectModel
	}
)

// NewUserCollectModel returns a model for the database table.
func NewUserCollectModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) UserCollectModel {
	return &customUserCollectModel{
		defaultUserCollectModel: newUserCollectModel(conn, c, opts...),
	}
}
