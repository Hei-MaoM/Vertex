// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"
	"encoding/json"

	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetMyPostsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetMyPostsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetMyPostsLogic {
	return &GetMyPostsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetMyPostsLogic) GetMyPosts(req *types.GetMyPostsReq) (resp *types.ListResp, err error) {
	userId, _ := l.ctx.Value("id").(json.Number).Int64()
	posts, total, err := l.svcCtx.ProblemPostModel.FindPosts(l.ctx, userId, req.Status, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}
	dataList := make([]types.ProblemPost, 0, len(posts))
	for _, p := range posts {
		problem, _ := l.svcCtx.ProblemModel.FindOne(l.ctx, p.ProblemId)
		dataList = append(dataList, types.ProblemPost{
			Id:       int64(p.Id),
			Title:    p.Title,
			Tags:     problem.TagsStr,
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
