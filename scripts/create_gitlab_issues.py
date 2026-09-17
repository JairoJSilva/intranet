#!/usr/bin/env python3
"""
Script de automação para criação de Issues no GitLab — Omniflowti
Repositório: git@gitlab.com:mv-corp/flowti/flowti-devops/flowti-hub.git
Projeto ID ou Path: mv-corp/flowti/flowti-devops/flowti-hub

Uso:
  1. Criar issues localmente em markdown:
     python3 scripts/create_gitlab_issues.py --generate-docs

  2. Criar issues diretamente no GitLab via API:
     python3 scripts/create_gitlab_issues.py --token <SEU_GITLAB_TOKEN>
     ou exportando GITLAB_TOKEN="seu_token" e rodando:
     python3 scripts/create_gitlab_issues.py
"""

import sys
import os
import json
import urllib.request
import urllib.parse
import urllib.error

PROJECT_PATH = "mv-corp/flowti/flowti-devops/flowti-hub"
ENCODED_PROJECT = urllib.parse.quote(PROJECT_PATH, safe="")
API_URL = f"https://gitlab.com/api/v4/projects/{ENCODED_PROJECT}/issues"

ISSUES = [
    {
        "id": "ISSUE-01",
        "title": "⚡ Command Palette Global (Ctrl + K / Cmd + K)",
        "labels": ["frontend", "ui/ux", "enhancement", "priority::high"],
        "weight": 3,
        "description": """### 🎯 Objetivo & User Story
Como operador ou administrador do Omniflowti, quero pressionar `Ctrl + K` (ou `Cmd + K`) em qualquer tela do portal para abrir uma paleta de busca global rápida estilo *Spotlight / VS Code*, para navegar e abrir sistemas corporativos instantaneamente sem precisar tirar as mãos do teclado.

---

### 📋 Critérios de Aceite
- [ ] O atalho `Ctrl + K` e `Cmd + K` deve abrir o modal centralizado da Command Palette de qualquer tela.
- [ ] A tecla `Escape` deve fechar o modal.
- [ ] Navegação completa por teclado: setas `Up` / `Down` selecionam o item, `Enter` aciona o item focado.
- [ ] Ao dar `Enter` em um sistema/link, abre a URL em nova aba.
- [ ] Ao dar `Enter` em um painel, redireciona o router para `#/panels/:id`.
- [ ] Busca em tempo real com filtro por título, descrição, domínio e tags.
- [ ] Badge colorido indicando status em tempo real (`online`, `warning`, `offline`) ao lado de cada link sugerido.
- [ ] Design System em Glassmorphism integrado aos temas do Omniflowti.
"""
    },
    {
        "id": "ISSUE-02",
        "title": "📲 PWA (Progressive Web App - Instalação Desktop & Offline Cache)",
        "labels": ["frontend", "pwa", "mobile/desktop", "enhancement"],
        "weight": 2,
        "description": """### 🎯 Objetivo & User Story
Como colaborador corporativo, quero instalar o Omniflowti como um aplicativo no meu computador (Windows, Linux ou Mac), para ter um ícone dedicado na barra de tarefas e inicialização rápida sem a moldura do navegador.

---

### 📋 Critérios de Aceite
- [ ] Criar arquivo `public/manifest.json` configurado com nomes, ícones (192x192, 512x512) e `theme_color: #0B0A0A`.
- [ ] Implementar Service Worker (`public/sw.js`) para interceptação de rede e cache seguro dos recursos estáticos (CSS, JS, fontes RemixIcon).
- [ ] Registrar o Service Worker no carregamento de `index.html`.
- [ ] Exibir botão ou prompt nativo do navegador para "Instalar Aplicativo".
- [ ] Testar modo standalone em janela própria.
"""
    },
    {
        "id": "ISSUE-03",
        "title": "🖱️ Reordenação por Arrastar e Soltar (Drag & Drop de Cartões e Painéis)",
        "labels": ["frontend", "ui/ux", "interactivity", "enhancement"],
        "weight": 3,
        "description": """### 🎯 Objetivo & User Story
Como supervisor ou operador, quero poder arrastar e soltar os cartões de links dentro dos painéis e os painéis fixados na barra lateral, para personalizar a hierarquia visual conforme as prioridades do meu dia a dia.

---

### 📋 Critérios de Aceite
- [ ] Implementar suporte a drag and drop nativo ou biblioteca leve sem dependências externas.
- [ ] Permitir reordenar os painéis fixados na barra lateral esquerda, persistindo a ordem no `localStorage`.
- [ ] Permitir reordenar os cartões de sistemas (`app-tile`) dentro do painel para administradores e supervisores.
- [ ] Criar endpoint `PUT /api/links/reorder` para salvar o `sort_order` no banco MySQL quando persistido pelo gestor do painel.
- [ ] Feedback visual suave com placeholder indicador de soltura (*drop target*).
"""
    },
    {
        "id": "ISSUE-04",
        "title": "📱 Alternador de Densidade de Tela (Modo Compacto / NOC vs. Confortável)",
        "labels": ["frontend", "ui/ux", "design-system", "accessibility"],
        "weight": 2,
        "description": """### 🎯 Objetivo & User Story
Como operador de NOC/SOC que monitora dezenas de sistemas simultâneos, quero alternar a visualização para um modo de alta densidade (compacto), para enxergar mais aplicações na mesma tela sem necessidade de scroll excessivo.

---

### 📋 Critérios de Aceite
- [ ] Adicionar botão de alternância de densidade no cabeçalho ou Topbar: **Modo Confortável** (padrão com cards expandidos) vs. **Modo Compacto** (micro-tiles / lista densa).
- [ ] O modo compacto reduz margens, paddings e tamanhos de fonte de forma legível e elegante.
- [ ] Salvar a preferência do usuário no `localStorage` (`omniflowti_density_mode`).
- [ ] Garantir compatibilidade visual com todos os 7 temas de cores da aplicação.
"""
    },
    {
        "id": "ISSUE-05",
        "title": "📢 Mural de Avisos & Manutenções Programadas (Broadcast Banner)",
        "labels": ["backend", "frontend", "feature", "priority::high"],
        "weight": 4,
        "description": """### 🎯 Objetivo & User Story
Como administrador ou supervisor, quero publicar avisos corporativos e comunicados de manutenção programada no topo do portal, para manter todos os colaboradores informados sobre instabilidades planejadas ou comunicados urgentes da TIC.

---

### 📋 Critérios de Aceite
- [ ] Criar tabela `announcements` no banco MySQL com campos: `title`, `message`, `severity` (`info`, `warning`, `critical`), `starts_at`, `expires_at`, `is_active`, `created_by`.
- [ ] Criar Controller e rotas REST: `GET /api/announcements/active`, `POST /api/announcements`, `PUT /api/announcements/:id`, `DELETE /api/announcements/:id`.
- [ ] Banner no topo do layout do portal com ícone, cor de severidade e animação suave.
- [ ] Permitir ao colaborador clicar em "Entendido / Fechar" (ocultando o aviso específico naquela sessão).
- [ ] Modal administrativo para publicação rápida de avisos.
"""
    },
    {
        "id": "ISSUE-06",
        "title": "🏷️ Tags Transversais de Sistemas (#producao, #homologacao, #cloud)",
        "labels": ["database", "backend", "frontend", "feature"],
        "weight": 3,
        "description": """### 🎯 Objetivo & User Story
Como colaborador ou operador, quero filtrar links corporativos por tags temáticas transversais (ex: `#producao`, `#homologacao`, `#observabilidade`, `#cloud`), para cruzar aplicações de diferentes setores em uma única busca.

---

### 📋 Critérios de Aceite
- [ ] Criar tabelas `tags` e `link_tags` (relação N:N) no banco MySQL.
- [ ] Atualizar endpoints de Links para aceitar lista de tags no cadastro/edição (`tags: ['producao', 'cloud']`).
- [ ] Adicionar componente de seleção/criação de tags no modal de link.
- [ ] Exibir tags como badges clicáveis nos cards de links.
- [ ] Seletor rápido de filtro por tag na barra de busca e no catálogo de painéis.
"""
    },
    {
        "id": "ISSUE-07",
        "title": "🌐 Autodetecção e Download Automático de Favicons das URLs",
        "labels": ["backend", "frontend", "automation", "enhancement"],
        "weight": 2,
        "description": """### 🎯 Objetivo & User Story
Como usuário cadastrando um sistema no portal, quero que o sistema descubra e preencha automaticamente o ícone/favicon oficial da aplicação a partir da URL informada, economizando tempo na configuração manual.

---

### 📋 Critérios de Aceite
- [ ] Criar endpoint `GET /api/links/detect-icon?url=https://...` no backend PHP.
- [ ] O backend faz requisição cURL segura (timeout 2s) buscando `<link rel="icon">` no HTML ou testando `/favicon.ico`.
- [ ] Se encontrado, retorna a URL ou SVG do ícone para preview no formulário.
- [ ] Se o usuário optar por manter o favicon externo, o sistema armazena a referência no campo `icon`.
"""
    },
    {
        "id": "ISSUE-08",
        "title": "⏱️ Worker Assíncrono de Health Check Periódico em Background",
        "labels": ["backend", "devops", "worker", "priority::high"],
        "weight": 3,
        "description": """### 🎯 Objetivo & User Story
Como equipe de operações de TIC, queremos que a disponibilidade de todos os links seja monitorada continuamente a cada 5 minutos via worker em background, sem depender que algum usuário clique manualmente no botão de verificação.

---

### 📋 Critérios de Aceite
- [ ] Criar script executável CLI: `bin/healthcheck-worker.php`.
- [ ] Executar checagens concorrentes de conectividade com `curl_multi` (lotes paralelos de alta performance).
- [ ] Atualizar `health_status`, `response_time_ms` e `last_checked_at` diretamente no banco MySQL.
- [ ] Fornecer configuração no crontab ou suporte a loop daemon com intervalo configurável via `.env` (`HEALTHCHECK_INTERVAL=300`).
- [ ] Registrar logs de execução e detecção de incidentes.
"""
    },
    {
        "id": "ISSUE-09",
        "title": "🧹 Rotina de Rotação e Expurgamento da audit_log",
        "labels": ["database", "backend", "performance", "maintenance"],
        "weight": 2,
        "description": """### 🎯 Objetivo & User Story
Como DBA e administrador do sistema, quero uma rotina agendada para expurgar registros de auditoria com mais de 365 dias, para prevenir o crescimento descontrolado do banco e manter consultas rápidas.

---

### 📋 Critérios de Aceite
- [ ] Criar script CLI `bin/audit-purge.php --days=365` ou procedure MySQL.
- [ ] Executar deleção ou arquivamento em lotes (`LIMIT 1000`) para evitar bloqueios de tabela (locks) no MySQL.
- [ ] Registrar evento de auditoria informando a quantidade de registros expurgados.
- [ ] Parâmetro configurável em `.env` (`AUDIT_RETENTION_DAYS=365`).
"""
    },
    {
        "id": "ISSUE-10",
        "title": "📈 View Materializada de Métricas Operacionais (vw_dashboard_stats)",
        "labels": ["database", "performance", "sql", "enhancement"],
        "weight": 2,
        "description": """### 🎯 Objetivo & User Story
Como engenheiro de software, quero que as métricas consolidadas do Dashboard sejam geradas via queries agregadas otimizadas no MySQL, garantindo tempo de resposta inferior a 10ms mesmo com milhares de acessos e links cadastrados.

---

### 📋 Critérios de Aceite
- [ ] Criar DDL com view ou stored query `vw_dashboard_stats` totalizando links online, offline, warnings e tempo médio de resposta por painel.
- [ ] Otimizar índices na tabela `links` (`INDEX idx_links_health (panel_id, health_status)`).
- [ ] Integrar o método `DashboardController::stats()` para consumir os dados consolidados.
"""
    }
]

