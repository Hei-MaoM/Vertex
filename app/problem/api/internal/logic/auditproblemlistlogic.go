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

type AuditProblemListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAuditProblemListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AuditProblemListLogic {
	return &AuditProblemListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AuditProblemListLogic) AuditProblemList(req *types.ListReq) (resp *types.ListResp, err error) {
	total, err := l.svcCtx.ProblemPostModel.CountPending(l.ctx)
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

	posts, err := l.svcCtx.ProblemPostModel.FindNotApproved(l.ctx, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	dataList := make([]types.ProblemPost, 0, len(posts))
	for _, p := range posts {
		dataList = append(dataList, types.ProblemPost{
			Id:    int64(p.Id),
			Title: p.Title,
			Tags:  []types.Tag{}, // 暂时留空
		})
	}

	return &types.ListResp{
		Status: errno.Success,
		Msg:    "ok",
		Total:  total,
		Data:   dataList,
	}, nil
}
