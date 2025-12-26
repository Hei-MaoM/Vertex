package main

import (
	"Vertex/pkg/database"
	"Vertex/services/user/config"
	"Vertex/services/user/dao"
	"Vertex/services/user/router"
	"fmt"
)

func main() {
	config.Init()
	m := config.Con.MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		m.DbUser, m.DbPassword, m.DbHost, m.DbPort, m.DbName)
	database.InitMysql(dsn)
	r := config.Con.Redis
	database.InitRedis(r.Addr, r.Password, r.DB)
	dao.Init()
	fmt.Println("User service initialized successfully")
	re := router.NewRouter()
	re.Run(config.Con.Server.HttpPort)
}
