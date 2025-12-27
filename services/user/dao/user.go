package dao

import (
	"Vertex/pkg/database"
	"Vertex/services/user/model"
	"context"

	"gorm.io/gorm"
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

type UserDao struct {
	*gorm.DB
}

func NewUserDao(ctx context.Context) *UserDao {
	return &UserDao{
		DB: database.NewDBClient(ctx),
	}
}

// EXISTORNOTBYEMAIL判断邮箱是否已经被注册
func (dao *UserDao) ExistOrNotByEmail(email string) (bool, error) {
	var count int64
	err := dao.DB.Model(&model.User{}).Where("email=?", email).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// EXISTORNOTBYUserName判断邮箱是否已经被注册
func (dao *UserDao) ExistOrNotByUserName(username string) (bool, error) {
	var count int64
	err := dao.DB.Model(&model.User{}).Where("username=?", username).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (dao *UserDao) CreateUser(user *model.User) error {
	return dao.DB.Model(&model.User{}).Create(user).Error
}
