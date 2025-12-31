// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"Vertex/pkg/errno"
	"context"
	"log"

	"github.com/zeromicro/go-zero/core/logx"
)

type ProblemListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewProblemListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ProblemListLogic {
	return &ProblemListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ProblemListLogic) ProblemList(req *types.ListReq) (resp *types.ListResp, err error) {
	total, err := l.svcCtx.ProblemPostModel.CountProbleming(l.ctx)
	if err != nil {
		return nil, err
	}

	if total == 0 {
		return &types.ListResp{
			Status: errno.Success,
			Msg:    "ok",
			Total:  0,
			Data:   []types.ProblemPost{},
		}, nil
	}

	posts, err := l.svcCtx.ProblemPostModel.FindApproved(l.ctx, req.Page, req.PageSize)
	if err != nil {
		log.Print(err)
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
