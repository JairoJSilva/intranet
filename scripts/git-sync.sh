#!/usr/bin/env bash
# ==============================================================================
# 🚀 Portal Unificado — Git Sync Master (Commit + Rebase + Push)
# Script completo e interativo para automação de fluxo Git com Rebase seguro.
# ==============================================================================

set -eo pipefail

# ---- Cores & Formatação ----
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'

# ---- Utilitários de Log ----
banner() {
  echo -e "${MAGENTA}${BOLD}"
  echo "╔══════════════════════════════════════════════════════════════════════════╗"
  echo "║       🚀 PORTAL UNIFICADO — GIT SYNC MASTER (Commit • Rebase • Push)     ║"
  echo "╚══════════════════════════════════════════════════════════════════════════╝"
  echo -e "${RESET}"
}

info()    { echo -e "${CYAN}${BOLD}ℹ [INFO]${RESET} $*"; }
success() { echo -e "${GREEN}${BOLD}✔ [SUCESSO]${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠ [AVISO]${RESET} $*"; }
error()   { echo -e "${RED}${BOLD}✖ [ERRO]${RESET} $*" >&2; }
step()    { echo -e "\n${BLUE}${BOLD}==>${RESET} ${WHITE}${BOLD}$*${RESET}"; }

# ---- Help / Uso ----
usage() {
  echo -e "${BOLD}Uso:${RESET} ./scripts/git-sync.sh [opções]"
  echo ""
  echo -e "${BOLD}Opções:${RESET}"
  echo -e "  ${CYAN}-m, --message <msg>${RESET}       Define a mensagem de commit diretamente"
  echo -e "  ${CYAN}-a, --all${RESET}                 Adiciona automaticamente todos os arquivos ('git add -A')"
  echo -e "  ${CYAN}-r, --rebase [branch]${RESET}     Executa rebase com o upstream ou com a branch informada"
  echo -e "  ${CYAN}-n, --no-push${RESET}             Apenas comita (e rebaseia), sem enviar ao remoto (push)"
  echo -e "  ${CYAN}-f, --force-with-lease${RESET}    Executa push com '--force-with-lease' (caso tenha rebaseado histórico local)"
  echo -e "  ${CYAN}-h, --help${RESET}                Exibe este menu de ajuda"
  echo ""
  echo -e "${BOLD}Exemplos:${RESET}"
  echo "  ./scripts/git-sync.sh"
  echo "  ./scripts/git-sync.sh -m 'feat: adicionar novo painel de observabilidade'"
  echo "  ./scripts/git-sync.sh -a -m 'fix: corrigir rota de health check' --rebase"
  echo "  ./scripts/git-sync.sh --rebase origin/main"
  exit 0
}

# ---- Verificações Iniciais ----
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  error "Este diretório não faz parte de um repositório Git!"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE="origin"

# ---- Processamento de Argumentos ----
COMMIT_MSG=""
ADD_ALL=false
DO_REBASE=false
REBASE_TARGET=""
DO_PUSH=true
FORCE_WITH_LEASE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      COMMIT_MSG="${2:-}"
      shift 2
      ;;
    -a|--all)
      ADD_ALL=true
      shift
      ;;
    -r|--rebase)
      DO_REBASE=true
      if [[ -n "${2:-}" && ! "$2" =~ ^- ]]; then
        REBASE_TARGET="$2"
        shift 2
      else
        shift
      fi
      ;;
    -n|--no-push)
      DO_PUSH=false
      shift
      ;;
    -f|--force-with-lease)
      FORCE_WITH_LEASE=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      # Se for texto avulso e não temos mensagem ainda, assume como mensagem
      if [[ -z "$COMMIT_MSG" && ! "$1" =~ ^- ]]; then
        COMMIT_MSG="$1"
        shift
      else
        error "Opção desconhecida: $1"
        usage
      fi
      ;;
  esac
done

banner

info "Repositório: ${WHITE}${REPO_ROOT}${RESET}"
info "Branch atual: ${GREEN}${BOLD}${CURRENT_BRANCH}${RESET}"
info "Remoto:       ${WHITE}${REMOTE}${RESET}"

# ---- 1. Análise de Mudanças no Workspace ----
step "1/4. Analisando arquivos modificados..."

STATUS_PORCELAIN="$(git status --porcelain)"
HAS_CHANGES=false
[[ -n "$STATUS_PORCELAIN" ]] && HAS_CHANGES=true

