package email

import (
	"fmt"
	"math/rand"
	"time"

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
func (s *EmailSender) SendCode(to string, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(s.conf.Username, s.conf.From))
	m.SetHeader("To", to)
	m.SetHeader("Subject", "验证码邮件")
	m.SetBody("text/html", body)
	d := gomail.NewDialer(s.conf.Host, s.conf.Port, s.conf.Username, s.conf.Password)
	d.SSL = true
	return d.DialAndSend(m)
}

func (s *EmailSender) CreateCode(email string) string {
	h := 0
	rand.Seed(time.Now().UnixNano())
	for i := 0; i < len(email); i++ {
		h = (h*rand.Intn(1000000) + int(email[i])) % 1000000
		h = h ^ rand.Intn(1000000)
		h = h % 1000000
	}
	res := fmt.Sprintf("%6d", h)
	return res
}
