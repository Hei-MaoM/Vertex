package database

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(addr, password string, db int) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     addr,     // "127.0.0.1:6379"
		Password: password, // ""
		DB:       db,       // 0

		// --- 连接池配置 (根据 2C2G 服务器调整) ---
		PoolSize:     20,              // 最大连接数
		MinIdleConns: 5,               // 最小空闲连接 (保证随时有连接可用)
		DialTimeout:  5 * time.Second, // 连接超时时间
		ReadTimeout:  3 * time.Second, // 读取超时
		WriteTimeout: 3 * time.Second, // 写入超时
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := RDB.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
	log.Printf("redis is success")
}
