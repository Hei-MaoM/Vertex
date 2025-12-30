package model

import (
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ ProblemPostModel = (*customProblemPostModel)(nil)

type (
	// ProblemPostModel is an interface to be customized, add more methods here,
	// and implement the added methods in customProblemPostModel.
	ProblemPostModel interface {
		problemPostModel
		FindApproved(ctx context.Context, page, pageSize int64) ([]*ProblemPost, error)
		FindNotApproved(ctx context.Context, page, pageSize int64) ([]*ProblemPost, error)
		CountPending(ctx context.Context) (int64, error)
		CountProbleming(ctx context.Context) (int64, error)
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
func (m *customProblemPostModel) CountPending(ctx context.Context) (int64, error) {
	query := fmt.Sprintf("select count(*) from %s where `status` = 0", m.table)
	var count int64
	err := m.QueryRowNoCacheCtx(ctx, &count, query)
	return count, err
}
func (m *customProblemPostModel) CountProbleming(ctx context.Context) (int64, error) {
	query := fmt.Sprintf("select count(*) from %s where `status` = 1", m.table)
	var count int64
	err := m.QueryRowNoCacheCtx(ctx, &count, query)
	return count, err
}
func (m *customProblemPostModel) FindNotApproved(ctx context.Context, page, pageSize int64) ([]*ProblemPost, error) {
	offset := (page - 1) * pageSize
	query := fmt.Sprintf("select %s from %s where `status` = ? order by id desc limit ?, ?", problemPostRows, m.table)
	var resp []*ProblemPost
	if err := m.QueryRowsNoCacheCtx(ctx, &resp, query, 0, offset, pageSize); err != nil {
		return nil, err
	}
	return resp, nil
}
func (m *customProblemPostModel) FindApproved(ctx context.Context, page, pageSize int64) ([]*ProblemPost, error) {
	offset := (page - 1) * pageSize
	query := fmt.Sprintf("select %s from %s where `status` = ? order by id desc limit ?, ?", problemPostRows, m.table)
	var resp []*ProblemPost
	if err := m.QueryRowsNoCacheCtx(ctx, &resp, query, 1, offset, pageSize); err != nil {
		return nil, err
	}
	return resp, nil
}
