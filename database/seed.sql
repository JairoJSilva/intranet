-- ============================================================
-- Intranet Flowti — Seed Data
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
INSERT INTO `user_groups` (`user_id`, `group_id`) VALUES
(1, 1),
(1, 4),
(2, 1),
(3, 2);

-- ------------------------------------------------------------
-- 4. PANELS
-- ------------------------------------------------------------
INSERT INTO `panels` (`title`, `description`, `icon`, `sort_order`) VALUES
('Monitoramento',         'Ferramentas de monitoramento e observabilidade',  'ri-line-chart-line',   1),
('DevOps & CI/CD',        'Ferramentas de desenvolvimento e deploy',         'ri-git-branch-line',   2),
('Faturamento',           'Sistemas de faturamento e notas fiscais',         'ri-bill-line',         3),
('Contas a Pagar',        'Gestão de pagamentos e fornecedores',             'ri-bank-card-line',    4),
('Portal RH',             'Sistemas de gestão de pessoas',                   'ri-user-heart-line',   5),
('Relatórios Gerenciais', 'Dashboards e relatórios executivos',              'ri-pie-chart-line',    6);

-- ------------------------------------------------------------
-- 5. GROUP_PANELS
-- TIC: Monitoramento, DevOps
-- Financeiro: Faturamento, Contas a Pagar
-- RH: Portal RH
-- Diretoria: Relatórios Gerenciais
-- ------------------------------------------------------------
INSERT INTO `group_panels` (`group_id`, `panel_id`) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 5),
(4, 6);

-- ------------------------------------------------------------
-- 6. LINKS
-- ------------------------------------------------------------
INSERT INTO `links` (`panel_id`, `title`, `url`, `description`, `icon`, `sort_order`) VALUES
(1, 'Grafana',              'https://grafana.flowti.com.br',        'Dashboards de monitoramento',          'ri-dashboard-3-line',    1),
(1, 'Zabbix',               'https://zabbix.flowti.com.br',         'Monitoramento de infraestrutura',      'ri-radar-line',          2),
(1, 'Kibana',               'https://kibana.flowti.com.br',         'Análise de logs centralizada',         'ri-search-eye-line',     3),
(2, 'GitLab',               'https://gitlab.flowti.com.br',         'Repositório de código e CI/CD',        'ri-git-repository-line', 1),
(2, 'ArgoCD',               'https://argocd.flowti.com.br',         'GitOps — Deploy automático K8s',       'ri-rocket-2-line',       2),
(2, 'Harbor Registry',      'https://harbor.flowti.com.br',         'Registry de imagens Docker',           'ri-ship-line',           3),
(2, 'SonarQube',            'https://sonar.flowti.com.br',          'Qualidade e segurança de código',      'ri-bug-line',            4),
(3, 'Sistema NFe',          'https://nfe.flowti.com.br',            'Emissão de notas fiscais eletrônicas', 'ri-file-text-line',      1),
(3, 'ERP Financeiro',       'https://erp.flowti.com.br/financeiro', 'Módulo financeiro do ERP',             'ri-funds-line',          2),
(4, 'Portal Fornecedores',  'https://fornecedores.flowti.com.br',   'Gestão de fornecedores e pagamentos',  'ri-store-2-line',        1),
(4, 'Internet Banking',     'https://www.bb.com.br',                'Banco do Brasil — Internet Banking',   'ri-bank-line',           2),
(5, 'Ponto Eletrônico',     'https://ponto.flowti.com.br',          'Sistema de ponto e frequência',        'ri-time-line',           1),
(5, 'Portal do Colaborador','https://rh.flowti.com.br',             'Holerites, férias e benefícios',       'ri-user-smile-line',     2),
(6, 'Power BI',             'https://app.powerbi.com',              'Dashboards executivos',                'ri-bar-chart-box-line',  1),
(6, 'Relatórios Custom',    'https://reports.flowti.com.br',        'Relatórios personalizados',            'ri-file-chart-line',     2);
