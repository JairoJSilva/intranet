# 📝 RMT-20260911-02: Criação do Script de Automação Git Sync (Commit, Rebase e Push)

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: Antigravity AI / @DevOpsSenior  
> **Tipo de Mudança**: Infra/DevOps / Automation  
> **Versão Afetada**: v2.0.1  

---

## 1. 🎯 Contexto e Motivação
Necessidade de um utilitário de terminal corporativo completo e seguro que simplifique o fluxo de trabalho diário com Git, unificando:
1. Inspeção e staging inteligente de alterações (`git add`).
2. Padronização de mensagens de commit com Conventional Commits (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`).
3. Sincronização e Rebase automático com branches remotas ou branch principal (`main`), evitando merge commits poluídos no histórico.
4. Resolução assistida de conflitos de rebase com instruções claras para o desenvolvedor.
5. Push seguro com auto-configuração de upstream (`-u`) e suporte a `--force-with-lease`.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `scripts/git-sync.sh` | Criado | Script Bash executável com menu interativo e flags CLI para commit, rebase e push |
| `Documentações/modificacoes-tecnicas/RMT-20260911-02-script-automacao-git-sync.md` | Criado | Este registro técnico |
| `Documentações/modificacoes-tecnicas/README.md` | Modificado | Atualização da tabela cronológica de modificações técnicas |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Script `scripts/git-sync.sh`
- **Shell**: Bash com `set -eo pipefail`.
- **Interface e Cores**: Banner visual formatado, cores ANSI e mensagens semânticas (`info`, `success`, `warn`, `error`).
- **Flags Suportadas**:
  - `-m, --message <msg>`: Permite informar mensagem via CLI sem entrar no modo interativo.
  - `-a, --all`: Adiciona automaticamente todas as mudanças com `git add -A`.
  - `-r, --rebase [branch]`: Força rebase com upstream ou com branch especificada (ex.: `origin/main`).
  - `-n, --no-push`: Realiza commit e rebase sem disparar push para o servidor remoto.
  - `-f, --force-with-lease`: Executa push seguro sobrescrevendo histórico após rebase local.
  - `-h, --help`: Manual de ajuda integrado.
- **Modo Interativo**:
  - Exibe resumo de arquivos alterados via `git status --short`.
  - Pergunta sobre staging caso nada esteja preparado.
  - Menu interativo para seleção de tipo de commit (Conventional Commits).
  - Verificação de divergência entre branch local e remota (`git fetch`).
  - Tratamento de erro com instruções detalhadas se ocorrer conflito durante `git rebase`.
  - Push com `-u origin <branch>` automático para novas branches.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Trata-se de script utilitário de desenvolvedor.
- **Requisitos de Sistema**: `bash` 4+ e `git` 2.x instalado no ambiente do usuário.
- **Permissões**: Permissão de execução configurada (`chmod +x scripts/git-sync.sh`).

---

## 5. 🧪 Testes e Validação
- [x] Teste de sintaxe e flags com `./scripts/git-sync.sh --help`.
- [x] Validação de detecção de branch (`main`) e repositório raiz.
- [x] Validação de opções de commit e flags combinadas.
