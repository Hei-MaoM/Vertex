// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"context"
	"encoding/json"

	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLeaderboradLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLeaderboradLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLeaderboradLogic {
	return &GetLeaderboradLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLeaderboradLogic) GetLeaderborad() (resp *types.LeaderboardResp, err error) {
	val, err := l.svcCtx.Redis.Get("biz:leaderboard")
	if err != nil {
		return &types.LeaderboardResp{Status: 0, Data: []types.LeaderboardUser{}}, nil
	}

	if len(val) == 0 {
		return &types.LeaderboardResp{Status: 0, Data: []types.LeaderboardUser{}}, nil
	}

	var list []types.LeaderboardUser
	err = json.Unmarshal([]byte(val), &list)
	if err != nil {
		return nil, err
	}

	return &types.LeaderboardResp{
		Status: 0,
		Data:   list,
	}, nil
}
