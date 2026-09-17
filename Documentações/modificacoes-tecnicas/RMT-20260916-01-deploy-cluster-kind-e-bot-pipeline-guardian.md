# 📝 RMT-20260916-01: Deploy no Cluster Kind (Namespace intranet) e Criação do Bot Pipeline Guardian

> **RMT (Registro de Modificação Técnica)**  
> **Status**: ✅ Aplicada  
> **Data**: 2026-09-16  
> **Autor / Agente Responsável**: Antigravity AI / @DevOpsSenior & @PipelineOwner  
> **Tipo de Mudança**: Infra/DevOps / Automation / Monitoring  
> **Versão Afetada**: v1.4.2  

---

## 1. 🎯 Contexto e Motivação
Atendimento à demanda de implantação da aplicação Flowti Intranet (Omniflowti) diretamente no cluster Kubernetes local baseado em **Kind** (`portal-cluster`), alocando todos os componentes dentro do namespace isolado **`intranet`**. Adicionalmente, foi implementado e ativado o **Pipeline Guardian Bot**, um agente autônomo supervisor de pipeline e cluster encarregado de monitorar o ciclo de vida dos pods, rollouts, conexões com banco de dados, roteamento Ingress e identificar falhas técnicas e exceções com diagnóstico de causa-raiz e remediações acionáveis em tempo real.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `k8s/00-namespace.yaml` | Criado | Declaração declarativa do namespace `intranet`. |
| `k8s/01-mysql-secret.yaml` | Criado | Credenciais seguras para o banco de dados MySQL 8.0. |
| `k8s/02-mysql-pvc.yaml` | Criado | Volume persistente (2Gi, storageClassName `standard`). |
| `k8s/03-mysql-initdb-configmap.yaml` | Criado | ConfigMap contendo `schema.sql` e `seed.sql` com senhas em hash bcrypt. |
| `k8s/04-mysql-deployment.yaml` | Criado | Deployment e Service do MySQL 8.0 com probes de integridade. |
| `k8s/05-app-configmap.yaml` | Criado | Variáveis de configuração da aplicação PHP 8.2 Apache. |
| `k8s/06-app-secret.yaml` | Criado | Segredos de aplicação e chaves de sessão. |
| `k8s/07-app-deployment.yaml` | Criado | Deployment da aplicação PHP 8.2 (2 réplicas, RollingUpdate, probes). |
| `k8s/08-app-service.yaml` | Criado | Service ClusterIP expondo porta 80 da aplicação. |
| `k8s/09-app-ingress.yaml` | Criado | Roteamento Ingress NGINX para `intranet.local`, `localhost` e `guardian.local`. |
| `k8s/10-guardian-bot-rbac.yaml` | Criado | ServiceAccount, Role e RoleBinding para o bot no namespace `intranet`. |
| `k8s/11-guardian-bot-deployment.yaml` | Criado | Deployment e Service do bot supervisor `pipeline-guardian`. |
| `k8s/kustomization.yaml` | Criado | Pacote Kustomize agregador de todos os manifestos do namespace `intranet`. |
| `docker/Dockerfile.guardian` | Criado | Imagem conteinerizada enxuta (Alpine + Python3) para o daemon do bot. |
| `scripts/pipeline-guardian.py` | Modificado | Motor aprimorado com diagnósticos de cluster, detecção de erros e dashboard HTTP. |
| `database/seed.sql` | Modificado | Inclusão de hashes BCrypt reais para credenciais de inicialização. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Infraestrutura Kubernetes no Kind (`portal-cluster`)
- **Namespace**: `intranet`.
- **Topologia de Banco de Dados**: MySQL 8.0 implantado com PersistentVolumeClaim via storage provisioner local do Kind (`rancher.io/local-path`), inicialização automática de esquemas e dados via ConfigMap `/docker-entrypoint-initdb.d/`.
- **Topologia de Aplicação**: Imagem `flowti-app:latest` carregada nos nós do Kind via `kind load docker-image`, rodando com 2 réplicas, readiness e liveness probes em `/index.html` e limites de CPU/memória definidos.
- **Roteamento Ingress**: Configurado com `ingressClassName: nginx` suportando requisições diretas em `http://localhost/` e cabeçalhos de host `intranet.local`, `portalvem.local` e `guardian.local`.

### 3.2. Pipeline Guardian Bot
- **Modos de Operação**:
  1. **In-Cluster Daemon**: Executando como pod contínuo no namespace `intranet` com RBAC restrito, varrendo pods e eventos a cada 15s e servindo dashboard visual HTML na porta 9090 (`http://guardian.local/`).
  2. **CLI Host Diagnostic**: Execução local via `./scripts/pipeline-guardian.sh --diagnose` ou `python3 scripts/pipeline-guardian.py --diagnose`, gerando relatórios instantâneos em terminal.
  3. **GitOps ConfigMap Sync**: Atualização automática do ConfigMap `pipeline-guardian-status` no namespace `intranet` contendo o payload JSON e saúde global (`overall_health`).
- **Motor de Detecção de Erros**:
  - Análise regex de falhas de banco de dados (`Connection refused`, `Access denied`, `Table doesn't exist`).
  - Falhas de ciclo de vida de pods (`CrashLoopBackOff`, `ImagePullBackOff`, `OOMKilled`).
  - Exceções e erros fatais PHP em tempo de execução.
  - Falhas de probes e indisponibilidade de Ingress/HTTP.
  - Para cada falha, gera diagnóstico estruturado: Severidade, Causa-Raiz, Evidência e Comando de Correção.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não.
- **Variáveis de Ambiente**: Gerenciadas via ConfigMap `intranet-config` e Secret `intranet-secret`.
- **Compatibilidade**: Total compatibilidade com o cluster Kind existente (`portal-cluster`) e Docker Compose local.

---

## 5. 🧪 Testes e Validação
- [x] Build da imagem `flowti-app:latest` e carga nos nós do cluster Kind (`portal-cluster`).
- [x] Build da imagem `pipeline-guardian:latest` e carga nos nós do Kind.
- [x] Aplicação declarativa via `kubectl apply -f k8s/`.
- [x] Teste de conectividade e status dos 4 pods no namespace `intranet` (todos `1/1 Running`).
- [x] Teste HTTP no Ingress: `curl -i http://localhost/` retornando HTTP 200 e HTML do portal.
- [x] Teste de autenticação na API: `POST /api/auth/login` retornando sucesso com credenciais seed.
- [x] Teste do dashboard do bot: `curl -s -H "Host: guardian.local" http://localhost/` retornando o dashboard HTML do Pipeline Guardian.
- [x] Execução do diagnóstico via CLI: `./scripts/pipeline-guardian.sh --diagnose` retornando `HEALTHY` com 0 erros.

---

## 6. 📌 Referências e Links Relacionados
- Manifestos Kubernetes: [`k8s/`](../../k8s/)
- Script do Bot: [`scripts/pipeline-guardian.py`](../../scripts/pipeline-guardian.py)
- Shell Runner: [`scripts/pipeline-guardian.sh`](../../scripts/pipeline-guardian.py)
