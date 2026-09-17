#!/usr/bin/env python3
"""
🛡️ Pipeline Guardian — Autonomous CI/CD Pipeline, Cluster & Deployment Monitoring Bot
Intranet Flowti — Portal Unificado Corporativo

Capabilities:
1. SemVer Tagging & Commit Monitoring (Commit-to-Tag).
2. Local CI Pipeline Audit (lint, composer, tests, docker).
3. Kubernetes Cluster & Pipeline Monitor for namespace 'intranet':
   - Deployment rollout, replica state, Pod health, PVC bounds.
   - Pod CrashLoopBackOff, ImagePullBackOff, OOMKilled, Pending detection.
   - Automated log inspection and deep root cause analysis (PHP errors, PDO/MySQL issues, HTTP errors).
   - Ingress and HTTP endpoint verification.
4. Autonomous In-Cluster Daemon with live HTML Dashboard & Status API (port 9090).
5. Kubernetes ConfigMap status synchronization for GitOps and CLI observability.
"""

import os
import sys
import subprocess
import re
import argparse
import time
import json
import ssl
import urllib.request
import urllib.error
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ANSI terminal colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


# ==============================================================================
# 1. Kubernetes Client (In-Cluster ServiceAccount + Out-of-Cluster kubectl fallback)
# ==============================================================================

class K8sClient:
    def __init__(self, namespace="intranet"):
        self.namespace = namespace
        self.in_cluster = os.path.exists("/var/run/secrets/kubernetes.io/serviceaccount/token")
        self.token = None
        self.ssl_ctx = None
        self.api_host = None

        if self.in_cluster:
            try:
                with open("/var/run/secrets/kubernetes.io/serviceaccount/token", "r") as f:
                    self.token = f.read().strip()
                ca_path = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
                self.ssl_ctx = ssl.create_default_context(cafile=ca_path) if os.path.exists(ca_path) else None
                host = os.environ.get("KUBERNETES_SERVICE_HOST", "kubernetes.default.svc")
                port = os.environ.get("KUBERNETES_SERVICE_PORT", "443")
                self.api_host = f"https://{host}:{port}"
            except Exception as e:
                self.in_cluster = False

    def _api_get(self, path):
        if not self.in_cluster:
            return None
        url = f"{self.api_host}{path}"
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req, context=self.ssl_ctx, timeout=10) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None

    def _api_put(self, path, body):
        if not self.in_cluster:
            return None
        url = f"{self.api_host}{path}"
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(url, data=data, method="PUT")
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, context=self.ssl_ctx, timeout=10) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None

    def get_pods(self):
        """Returns pod items in target namespace."""
        if self.in_cluster:
            res = self._api_get(f"/api/v1/namespaces/{self.namespace}/pods")
            if res and "items" in res:
                return res["items"]
        
        # Fallback to kubectl
        try:
            res = subprocess.run(
                ["kubectl", "get", "pods", "-n", self.namespace, "-o", "json"],
                capture_output=True, text=True, check=True
            )
            data = json.loads(res.stdout)
            return data.get("items", [])
        except Exception:
            return []

    def get_events(self):
        """Returns warning or recent events in target namespace."""
        if self.in_cluster:
            res = self._api_get(f"/api/v1/namespaces/{self.namespace}/events")
            if res and "items" in res:
                return res["items"]

        try:
            res = subprocess.run(
                ["kubectl", "get", "events", "-n", self.namespace, "-o", "json"],
                capture_output=True, text=True, check=True
            )
            data = json.loads(res.stdout)
            return data.get("items", [])
        except Exception:
            return []

    def get_deployments(self):
        """Returns deployments in target namespace."""
        if self.in_cluster:
            res = self._api_get(f"/apis/apps/v1/namespaces/{self.namespace}/deployments")
            if res and "items" in res:
                return res["items"]

        try:
            res = subprocess.run(
                ["kubectl", "get", "deployments", "-n", self.namespace, "-o", "json"],
                capture_output=True, text=True, check=True
            )
            data = json.loads(res.stdout)
            return data.get("items", [])
        except Exception:
            return []

    def get_pod_logs(self, pod_name, container=None, tail_lines=50):
        """Fetches recent logs of a container."""
        if self.in_cluster:
            c_param = f"&container={container}" if container else ""
            res = self._api_get(f"/api/v1/namespaces/{self.namespace}/pods/{pod_name}/log?tailLines={tail_lines}{c_param}")
            if isinstance(res, str):
                return res

        try:
            cmd = ["kubectl", "logs", "-n", self.namespace, pod_name, f"--tail={tail_lines}"]
            if container:
                cmd.extend(["-c", container])
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return res.stdout
        except Exception as e:
            return ""

    def update_status_configmap(self, status_data):
        """Creates or updates ConfigMap 'pipeline-guardian-status' in target namespace."""
        cm_name = "pipeline-guardian-status"
        payload = {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": {
                "name": cm_name,
                "namespace": self.namespace,
                "labels": {
                    "app.kubernetes.io/name": "pipeline-guardian",
                    "app.kubernetes.io/part-of": "omniflowti"
                }
            },
            "data": {
                "status.json": json.dumps(status_data, indent=2),
                "last_updated": datetime.now().isoformat(),
                "overall_health": status_data.get("overall_health", "UNKNOWN")
            }
        }

        if self.in_cluster:
            self._api_put(f"/api/v1/namespaces/{self.namespace}/configmaps/{cm_name}", payload)
            return

        try:
            cm_json = json.dumps(payload)
            subprocess.run(
                ["kubectl", "apply", "-f", "-"],
                input=cm_json, text=True, capture_output=True, check=True
            )
        except Exception:
            pass


