-- 1. 标签字典
CREATE TABLE `tag`
(
    `id`       int unsigned NOT NULL AUTO_INCREMENT,
    `name`     varchar(50) NOT NULL DEFAULT '',
    `category` varchar(50) NOT NULL DEFAULT '算法',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 题目-标签关联表
CREATE TABLE `problem_tag`
(
    `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
    `problem_id` bigint unsigned NOT NULL,
    `tag_id`     int unsigned NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_problem_tag` (`problem_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
