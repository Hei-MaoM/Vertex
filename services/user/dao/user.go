package dao

import (
	"Vertex/pkg/database"
	"Vertex/services/user/model"
)

// Init 负责把 user 服务的表建好
func Init() {
	// 拿到全局 DB 对象
	db := database.DB

	// 自动迁移 (如果没有表就创建，有表就修改字段)
	err := db.AutoMigrate(&model.User{})
	if err != nil {
		panic("User表自动迁移失败: " + err.Error())
	}
}
