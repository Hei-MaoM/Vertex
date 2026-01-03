// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package handler

import (
	"net/http"

	"Vertex/app/problem/api/internal/logic"
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func ShouOtherPostHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetPostsReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewShouOtherPostLogic(r.Context(), svcCtx)
		resp, err := l.ShouOtherPost(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
