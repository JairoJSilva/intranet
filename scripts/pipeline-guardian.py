#!/usr/bin/env python3
"""
🛡️ Pipeline Guardian — Autonomous CI/CD Pipeline & SemVer Tagging Engine
Intranet Flowti - Portal Unificado Corporativo

Responsibilities:
1. Detect un-tagged commits on the active branch.
2. Calculate and generate the next SemVer release tag (vX.Y.Z) based on Conventional Commits.
3. Push the tag to trigger GitHub Actions / GitLab CI pipeline.
4. Provide audit, watch (daemon), and auto-heal capabilities.
"""

import os
import sys
import subprocess
import re
import argparse
import time
from datetime import datetime

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def run_git(args, cwd=REPO_ROOT, check=True):
    """Executes a git command and returns stdout."""
    res = subprocess.run(["git"] + args, cwd=cwd, text=True, capture_output=True)
    if check and res.returncode != 0:
        raise RuntimeError(f"Git command failed: git {' '.join(args)}\nError: {res.stderr.strip()}")
    return res.stdout.strip(), res.stderr.strip(), res.returncode

def get_latest_tag():
    """Retrieves the latest SemVer tag sorted by version, or None if no tags exist."""
    stdout, _, code = run_git(["tag", "-l", "v*", "--sort=-v:refname"], check=False)
    if not stdout:
        # Fallback to any tags
        stdout, _, _ = run_git(["tag", "-l", "--sort=-v:refname"], check=False)
    tags = [t.strip() for t in stdout.splitlines() if t.strip()]
    semver_pattern = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$")
    valid_tags = [t for t in tags if semver_pattern.match(t)]
    return valid_tags[0] if valid_tags else None

def parse_semver(tag_str):
    """Parses a SemVer tag into (major, minor, patch)."""
    clean = tag_str.lstrip("v")
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)", clean)
    if not match:
        return (1, 0, 0)
    return tuple(map(int, match.groups()))

def get_commits_since(tag=None):
    """Gets commits between the specified tag and HEAD."""
    if tag:
        range_spec = f"{tag}..HEAD"
    else:
        range_spec = "HEAD"
    stdout, _, _ = run_git(["log", range_spec, "--pretty=format:%h|%s|%an|%cI"], check=False)
    commits = []
    for line in stdout.splitlines():
        if not line.strip():
            continue
        parts = line.split("|", 3)
        if len(parts) == 4:
            commits.append({
                "hash": parts[0],
                "subject": parts[1],
                "author": parts[2],
                "date": parts[3]
            })
    return commits

def determine_bump_level(commits):
    """
    Analyzes commit subjects following Conventional Commits.
    Returns: 'major', 'minor', or 'patch'.
    """
    has_breaking = False
    has_feat = False

    for c in commits:
        sub = c["subject"]
        if "BREAKING CHANGE:" in sub or re.search(r"^[a-z]+(\([^\)]+\))?!:", sub):
            has_breaking = True
            break
        if re.search(r"^feat(\([^\)]+\))?:", sub, re.IGNORECASE):
            has_feat = True

    if has_breaking:
        return "major"
    if has_feat:
        return "minor"
    return "patch"

def calculate_next_version(latest_tag, commits):
    """Calculates the next SemVer string given the latest tag and new commits."""
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
    """
    Checks if new commits exist without a tag, generates the next tag,
    and optionally pushes to origin to trigger the CI/CD pipeline.
    """
    latest_tag = get_latest_tag()
    commits = get_commits_since(latest_tag)

    if not commits and not force:
        print(f"✅ [PIPELINE GUARDIAN] Nenhuma alteração nova desde a tag '{latest_tag}'. Nenhuma nova tag necessária.")
        return None

    next_version = calculate_next_version(latest_tag, commits)
    print(f"🔍 [PIPELINE GUARDIAN] Última tag: {latest_tag or 'Nenhuma'}")
    print(f"📦 [PIPELINE GUARDIAN] Commits pendentes: {len(commits)}")
    for c in commits[:5]:
        print(f"   - {c['hash']}: {c['subject']}")
    if len(commits) > 5:
        print(f"   - ... e mais {len(commits) - 5} commits.")

    print(f"🚀 [PIPELINE GUARDIAN] Próxima versão calculada: {next_version}")

    # Build changelog annotation message
    changelog_lines = [f"Release {next_version} ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})", ""]
    changelog_lines.append("Alterações incluídas:")
    for c in commits:
        changelog_lines.append(f"- {c['hash']} {c['subject']} ({c['author']})")
    tag_message = "\n".join(changelog_lines)

    # Create annotated tag
    print(f"🏷️  [PIPELINE GUARDIAN] Criando tag '{next_version}' localmente...")
    run_git(["tag", "-a", next_version, "-m", tag_message])

    # Push tag if requested
    if push:
        print(f"📤 [PIPELINE GUARDIAN] Enviando tag '{next_version}' para o remote origin...")
        stdout, stderr, code = run_git(["push", "origin", next_version], check=False)
        if code == 0:
            print(f"🎉 [PIPELINE GUARDIAN] Tag '{next_version}' enviada com sucesso! Pipeline CI/CD disparada.")
        else:
            print(f"⚠️  [PIPELINE GUARDIAN] Aviso ao enviar tag para o origin: {stderr}")
            print(f"ℹ️  [PIPELINE GUARDIAN] Tag '{next_version}' permanece criada localmente no repositório.")

    return next_version

