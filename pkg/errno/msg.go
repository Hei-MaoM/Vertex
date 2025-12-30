package errno

var MsgFlags = map[int]string{
	Success:                    "ok",
	Error:                      "fail",
	ErrorTokenEmpty:            "Token为空",
	ErrorAuthCheckTokenTimeout: "Token过期",
	ErrorAuthToken:             "Token认证失败",
	ErrorParameter:             "参数错误",
	ErrorSendEmail:             "邮件发送失败",
	ErrorDatabase:              "数据库错误",
	ErrorEmailExist:            "邮箱已存在",
	ErrorNameExist:             "用户名已存在",
	ErrorCodeInvalid:           "验证码无效",
	ErrorPasswordIncorrect:     "密码错误",
	ErrorTokenGenerate:         "token生成失败",
	ErrorUserNotFound:          "用户不存在",
	ErrorAuth:                  "jwt密钥出错",
}

func GetMsg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}
	return MsgFlags[Error]
}