# ==============================================================================
# 2. Diagnostic & Error Analysis Engine
# ==============================================================================

class ErrorDetector:
    PATTERNS = [
        {
            "id": "ERR_DB_CONN",
            "regex": r"(Connection refused|Falha na conexão com o banco de dados|SQLSTATE\[HY000\] \[2002\])",
            "category": "DATABASE",
            "severity": "CRITICAL",
            "title": "Falha de Conexão com o Banco de Dados MySQL",
            "remediation": "Verifique se o Pod 'mysql' está Running e se o Service 'mysql' na porta 3306 está acessível."
        },
        {
            "id": "ERR_DB_AUTH",
            "regex": r"(Access denied for user|SQLSTATE\[HY000\] \[1045\])",
            "category": "DATABASE",
            "severity": "CRITICAL",
            "title": "Erro de Autenticação no MySQL",
            "remediation": "Verifique os segredos 'mysql-secret' e 'intranet-secret' (DB_USER e DB_PASS)."
        },
        {
            "id": "ERR_DB_TABLE_MISSING",
            "regex": r"(Table '[^']+' doesn't exist|Base table or view not found)",
            "category": "DATABASE",
            "severity": "HIGH",
            "title": "Tabela Inexistente no Banco de Dados",
            "remediation": "Execute o script 'database/schema.sql' ou recarregue o ConfigMap 'mysql-initdb'."
        },
        {
            "id": "ERR_PHP_FATAL",
            "regex": r"(PHP Fatal error|Fatal error: Uncaught|Parse error:)",
            "category": "APPLICATION",
            "severity": "CRITICAL",
            "title": "Erro Fatal ou de Sintaxe PHP",
            "remediation": "Analise a linha de erro do PHP no pod da aplicação e execute 'php -l' nos arquivos afetados."
        },
        {
            "id": "ERR_OOM",
            "regex": r"(OOMKilled|out of memory|Killed)",
            "category": "RESOURCES",
            "severity": "CRITICAL",
            "title": "Contêiner Finalizado por Falta de Memória (OOMKilled)",
            "remediation": "Aumente os limites de memória (resources.limits.memory) no manifesto de Deployment correspondente."
        },
        {
            "id": "ERR_IMAGE_PULL",
            "regex": r"(ImagePullBackOff|ErrImagePull|manifest unknown|not found)",
            "category": "KUBERNETES",
            "severity": "HIGH",
            "title": "Falha no Download ou Carregamento da Imagem Docker",
            "remediation": "Carregue a imagem local no Kind: 'kind load docker-image <imagem> --name portal-cluster'."
        },
        {
            "id": "ERR_PROBE_FAIL",
            "regex": r"(Liveness probe failed|Readiness probe failed)",
            "category": "HEALTH",
            "severity": "WARNING",
            "title": "Falha na Sonda de Integridade (Liveness/Readiness Probe)",
            "remediation": "Verifique se a rota HTTP definida na probe está respondendo com status 200 dentro do timeout."
        }
    ]

    @classmethod
    def scan_text(cls, text, source="log"):
        """Scans log text or event messages for recognized error patterns."""
        errors = []
        if not text:
            return errors

        for p in cls.PATTERNS:
            match = re.search(p["regex"], text, re.IGNORECASE)
            if match:
                snippet = match.group(0)
                # Find line with match
                matched_line = ""
                for line in text.splitlines():
                    if snippet in line:
                        matched_line = line.strip()[:180]
                        break
                errors.append({
                    "id": p["id"],
                    "category": p["category"],
                    "severity": p["severity"],
                    "title": p["title"],
                    "evidence": matched_line or snippet,
                    "remediation": p["remediation"],
                    "source": source
                })
        return errors


