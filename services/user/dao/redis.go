package dao

import (
	"Vertex/pkg/util"
	"context"
	"fmt"
)

func CheckEmailCode(ctx context.Context, email string, code string) bool {
	AuthEmail := fmt.Sprintf("Vertex:Email:Auth:%s", email)
	return util.CheckVal(ctx, AuthEmail, code)
}

func TypeConfirmation(ctx context.Context, email string, ty string) bool {
	TypeEmail := fmt.Sprintf("Vertex:Email:Type:%s", email)
	return util.CheckVal(ctx, TypeEmail, ty)
}
