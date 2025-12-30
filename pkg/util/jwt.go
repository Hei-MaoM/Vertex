package util

import (
	"time"

	"github.com/dgrijalva/jwt-go"
	//"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte("Authorization")

type Claims struct {
	ID        uint   `json:"id"`
	UserName  string `json:"user_name"`
	Authority int    `json:"authority"`
	jwt.StandardClaims
}

func GenerateToken(id uint, userName string, authority int, secret string, expireSecond int64) (string, error) {
	nowTime := time.Now()
	expireTime := nowTime.Add(time.Duration(expireSecond) * time.Second)
	claims := Claims{
		ID:        id,
		UserName:  userName,
		Authority: authority,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expireTime.Unix(),
			Issuer:    "HeiMaoM",
		},
	}
	tokeClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokeClaims.SignedString([]byte(secret))
	return token, err
}
