// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package handler

import (
	"net/http"

	"Vertex/app/user/api/internal/logic"
	"Vertex/app/user/api/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func ShowMyInfoHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := logic.NewShowMyInfoLogic(r.Context(), svcCtx)
		resp, err := l.ShowMyInfo()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
