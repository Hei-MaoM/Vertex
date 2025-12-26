package api

import (
	"Vertex/pkg/errno"
	"Vertex/services/user/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SendEmail(c *gin.Context) {
	var user service.SendEmailService
	if err := c.ShouldBind(&user); err == nil {
		res := user.SendEmail(c.Request.Context())
		c.JSON(http.StatusOK, res)
	} else {
		c.JSON(http.StatusBadRequest, errno.ErrrResponse(err))
	}
}
