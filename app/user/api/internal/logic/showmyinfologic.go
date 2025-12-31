// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package logic

import (
	"Vertex/pkg/errno"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"Vertex/app/user/api/internal/svc"
	"Vertex/app/user/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ShowMyInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewShowMyInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ShowMyInfoLogic {
	return &ShowMyInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ShowMyInfoLogic) ShowMyInfo() (resp *types.UserInfoResp, err error) {
	val := l.ctx.Value("id")
	usernum, ok := val.(json.Number)
	if !ok {
		return nil, errors.New(fmt.Sprintf("密钥错误"))
	}
	userid, _ := usernum.Int64()
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uint64(userid))
	if err != nil {
		return &types.UserInfoResp{
			Status: errno.ErrorDatabase,
			Msg:    errno.GetMsg(errno.ErrorDatabase),
			Error:  err.Error(),
		}, nil
	}
	return &types.UserInfoResp{
		Status: errno.Success,
		Msg:    "ok",
		Data: types.UserInfo{
			Id:         int64(user.Id),
			Username:   user.Username,
			Email:      user.Email,
			Authority:  user.Authority,
			Status:     user.Status,
			Avatar:     user.Avatar,
			SolveCnt:   user.SolveCnt,
			CollectCnt: user.CollectCnt,
			PostCnt:    user.PostCnt,
			CreatedAt:  user.CreatedAt.Format("2006-01-02 15:04:05"),
		},
	}, nil
}
