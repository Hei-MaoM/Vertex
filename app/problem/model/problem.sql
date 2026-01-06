-- 1. 题目表 (公共资产，URL唯一)
CREATE TABLE `problem`
(
    `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
    `title`       varchar(255)  NOT NULL DEFAULT '' COMMENT '题目名称',
    `source`      varchar(50)   NOT NULL DEFAULT '' COMMENT '来源: LeetCode/Luogu等',
    `url`         varchar(700)  NOT NULL DEFAULT '' COMMENT '核心跳转链接',
    `description` varchar(1024) NOT NULL DEFAULT '' COMMENT '简短描述(可选)',
    `tags_str`    varchar(512)  NOT NULL DEFAULT '' COMMENT 'Tag名称快照',
    `solve_num` int unsigned NOT NULL DEFAULT '0',
    `collect_num` int unsigned NOT NULL DEFAULT '0',
    `created_at`  timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`  timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_url` (`url`) -- 保证一题一录
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目主表';

-- 2. 推荐帖子表 (用户发布的题解/推荐)
CREATE TABLE `problem_post`
(
    `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
    `problem_id`  bigint unsigned NOT NULL COMMENT '关联 problem.id',
    `user_id`     bigint unsigned NOT NULL COMMENT '关联 users.id',
    `title`       varchar(255) NOT NULL DEFAULT '' COMMENT '帖子标题',
    `content`     text         NOT NULL COMMENT '推荐理由/内容',
    `solution`    text         NOT NULL COMMENT '代码/题解',
    `status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '状态: 0-审核中, 1-以发布, 2-已撤销',
    `tags_str` varchar(512) NOT NULL DEFAULT '' COMMENT 'Tag名称快照',
    `view_num`    int unsigned NOT NULL DEFAULT '0',
    `collect_num` int unsigned NOT NULL DEFAULT '0',
    `score`      float not null default '0.00',
    `created_at`  timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`  timestamp NULL DEFAULT NULL,
    `embedding`   json NOT Null COMMENT '768维向量数据',
    PRIMARY KEY (`id`),
    KEY           `idx_problem_user` (`problem_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目推荐贴';
