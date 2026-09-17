# 📝 RMT-20260916-05: Resolução de Visibilidade no ArgoCD, Ingress e Pipeline CI/CD Universal Replicável

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-16  
> **Autor / Agente Responsável**: @DevOpsSenior / @PipelineOwner / Antigravity Agent  
> **Tipo de Mudança**: [Infra/DevOps | GitOps | Architecture]  
> **Versão Afetada**: v2.1.0  

---

## 1. 🎯 Contexto e Motivação
O usuário relatou que, apesar do ArgoCD estar em execução no cluster Kind, a aplicação não estava aparecendo sincronizada no painel. Além disso, solicitou uma solução educativa e prática para aprender, criar e implantar uma pipeline universal replicável para qualquer nova aplicação com o mínimo de alteração possível.

O diagnóstico técnico identificou:
1. O manifesto `Application` do ArgoCD estava gerando `ComparisonError: k8s: app path does not exist` devido a um descasamento temporário com a branch remota do GitHub antes da reconciliação.
2. O serviço do ArgoCD Server não possuía rota Ingress exposta no host, impedindo o acesso visual ao dashboard pelo usuário.
3. Ausência de templates padronizados para inclusão rápida de novas aplicações no ciclo CI/CD e GitOps.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `argocd/ingress.yaml` | Criado | Manifesto Ingress NGINX para expor o ArgoCD em `http://argocd.local` |
| `argocd/templates/application-template.yaml` | Criado | Template de manifesto `Application` parametrizável para novas aplicações |
| `ci-templates/universal-pipeline.gitlab-ci.yml` | Criado | Template modular universal de CI/CD para GitLab CI com 5 estágios |
| `ci-templates/universal-pipeline.github-actions.yml` | Criado | Workflow reutilizável (`workflow_call`) para GitHub Actions |
| `scripts/onboard-app.sh` | Criado | Script interativo de automação para onboarding de novas aplicações |
| `Documentações/guias/GUIA-PIPELINE-GITOPS-UNIVERSAL.md` | Criado | Guia educativo detalhado sobre GitOps, ArgoCD e pipelines modulares |
| `/etc/hosts` | Modificado | Adicionado mapeamento de `argocd.local` e `intranet.local` para `127.0.0.1` |
| `k8s/03-mysql-initdb-configmap.yaml` | Modificado | Sincronizado e regenerado com labels padronizados |
| `aplicação/tests/api_test.php` | Modificado | Autodetecção de ambiente Kubernetes/container no `baseUrl` |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. ArgoCD & GitOps
- Configurado `server.insecure: "true"` no ConfigMap `argocd-cmd-params-cm` para operação HTTP limpa atrás do Ingress NGINX.
- Criado `argocd/ingress.yaml` associado ao serviço `argocd-server` na porta 80.
- Executado Hard Refresh na aplicação `portal-intranet` no ArgoCD:
  ```bash
  kubectl annotate application portal-intranet -n argocd argocd.argoproj.io/refresh=hard --overwrite
  ```
- Aplicação transitou com sucesso para o estado **Synced | Healthy**, rastreando todos os 16 recursos no namespace `intranet`.

### 3.2. Template de Pipeline Universal Replicável
- Desenvolvido `ci-templates/universal-pipeline.gitlab-ci.yml`:
  - Permite inclusão via `remote:` ou `local:`.
  - Exige apenas 5 variáveis no projeto consumidor (`APP_NAME`, `APP_TYPE`, `K8S_NAMESPACE`, `K8S_MANIFESTS_DIR`, `IMAGE_NAME`).
  - 5 estágios padronizados:
    1. `lint-and-quality`: Validação de código e manifestos Kubernetes.
    2. `security-sast`: Detecção de segredos hardcoded e chaves privadas.
    3. `test`: Execução de testes automatizados.
    4. `build-image`: Docker build multi-stage e publicação no container registry.
    5. `gitops-sync`: Notificação e disparo de sincronização no ArgoCD.

### 3.3. Script de Automação de Onboarding
- Desenvolvido `scripts/onboard-app.sh`:
  - Opera de forma interativa ou via CLI flags (`--name`, `--type`, `--repo`, `--namespace`, `--port`).
  - Gera a estrutura de manifestos `k8s/` (`deployment`, `service`, `ingress`, `kustomization`), o `.gitlab-ci.yml` pronto e o manifesto `Application` do ArgoCD.
  - Oferece aplicação imediata no cluster.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não.
- **Variáveis de Ambiente**: Nenhuma nova variável obrigatória no core da aplicação.
- **Credenciais do ArgoCD**: Usuário `admin`, senha `uXlxrn2LLOmPlcpf` (recuperada do secret inicial `argocd-initial-admin-secret`).

---

## 5. 🧪 Testes e Validação
- [x] **Verificação de Saúde no ArgoCD**:
  ```bash
  kubectl get application portal-intranet -n argocd
  # Retorno: portal-intranet Synced Healthy
  ```
- [x] **Validação Ingress ArgoCD**:
  ```bash
  curl -s -I -H "Host: argocd.local" http://localhost/
  # Retorno: HTTP/1.1 200 OK
  ```
- [x] **Suíte de Testes da Aplicação (api_test.php)**:
  ```bash
  kubectl exec -n intranet deployment/intranet-app -c intranet-app -- php tests/api_test.php
  # Retorno: Total: 52 | Aprovados: 52 | Falhas: 0 (100% de sucesso)
  ```
- [x] **Diagnóstico do Pipeline Guardian**:
  ```bash
  ./scripts/pipeline-guardian.sh --diagnose
  # Retorno: Estado Geral: HEALTHY (Pods 100% online)
  ```
- [x] **Validação de Execução do Script de Onboarding**:
  `scripts/onboard-app.sh` testado e validado com permissão de execução.

---

## 6. 📌 Referências e Links Relacionados
- [GUIA-PIPELINE-GITOPS-UNIVERSAL.md](../guias/GUIA-PIPELINE-GITOPS-UNIVERSAL.md)
- [universal-pipeline.gitlab-ci.yml](../../ci-templates/universal-pipeline.gitlab-ci.yml)
- [argocd/application.yaml](../../argocd/application.yaml)
- [argocd/ingress.yaml](../../argocd/ingress.yaml)
