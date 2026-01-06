package model

import (
	"context"

	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UserSolvedModel = (*customUserSolvedModel)(nil)

type (
	// UserSolvedModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUserSolvedModel.
	UserSolvedModel interface {
		userSolvedModel
		FindRecentUserHistory(ctx context.Context) ([]*UserCategoryLog, error)
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

type UserCategoryLog struct {
	UserId  int64
	TagsStr string
}

func (m *customUserSolvedModel) FindRecentUserHistory(ctx context.Context) ([]*UserCategoryLog, error) {
	query := `
        SELECT s.user_id, p.tags_str 
        FROM user_solve s 
        JOIN problem p ON s.problem_id = p.id 
        WHERE s.create_time > DATE_SUB(NOW(), INTERVAL 24 HOUR) 
        AND p.tags_str != ''
    `
	var resp []*UserCategoryLog
	err := m.QueryRowsNoCacheCtx(ctx, &resp, query)
	return resp, err
}
