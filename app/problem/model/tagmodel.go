package model

import (
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ TagModel = (*customTagModel)(nil)

type (
	// TagModel is an interface to be customized, add more methods here,
	// and implement the added methods in customTagModel.
	TagModel interface {
		tagModel
		FindAll(ctx context.Context) ([]*Tag, error)
	}

	customTagModel struct {
		*defaultTagModel
	}
)

// NewTagModel returns a model for the database table.
func NewTagModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) TagModel {
	return &customTagModel{
		defaultTagModel: newTagModel(conn, c, opts...),
	}
}
func (m *customTagModel) FindAll(ctx context.Context) ([]*Tag, error) {
	var tags []*Tag
	query := fmt.Sprintf("SELECT %s FROM %s ORDER BY category, id", tagRows, m.table)
	err := m.QueryRowsNoCacheCtx(ctx, &tags, query)
	return tags, err
}
