// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"

	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"

	"github.com/qiniu/go-sdk/v7/auth/qbox"
	"github.com/qiniu/go-sdk/v7/storage"
	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateTokenLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateTokenLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateTokenLogic {
	return &UpdateTokenLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateTokenLogic) UpdateToken() (resp *types.UpdateTokenResp, err error) {
	accessKey := l.svcCtx.Config.Qiniu.AccessKey
	sercretKey := l.svcCtx.Config.Qiniu.SecretKey
	bucket := l.svcCtx.Config.Qiniu.Bucket
	putPolicy := storage.PutPolicy{
		Scope:     bucket,
		MimeLimit: "image/*",
	}
	moc := qbox.NewMac(accessKey, sercretKey)
	upToken := putPolicy.UploadToken(moc)
	return &types.UpdateTokenResp{
		Status: errno.Success,
		Msg:    "ok",
		Data: types.UpToken{
			Token:  upToken,
			Domain: l.svcCtx.Config.Qiniu.Domain,
		},
	}, nil
}
