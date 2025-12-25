package model

import (
	"gorm.io/gorm"
)

// User 用户表结构
type User struct {
	// gorm.Model 包含了 ID, CreatedAt, UpdatedAt, DeletedAt
	gorm.Model

	Username string `gorm:"type:varchar(20);uniqueIndex;not null"` // 用户名唯一
	Password string `gorm:"type:varchar(100);not null"`            // 密码 (加密存)
	Email    string `gorm:"type:varchar(100);uniqueIndex"`         // 邮箱唯一
	Avatar   string `gorm:"type:varchar(255);default:''"`          // 头像

	// 扩展字段
	Phone string `gorm:"type:varchar(20)"`
}

// TableName 强制指定表名为 users (不然 gorm 可能会把它变成 user_models 之类的)
func (User) TableName() string {
	return "users"
}
