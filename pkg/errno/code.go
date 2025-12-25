package errno

const (
	Success = 200
	Error   = 500
	//用户/认证模块错误
	ErrorTokenEmpty            = 20001
	ErrorAuthCheckTokenTimeout = 20002
	ErrorAuthToken             = 20003
)
