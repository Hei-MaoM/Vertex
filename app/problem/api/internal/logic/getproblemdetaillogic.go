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
	"math/rand"
	"strconv"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetProblemDetailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetProblemDetailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetProblemDetailLogic {
	return &GetProblemDetailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetProblemDetailLogic) GetProblemDetail(req *types.GetProblemDetailReq) (resp *types.GetProblemDetailResp, err error) {
	p, err := l.svcCtx.ProblemPostModel.FindOne(l.ctx, uint64(req.Id))
	if err != nil {
		return nil, err
	}
	problem, err := l.svcCtx.ProblemModel.FindOne(l.ctx, p.ProblemId)
	problemUrl := ""
	if err == nil {
		problemUrl = problem.Url
	}

	userId, _ := l.ctx.Value("id").(json.Number).Int64()
	isSolved := false
	if userId > 0 {
		_, err := l.svcCtx.UserSolvedModel.FindOneByUserIdProblemId(l.ctx, uint64(userId), p.ProblemId)
		if err == nil {
			isSolved = true
		} else if !errors.Is(err, model.ErrNotFound) {
			// 如果是数据库报错，记录日志但不错杀，当做没做过
			logx.Errorf("Check UserSolved failed: %v", err)
		}
	}
	viewCountKey := fmt.Sprintf("vertex:post:views:%d", req.Id)
	newView, _ := l.svcCtx.Redis.Incr(viewCountKey)
	if newView == 1 && p.ViewNum > uint64(newView) {
		newView = int64(p.ViewNum + 1)
		err := l.svcCtx.Redis.Set(viewCountKey, strconv.FormatInt(newView, 10))
		if err != nil {
			return nil, err
		}
	}
	if rand.Intn(10) == 0 {
		p.ViewNum = uint64(newView)
		go func(pid, views int64) {
			err := l.svcCtx.ProblemPostModel.UpdateViewNum(context.Background(), pid, views)
			if err != nil {
				logx.Errorf("Async update view_num failed (id=%d): %v", pid, err)
			}
		}(int64(p.Id), newView)
	}
	return &types.GetProblemDetailResp{
		Status: errno.Success,
		Msg:    "OK",
		Data: types.ProblemDetail{
			Id:         int64(p.Id),
			ProblemId:  int64(p.ProblemId),
			Title:      p.Title,
			Content:    p.Content,
			Solution:   p.Solution,
			Source:     problem.Source, // 来源通常存原题表，也可以存 post 表，看你设计
			IsSolved:   isSolved,
			ProblemUrl: problemUrl,
			ViewNum:    newView,
		},
	}, nil
}