if [ "$HAS_CHANGES" = true ]; then
  echo -e "\n${BOLD}Arquivos alterados no repositório:${RESET}"
  git status --short
  echo ""

  # Pergunta se deseja adicionar arquivos caso não tenha passado -a
  if [ "$ADD_ALL" = false ]; then
    STAGED_CHANGES="$(git diff --cached --name-only)"
    if [ -z "$STAGED_CHANGES" ]; then
      read -r -p "$(echo -e "${CYAN}? Nenhum arquivo preparado. Deseja adicionar TODOS os arquivos ('git add -A')? [S/n]: ${RESET}")" ADD_CONFIRM
      ADD_CONFIRM=${ADD_CONFIRM:-S}
      if [[ "$ADD_CONFIRM" =~ ^[SsYy]$ ]]; then
        git add -A
        success "Todos os arquivos foram adicionados à área de preparação (staged)."
      else
        warn "Adicione os arquivos desejados com 'git add <arquivo>' e execute novamente."
        exit 0
      fi
    else
      echo -e "${YELLOW}Já existem arquivos em staging:${RESET}"
      git diff --cached --name-status
      read -r -p "$(echo -e "${CYAN}? Deseja adicionar também as alterações não preparadas pendentes? [s/N]: ${RESET}")" ADD_MORE
      if [[ "$ADD_MORE" =~ ^[SsYy]$ ]]; then
        git add -A
        success "Arquivos complementares adicionados com sucesso."
      fi
    fi
  else
    git add -A
    success "Adicionado tudo via flag '--all' ('git add -A')."
  fi
else
  info "Nenhuma alteração local pendente no working tree."
fi

# ---- 2. Mensagem e Execução do Commit ----
STAGED_NOW="$(git diff --cached --name-only)"
if [ -n "$STAGED_NOW" ]; then
  step "2/4. Criando Commit..."

  if [ -z "$COMMIT_MSG" ]; then
    echo -e "\n${BOLD}Selecione o tipo de Commit (Conventional Commits):${RESET}"
    echo -e "  ${CYAN}1)${RESET} feat     ${DIM}(Nova funcionalidade para o usuário)${RESET}"
    echo -e "  ${CYAN}2)${RESET} fix      ${DIM}(Correção de bug/defeito)${RESET}"
    echo -e "  ${CYAN}3)${RESET} docs     ${DIM}(Alterações exclusivamente em documentações)${RESET}"
    echo -e "  ${CYAN}4)${RESET} style    ${DIM}(Formatação, ponto e vírgula, sem mudança de lógica)${RESET}"
    echo -e "  ${CYAN}5)${RESET} refactor ${DIM}(Refatoração de código sem alterar comportamento)${RESET}"
    echo -e "  ${CYAN}6)${RESET} test     ${DIM}(Adição ou correção de testes automatizados)${RESET}"
    echo -e "  ${CYAN}7)${RESET} chore    ${DIM}(Manutenção de build, scripts, docker, dependências)${RESET}"
    echo -e "  ${CYAN}8)${RESET} Outro    ${DIM}(Mensagem livre sem prefixo padrão)${RESET}"
    
    read -r -p "$(echo -e "${CYAN}? Escolha uma opção [1-8] (padrão: 1): ${RESET}")" TYPE_OPT
    TYPE_OPT=${TYPE_OPT:-1}

    PREFIX=""
    case "$TYPE_OPT" in
      1) PREFIX="feat: " ;;
      2) PREFIX="fix: " ;;
      3) PREFIX="docs: " ;;
      4) PREFIX="style: " ;;
      5) PREFIX="refactor: " ;;
      6) PREFIX="test: " ;;
      7) PREFIX="chore: " ;;
      *) PREFIX="" ;;
    esac

    while [ -z "$COMMIT_MSG" ]; do
      read -r -p "$(echo -e "${CYAN}? Digite a mensagem do commit: ${RESET}${PREFIX}")" USER_MSG
      if [ -n "$USER_MSG" ]; then
        COMMIT_MSG="${PREFIX}${USER_MSG}"
      else
        warn "A mensagem do commit não pode ser vazia!"
      fi
    done
  fi

  git commit -m "$COMMIT_MSG"
  COMMIT_HASH="$(git rev-parse --short HEAD)"
  success "Commit registrado: ${WHITE}${BOLD}[${COMMIT_HASH}] ${COMMIT_MSG}${RESET}"
else
  info "Nenhuma alteração staged para commit. Pulando para verificação de sincronização."
fi

# ---- 3. Rebase e Sincronização com o Remoto ----
step "3/4. Verificando sincronização e Rebase..."

# Atualizar referências remotas
info "Buscando atualizações no remoto ('git fetch ${REMOTE}')..."
if git fetch "$REMOTE" "$CURRENT_BRANCH" 2>/dev/null; then
  REMOTE_EXISTS=true
else
  REMOTE_EXISTS=false
fi

# Se a branch remota existir, verifica se estamos atrás
if [ "$REMOTE_EXISTS" = true ]; then
  LOCAL_REV="$(git rev-parse @ 2>/dev/null || true)"
  REMOTE_REV="$(git rev-parse "${REMOTE}/${CURRENT_BRANCH}" 2>/dev/null || true)"
  BASE_REV="$(git merge-base @ "${REMOTE}/${CURRENT_BRANCH}" 2>/dev/null || true)"

  if [ "$LOCAL_REV" = "$REMOTE_REV" ]; then
    info "Local e remoto estão perfeitamente sincronizados."
  elif [ "$LOCAL_REV" = "$BASE_REV" ]; then
    warn "Sua branch está atrás do remoto. Rebase automático necessário!"
    DO_REBASE=true
  elif [ "$REMOTE_REV" = "$BASE_REV" ]; then
    info "Sua branch está à frente do remoto (pronta para push)."
  else
    warn "Suas branches divergiram (existem commits locais e remotos diferentes)."
    DO_REBASE=true
  fi
