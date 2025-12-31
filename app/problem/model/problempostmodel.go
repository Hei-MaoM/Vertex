package model

import (
	"context"
	"database/sql"
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
		UpdateViewNum(ctx context.Context, id, viewNum int64) error
		FindPosts(ctx context.Context, userId, status, page, pageSize int64) ([]*ProblemPost, int64, error)
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
func (m *customProblemPostModel) UpdateViewNum(ctx context.Context, id, viewNum int64) error {
	problemPostIdKey := fmt.Sprintf("%s%v", cacheProblemPostIdPrefix, id)
	_, err := m.ExecCtx(ctx, func(ctx context.Context, conn sqlx.SqlConn) (result sql.Result, err error) {
		query := fmt.Sprintf("update %s set view_num = ? where `id` = ?", m.table)
		return conn.ExecCtx(ctx, query, viewNum, id)
	}, problemPostIdKey)
	return err
}

func (m *customProblemPostModel) FindPosts(ctx context.Context, userId, status, page, pageSize int64) ([]*ProblemPost, int64, error) {
	where := "user_id = ?"
	args := []interface{}{userId}

	if status != -1 {
		where += " AND status = ?"
		args = append(args, status)
	}

	// 查总数
	var total int64
	countQuery := fmt.Sprintf("SELECT count(*) FROM %s WHERE %s", m.table, where)
	m.CachedConn.QueryRowNoCacheCtx(ctx, &total, countQuery, args...) // 注意: 用 NoCache 或者处理好缓存

	// 查列表
	offset := (page - 1) * pageSize
	query := fmt.Sprintf("SELECT %s FROM %s WHERE %s ORDER BY id DESC LIMIT ?, ?", problemPostRows, m.table, where)
	args = append(args, offset, pageSize)

	var resp []*ProblemPost
	err := m.CachedConn.QueryRowsNoCacheCtx(ctx, &resp, query, args...)

	return resp, total, err
}
