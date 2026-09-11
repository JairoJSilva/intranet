# 📝 RMT-20260911-10: Criação da Branch de Desenvolvimento (dev) e Governança de Release

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: @PipelineOwner & @DevOpsSenior  
> **Tipo de Mudança**: Infra/DevOps / Governance / Branching  
> **Versão Afetada**: v2.1.0  

---

## 1. 🎯 Contexto e Motivação
Para assegurar a separação entre o código estável de produção (`main`) e as atividades ativas de desenvolvimento contínuo, foi criada a branch de desenvolvimento (`dev`). Adicionalmente, foram ajustadas as regras de ignore no repositório para evitar persistência de credenciais e caches efêmeros de favicons gerados pela rotina de autodetecção.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `.gitignore` | Modificado | Adicionado bloqueio de `senhas-padrão` e arquivos em `aplicação/public/uploads/favicons/*` (preservando `.gitkeep`) |
| `Documentações/modificacoes-tecnicas/RMT-20260911-10-criacao-branch-dev-e-governanca-de-release.md` | Criado | Registro oficial da modificação técnica e estratégia de branching |
| `Documentações/modificacoes-tecnicas/README.md` | Modificado | Atualização da tabela cronológica de modificações técnicas |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Estratégia de Branching (Gitflow Adaptado)
- **`main`**: Ramo de produção, contendo releases oficiais consolidadas.
- **`dev`**: Ramo base para integração contínua de features, correções e testes antes do merge para produção.
- **Rastreabilidade**: Todas as entregas para a branch `dev` e `main` contam com tagueamento SemVer e histórico auditável.

### 3.2. Proteção de Dados e Arquivos Efêmeros (.gitignore)
- `senhas-padrão`: Arquivos de credenciais padrão de desenvolvimento bloqueados de commits acidentais.
- `aplicação/public/uploads/favicons/*`: Impede que favicons baixados dinamicamente via serviço de scraping saturem a árvore do Git, mantendo apenas a pasta rastreada com `.gitkeep`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não.
- **Variáveis de Ambiente**: Nenhuma nova variável necessária.
- **Migrações / Seeders**: Nenhuma intervenção de banco de dados necessária.
- **Compatibilidade**: Compatibilidade total mantida.

---

## 5. 🧪 Testes e Validação
- [x] Criação e checkout da branch `dev` verificado via `git checkout -b dev`.
- [x] Regras de `.gitignore` testadas e validadas com o status do repositório.
- [x] Tag de versão `v2.1.0` gerada e publicada para rastreabilidade SemVer.
- [x] Push da branch `dev` para o repositório remoto `origin` executado com sucesso.

---

## 6. 📌 Referências e Links Relacionados
- Branch: `dev`
- Tag Git: `v2.1.0`
- Repositório: `git@github.com:JairoJSilva/intranet.git`
