package mq

import (
	"Vertex/app/user/api/internal/svc"
	"context"
	"strconv"

	rediss "github.com/redis/go-redis/v9"
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"time"
)

func StartConsumers(svcCtx *svc.ServiceContext) {
	logx.Info("Start Consumers")
	go consumeCollectionEvents(svcCtx)
	go consumePostEvents(svcCtx)
	go consumeSolveEvents(svcCtx)
}
func consumeCollectionEvents(svcCtx *svc.ServiceContext) {
	streamKey := "stream:collection"
	groupName := "user_service_group"
	consumerName := "c1"

	_, err := svcCtx.Redis.XGroupCreateMkStream(streamKey, groupName, "0")
	if err != nil && err.Error() != "BUSYGROUP Consumer Group name already exists" {
		logx.Errorf("Create group failed: %v", err)
	}
	blockingNokde, err := redis.CreateBlockingNode(svcCtx.Redis)
	if err != nil {
		logx.Errorf("Failed to create blocking node: %v", err)
		return
	}
	defer blockingNokde.Close()
	for {

		results, err := svcCtx.Redis.XReadGroupCtx(
			context.Background(),
			blockingNokde,
			groupName,
			consumerName,
			10,
			time.Second*5,
			false,
			streamKey,
			">",
		)
		if err != nil {
			if err != redis.Nil {
				logx.Errorf("Read group failed: %v", err)
			}
			continue
		}
		for _, item := range results {
			for _, msg := range item.Messages {
				collectionProcessMessage(svcCtx, &msg)
				svcCtx.Redis.XAckCtx(context.Background(), streamKey, groupName, msg.ID)
			}

		}
	}
}
func collectionProcessMessage(svcCtx *svc.ServiceContext, msg *rediss.XMessage) {
	id, _ := strconv.ParseInt(msg.Values["user_id"].(string), 10, 64)
	action, _ := msg.Values["action"].(string)
	var dalta int
	if action == "add" {
		dalta = 1
	} else {
		dalta = -1
	}
	if dalta != 0 {
		err := svcCtx.UserModel.UpdateCollectCount(context.Background(), uint64(id), dalta)
		if err != nil {
			logx.Errorf("[STREAM] failed to update user collect_cnt for user %d: %v", id, err)
		}
	}
}

func consumePostEvents(svcCtx *svc.ServiceContext) {
	streamKey := "stream:post"
	groupName := "user_service_group"
	consumerName := "c2"

	_, err := svcCtx.Redis.XGroupCreateMkStream(streamKey, groupName, "0")
	if err != nil && err.Error() != "BUSYGROUP Consumer Group name already exists" {
		logx.Errorf("Create group failed: %v", err)
	}
	blockingNokde, err := redis.CreateBlockingNode(svcCtx.Redis)
	if err != nil {
		logx.Errorf("Failed to create blocking node: %v", err)
		return
	}
	defer blockingNokde.Close()
	for {

		results, err := svcCtx.Redis.XReadGroupCtx(
			context.Background(),
			blockingNokde,
			groupName,
			consumerName,
			10,
			time.Second*5,
			false,
			streamKey,
			">",
		)
		if err != nil {
			if err != redis.Nil {
				logx.Errorf("Read group failed: %v", err)
			}
			continue
		}
		for _, item := range results {
			for _, msg := range item.Messages {
				postProcessMessage(svcCtx, &msg)
				svcCtx.Redis.XAckCtx(context.Background(), streamKey, groupName, msg.ID)
			}

		}
	}
}
func postProcessMessage(svcCtx *svc.ServiceContext, msg *rediss.XMessage) {
	id, _ := strconv.ParseInt(msg.Values["user_id"].(string), 10, 64)
	action, _ := msg.Values["action"].(string)
	var dalta int
	if action == "add" {
		dalta = 1
	} else {
		dalta = -1
	}
	if dalta != 0 {
		err := svcCtx.UserModel.UpdatePostCount(context.Background(), uint64(id), dalta)
		if err != nil {
			logx.Errorf("[STREAM] failed to update user collect_cnt for user %d: %v", id, err)
		}
	}
}

func consumeSolveEvents(svcCtx *svc.ServiceContext) {
	streamKey := "stream:solve"
	groupName := "user_service_group"
	consumerName := "c3"

	_, err := svcCtx.Redis.XGroupCreateMkStream(streamKey, groupName, "0")
	if err != nil && err.Error() != "BUSYGROUP Consumer Group name already exists" {
		logx.Errorf("Create group failed: %v", err)
	}
	blockingNokde, err := redis.CreateBlockingNode(svcCtx.Redis)
	if err != nil {
		logx.Errorf("Failed to create blocking node: %v", err)
		return
	}
	defer blockingNokde.Close()
	for {

		results, err := svcCtx.Redis.XReadGroupCtx(
			context.Background(),
			blockingNokde,
			groupName,
			consumerName,
			10,
			time.Second*5,
			false,
			streamKey,
			">",
		)
		if err != nil {
			if err != redis.Nil {
				logx.Errorf("Read group failed: %v", err)
			}
			continue
		}
		for _, item := range results {
			for _, msg := range item.Messages {
				solveProcessMessage(svcCtx, &msg)
				svcCtx.Redis.XAckCtx(context.Background(), streamKey, groupName, msg.ID)
			}

		}
	}
}
func solveProcessMessage(svcCtx *svc.ServiceContext, msg *rediss.XMessage) {
	id, _ := strconv.ParseInt(msg.Values["user_id"].(string), 10, 64)
	action, _ := msg.Values["action"].(string)
	var dalta int
	if action == "add" {
		dalta = 1
	} else {
		dalta = -1
	}
	if dalta != 0 {
		err := svcCtx.UserModel.UpdateSolveCount(context.Background(), uint64(id), dalta)
		if err != nil {
			logx.Errorf("[STREAM] failed to update user collect_cnt for user %d: %v", id, err)
		}
	}
}