def audit_pipeline():
    """Performs local audit of pipeline components."""
    print("=" * 60)
    print("🛡️  [PIPELINE GUARDIAN] Auditoria Completa da Pipeline CI/CD")
    print("=" * 60)

    results = {}

    # 1. Composer validation
    print("\n[1/4] Validando aplicação/composer.json...")
    res = subprocess.run(["docker", "run", "--rm", "-v", f"{REPO_ROOT}/aplicação:/app", "-w", "/app", "composer:latest", "composer", "validate", "--strict"],
                         capture_output=True, text=True)
    if res.returncode == 0:
        print("  ✅ composer.json válido e estrito!")
        results["composer"] = "PASS"
    else:
        print(f"  ❌ composer.json falhou:\n{res.stderr or res.stdout}")
        results["composer"] = "FAIL"

    # 2. PHP Syntax Lint
    print("\n[2/4] Verificando sintaxe PHP (Lint)...")
    res = subprocess.run(["docker", "run", "--rm", "-v", f"{REPO_ROOT}/aplicação:/app", "-w", "/app", "php:8.2-cli",
                          "bash", "-c", "find src public -name '*.php' -print0 | xargs -0 -n1 -P4 php -l"],
                         capture_output=True, text=True)
    if res.returncode == 0:
        print("  ✅ Todos os arquivos PHP passaram na verificação de sintaxe!")
        results["php_lint"] = "PASS"
    else:
        print(f"  ❌ Erros de sintaxe encontrados:\n{res.stderr or res.stdout}")
        results["php_lint"] = "FAIL"

    # 3. Docker build test
    print("\n[3/4] Validando Dockerfile & build da imagem...")
    res = subprocess.run(["docker", "build", "-q", "-f", f"{REPO_ROOT}/docker/Dockerfile", REPO_ROOT],
                         capture_output=True, text=True)
    if res.returncode == 0:
        print(f"  ✅ Docker build bem-sucedido! Imagem: {res.stdout.strip()[:12]}")
        results["docker"] = "PASS"
    else:
        print(f"  ❌ Falha no Docker build:\n{res.stderr}")
        results["docker"] = "FAIL"

    # 4. K8s / ArgoCD / Pipeline files check
    print("\n[4/4] Verificando workflows CI/CD...")
    ci_path = os.path.join(REPO_ROOT, ".github", "workflows", "ci.yml")
    if os.path.exists(ci_path):
        print(f"  ✅ Workflow GitHub Actions encontrado: {ci_path}")
        results["ci_workflow"] = "PASS"
    else:
        print(f"  ❌ Workflow GitHub Actions não encontrado.")
        results["ci_workflow"] = "FAIL"

    print("\n" + "=" * 60)
    print("📊 Resumo da Auditoria:")
    for k, v in results.items():
        print(f" - {k}: {v}")
    print("=" * 60)
    return all(v == "PASS" for v in results.values())

def watch_loop(interval_sec=30):
    """Continuously monitors for new commits and auto-generates tags."""
    print(f"🛡️  [PIPELINE GUARDIAN] Modo Vigilância Ativa iniciado (intervalo: {interval_sec}s). Pressione Ctrl+C para sair.")
    try:
        while True:
            latest_tag = get_latest_tag()
            commits = get_commits_since(latest_tag)
            if commits:
                print(f"\n🔔 [PIPELINE GUARDIAN] {len(commits)} novos commits detectados desde '{latest_tag}'!")
                generate_tag_and_trigger(push=True)
            time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("\n🛑 [PIPELINE GUARDIAN] Vigilância interrompida pelo usuário.")

def main():
    parser = argparse.ArgumentParser(description="Pipeline Guardian — Autonomous CI/CD Pipeline & SemVer Tagging Engine")
    parser.add_argument("--check-commits", action="store_true", help="Verifica commits pendentes e exibe a próxima versão calculada")
    parser.add_argument("--tag-and-trigger", action="store_true", help="Gera a próxima tag SemVer e dispara a pipeline")
    parser.add_argument("--no-push", action="store_true", help="Cria a tag apenas localmente sem fazer push")
    parser.add_argument("--force", action="store_true", help="Força criação de tag mesmo sem commits novos")
    parser.add_argument("--audit", action="store_true", help="Executa auditoria completa local da pipeline")
    parser.add_argument("--watch", action="store_true", help="Inicia o loop contínuo de vigilância autônoma")
    parser.add_argument("--interval", type=int, default=30, help="Intervalo em segundos para o modo watch (padrão: 30)")

    args = parser.parse_args()

    if args.audit:
        success = audit_pipeline()
        sys.exit(0 if success else 1)
    elif args.watch:
        watch_loop(args.interval)
    elif args.tag_and_trigger:
        tag = generate_tag_and_trigger(push=not args.no_push, force=args.force)
        sys.exit(0 if tag else 0)
    elif args.check_commits:
        latest = get_latest_tag()
        commits = get_commits_since(latest)
        next_ver = calculate_next_version(latest, commits)
        print(f"Última tag: {latest or 'Nenhuma'}")
        print(f"Commits pendentes: {len(commits)}")
        print(f"Próxima tag a ser gerada: {next_ver}")
        sys.exit(0)
    else:
        # Default behavior: run check & trigger if needed
        generate_tag_and_trigger(push=not args.no_push)

if __name__ == "__main__":
    main()
