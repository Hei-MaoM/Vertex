package router

import (
	"Vertex/pkg/middleware"
	"Vertex/services/user/api/v1"
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.Cors())
	r.StaticFS("/static", http.Dir("./static"))
	v1 := r.Group("/v1")
	{
		v1.POST("/email/send", api.SendEmail)
		v1.POST("/register", api.UserRegister)
	}
	return r
}
