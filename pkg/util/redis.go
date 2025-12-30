package util

import (
	"context"

	"github.com/zeromicro/go-zero/core/stores/redis"
)

func CheckVal(ctx context.Context, r *redis.Redis, key string, val string) bool {

	getCtx, err := r.GetCtx(ctx, key)
	if err != nil || getCtx != val {
		return false
	} else {
		return true
	}
}

func DeleteVal(ctx context.Context, r *redis.Redis, key string) error {
	_, err := r.Del(key)
	return err
}
