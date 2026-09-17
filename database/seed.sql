-- ============================================================
-- Portal Unificado Corporativo — Seed Data
-- Senhas padrão (BCrypt):
--   admin   → BHU*nji9
--   suporte → Suporte@Portal2024
--   usuario → Usuario@Portal2024
-- ============================================================

USE `intranet_db`;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
INSERT INTO `users` (`username`, `display_name`, `email`, `password_hash`, `auth_provider`, `is_admin`, `is_supervisor`, `is_active`) VALUES
('admin',   'Administrador do Sistema', 'admin@portal.local',   '$2y$12$ePgV/XPT.plecIKXSEJ7tOyvhRYuhS1lpk8kInLBGBT1gA2OloEJy', 'local', 1, 0, 1),
('suporte', 'Suporte Técnico TIC',      'suporte@portal.local', '$2y$10$yAXB5S7OAGlSh8bi8YyXjeyZYSUQvCFaszSjGy.s/1JGWIVExorPS', 'local', 0, 1, 1),
('usuario', 'Usuário Colaborador',      'usuario@portal.local', '$2y$10$QPyAPSyZ3oNb8FS7BVbZjO3zpuXxwpFAPUtl15ZaWzNHSGO5cSsF.', 'local', 0, 0, 1);

-- ------------------------------------------------------------
-- 2. GROUPS
-- ------------------------------------------------------------
INSERT INTO `groups` (`name`, `slug`, `description`, `icon`, `color`) VALUES
('TIC',               'tic',               'Tecnologia da Informação e Comunicação', 'ri-computer-line',            '#0165aa'),
('Financeiro',        'financeiro',        'Setor Financeiro e Contabilidade',       'ri-money-dollar-circle-line', '#10b981'),
('Recursos Humanos',  'recursos-humanos',  'Gestão de Pessoas e Departamento Pessoal','ri-team-line',               '#8b5cf6'),
('Diretoria',         'diretoria',         'Diretoria Executiva e Estratégica',      'ri-building-2-line',          '#f67f1d');

-- ------------------------------------------------------------
-- 3. USER_GROUPS
-- admin  → TIC + Diretoria (bypass global via is_admin)
-- suporte → TIC (supervisor do setor)
-- usuario → Financeiro (colaborador)
-- ------------------------------------------------------------
INSERT INTO `user_groups` (`user_id`, `group_id`, `role`, `can_manage_links`, `can_manage_members`) VALUES
(1, 1, 'admin', 1, 1),
(1, 4, 'admin', 1, 1),
(2, 1, 'supervisor', 1, 0),
(3, 2, 'member', 0, 0);

-- ------------------------------------------------------------
-- 4. PANELS
-- ------------------------------------------------------------
INSERT INTO `panels` (`title`, `description`, `icon`, `sort_order`) VALUES
('Sistemas Corporativos',  'Aplicações e agentes internos de automação',       'ri-cpu-line',            1),
('Portal-OCI',            'Oracle Cloud Infrastructure — Ambientes e Tenants','ri-cloud-line',          2),
('Portal-Azure',          'Microsoft Azure — Portal de Gestão Cloud',        'ri-microsoft-line',      3),
('Portal-AWS',            'Amazon Web Services — Console de Gestão Cloud',    'ri-amazon-line',         4),
('Cofres de Senhas',      'Cofres e gerenciadores corporativos de senhas',   'ri-shield-keyhole-line', 5),
('DevOps & Monitoramento','Operações, observabilidade e gestão de chamados', 'ri-pulse-line',          6),
('Financeiro',            'Sistemas de faturamento e notas fiscais',          'ri-bill-line',           7),
('Recursos Humanos',      'Sistemas de gestão de pessoas e benefícios',       'ri-user-heart-line',     8);

-- ------------------------------------------------------------
-- 5. GROUP_PANELS
-- TIC (1): Sistemas Corporativos, Portal-OCI, Portal-Azure, Portal-AWS, Cofres, DevOps
-- Financeiro (2): Financeiro
-- RH (3): Recursos Humanos
-- Diretoria (4): Sistemas Corporativos, Portais Cloud, DevOps, Financeiro
-- ------------------------------------------------------------
INSERT INTO `group_panels` (`group_id`, `panel_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(2, 7),
(3, 8),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 6),
(4, 7);

-- ------------------------------------------------------------
-- 6. LINKS
-- ------------------------------------------------------------
INSERT INTO `links` (`panel_id`, `title`, `url`, `description`, `icon`, `sort_order`) VALUES
-- Sistemas Corporativos
(1, 'Agent-Interno',     'https://agent.empresa.local/index.php',                                      'Agente de monitoramento e automação interno',      'ri-robot-line',        1),
(1, 'Cloud-Inventory',   'https://inventario.empresa.local/index.php',                                 'Inventário de recursos e infraestrutura cloud',    'ri-server-line',       2),

-- Portal-OCI
(2, 'OCI-Frankfurt',     'https://cloud.oracle.com/?region=eu-frankfurt-1',                            'Oracle Cloud — Tenant Frankfurt (eu-frankfurt-1)', 'ri-cloud-line',       1),
(2, 'OCI-SaoPaulo',      'https://cloud.oracle.com/?region=sa-saopaulo-1',                             'Oracle Cloud — Tenant São Paulo (sa-saopaulo-1)',  'ri-cloud-line',       2),

-- Portal-Azure
(3, 'Portal Azure',      'https://portal.azure.com',                                                   'Console de administração Microsoft Azure',         'ri-microsoft-line',    1),

-- Portal-AWS
(4, 'Portal AWS',        'https://console.aws.amazon.com',                                             'AWS Management Console — Acesso global',          'ri-amazon-line',       1),

-- Cofres de Senhas
(5, 'Passbolt',          'https://passbolt.empresa.local/app/passwords',                               'Cofre de senhas corporativo compartilhado',        'ri-key-2-line',        1),
(5, 'Keeper',            'https://keepersecurity.com/vault/#',                                         'Keeper Security Vault — Cofre seguro de senhas',   'ri-safe-2-line',       2),

-- DevOps & Monitoramento
(6, 'Grafana',           'https://dash.empresa.local/login',                                           'Dashboards de telemetria e monitoramento',         'ri-dashboard-3-line',  1),
(6, 'Jira-Operações',    'https://jira.empresa.local/projects/OPS',                                    'Gestão de demandas e chamados de Operações',       'ri-task-line',         2),

-- Financeiro
(7, 'Sistema NFe',       'https://nfe.empresa.local',                                                  'Emissão de notas fiscais eletrônicas',             'ri-file-text-line',    1),
(7, 'ERP Financeiro',    'https://erp.empresa.local/financeiro',                                       'Módulo financeiro do ERP',                         'ri-funds-line',        2),

-- Recursos Humanos
(8, 'Ponto Eletrônico',  'https://ponto.empresa.local',                                                'Sistema de ponto e frequência',                    'ri-time-line',         1),
(8, 'Portal Colaborador','https://rh.empresa.local',                                                   'Holerites, férias e benefícios',                   'ri-user-smile-line',   2);
