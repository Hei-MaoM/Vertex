package model

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UsersModel = (*customUsersModel)(nil)

type (
	// UsersModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUsersModel.
	UsersModel interface {
		usersModel
		UpdateCollectCount(ctx context.Context, uid uint64, delta int) error
		UpdatePostCount(ctx context.Context, uid uint64, delta int) error
		UpdateSolveCount(ctx context.Context, uid uint64, delta int) error
		FindTopCollect(ctx context.Context) ([]*Users, error)
	}

	customUsersModel struct {
		*defaultUsersModel
	}
)

// NewUsersModel returns a model for the database table.
func NewUsersModel(conn sqlx.SqlConn, c cache.CacheConf, expire time.Duration, opts ...cache.Option) UsersModel {
	return &customUsersModel{
		defaultUsersModel: newUsersModel(conn, c, cache.WithExpiry(expire)),
	}
}

func (m *customUsersModel) UpdateCollectCount(ctx context.Context, uid uint64, delta int) error {
	query := fmt.Sprintf("UPDATE users SET collect_cnt = collect_cnt + ? WHERE id = ?")
	_, err := m.ExecCtx(ctx, func(ctx context.Context, conn sqlx.SqlConn) (sql.Result, error) {
		return conn.ExecCtx(ctx, query, delta, uid)
	})
	return err
}
func (m *customUsersModel) UpdatePostCount(ctx context.Context, uid uint64, delta int) error {
	query := fmt.Sprintf("UPDATE users SET post_cnt = post_cnt + ? WHERE id = ?")
	_, err := m.ExecCtx(ctx, func(ctx context.Context, conn sqlx.SqlConn) (sql.Result, error) {
		return conn.ExecCtx(ctx, query, delta, uid)
	})
	return err
}
func (m *customUsersModel) UpdateSolveCount(ctx context.Context, uid uint64, delta int) error {
	query := fmt.Sprintf("UPDATE users SET solve_cnt = solve_cnt + ? WHERE id = ?")
	_, err := m.ExecCtx(ctx, func(ctx context.Context, conn sqlx.SqlConn) (sql.Result, error) {
		return conn.ExecCtx(ctx, query, delta, uid)
	})
	return err
}

func (m *customUsersModel) FindTopCollect(ctx context.Context) ([]*Users, error) {
	query := fmt.Sprintf("select * from %s order by collect_cnt desc limit 20", m.table)
	var res []*Users
	err := m.QueryRowsNoCacheCtx(ctx, &res, query)
	return res, err
}
