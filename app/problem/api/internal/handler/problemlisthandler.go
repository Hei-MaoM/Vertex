// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package handler

import (
	"Vertex/app/problem/api/internal/types"
	"net/http"

	"Vertex/app/problem/api/internal/logic"
	"Vertex/app/problem/api/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func ProblemListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := logic.NewProblemListLogic(r.Context(), svcCtx)
		resp, err := l.ProblemList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