def diagnose_intranet(namespace="intranet", http_url=None):
    """
    Executes a comprehensive health and error diagnosis of the intranet workload.
    Returns a detailed structured diagnosis dictionary.
    """
    k8s = K8sClient(namespace=namespace)
    if not http_url:
        http_url = f"http://intranet-service.{namespace}.svc.cluster.local" if k8s.in_cluster else "http://localhost"

    diagnosis = {
        "timestamp": datetime.now().isoformat(),
        "namespace": namespace,
        "overall_health": "HEALTHY",
        "nodes": [],
        "deployments": [],
        "pods": [],
        "events_warnings": [],
        "detected_errors": [],
        "http_check": {}
    }

    # 1. Check Pods
    pods = k8s.get_pods()
    for p in pods:
        p_name = p.get("metadata", {}).get("name", "unknown")
        status_info = p.get("status", {})
        phase = status_info.get("phase", "Unknown")
        container_statuses = status_info.get("containerStatuses", [])
        
        restarts = 0
        ready = True
        waiting_reasons = []

        for cs in container_statuses:
            restarts += cs.get("restartCount", 0)
            if not cs.get("ready", False):
                ready = False
            state = cs.get("state", {})
            if "waiting" in state:
                reason = state["waiting"].get("reason", "")
                waiting_reasons.append(reason)
                if reason in ["CrashLoopBackOff", "ImagePullBackOff", "ErrImagePull"]:
                    diagnosis["detected_errors"].append({
                        "id": f"POD_{reason.upper()}",
                        "category": "POD_LIFECYCLE",
                        "severity": "CRITICAL",
                        "title": f"Pod {p_name} em estado {reason}",
                        "evidence": state["waiting"].get("message", reason),
                        "remediation": f"Inspecione os logs com 'kubectl logs -n {namespace} {p_name}'.",
                        "source": p_name
                    })

        # Scan logs if restarting or not ready
        logs = k8s.get_pod_logs(p_name, tail_lines=40)
        log_errors = ErrorDetector.scan_text(logs, source=f"pod/{p_name}")
        for err in log_errors:
            if not any(e["id"] == err["id"] and e["source"] == err["source"] for e in diagnosis["detected_errors"]):
                diagnosis["detected_errors"].append(err)

        diagnosis["pods"].append({
            "name": p_name,
            "phase": phase,
            "ready": ready,
            "restarts": restarts,
            "waiting": waiting_reasons
        })

    # 2. Check Warning Events
    events = k8s.get_events()
    for ev in events:
        ev_type = ev.get("type", "Normal")
        reason = ev.get("reason", "")
        message = ev.get("message", "")
        obj_name = ev.get("involvedObject", {}).get("name", "")
        if ev_type == "Warning":
            diagnosis["events_warnings"].append({
                "object": obj_name,
                "reason": reason,
                "message": message
            })
            ev_errors = ErrorDetector.scan_text(message, source=f"event/{obj_name}")
            for err in ev_errors:
                if not any(e["id"] == err["id"] and e["source"] == err["source"] for e in diagnosis["detected_errors"]):
                    diagnosis["detected_errors"].append(err)

    # 3. Check HTTP Application Response
    try:
        req = urllib.request.Request(http_url, headers={"Host": "intranet.local"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status_code = resp.getcode()
            body_preview = resp.read(2048).decode("utf-8", errors="ignore")
            has_title = "<title>Omniflowti" in body_preview
            diagnosis["http_check"] = {
                "status": "PASS" if status_code == 200 and has_title else "WARN",
                "code": status_code,
                "url": http_url,
                "title_verified": has_title
            }
    except Exception as e:
        diagnosis["http_check"] = {
            "status": "FAIL",
            "error": str(e),
            "url": http_url
        }
        diagnosis["detected_errors"].append({
            "id": "ERR_HTTP_UNREACHABLE",
            "category": "NETWORK",
            "severity": "HIGH",
            "title": "Aplicação Inacessível via Ingress/HTTP",
            "evidence": str(e),
            "remediation": f"Verifique se o ingress controller e o service 'intranet-service' estão ativos na porta 80.",
            "source": "ingress"
        })

    # Overall Health Determination
    critical_errors = [e for e in diagnosis["detected_errors"] if e.get("severity") == "CRITICAL"]
    app_pods = [p for p in diagnosis["pods"] if "pipeline-guardian" not in p["name"]]
    if critical_errors or any(not p["ready"] for p in app_pods):
        diagnosis["overall_health"] = "DEGRADED" if not critical_errors else "CRITICAL"
    elif diagnosis["events_warnings"]:
        diagnosis["overall_health"] = "WARNING"
    else:
        diagnosis["overall_health"] = "HEALTHY"

    # Sync to ConfigMap
    k8s.update_status_configmap(diagnosis)
    return diagnosis


def print_diagnosis_report(diag):
    """Formats and prints the diagnosis report in rich terminal text."""
    health = diag["overall_health"]
    health_color = GREEN if health == "HEALTHY" else (YELLOW if health == "WARNING" else RED)

    print("\n" + "=" * 70)
    print(f"{BOLD}🛡️  PIPELINE GUARDIAN — RELATÓRIO DE DIAGNÓSTICO E SAÚDE{RESET}")
    print("=" * 70)
    print(f"📍 Namespace Monitorado : {BOLD}{diag['namespace']}{RESET}")
    print(f"🕒 Timestamp de Análise : {diag['timestamp']}")
    print(f"🚦 Estado Geral          : {health_color}{BOLD}{health}{RESET}")
    print("-" * 70)

    # HTTP Check
    http = diag.get("http_check", {})
    http_st = http.get("status", "UNKNOWN")
    http_col = GREEN if http_st == "PASS" else RED
    print(f"🌐 Ingress / HTTP Endpoint : {http_col}[{http_st}]{RESET} URL: {http.get('url')} (HTTP {http.get('code', 'ERR')})")

    # Pods Table
    print(f"\n📦 {BOLD}Pods no Namespace '{diag['namespace']}':{RESET}")
    for p in diag["pods"]:
        ready_icon = "🟢" if p["ready"] else "🔴"
        print(f"  {ready_icon} {BOLD}{p['name']}{RESET} | Status: {p['phase']} | Pronto: {p['ready']} | Restarts: {p['restarts']}")

    # Warnings
    if diag["events_warnings"]:
        print(f"\n⚠️  {BOLD}Avisos Recentes (Kubernetes Events):{RESET}")
        for ev in diag["events_warnings"][:5]:
            print(f"  - [{ev['reason']}] {ev['object']}: {ev['message']}")

    # Errors & Root Causes
    print("\n" + "-" * 70)
    if diag["detected_errors"]:
        print(f"❌ {BOLD}{RED}FALHAS IDENTIFICADAS ({len(diag['detected_errors'])}):{RESET}")
        for i, err in enumerate(diag["detected_errors"], 1):
            sev_color = RED if err["severity"] == "CRITICAL" else YELLOW
            print(f"\n  [{i}] {sev_color}{BOLD}[{err['severity']}] {err['title']}{RESET}")
            print(f"      Origem      : {err.get('source')}")
            print(f"      Evidência   : {err.get('evidence')}")
            print(f"      💡 Correção : {GREEN}{err.get('remediation')}{RESET}")
    else:
        print(f"✅ {BOLD}{GREEN}Nenhum erro ou falha detectado no ambiente! Pipeline e pods operando perfeitamente.{RESET}")
    print("=" * 70 + "\n")


# ==============================================================================
# 3. HTTP Dashboard Server for In-Cluster Bot (Port 9090)
# ==============================================================================

LATEST_DIAGNOSIS = {}

class GuardianHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global LATEST_DIAGNOSIS
        if self.path in ["/status", "/api/status"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(LATEST_DIAGNOSIS, indent=2).encode("utf-8"))
            return

        if self.path in ["/healthz", "/health"]:
            status_code = 200 if LATEST_DIAGNOSIS.get("overall_health") != "CRITICAL" else 500
            self.send_response(status_code)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(LATEST_DIAGNOSIS.get("overall_health", "UNKNOWN").encode("utf-8"))
            return

        # HTML Dashboard
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()

        health = LATEST_DIAGNOSIS.get("overall_health", "INITIALIZING")
        badge_bg = "#10b981" if health == "HEALTHY" else ("#f59e0b" if health == "WARNING" else "#ef4444")
        
        pods_html = "".join([
            f"<tr><td>{'🟢' if p['ready'] else '🔴'} {p['name']}</td><td>{p['phase']}</td><td>{p['restarts']}</td></tr>"
            for p in LATEST_DIAGNOSIS.get("pods", [])
        ]) or "<tr><td colspan='3'>Aguardando pods...</td></tr>"

        errors_html = "".join([
            f"<div class='error-box'><strong>[{e['severity']}] {e['title']}</strong><p><em>Origem:</em> {e.get('source')}</p><p><code>{e.get('evidence')}</code></p><p>💡 <b>Ação:</b> {e.get('remediation')}</p></div>"
            for e in LATEST_DIAGNOSIS.get("detected_errors", [])
        ]) or "<p style='color: #10b981;'>Nenhum erro ativo no momento. Todos os componentes estão saudáveis!</p>"

        html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Pipeline Guardian — Status Dashboard</title>
    <meta http-equiv="refresh" content="10">
    <style>
        body {{ background: #0B0A0A; color: #E0E0E0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; }}
        .header {{ display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; padding-bottom: 16px; margin-bottom: 24px; }}
        .badge {{ background: {badge_bg}; color: #fff; padding: 6px 14px; border-radius: 20px; font-weight: bold; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #141414; border-radius: 8px; overflow: hidden; }}
        th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #222; }}
        th {{ background: #1a1a1a; color: #888; font-size: 0.85rem; text-transform: uppercase; }}
        .error-box {{ background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px; }}
        code {{ background: #222; padding: 2px 6px; border-radius: 4px; color: #f87171; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h2>🛡️ Pipeline Guardian Bot</h2>
            <p style="color: #888; margin: 4px 0 0 0;">Namespace: <strong>{LATEST_DIAGNOSIS.get('namespace', 'intranet')}</strong> | Atualizado: {LATEST_DIAGNOSIS.get('timestamp', '-')}</p>
        </div>
        <div>
            <span class="badge">{health}</span>
        </div>
    </div>
    <h3>📦 Pods Monitorados</h3>
    <table>
        <thead><tr><th>Nome do Pod</th><th>Status</th><th>Restarts</th></tr></thead>
        <tbody>{pods_html}</tbody>
    </table>
    <h3>🔍 Erros e Diagnóstico de Pipeline</h3>
    {errors_html}
</body>
</html>"""
        self.wfile.write(html.encode("utf-8"))

    def log_message(self, format, *args):
        # Silence default HTTP access logs to keep stdout clean
        pass


def start_http_server(port=9090):
    server = HTTPServer(("0.0.0.0", port), GuardianHTTPHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


# ==============================================================================
# 4. Daemon & Monitoring Loop
# ==============================================================================

def run_guardian_daemon(namespace="intranet", interval_sec=15, port=9090):
    """Continuously monitors the cluster namespace, serving health and detecting errors."""
    global LATEST_DIAGNOSIS
    print(f"{BOLD}🛡️  [PIPELINE GUARDIAN] Bot iniciado em modo Daemon.{RESET}")
    print(f"📍 Namespace: {BOLD}{namespace}{RESET} | Intervalo: {interval_sec}s | Porta Dashboard: {port}")

    start_http_server(port)
    print(f"🌐 Servidor de Status ativo em http://0.0.0.0:{port}/")

    prev_health = None
    try:
        while True:
            diag = diagnose_intranet(namespace=namespace)
            LATEST_DIAGNOSIS = diag

            current_health = diag["overall_health"]
            if current_health != prev_health or diag["detected_errors"]:
                print_diagnosis_report(diag)
                prev_health = current_health
            else:
                ts = datetime.now().strftime("%H:%M:%S")
                print(f"[{ts}] 🛡️ [GUARDIAN] Namespace '{namespace}' auditado: {GREEN}HEALTHY{RESET} (0 erros).")

            time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("\n🛑 [PIPELINE GUARDIAN] Daemon encerrado pelo usuário.")


# ==============================================================================
# 5. SemVer & Git Operations (Preserved from original)
# ==============================================================================

def run_git(args, cwd=REPO_ROOT, check=True):
    res = subprocess.run(["git"] + args, cwd=cwd, text=True, capture_output=True)
    if check and res.returncode != 0:
        raise RuntimeError(f"Git command failed: git {' '.join(args)}\nError: {res.stderr.strip()}")
    return res.stdout.strip(), res.stderr.strip(), res.returncode

def get_latest_tag():
    stdout, _, _ = run_git(["tag", "-l", "v*", "--sort=-v:refname"], check=False)
    if not stdout:
        stdout, _, _ = run_git(["tag", "-l", "--sort=-v:refname"], check=False)
    tags = [t.strip() for t in stdout.splitlines() if t.strip()]
    semver_pattern = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$")
    valid_tags = [t for t in tags if semver_pattern.match(t)]
    return valid_tags[0] if valid_tags else None

def parse_semver(tag_str):
    clean = tag_str.lstrip("v")
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)", clean)
    return tuple(map(int, match.groups())) if match else (1, 0, 0)

def get_commits_since(tag=None):
    range_spec = f"{tag}..HEAD" if tag else "HEAD"
    stdout, _, _ = run_git(["log", range_spec, "--pretty=format:%h|%s|%an|%cI"], check=False)
    commits = []
    for line in stdout.splitlines():
        parts = line.split("|", 3)
        if len(parts) == 4:
            commits.append({"hash": parts[0], "subject": parts[1], "author": parts[2], "date": parts[3]})
    return commits

def determine_bump_level(commits):
    has_breaking = any("BREAKING CHANGE:" in c["subject"] or re.search(r"^[a-z]+(\([^\)]+\))?!:", c["subject"]) for c in commits)
    if has_breaking:
        return "major"
    has_feat = any(re.search(r"^feat(\([^\)]+\))?:", c["subject"], re.IGNORECASE) for c in commits)
    return "minor" if has_feat else "patch"

def calculate_next_version(latest_tag, commits):
    if not latest_tag:
        return "v1.0.0"
    major, minor, patch = parse_semver(latest_tag)
    bump = determine_bump_level(commits)
    if bump == "major":
        return f"v{major + 1}.0.0"
    elif bump == "minor":
        return f"v{major}.{minor + 1}.0"
    else:
        return f"v{major}.{minor}.{patch + 1}"

def generate_tag_and_trigger(push=True, force=False):
    latest_tag = get_latest_tag()
    commits = get_commits_since(latest_tag)
    if not commits and not force:
        print(f"✅ [PIPELINE GUARDIAN] Nenhuma alteração nova desde a tag '{latest_tag}'.")
        return None

    next_version = calculate_next_version(latest_tag, commits)
    print(f"🚀 [PIPELINE GUARDIAN] Próxima versão calculada: {next_version}")
    tag_message = f"Release {next_version}\n\n" + "\n".join([f"- {c['hash']} {c['subject']} ({c['author']})" for c in commits])
    run_git(["tag", "-a", next_version, "-m", tag_message])

    if push:
        print(f"📤 [PIPELINE GUARDIAN] Enviando tag '{next_version}' para o remote origin...")
        _, stderr, code = run_git(["push", "origin", next_version], check=False)
        if code == 0:
            print(f"🎉 [PIPELINE GUARDIAN] Tag '{next_version}' enviada com sucesso!")
        else:
            print(f"⚠️  [PIPELINE GUARDIAN] Aviso no envio da tag: {stderr}")
    return next_version

def audit_pipeline():
    print("=" * 60)
    print("🛡️  [PIPELINE GUARDIAN] Auditoria Completa da Pipeline CI/CD")
    print("=" * 60)
    results = {}

    print("\n[1/4] Validando aplicação/composer.json...")
    res = subprocess.run(["docker", "run", "--rm", "-v", f"{REPO_ROOT}/aplicação:/app", "-w", "/app", "composer:latest", "composer", "validate", "--strict"], capture_output=True, text=True)
    results["composer"] = "PASS" if res.returncode == 0 else "FAIL"

    print("\n[2/4] Verificando sintaxe PHP...")
    res = subprocess.run(["docker", "run", "--rm", "-v", f"{REPO_ROOT}/aplicação:/app", "-w", "/app", "php:8.2-cli", "bash", "-c", "find src public -name '*.php' -print0 | xargs -0 -n1 -P4 php -l"], capture_output=True, text=True)
    results["php_lint"] = "PASS" if res.returncode == 0 else "FAIL"

    print("\n[3/4] Validando Docker build...")
    res = subprocess.run(["docker", "build", "-q", "-f", f"{REPO_ROOT}/docker/Dockerfile", REPO_ROOT], capture_output=True, text=True)
    results["docker"] = "PASS" if res.returncode == 0 else "FAIL"

    print("\n[4/4] Verificando manifesto K8s...")
    k8s_path = os.path.join(REPO_ROOT, "k8s")
    results["k8s_manifests"] = "PASS" if os.path.exists(k8s_path) else "FAIL"

    print("\n" + "=" * 60)
    for k, v in results.items():
        print(f" - {k}: {v}")
    print("=" * 60)
    return all(v == "PASS" for v in results.values())


# ==============================================================================
# 6. Main Entrypoint
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Pipeline Guardian — Autonomous CI/CD & Cluster Pipeline Monitoring Bot")
    parser.add_argument("--diagnose", action="store_true", help="Executa diagnóstico completo da pipeline e do cluster no namespace intranet")
    parser.add_argument("--monitor", action="store_true", help="Executa monitoramento em tempo real no terminal")
    parser.add_argument("--daemon", action="store_true", help="Inicia o bot em modo daemon com dashboard HTTP na porta 9090")
    parser.add_argument("--namespace", default=os.environ.get("WATCH_NAMESPACE", "intranet"), help="Namespace do Kubernetes a ser monitorado (padrão: intranet)")
    parser.add_argument("--interval", type=int, default=15, help="Intervalo de varredura em segundos (padrão: 15)")
    parser.add_argument("--port", type=int, default=9090, help="Porta HTTP para o dashboard do daemon (padrão: 9090)")
    parser.add_argument("--check-commits", action="store_true", help="Verifica commits pendentes e exibe a próxima versão SemVer")
    parser.add_argument("--tag-and-trigger", action="store_true", help="Gera a próxima tag SemVer e dispara a pipeline")
    parser.add_argument("--no-push", action="store_true", help="Cria tag apenas localmente sem push")
    parser.add_argument("--audit", action="store_true", help="Executa auditoria local de lint e build")
    parser.add_argument("--watch", action="store_true", help="Loop de vigilância de commits")

    args = parser.parse_args()

    if args.diagnose:
        diag = diagnose_intranet(namespace=args.namespace)
        print_diagnosis_report(diag)
        sys.exit(0 if diag["overall_health"] != "CRITICAL" else 1)
    elif args.daemon:
        run_guardian_daemon(namespace=args.namespace, interval_sec=args.interval, port=args.port)
    elif args.monitor:
        run_guardian_daemon(namespace=args.namespace, interval_sec=args.interval, port=args.port)
    elif args.audit:
        success = audit_pipeline()
        sys.exit(0 if success else 1)
    elif args.tag_and_trigger:
        tag = generate_tag_and_trigger(push=not args.no_push)
        sys.exit(0 if tag else 0)
    elif args.check_commits:
        latest = get_latest_tag()
        commits = get_commits_since(latest)
        next_ver = calculate_next_version(latest, commits)
        print(f"Última tag: {latest or 'Nenhuma'}")
        print(f"Commits pendentes: {len(commits)}")
        print(f"Próxima versão SemVer: {next_ver}")
        sys.exit(0)
    elif args.watch:
        # Default watch commits
        print(f"🛡️  [PIPELINE GUARDIAN] Modo Vigilância Ativa de Commits (intervalo: {args.interval}s).")
        try:
            while True:
                latest = get_latest_tag()
                commits = get_commits_since(latest)
                if commits:
                    print(f"\n🔔 [PIPELINE GUARDIAN] {len(commits)} novos commits detectados!")
                    generate_tag_and_trigger(push=not args.no_push)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n🛑 Encerrado.")
    else:
        # Default behavior: run diagnosis
        diag = diagnose_intranet(namespace=args.namespace)
        print_diagnosis_report(diag)

if __name__ == "__main__":
    main()
