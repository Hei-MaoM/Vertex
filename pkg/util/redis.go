package util

import (
	"Vertex/pkg/database"
	"context"
)

func CheckVal(ctx context.Context, key string, val string) bool {
	if database.RDB.Get(ctx, key).Val() != val {
		return false
	} else {
		return true
	}
}

func DeleteVal(ctx context.Context, key string) error {
	return database.RDB.Del(ctx, key).Err()
}