def generate_local_docs():
    """Gera arquivos markdown em Documentações/issues/"""
    output_dir = os.path.join(os.path.dirname(__file__), "..", "Documentações", "issues")
    os.makedirs(output_dir, exist_ok=True)
    
    index_md = "# 📋 Catálogo de Issues de Evolução — Omniflowti\n\n"
    index_md += "| ID | Título | Labels | Estimativa |\n"
    index_md += "|:---|:---|:---|:---|\n"

    for issue in ISSUES:
        filename = f"{issue['id']}-{slugify(issue['title'])}.md"
        filepath = os.path.join(output_dir, filename)
        
        content = f"# {issue['title']}\n\n"
        content += f"> **ID**: `{issue['id']}`  \n"
        content += f"> **Labels**: `{', '.join(issue['labels'])}`  \n"
        content += f"> **Weight (Complexidade)**: `{issue['weight']}`  \n\n"
        content += issue['description']
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        index_md += f"| [{issue['id']}]({filename}) | {issue['title']} | `{', '.join(issue['labels'])}` | {issue['weight']} |\n"
    
    with open(os.path.join(output_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(index_md)

    print(f"✅ {len(ISSUES)} issues geradas com sucesso no diretório: {output_dir}")

def create_gitlab_issues(token):
    """Envia as issues para o repositório GitLab via REST API"""
    headers = {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": token
    }

    print(f"🚀 Conectando ao GitLab: {PROJECT_PATH}...")
    success_count = 0

    for issue in ISSUES:
        payload = {
            "title": issue["title"],
            "description": issue["description"],
            "labels": ",".join(issue["labels"]),
            "weight": issue["weight"]
        }

        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status in (200, 201):
                    res_data = json.loads(resp.read().decode("utf-8"))
                    print(f"  ✓ Criada: #{res_data.get('iid')} — {issue['title']}")
                    success_count += 1
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"  ✗ Erro ao criar '{issue['title']}': HTTP {e.code} - {err_body}")
        except Exception as e:
            print(f"  ✗ Falha de conexão ao criar '{issue['title']}': {e}")

    print(f"\n🎉 Concluído: {success_count}/{len(ISSUES)} issues criadas no GitLab!")

def slugify(text):
    text = text.lower()
    for ch in ['⚡', '📲', '🖱️', '📱', '📢', '🏷️', '🌐', '⏱️', '🧹', '📈', '(', ')', '/', '+', '#', ':', ',']:
        text = text.replace(ch, '')
    words = [w.strip() for w in text.split() if w.strip()]
    return '-'.join(words[:6])

if __name__ == "__main__":
    token = os.environ.get("GITLAB_TOKEN")

    if "--token" in sys.argv:
        idx = sys.argv.index("--token")
        if idx + 1 < len(sys.argv):
            token = sys.argv[idx + 1]

    # Sempre gera os docs locais para rastreabilidade
    generate_local_docs()

    if token:
        create_gitlab_issues(token)
    else:
        print("\nℹ️ Para criar diretamente no GitLab remoto, execute:")
        print(f"   python3 scripts/create_gitlab_issues.py --token <SEU_GITLAB_TOKEN>")
        print("   (ou defina a variável de ambiente GITLAB_TOKEN)")
