package errno

var MsgFlags = map[int]string{
	Success:                    "ok",
	Error:                      "fail",
	ErrorTokenEmpty:            "Token为空",
	ErrorAuthCheckTokenTimeout: "Token过期",
	ErrorAuthToken:             "Token认证失败",
}

func GetMsg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}
	return MsgFlags[Error]
}
