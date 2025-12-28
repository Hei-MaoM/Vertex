package model

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ ProblemPostModel = (*customProblemPostModel)(nil)

type (
	// ProblemPostModel is an interface to be customized, add more methods here,
	// and implement the added methods in customProblemPostModel.
	ProblemPostModel interface {
		problemPostModel
	}

	customProblemPostModel struct {
		*defaultProblemPostModel
	}
)

// NewProblemPostModel returns a model for the database table.
func NewProblemPostModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) ProblemPostModel {
	return &customProblemPostModel{
		defaultProblemPostModel: newProblemPostModel(conn, c, opts...),
	}
}
