package model

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ ProblemModel = (*customProblemModel)(nil)

type (
	// ProblemModel is an interface to be customized, add more methods here,
	// and implement the added methods in customProblemModel.
	ProblemModel interface {
		problemModel
		UpdateSolveCount(ctx context.Context, id uint64, delta int) error
	}

	customProblemModel struct {
		*defaultProblemModel
	}
)

// NewProblemModel returns a model for the database table.
func NewProblemModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) ProblemModel {
	return &customProblemModel{
		defaultProblemModel: newProblemModel(conn, c, opts...),
	}
}
func (m *customProblemModel) UpdateSolveCount(ctx context.Context, id uint64, delta int) error {
	query := fmt.Sprintf("UPDATE problem_post SET solve_num = solve_num + ? WHERE id = ?")
	_, err := m.ExecCtx(ctx, func(ctx context.Context, conn sqlx.SqlConn) (sql.Result, error) {
		return conn.ExecCtx(ctx, query, delta, id)
	})
	return err
}
