// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package middleware

import (
	"encoding/json"
	"net/http"
)

type AdminCheckMiddleware struct {
}

func NewAdminCheckMiddleware() *AdminCheckMiddleware {
	return &AdminCheckMiddleware{}
}

func (m *AdminCheckMiddleware) Handle(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO generate middleware implement function, delete after code implementation
		authVal := r.Context().Value("authority")
		if authVal == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var authority int64
		var err error
		switch v := authVal.(type) {
		case json.Number:
			authority, err = v.Int64()
		case int64:
			authority = v
		case int:
			authority = int64(v)
		default:
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if authority < 2 {
			http.Error(w, "Forbidden: Admins only", http.StatusForbidden)
			return
		}
		// Passthrough to next handler if need
		next(w, r)
	}
}
