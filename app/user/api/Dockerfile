# 使用多阶段构建，减小镜像体积
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY .. .
# 开启代理加速下载
RUN go env -w GOPROXY=https://goproxy.cn,direct
RUN go build -ldflags="-s -w" -o server main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/etc ./etc
# 运行
CMD ["./server", "-f", "etc/config.yaml"]
