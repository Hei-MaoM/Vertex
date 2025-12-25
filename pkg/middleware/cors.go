package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Cors 跨域中间件
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin") // 请求来源

		if origin != "" {
			// 1. 允许的源 (开发环境用 *, 生产环境建议指定具体域名)
			c.Header("Access-Control-Allow-Origin", "*")

			// 2. 允许的方法
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

			// 3. 允许的 Header (已包含 Authorization，这对于 JWT 很重要)
			c.Header("Access-Control-Allow-Headers", "Authorization, Content-Length, X-CSRF-Token, Token, session, X_Requested_With, Accept, Origin, Host, Connection, Accept-Encoding, Accept-Language, DNT, X-CustomHeader, Keep-Alive, User-Agent, If-Modified-Since, Cache-Control, Content-Type, Pragma")

			// 4. 暴露给前端的 Header
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type, Expires, Last-Modified, Pragma, FooBar")

			// 5. 缓存时间 (秒)
			c.Header("Access-Control-Max-Age", "172800")

			// 6. 是否允许携带 Cookie (Origin 为 * 时，这里必须是 false)
			c.Header("Access-Control-Allow-Credentials", "false")
		}

		// 放行所有 OPTIONS 预检
		if method == "OPTIONS" {
			// 204 No Content 通常比 200 OK 更符合语义，不过 200 也可以
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// 处理请求
		c.Next()
	}
}
