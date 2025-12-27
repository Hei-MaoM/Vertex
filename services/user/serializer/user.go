package serializer

import (
	"Vertex/services/user/model"
)

type User struct {
	ID        uint   `json:"id"`
	UserName  string `json:"username"`
	Authority int    `json:"authority"`
	Email     string `json:"email"`
	Status    int    `json:"status"`
	Avatar    string `json:"avatar"`
	CreateAt  string `json:"create_at"`
}

func BuildUser(user *model.User) *User {
	return &User{
		ID:        user.ID,
		UserName:  user.UserName,
		Email:     user.Email,
		Status:    user.Status,
		Avatar:    user.Avatar,
		CreateAt:  user.CreatedAt.Format("2006-01-02 15:04:05"),
		Authority: user.Authority,
	}
}
