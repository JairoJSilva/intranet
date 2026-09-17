#!/usr/bin/env bash
# ==============================================================================
# 🚀 Onboard New Application — GitOps & CI/CD Generator
# ==============================================================================
# Automatiza a criação de pipeline CI/CD universal, manifestos Kubernetes
# e cadastro declarativo no ArgoCD para qualquer nova aplicação.
#
# Uso interativo:
#   ./scripts/onboard-app.sh
#
# Uso via argumentos:
#   ./scripts/onboard-app.sh \
#     --name minha-api \
#     --type nodejs \
#     --repo https://github.com/JairoJSilva/intranet.git \
#     --namespace producao \
#     --port 3000 \
#     --host minha-api.local
# ==============================================================================

set -euo pipefail

# Cores
BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'

APP_NAME=""
APP_TYPE="docker"
REPO_URL=""
TARGET_NAMESPACE="default"
CONTAINER_PORT="8080"
APP_HOST=""
OUTPUT_DIR=""

# Parse de argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --name) APP_NAME="$2"; shift 2 ;;
    --type) APP_TYPE="$2"; shift 2 ;;
    --repo) REPO_URL="$2"; shift 2 ;;
    --namespace) TARGET_NAMESPACE="$2"; shift 2 ;;
    --port) CONTAINER_PORT="$2"; shift 2 ;;
    --host) APP_HOST="$2"; shift 2 ;;
    --out) OUTPUT_DIR="$2"; shift 2 ;;
    *) echo -e "${RED}Opção desconhecida: $1${RESET}"; exit 1 ;;
  esac
done

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║      🚀 ONBOARDING UNIVERSAL DE APLICAÇÃO (CI/CD + GITOPS ARGOCD)        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Modo interativo se variáveis estiverem vazias
if [ -z "$APP_NAME" ]; then
  read -rp "1. Nome da aplicação (ex: pagamentos-api, crm-web): " APP_NAME
fi

if [ -z "$REPO_URL" ]; then
  read -rp "2. URL do Repositório Git (ex: https://github.com/usuario/repo.git): " REPO_URL
fi

if [ -z "$APP_HOST" ]; then
  APP_HOST="${APP_NAME}.local"
fi

if [ -z "$OUTPUT_DIR" ]; then
  OUTPUT_DIR="apps-generated/${APP_NAME}"
fi

echo -e "\n${YELLOW}Configurando aplicação:${RESET}"
echo "  - Nome        : ${APP_NAME}"
echo "  - Tipo        : ${APP_TYPE}"
echo "  - Namespace   : ${TARGET_NAMESPACE}"
echo "  - Porta       : ${CONTAINER_PORT}"
echo "  - Host Ingress: ${APP_HOST}"
echo "  - Repositório : ${REPO_URL}"
echo "  - Saída       : ${OUTPUT_DIR}"
echo ""

mkdir -p "${OUTPUT_DIR}/k8s"
mkdir -p "argocd/apps"

# ------------------------------------------------------------------------------
# 1. Gerar .gitlab-ci.yml da Aplicação
# ------------------------------------------------------------------------------
cat <<EOF > "${OUTPUT_DIR}/.gitlab-ci.yml"
# ==============================================================================
# 🚀 Pipeline CI/CD — ${APP_NAME} (Baseada no Template Universal)
# ==============================================================================
include:
  - remote: 'https://raw.githubusercontent.com/JairoJSilva/intranet/main/ci-templates/universal-pipeline.gitlab-ci.yml'

variables:
  APP_NAME: "${APP_NAME}"
  APP_TYPE: "${APP_TYPE}"
  K8S_NAMESPACE: "${TARGET_NAMESPACE}"
  K8S_MANIFESTS_DIR: "k8s"
  IMAGE_NAME: "${APP_NAME}"
  ARGOCD_APP_NAME: "${APP_NAME}"
EOF

# ------------------------------------------------------------------------------
# 2. Gerar Manifestos Kubernetes Padrão (k8s/)
# ------------------------------------------------------------------------------
cat <<EOF > "${OUTPUT_DIR}/k8s/deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_NAME}
  namespace: ${TARGET_NAMESPACE}
  labels:
    app: ${APP_NAME}
    app.kubernetes.io/name: ${APP_NAME}
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ${APP_NAME}
  template:
    metadata:
      labels:
        app: ${APP_NAME}
    spec:
      containers:
        - name: app
          image: ${APP_NAME}:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: ${CONTAINER_PORT}
              name: http
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 250m
              memory: 256Mi
EOF

cat <<EOF > "${OUTPUT_DIR}/k8s/service.yaml"
apiVersion: v1
kind: Service
metadata:
  name: ${APP_NAME}-service
  namespace: ${TARGET_NAMESPACE}
  labels:
    app: ${APP_NAME}
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: ${CONTAINER_PORT}
      name: http
  selector:
    app: ${APP_NAME}
EOF

cat <<EOF > "${OUTPUT_DIR}/k8s/ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${APP_NAME}-ingress
  namespace: ${TARGET_NAMESPACE}
  labels:
    app: ${APP_NAME}
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
    - host: ${APP_HOST}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${APP_NAME}-service
                port:
                  number: 80
EOF

cat <<EOF > "${OUTPUT_DIR}/k8s/kustomization.yaml"
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: ${TARGET_NAMESPACE}
resources:
  - deployment.yaml
  - service.yaml
  - ingress.yaml
EOF

# ------------------------------------------------------------------------------
# 3. Gerar Manifesto ArgoCD Application (argocd/apps/${APP_NAME}.yaml)
# ------------------------------------------------------------------------------
ARGOCD_APP_FILE="argocd/apps/${APP_NAME}.yaml"
cat <<EOF > "${ARGOCD_APP_FILE}"
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${APP_NAME}
  namespace: argocd
  labels:
    app.kubernetes.io/name: ${APP_NAME}
    app.kubernetes.io/part-of: ${TARGET_NAMESPACE}
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: '${REPO_URL}'
    targetRevision: main
    path: ${OUTPUT_DIR}/k8s
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: ${TARGET_NAMESPACE}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ApplyOutOfSyncOnly=true
EOF

echo -e "${GREEN}✔ Arquivos gerados com sucesso!${RESET}"
echo "  1. Pipeline CI/CD   : ${OUTPUT_DIR}/.gitlab-ci.yml"
echo "  2. Manifestos K8s   : ${OUTPUT_DIR}/k8s/"
echo "  3. ArgoCD App       : ${ARGOCD_APP_FILE}"
echo ""
echo -e "${CYAN}Deseja registrar agora esta aplicação no cluster ArgoCD? (s/n)${RESET}"
read -rp "> " APPLY_NOW

if [[ "$APPLY_NOW" =~ ^[Ss]$ ]]; then
  kubectl apply -f "${ARGOCD_APP_FILE}"
  echo -e "${GREEN}✔ Aplicação '${APP_NAME}' cadastrada no ArgoCD!${RESET}"
  echo "Acesse o painel web em: http://argocd.local para acompanhar o sync."
else
  echo -e "Para registrar manualmente mais tarde, execute:"
  echo -e "  ${BOLD}kubectl apply -f ${ARGOCD_APP_FILE}${RESET}"
fi
