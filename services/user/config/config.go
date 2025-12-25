package config

import "github.com/spf13/viper"

type Config struct {
	Server ServerConfig `mapstructure:"server"`
	MySQL  MySQLConfig  `mapstructure:"mysql"`
	Redis  RedisConfig  `mapstructure:"redis"`
	Email  EmailConfig  `mapstructure:"email"`
}

type ServerConfig struct {
	AppMode     string `mapstructure:"app_mode"`
	HttpPort    string `mapstructure:"http_port"`
	ServiceName string `mapstructure:"service_name"`
}
type MySQLConfig struct {
	DbHost     string `mapstructure:"db_host"`
	DbPort     string `mapstructure:"db_port"`
	DbUser     string `mapstructure:"db_user"`
	DbPassword string `mapstructure:"db_password"`
	DbName     string `mapstructure:"db_name"`
}
type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type EmailConfig struct {
	SmtpHost  string `mapstructure:"smtp_host"`
	SmtpEmail string `mapstructure:"smtp_email"`
	SmtpPass  string `mapstructure:"smtp_pass"`
	SmtpPort  int    `mapstructure:"smtp_port"`
	FromName  string `mapstructure:"from_name"`
}

var Con = new(Config)

func Init() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	//以防止找不到配置文件，可以多添加几个搜索路径
	viper.AddConfigPath(".")
	viper.AddConfigPath("./services/user/config")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}
	if err := viper.Unmarshal(&Con); err != nil {
		panic(err)
	}
}
