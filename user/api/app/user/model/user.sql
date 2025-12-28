CREATE TABLE `users`
(
    `id`         bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`   varchar(20)  NOT NULL DEFAULT '' COMMENT '用户名',
    `password`   varchar(100) NOT NULL DEFAULT '' COMMENT '加密后的密码',
    `email`      varchar(100) NOT NULL DEFAULT '' COMMENT '邮箱',
    `avatar`     varchar(255) NOT NULL DEFAULT '' COMMENT '头像',
    `authority`  tinyint(4) NOT NULL DEFAULT '1' COMMENT '权限: 1-普通用户, 2-管理员',
    `status`     tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态: 1-启用, 0-禁用',
    `phone`      varchar(20)           DEFAULT '' COMMENT '手机号',

    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` timestamp NULL DEFAULT NULL COMMENT '软删除时间',

    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_username` (`username`),      -- 👈 关键：goctl 会生成 FindOneByUsername
    UNIQUE KEY `idx_email` (`email`),            -- 👈 关键：goctl 会生成 FindOneByEmail
    KEY          `idx_deleted_at` (`deleted_at`) -- 软删除通常加索引，加快查询非删除数据的速度
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
