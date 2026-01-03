// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"Vertex/pkg/errno"
	"context"

	"github.com/zeromicro/go-zero/core/logx"
)

type ShouOtherPostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewShouOtherPostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ShouOtherPostLogic {
	return &ShouOtherPostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ShouOtherPostLogic) ShouOtherPost(req *types.GetPostsReq) (resp *types.ListResp, err error) {
	posts, total, err := l.svcCtx.ProblemPostModel.FindPosts(l.ctx, req.Id, 1, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}
	dataList := make([]types.ProblemPost, 0, len(posts))
	for _, p := range posts {
		problem, _ := l.svcCtx.ProblemModel.FindOne(l.ctx, p.ProblemId)
		dataList = append(dataList, types.ProblemPost{
			Id:       int64(p.Id),
			Title:    p.Title,
			Tags:     p.TagsStr,
			AuthorId: int64(p.UserId),
			Source:   problem.Source,
		})
	}

	return &types.ListResp{
		Status: errno.Success,
		Msg:    "ok",
		Total:  total,
		Data:   dataList,
	}, nil
}
