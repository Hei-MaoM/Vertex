package middleware

import (
	"Vertex/pkg/errno"
	"Vertex/pkg/util"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func JWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		var code int
		code = 200
		// 优先取标准 Authorization 头，兼容备用 access_token 头
		token := c.GetHeader("Authorization")
		//fmt.Println(token)
		if token == "" {

			code = errno.ErrorTokenEmpty
		} else {
			fmt.Println(token)
			claims, err := util.ParseToken(token)
			if err != nil {
				code = errno.ErrorAuthToken
			} else if time.Now().Unix() > claims.ExpiresAt {
				code = errno.ErrorAuthCheckTokenTimeout
			} else {
				// 将 claims 放入上下文，便于后续 handler 复用
				c.Set("claims", claims)
			}
		}
		if code != errno.Success {
			c.JSON(200, gin.H{
				"status": code,
				"msg":    errno.GetMsg(code),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
