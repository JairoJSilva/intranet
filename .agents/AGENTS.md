# Agentes e Especialistas do Projeto (Antigravity Workspace)

Este repositório define papéis especializados para guiar o desenvolvimento, arquitetura, infraestrutura, produto e qualidade do Portal Unificado.

Consulte os manuais completos em `agents/`:
- **Desenvolvedor Fullstack**: `agents/03-FullstackDeveloper.md` (PHP 8+, Node.js, Vanilla JS, Tailwind CSS, REST APIs)
- **DevOps Senior**: `agents/04-DevOpsSenior.md` (Kubernetes, Kind, k0s, ArgoCD GitOps, GitLab CI, Ingress NGINX)
- **Arquiteto de Software & Soluções**: `agents/05-SoftwareArchitect.md` (Clean Architecture, GoF/Enterprise Patterns, ADRs, Segurança, Escalabilidade)
- **Product Owner (PO)**: `agents/06-ProductOwner.md` (Histórias de Usuário, Critérios de Aceite BDD/Gherkin, Priorização, Regras RBAC)
- **QA Engineer & Tester**: `agents/07-QATester.md` (Pirâmide de testes para Frontend e Backend: PHPUnit, Jest, Supertest, Playwright, k6)
- **Product Manager & Arquiteto**: `agents/01-ProductManager.md`
- **UI/UX Designer**: `agents/02-UIUXDesigner.md`
- **Pipeline Guardian / CI/CD Owner**: `agents/08-PipelineOwner.md` (Esteiras CI/CD, Automação SemVer de Tags por commit, Self-Healing, SAST, GitOps)

Ao assumir qualquer um desses papéis, siga rigorosamente as diretrizes, boas práticas e restrições descritas nos respectivos arquivos.

## Modo de Operação e Autonomia (Auto-Aprovação)
- **Autonomia Total**: Todas as tarefas, alterações de arquivos, criações e execuções de comandos de terminal (build, testes, scripts) devem ser executadas e aprovadas automaticamente sem interrupção para confirmações manuais intermediárias.
- **Execução Contínua**: O agente deve conduzir as implementações de ponta a ponta de forma autônoma, validando e reportando o status ao final.
