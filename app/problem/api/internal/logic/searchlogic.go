// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"context"

	"github.com/zeromicro/go-zero/core/logx"
)

type SearchLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSearchLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SearchLogic {
	return &SearchLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SearchLogic) Search(req *types.SearchReq) (resp *types.ListResp, err error) {
	if req.Keyword == "" {
		return &types.ListResp{Total: 0, Data: []types.ProblemPost{}}, nil
	}
	queryVec, err := l.svcCtx.ZhipuClient.GetEmbedding(req.Keyword)
	if err != nil {
		logx.Errorf("GetEmbedding failed: %v", err)
		return nil, err
	}
	ids := l.svcCtx.VectorIndex.Search(queryVec, 20)
	if len(ids) == 0 {
		return &types.ListResp{Total: 0, Data: []types.ProblemPost{}}, nil
	}
	var posts []types.ProblemPost
	for _, id := range ids {
		post, err := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(id))
		if err == nil {
			problem, _ := l.svcCtx.ProblemModel.FindOne(l.ctx, post.ProblemId)
			posts = append(posts, types.ProblemPost{
				Id:       int64(post.Id),
				Title:    post.Title,
				Source:   problem.Source,
				Tags:     post.TagsStr,
				AuthorId: int64(post.UserId),
			})
		}
	}
	return &types.ListResp{Status: 200, Msg: "success", Total: int64(len(ids)), Data: posts}, nil
}
