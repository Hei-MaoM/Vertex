// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"
	"Vertex/app/problem/model"
	"Vertex/pkg/errno"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type PublishLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewPublishLogic(ctx context.Context, svcCtx *svc.ServiceContext) *PublishLogic {
	return &PublishLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *PublishLogic) Publish(req *types.PublishReq) (resp *types.CommonResp, err error) {
	problemUrl := req.ProblemUrl
	problem, err := l.svcCtx.ProblemModel.FindOneByUrl(l.ctx, problemUrl)
	var tag string
	for i := 0; i < len(req.TagIds); i += 1 {
		tag1, _ := l.svcCtx.TagModel.FindOne(l.ctx, uint64(req.TagIds[i]))
		if i != 0 {
			tag = fmt.Sprintf("%s,%s", tag, tag1.Name)
		} else {
			tag = tag1.Name
		}
	}
	if errors.Is(err, sqlx.ErrNotFound) {

		problem = &model.Problem{
			Title:      req.ProblemTitle,
			Source:     req.ProblemSource,
			Url:        req.ProblemUrl,
			SolveNum:   0,
			CollectNum: 0,
		}
		_, _ = l.svcCtx.ProblemModel.Insert(l.ctx, problem)

	} else if err != nil {
		return &types.CommonResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	problem, _ = l.svcCtx.ProblemModel.FindOneByUrl(l.ctx, problemUrl)
	val := l.ctx.Value("id")
	usernum, ok := val.(json.Number)
	if !ok {
		return nil, errors.New(fmt.Sprintf("密钥错误"))
	}
	userid, _ := usernum.Int64()
	var problemPost *model.ProblemPost
	problemPost = &model.ProblemPost{
		ProblemId:  problem.Id,
		UserId:     uint64(userid),
		Title:      req.Title,
		Content:    req.Content,
		Solution:   req.Solution,
		Status:     0,
		ViewNum:    0,
		CollectNum: 0,
		TagsStr:    tag,
	}
	_, _ = l.svcCtx.ProblemPostModel.Insert(l.ctx, problemPost)
	return &types.CommonResp{
		Status: errno.Success,
		Msg:    "上传成功",
		Data:   problemPost,
	}, nil
}
