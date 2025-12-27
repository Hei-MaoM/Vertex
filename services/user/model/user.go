package model

import (
	"gorm.io/gorm"
)

// User 用户表结构
type User struct {
	// gorm.Model 包含了 ID, CreatedAt, UpdatedAt, DeletedAt
	// 自动拥有 ID (uint, primaryKey)
	gorm.Model

	// 建议显式指定 column 名，防止 GORM 自动转化的命名不符合预期
	UserName string `gorm:"column:username;type:varchar(20);uniqueIndex;not null"`
	Password string `gorm:"column:password;type:varchar(100);not null"`
	Email    string `gorm:"column:email;type:varchar(100);uniqueIndex;not null"`
	Avatar   string `gorm:"column:avatar;type:varchar(255);default:''"`

	// 权限设计：建议用 tinyint 节省空间，除非你有超过 255 种权限
	Authority int `gorm:"column:authority;type:int;default:1"` // 1-普通用户，2-管理员
	Status    int `gorm:"column:status;type:int;default:1"`    // 1-启用，0-禁用

	// 扩展字段
	Phone string `gorm:"column:phone;type:varchar(20)"`
}

// TableName 强制指定表名为 users
func (User) TableName() string {
	return "users"
}
