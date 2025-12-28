package errno

const (
	Success = 200
	Error   = 500
	//用户/认证模块错误
	ErrorTokenEmpty            = 20001
	ErrorAuthCheckTokenTimeout = 20002
	ErrorAuthToken             = 20003
	ErrorParameter             = 20004
	ErrorSendEmail             = 20005
	ErrorEmailExist            = 20006
	ErrorNameExist             = 20007
	ErrorCodeInvalid           = 20008
	ErrorPasswordIncorrect     = 20009
	ErrorTokenGenerate         = 20010
	ErrorUserNotFound          = 20011
	//数据库错误
	ErrorDatabase = 30001
)
