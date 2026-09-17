# 📝 RMT-20260916-04: Correção de Integridade do CI (composer.lock) e Configuração GitOps no ArgoCD

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-16  
> **Autor / Agente Responsável**: Antigravity AI / @DevOpsSenior & @PipelineOwner  
> **Tipo de Mudança**: Bugfix / Infra/DevOps / GitOps / CI/CD  
> **Versão Afetada**: v2.1.0  

---

## 1. 🎯 Contexto e Motivação

Foram identificados dois impedimentos operacionais críticos:
1. **Falha na Esteira do GitHub Actions (`ci.yml`)**: O job `Lint & Code Quality` falhava com exit code 2 na etapa `Validate composer.json` devido ao descasamento entre o arquivo `composer.json` e o hash criptográfico `content-hash` do `composer.lock`. Adicionalmente, identificou-se que os testes unitários do `ValidatorTest.php` falhavam na validação de URLs arbitrárias sem TLD/ponto.
2. **Ausência da Aplicação no Painel do ArgoCD**: A interface web do ArgoCD exibia a mensagem *"No applications available to you just yet"* porque nenhum recurso customizado (`kind: Application`) havia sido criado no cluster, e os manifestos locais da pasta `k8s/` ainda não haviam sido sincronizados com o branch remoto no GitHub.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/composer.lock` | Modificado | Regenerado e sincronizado com `composer.json` via Composer CLI |
| `aplicação/src/Helpers/Validator.php` | Modificado | Ajustada regex de validação de URL para exigir TLD ou localhost |
| `.github/workflows/ci.yml` | Modificado | Ajustadas variáveis de ambiente e comandos de banco para `intranet_db` com root |
| `argocd/application.yaml` | Criado | Manifesto declarativo do ArgoCD (`Application` CRD) apontando para a pasta `k8s` |
| `Documentações/modificacoes-tecnicas/README.md` | Modificado | Registro atualizado na tabela cronológica |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend & Validações
- **`aplicação/src/Helpers/Validator.php`**: Atualizada a expressão regular do método `url()` para `#^https?://(localhost|[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-\.]+)(:[0-9]+)?(/.*)?$#i`, garantindo a validação de endereços internos e a rejeição correta de strings sem separador de domínio como `not_a_valid_url`.

### 3.2. CI/CD Pipeline (GitHub Actions)
- **`composer.lock`**: Executado `composer update --lock` para sincronizar o lockfile após a renomeação do pacote para `portal/intranet`. A execução de `composer validate --strict` agora passa com código 0.
- **`.github/workflows/ci.yml`**: Atualizado o step de validação de banco e PHPUnit para usar `intranet_db` e conexão com senha de root configurada no service MySQL containerizado.

### 3.3. GitOps & Orquestração (ArgoCD)
- **`argocd/application.yaml`**: Criado manifesto do ArgoCD com reconciliação automatizada (`automated: { prune: true, selfHeal: true }`), sincronizando o repositório `https://github.com/JairoJSilva/intranet.git` (branch `main`, path `k8s`) para o namespace `intranet`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não.
- **Variáveis de Ambiente**: Nenhuma nova variável requerida.
- **Compatibilidade**: Total compatibilidade com o cluster Kind existente (`portal-cluster`).

---

## 5. 🧪 Testes e Validação
- [x] Validação estrita do Composer: `composer validate --strict` executado via container Docker com retorno de sucesso.
- [x] Suíte PHPUnit: Execução de todos os 6 testes unitários em `ValidatorTest.php` com 100% de aprovação.
- [x] Sintaxe PHP: Validação de 100% dos arquivos em `src/`, `public/` e `tests/` com `php -l`.
- [x] ArgoCD Application: `kubectl apply -f argocd/application.yaml` executado com sucesso e recurso criado no cluster.

---

## 6. 📌 Referências e Links Relacionados
- Workflow GitHub Actions: [ci.yml](file:///.github/workflows/ci.yml)
- Manifesto ArgoCD: [argocd/application.yaml](file:///argocd/application.yaml)