fi

# Pergunta sobre rebase se não foi forçado e estamos interativo
if [ "$DO_REBASE" = false ] && [ -z "$REBASE_TARGET" ]; then
  # Se estiver numa branch de feature, sugere rebase com main/master
  if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    read -r -p "$(echo -e "${CYAN}? Deseja fazer rebase da branch atual com a branch principal (${REMOTE}/main)? [s/N]: ${RESET}")" ASK_REBASE_MAIN
    if [[ "$ASK_REBASE_MAIN" =~ ^[SsYy]$ ]]; then
      DO_REBASE=true
      REBASE_TARGET="${REMOTE}/main"
    fi
  fi
fi

# Executar Rebase se solicitado ou necessário
if [ "$DO_REBASE" = true ] || [ -n "$REBASE_TARGET" ]; then
  TARGET="${REBASE_TARGET:-${REMOTE}/${CURRENT_BRANCH}}"
  info "Iniciando rebase sobre ${WHITE}${BOLD}${TARGET}${RESET}..."

  if git rebase "$TARGET"; then
    success "Rebase concluído com sucesso sobre ${TARGET}!"
  else
    echo -e "\n${RED}${BOLD}╔══════════════════════════════════════════════════════════════════╗"
    echo -e "║                    ⚠ CONFLITO DE REBASE DETECTADO!               ║"
    echo -e "╚══════════════════════════════════════════════════════════════════╝${RESET}\n"
    error "O rebase encontrou conflitos que precisam de resolução manual."
    echo ""
    echo -e "${YELLOW}Arquivos com conflito:${RESET}"
    git status --short
    echo ""
    echo -e "${WHITE}${BOLD}Como resolver:${RESET}"
    echo -e "  1. Abra os arquivos acima e corrija as marcações de conflito."
    echo -e "  2. Marque como resolvido: ${CYAN}git add <arquivo>${RESET}"
    echo -e "  3. Continue o rebase:    ${GREEN}git rebase --continue${RESET}"
    echo -e "  4. Se preferir desistir:  ${RED}git rebase --abort${RESET}"
    echo ""
    exit 1
  fi
fi

# ---- 4. Push para o Remoto ----
step "4/4. Enviando ao repositório remoto (Push)..."

if [ "$DO_PUSH" = false ]; then
  info "Flag '--no-push' ativa. Operação concluída localmente!"
  exit 0
fi

PUSH_ARGS=("$REMOTE" "$CURRENT_BRANCH")

# Verifica se a branch já tem tracking configurado
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
if [ -z "$UPSTREAM" ]; then
  info "Branch sem rastreamento remoto configurado. Configurando upstream com '-u'..."
  PUSH_ARGS=("-u" "$REMOTE" "$CURRENT_BRANCH")
fi

if [ "$FORCE_WITH_LEASE" = true ]; then
  warn "Usando '--force-with-lease' devido à solicitação explícita."
  PUSH_ARGS+=("--force-with-lease")
fi

info "Executando: ${WHITE}git push ${PUSH_ARGS[*]}${RESET}"

if git push "${PUSH_ARGS[@]}"; then
  echo ""
  success "Push realizado com sucesso para ${REMOTE}/${CURRENT_BRANCH}!"
  
  LATEST_HASH="$(git rev-parse --short HEAD)"
  LATEST_MSG="$(git log -1 --pretty=%B | head -n 1)"
  AUTHOR="$(git log -1 --pretty=%an)"

  echo -e "\n${GREEN}${BOLD}========================================================================${RESET}"
  echo -e "${GREEN}${BOLD}🎉 SINCRONIZAÇÃO COMPLETA COM SUCESSO!${RESET}"
  echo -e "  • Branch:    ${WHITE}${CURRENT_BRANCH}${RESET}"
  echo -e "  • Commit:    ${CYAN}${LATEST_HASH}${RESET}"
  echo -e "  • Mensagem:  ${WHITE}${LATEST_MSG}${RESET}"
  echo -e "  • Autor:     ${WHITE}${AUTHOR}${RESET}"
  echo -e "${GREEN}${BOLD}========================================================================${RESET}\n"
else
  error "Falha ao executar push no repositório remoto!"
  echo -e "${YELLOW}Dica: Se você reescreveu histórico com rebase local, execute com '--force-with-lease':${RESET}"
  echo -e "  ${CYAN}./scripts/git-sync.sh --force-with-lease${RESET}"
  exit 1
fi
