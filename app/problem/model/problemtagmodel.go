package model

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ ProblemTagModel = (*customProblemTagModel)(nil)

type (
	// ProblemTagModel is an interface to be customized, add more methods here,
	// and implement the added methods in customProblemTagModel.
	ProblemTagModel interface {
		problemTagModel
	}

	customProblemTagModel struct {
		*defaultProblemTagModel
	}
)

// NewProblemTagModel returns a model for the database table.
func NewProblemTagModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) ProblemTagModel {
	return &customProblemTagModel{
		defaultProblemTagModel: newProblemTagModel(conn, c, opts...),
	}
}
