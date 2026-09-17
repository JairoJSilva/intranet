-- ============================================================
-- Omniflowti — Portal Unificado Corporativo
-- Schema DDL — MySQL 8.0+ / MariaDB 10.6+
-- Charset: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `intranet_flowti`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `intranet_flowti`;

-- ------------------------------------------------------------
-- 1. USERS — Usuários do sistema (Local + LDAP/AD)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id`             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `username`       VARCHAR(100)    NOT NULL,
    `display_name`   VARCHAR(255)    NOT NULL,
    `email`          VARCHAR(255)    NOT NULL,
    `password_hash`  VARCHAR(255)    DEFAULT NULL COMMENT 'NULL para usuários autenticados apenas via LDAP',
    `auth_provider`  ENUM('local','ldap','sso') NOT NULL DEFAULT 'local',
    `is_admin`       TINYINT(1)      NOT NULL DEFAULT 0,
    `is_supervisor`  TINYINT(1)      NOT NULL DEFAULT 0,
    `is_active`      TINYINT(1)      NOT NULL DEFAULT 1,
    `avatar_url`     VARCHAR(500)    DEFAULT NULL,
    `last_login_at`  DATETIME        DEFAULT NULL,
    `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_email` (`email`),
    INDEX `idx_users_active` (`is_active`),
    INDEX `idx_users_provider` (`auth_provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. GROUPS — Grupos / Setores corporativos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groups` (
    `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(150)   NOT NULL,
    `slug`        VARCHAR(150)   NOT NULL,
    `description` TEXT           DEFAULT NULL,
    `icon`        VARCHAR(100)   DEFAULT 'ri-group-line' COMMENT 'Classe Remix Icon',
    `color`       VARCHAR(7)     DEFAULT '#0165aa' COMMENT 'Cor hex do grupo',
    `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
    `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_groups_name` (`name`),
    UNIQUE KEY `uk_groups_slug` (`slug`),
    INDEX `idx_groups_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. USER_GROUPS — Relação N:N entre Usuários e Grupos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_groups` (
    `user_id`            INT UNSIGNED NOT NULL,
    `group_id`           INT UNSIGNED NOT NULL,
    `role`               ENUM('member', 'supervisor', 'admin') NOT NULL DEFAULT 'member',
    `can_manage_links`   TINYINT(1)   NOT NULL DEFAULT 0,
    `can_manage_members` TINYINT(1)   NOT NULL DEFAULT 0,
    `assigned_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`user_id`, `group_id`),
    INDEX `idx_ug_group` (`group_id`),

    CONSTRAINT `fk_ug_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_ug_group`
        FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. PANELS — Painéis de links agrupados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `panels` (
    `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(200)   NOT NULL,
    `description` TEXT           DEFAULT NULL,
    `icon`        VARCHAR(100)   DEFAULT 'ri-dashboard-line',
    `sort_order`  INT            NOT NULL DEFAULT 0,
    `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
    `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_panels_sort` (`sort_order`),
    INDEX `idx_panels_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. GROUP_PANELS — Relação N:N entre Grupos e Painéis
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_panels` (
    `group_id`    INT UNSIGNED NOT NULL,
    `panel_id`    INT UNSIGNED NOT NULL,
    `assigned_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`group_id`, `panel_id`),
    INDEX `idx_gp_panel` (`panel_id`),

    CONSTRAINT `fk_gp_group`
        FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_gp_panel`
        FOREIGN KEY (`panel_id`) REFERENCES `panels` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. LINKS — Links/aplicações dentro de um painel
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `links` (
    `id`               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `panel_id`         INT UNSIGNED   NOT NULL,
    `title`            VARCHAR(200)   NOT NULL,
    `url`              VARCHAR(2048)  NOT NULL,
    `description`      TEXT           DEFAULT NULL,
    `icon`             VARCHAR(500)   DEFAULT 'ri-global-line' COMMENT 'RemixIcon ou URL do Favicon',
    `health_status`    ENUM('online','warning','offline','unknown') NOT NULL DEFAULT 'unknown',
    `response_time_ms` INT            DEFAULT NULL,
    `last_check_at`    DATETIME       DEFAULT NULL,
    `sort_order`       INT            NOT NULL DEFAULT 0,
    `is_active`        TINYINT(1)     NOT NULL DEFAULT 1,
    `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_links_panel` (`panel_id`),
    INDEX `idx_links_status` (`health_status`),
    INDEX `idx_links_sort` (`sort_order`),

    CONSTRAINT `fk_links_panel`
        FOREIGN KEY (`panel_id`) REFERENCES `panels` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. AUDIT_LOG — Registro de auditoria de ações
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`     INT UNSIGNED    DEFAULT NULL,
    `action`      VARCHAR(50)     NOT NULL COMMENT 'create, update, delete, login, logout',
    `entity_type` VARCHAR(50)     DEFAULT NULL COMMENT 'user, group, panel, link',
    `entity_id`   INT UNSIGNED    DEFAULT NULL,
    `old_values`  JSON            DEFAULT NULL,
    `new_values`  JSON            DEFAULT NULL,
    `ip_address`  VARCHAR(45)     DEFAULT NULL,
    `user_agent`  VARCHAR(500)    DEFAULT NULL,
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_date` (`created_at`),

    CONSTRAINT `fk_audit_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. NOTICES — Mural de avisos e manutenções programadas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
    `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255)   NOT NULL,
    `message`     TEXT           NOT NULL,
    `type`        ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
    `link_url`    VARCHAR(2048)  DEFAULT NULL,
    `link_text`   VARCHAR(100)   DEFAULT NULL,
    `starts_at`   DATETIME       DEFAULT NULL,
    `expires_at`  DATETIME       DEFAULT NULL,
    `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
    `created_by`  INT UNSIGNED   DEFAULT NULL,
    `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_notices_active` (`is_active`, `starts_at`, `expires_at`),

    CONSTRAINT `fk_notices_user`
        FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

