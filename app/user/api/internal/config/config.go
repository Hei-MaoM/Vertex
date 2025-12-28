// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package config

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	Mysql struct {
		DataSource string
	}
	Redis redis.RedisConf
	Email struct {
		SmtpHost  string
		SmtpPort  int
		SmtpEmail string
		SmtpPass  string
		FromName  string
	}
	CacheRedis cache.CacheConf
}

const EmailTemplate = `
<div style="background-color:#F2F4F7; padding: 40px 0; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">VERTEX</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">HMM</p>
        </div>
        <div style="padding: 40px 30px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">验证码认证</h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">亲爱的用户，您好！</p>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">您正在进行 <span style="color: #4F46E5; font-weight: bold;">%s</span> 操作。请使用下方的验证码完成认证：</p>
            <div style="background-color: #F3F4F6; border-radius: 6px; padding: 24px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827;">%s</span>
            </div>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
                ⚠️ <strong>注意：</strong>验证码在 <strong>15分钟</strong> 内有效。<br>
                为了您的账号安全，请勿将此验证码泄露给他人。
            </p>
        </div>
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">如非本人操作，请忽略此邮件。</p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0 0;">&copy; 2025 Vertex Algorithm Forum. All rights reserved.</p>
        </div>
    </div>
</div>
`
const TokenExpireDuration = 24
