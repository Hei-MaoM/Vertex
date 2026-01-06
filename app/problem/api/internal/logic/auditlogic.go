// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"
	"encoding/json"
	"strings"

	"Vertex/app/problem/api/internal/svc"
	"Vertex/app/problem/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AuditLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAuditLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AuditLogic {
	return &AuditLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AuditLogic) Audit(req *types.AuditReq) (resp *types.CommonResp, err error) {
	code := errno.Success
	postId := req.PostId
	problemPost, err := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(postId))
	if err != nil {
		code = errno.Error
		return &types.CommonResp{
			Status: errno.Error,
			Msg:    "审核失败，问题不存在",
			Error:  err.Error(),
		}, nil
	}
	problem, err := l.svcCtx.ProblemModel.FindOne(l.ctx, problemPost.ProblemId)
	if err != nil {
		code = errno.Error
		return &types.CommonResp{
			Status: errno.Error,
			Msg:    "审核失败，关联题目不存在",
			Error:  err.Error(),
		}, nil
	}
	if req.FixProblemTitle != "" {
		problem.Title = req.FixProblemTitle
		_ = l.svcCtx.ProblemModel.Update(l.ctx, problem)
	}
	if req.Status == 1 || req.Status == 2 {
		// 通过审核
		problemPost.Status = uint64(req.Status)
		err = l.svcCtx.ProblemPostModel.Update(l.ctx, problemPost)
		if err != nil {
			code = errno.Error
			return &types.CommonResp{
				Status: errno.Error,
				Msg:    "审核失败，更新问题状态失败",
				Error:  err.Error(),
			}, nil
		}
	} else {
		code = errno.Error
		return &types.CommonResp{
			Status: errno.Error,
			Msg:    "审核失败，状态码错误",
		}, nil
	}
	if req.Status == 1 {
		streamKey := "stream:post"
		problem, _ := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(problemPost.Id))

		message := map[string]interface{}{
			"user_id": problem.UserId,
			"action":  "add",
		}
		_, err = l.svcCtx.Redis.XAddCtx(l.ctx, streamKey, false, "*", message)
		tagSet := make(map[string]bool)
		tags := strings.Split(problem.TagsStr, ",")
		for _, tag := range tags {
			cleanTag := strings.TrimSpace(tag)
			if cleanTag == "" {
				tagSet[cleanTag] = true
			}
		}
		tags = strings.Split(problemPost.TagsStr, ",")
		for _, tag := range tags {
			cleanTag := strings.TrimSpace(tag)
			if cleanTag == "" {
				tagSet[cleanTag] = true
			}
		}
		var allTags []string
		for t := range tagSet {
			allTags = append(allTags, t)
		}
		mergedTagsStr := strings.Join(allTags, ",")
		problem.TagsStr = mergedTagsStr
		l.svcCtx.ProblemPostModel.Update(l.ctx, problem)
		var vec []float64

		if err := json.Unmarshal([]byte(problemPost.Embedding), &vec); err == nil {
			if len(vec) > 0 {
				l.svcCtx.VectorIndex.Add(int64(problemPost.Id), vec)
			}
		}
	}
	return &types.CommonResp{
		Status: int32(code),
		Msg:    "审核成功",
		Data:   problemPost,
	}, nil
}
