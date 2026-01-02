// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package main

import (
	"Vertex/app/user/api/internal/config"
	"Vertex/app/user/api/internal/cron"
	"Vertex/app/user/api/internal/handler"
	"Vertex/app/user/api/internal/mq"
	"Vertex/app/user/api/internal/svc"
	"context"
	"flag"
	"fmt"
	gitcron "github.com/robfig/cron/v3"
	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/user-api.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf, rest.WithCors())
	defer server.Stop()

	ctx := svc.NewServiceContext(c)
	cJob := gitcron.New()
	job := cron.NewLeaderboardJob(context.Background(), ctx)
	_, err := cJob.AddFunc("0/01 * * * *", job.Run)
	if err != nil {
		panic(err)
	}
	cJob.Start()
	handler.RegisterHandlers(server, ctx)
	mq.StartConsumers(ctx)
	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
