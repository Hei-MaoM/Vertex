package database

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/dbresolver"
)

var DB *gorm.DB

func InitMysql(dsn string) {
	var err error
	newlogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // 【关键】慢 SQL 阈值 (超过1秒的SQL会被打印出来)
			LogLevel:                  logger.Info, // 【关键】日志级别 (Info会打印所有SQL，方便开发时调试)
			IgnoreRecordNotFoundError: true,        // 忽略 ErrRecordNotFound 错误 (查不到数据不报错，这很正常)
			Colorful:                  true,        // 彩色打印，好看
		},
	)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger:      newlogger,
		PrepareStmt: true, //准备语句缓存
	})
	if err != nil {
		panic(err)
	}
	err = DB.Use(dbresolver.Register(dbresolver.Config{
		Sources:  []gorm.Dialector{mysql.Open(dsn)}, // 写操作 (主库)
		Replicas: []gorm.Dialector{mysql.Open(dsn)}, // 读操作 (从库 -> 目前还是指向主库)
		Policy:   dbresolver.RandomPolicy{},         // 负载均衡策略
	}))
	if err != nil {
		panic(err)
	}

	sqlDB, err := DB.DB()
	sqlDB.SetMaxIdleConns(20)  //设置连接池
	sqlDB.SetMaxOpenConns(100) //打开连接数
	sqlDB.SetConnMaxLifetime(time.Second * 600)

}
