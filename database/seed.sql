-- ============================================================
-- Omniflowti — Seed Data
-- Senhas padrão (BCrypt):
--   admin   → Admin@Flowti2024
--   suporte → Suporte@Flowti2024
--   usuario → Usuario@Flowti2024
-- NOTA: Os hashes abaixo são placeholders. O bootstrap.php
-- recria as senhas com password_hash() na primeira execução.
-- ============================================================

USE `intranet_flowti`;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
INSERT INTO `users` (`username`, `display_name`, `email`, `password_hash`, `auth_provider`, `is_admin`, `is_supervisor`, `is_active`) VALUES
('admin',   'Administrador do Sistema', 'admin@flowti.com.br',   '$2y$12$placeholder.hash.will.be.regenerated.on.first.boot000', 'local', 1, 0, 1),
('suporte', 'Suporte Técnico TIC',      'suporte@flowti.com.br', '$2y$12$placeholder.hash.will.be.regenerated.on.first.boot000', 'local', 0, 1, 1),
('usuario', 'Usuário Colaborador',      'usuario@flowti.com.br', '$2y$12$placeholder.hash.will.be.regenerated.on.first.boot000', 'local', 0, 0, 1);

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
('Sistemas Flowti',        'Aplicações e agentes internos de automação',       'ri-cpu-line',            1),
('Portal-OCI',            'Oracle Cloud Infrastructure — Ambientes e Tenants','ri-cloud-line',          2),
('Portal-Azure',          'Microsoft Azure — Portal de Gestão Cloud',        'ri-microsoft-line',      3),
('Portal-AWS',            'Amazon Web Services — Console de Gestão Cloud',    'ri-amazon-line',         4),
('Cofres de Senhas',      'Cofres e gerenciadores corporativos de senhas',   'ri-shield-keyhole-line', 5),
('DevOps & Monitoramento','Operações, observabilidade e gestão de chamados', 'ri-pulse-line',          6),
('Financeiro',            'Sistemas de faturamento e notas fiscais',          'ri-bill-line',           7),
('Recursos Humanos',      'Sistemas de gestão de pessoas e benefícios',       'ri-user-heart-line',     8);

-- ------------------------------------------------------------
-- 5. GROUP_PANELS
-- TIC (1): Sistemas Flowti, Portal-OCI, Portal-Azure, Portal-AWS, Cofres, DevOps
-- Financeiro (2): Financeiro
-- RH (3): Recursos Humanos
-- Diretoria (4): Sistemas Flowti, Portais Cloud, DevOps, Financeiro
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
-- Links reais cadastrados a partir de links-salvos
-- ------------------------------------------------------------
INSERT INTO `links` (`panel_id`, `title`, `url`, `description`, `icon`, `sort_order`) VALUES
-- Sistemas Flowti
(1, 'Flowti-agent',     'https://flowti-agent-develop.flowti.com.br/index.php',                                        'Agente de monitoramento e automação Flowti',       'ri-robot-line',        1),
(1, 'Cloud-Inventory',  'https://cloud-inventory.flowti.com.br/index.php',                                            'Inventário de recursos e infraestrutura cloud',    'ri-server-line',       2),

-- Portal-OCI (Pastas Cloud)
(2, 'cloudmvoracle',    'https://cloud.oracle.com/?tenant=cloudmvoracle&region=eu-frankfurt-1',                        'Oracle Cloud — Tenant cloudmvoracle (eu-frankfurt-1)', 'ri-cloud-line',   1),
(2, 'mvcliensaas',      'https://www.oracle.com/cloud/sign-in.html?redirect_uri=https%3A%2F%2Fcloud.oracle.com%2F%3Fregion%3Dsa-saopaulo-1', 'Oracle Cloud — Tenant mvcliensaas (sa-saopaulo-1)', 'ri-cloud-line', 2),

-- Portal-Azure
(3, 'Portal Azure',     'https://portal.azure.com',                                                                   'Console de administração Microsoft Azure',         'ri-microsoft-line',    1),

-- Portal-AWS
(4, 'Portal AWS',       'https://console.aws.amazon.com',                                                             'AWS Management Console — Acesso global aos serviços', 'ri-amazon-line',    1),

-- Cofres de Senhas
(5, 'Passbolt',         'https://passbolt-develop.flowti.com.br/app/passwords',                                       'Cofre de senhas corporativo compartilhado',        'ri-key-2-line',        1),
(5, 'Keeper',           'https://keepersecurity.com/vault/#',                                                         'Keeper Security Vault — Cofre seguro de senhas',   'ri-safe-2-line',       2),

-- DevOps & Monitoramento
(6, 'Grafana',          'https://dash.flowti.com.br/login',                                                           'Dashboards de telemetria e monitoramento',         'ri-dashboard-3-line',  1),
(6, 'Jira-DevOps',      'https://jira.mv.com.br/projects/OPS/issues/OPS-14?filter=allopenissues',                     'Gestão de demandas e chamados de Operações',       'ri-task-line',         2),

-- Financeiro
(7, 'Sistema NFe',      'https://nfe.flowti.com.br',                                                                  'Emissão de notas fiscais eletrônicas',             'ri-file-text-line',    1),
(7, 'ERP Financeiro',   'https://erp.flowti.com.br/financeiro',                                                       'Módulo financeiro do ERP',                         'ri-funds-line',        2),

-- Recursos Humanos
(8, 'Ponto Eletrônico', 'https://ponto.flowti.com.br',                                                                'Sistema de ponto e frequência',                    'ri-time-line',         1),
(8, 'Portal do Colaborador', 'https://rh.flowti.com.br',                                                              'Holerites, férias e benefícios',                   'ri-user-smile-line',   2);

