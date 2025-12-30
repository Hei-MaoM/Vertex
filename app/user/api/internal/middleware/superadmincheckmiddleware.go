// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type SuperAdminCheckMiddleware struct {
}

func NewSuperAdminCheckMiddleware() *SuperAdminCheckMiddleware {
	return &SuperAdminCheckMiddleware{}
}

func (m *SuperAdminCheckMiddleware) Handle(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println(authority)
		if authority < 3 {
			http.Error(w, "Forbidden: SuperAdmins only", http.StatusForbidden)
			return
		}
		// Passthrough to next handler if need
		next(w, r)
	}
}
