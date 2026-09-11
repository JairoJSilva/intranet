# 📝 RMT-YYYYMMDD-XX: [Título Resumido da Modificação Técnica]

> **RMT (Registro de Modificação Técnica)**  
> **Status**: [Proposta | Aplicada | Em Homologação | Revertida]  
> **Data**: YYYY-MM-DD  
> **Autor / Agente Responsável**: @NomeOuAgente  
> **Tipo de Mudança**: [Feature | Bugfix | Refactor | Architecture | Database/Schema | Infra/DevOps | Security]  
> **Versão Afetada**: vX.Y.Z  

---

## 1. 🎯 Contexto e Motivação
Descreva detalhadamente o motivo pelo qual esta modificação foi realizada. Qual problema foi resolvido, qual funcionalidade foi adicionada ou qual melhoria técnica foi implementada?

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `caminho/do/arquivo.php` | [Criado / Modificado / Removido] | Resumo da intervenção |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
- Mudanças em regras de negócio, serviços, repositórios, rotas ou controllers.
- Parâmetros novos, novos endpoints ou validações adicionadas.

### 3.2. Frontend
- Mudanças em componentes, router, estado global (`state.js`), estilos ou temas.

### 3.3. Banco de Dados / Persistência
- Alterações de schema (DDL), novas tabelas, colunas, índices ou triggers.
- Comandos SQL executados ou scripts de migração aplicados.

### 3.4. Infraestrutura & DevOps
- Docker, compose, variáveis em `.env`, pipeline CI/CD ou dependências (`composer.json`, pacotes de sistema).

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** [Sim / Não] (Se sim, descrever como mitigar).
- **Variáveis de Ambiente**: Novas variáveis adicionadas ao `.env.example`?
- **Migrações / Seeders**: Necessário rodar algum script SQL no ambiente existente?
- **Compatibilidade com versões anteriores**: Riscos identificados.

---

## 5. 🧪 Testes e Validação
Descreva o que foi testado e os resultados obtidos:
- [ ] Testes unitários executados (ex: `vendor/bin/phpunit`)
- [ ] Testes de integração/API executados (ex: `php tests/api_test.php`)
- [ ] Testes manuais de interface ou cURL
- [ ] Validação em containers Docker

---

## 6. 📌 Referências e Links Relacionados
- ADR relacionada: [ADR-00X](...)
- Issue / Tarefa: [task.md](...)
- Commit / Tag Git: `hash-ou-tag`
