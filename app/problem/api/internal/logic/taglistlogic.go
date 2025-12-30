// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"

	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type TagListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewTagListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *TagListLogic {
	return &TagListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *TagListLogic) TagList() (resp *types.TagListResp, err error) {
	tagList, err := l.svcCtx.TagModel.FindAll(l.ctx)
	if err != nil {
		return &types.TagListResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	res := make([]types.Tag, 0)
	for i := 0; i < len(tagList); i++ {
		res = append(res, types.Tag{
			Id:       int64(tagList[i].Id),
			Name:     tagList[i].Name,
			Category: tagList[i].Category,
		})
	}
	return &types.TagListResp{
		Status: errno.Success,
		Msg:    errno.GetMsg(errno.Success),
		Data:   res,
	}, nil
}
