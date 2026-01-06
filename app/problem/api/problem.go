// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package main

import (
	"Vertex/app/problem/api/internal/cron"
	"context"
	"flag"
	"fmt"

	"Vertex/app/problem/api/internal/config"
	"Vertex/app/problem/api/internal/handler"
	"Vertex/app/problem/api/internal/svc"

	gitcron "github.com/robfig/cron/v3"
	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/problem-api.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf, rest.WithCors())
	defer server.Stop()

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)
	cJob := gitcron.New()
	job := cron.NewHotJob(context.Background(), ctx)
	_, err := cJob.AddFunc("0 * * * *", job.Run)
	if err != nil {
		panic(err)
	}
	//一天一次
	job2 := cron.NewSimilarityJob(context.Background(), ctx)
	_, err = cJob.AddFunc("0 3 * * *", job2.Run)
	if err != nil {
		panic(err)
	}
	cJob.Start()
	go ctx.VectorIndex.LoadFormDB(ctx.ProblemPostModel)
	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
