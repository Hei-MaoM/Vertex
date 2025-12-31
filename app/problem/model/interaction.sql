-- 1. 打卡记录表 (记录谁做过哪道题)
CREATE TABLE `user_solved`
(
    `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id`    bigint unsigned NOT NULL,
    `problem_id` bigint unsigned NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_problem` (`user_id`, `problem_id`) -- 防止重复打卡
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户刷题记录';

CREATE TABLE `user_collect`
(
    `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id`    bigint unsigned NOT NULL,
    `target_id`  bigint unsigned NOT NULL COMMENT 'problem_id 或 post_id',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_target` (`user_id`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';
