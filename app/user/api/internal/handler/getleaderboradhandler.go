// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package handler

import (
	"net/http"

	"Vertex/app/user/api/internal/logic"
	"Vertex/app/user/api/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetLeaderboradHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := logic.NewGetLeaderboradLogic(r.Context(), svcCtx)
		resp, err := l.GetLeaderborad()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
