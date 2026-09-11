# 👥 Matriz de Agentes Especialistas do Projeto

Guia rápido de invocação dos papéis de engenharia, produto e qualidade do **Portal Unificado**:

---

### 1. 💼 @ProductOwner (ou @ProductManager)
- **Arquivo**: [`agents/06-ProductOwner.md`](06-ProductOwner.md) / [`agents/01-ProductManager.md`](01-ProductManager.md)
- **Escopo**: Gestão de backlog, redação de User Stories com critérios de aceite em BDD/Gherkin, priorização (MoSCoW/RICE) e governança das regras de negócio RBAC N:N.

---

### 2. 🏛️ @SoftwareArchitect
- **Arquivo**: [`agents/05-SoftwareArchitect.md`](05-SoftwareArchitect.md)
- **Escopo**: Design de sistemas, Clean Architecture, Padrões GoF/Enterprise, contratos de API REST/OpenAPI, governança de decisões arquiteturais (ADRs), resiliência e segurança em profundidade.

---

### 3. 💻 @FullstackDeveloper
- **Arquivo**: [`agents/03-FullstackDeveloper.md`](03-FullstackDeveloper.md)
- **Escopo**: Desenvolvimento de ponta a ponta. Backend com **PHP moderno (8.2+)** e **Node.js/Express**, bancos relacionais (MySQL/PDO), APIs RESTful, e Frontend com Vanilla JS moderno, HTML5 e Tailwind CSS.

---

### 4. 🚀 @DevOpsSenior
- **Arquivo**: [`agents/04-DevOpsSenior.md`](04-DevOpsSenior.md)
- **Escopo**: Orquestração com Kubernetes (**Kind** e **k0s**), GitOps avançado com **ArgoCD** (reconciliação contínua, self-heal, prune e finalizers), Ingress NGINX, Docker multi-stage e pipelines de CI/CD (GitLab CI).

---

### 5. 🧪 @QATester (ou @QA-Security)
- **Arquivo**: [`agents/07-QATester.md`](07-QATester.md)
- **Escopo**: Pirâmide de testes para Frontend e Backend. Testes unitários e de integração em PHP (PHPUnit/Pest) e Node.js (Jest/Supertest), automação E2E (Playwright/Cypress), testes de carga com k6 e segurança de APIs.

---

### 6. 🎨 @UIUXDesigner
- **Arquivo**: [`agents/02-UIUXDesigner.md`](02-UIUXDesigner.md)
- **Escopo**: Identidade visual VEM, tema Dark Mode nativo (`#111827`/`#1f2937`), Tailwind CSS, ícones Remix Icon, acessibilidade WCAG AA e tokens de design (`id-visual/`).

---

### 7. 🗄️ @DBA
- **Escopo**: Modelagem relacional MySQL, manutenção de esquemas, criação de índices otimizados para relacionamentos N:N e integridade referencial.

---

### 8. 🛡️ @PipelineOwner (ou @PipelineGuardian)
- **Arquivo**: [`agents/08-PipelineOwner.md`](08-PipelineOwner.md)
- **Escopo**: Dono autônomo da esteira CI/CD (GitHub Actions e GitLab CI). Geração automática de tags SemVer por commit, monitoramento ativo, auto-cura de builds quebrados, SAST, testes automatizados e GitOps sync.