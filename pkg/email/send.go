package email

import (
	"gopkg.in/gomail.v2"
)

type Config struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}
type EmailSender struct {
	conf *Config
}

func NewEmailSender(conf *Config) *EmailSender {
	return &EmailSender{conf: conf}
}

// SendCode 发送验证码邮件
// to: 收件人邮箱, code: 验证码
func (s *EmailSender) SendCode(to string, code string, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("FROM", m.FormatAddress(s.conf.Username, s.conf.From))
	m.SetHeader("TO", to)
	m.SetHeader("SUBJECT", "验证码邮件")
	m.SetBody("text/html", body)
	d := gomail.NewDialer(s.conf.Host, s.conf.Port, s.conf.Username, s.conf.Password)
	return d.DialAndSend(m)
}
