# ADR-001: Stack Tecnológica — PHP 8.2 + MySQL 8.0 + Vanilla JS

**Status**: Aceita  
**Data**: 2026-09-10  
**Autores**: @SoftwareArchitect, @ProductManager

---

## Contexto

A Flowti possui dezenas de aplicações internas dispersas sem ponto de acesso unificado. É necessário um portal corporativo que centralize todos os links, com autenticação integrada ao Active Directory e gerenciamento de permissões por grupo/setor.

O portal precisa ser:
- **Simples de operar** pela equipe de TI existente
- **Leve e performático** — sem overhead de frameworks pesados
- **Compatível com a infraestrutura atual** (PHP, MySQL, Kubernetes)
- **Escalável** para toda a empresa

## Decisão

### Backend: PHP 8.2+ com PDO (MySQL)
- **Justificativa**: A equipe de TI da Flowti já possui expertise em PHP. O PHP 8.2+ oferece tipagem estrita, enums, readonly properties e performance excelente.
- **Padrões**: PSR-4 (autoload), PSR-12 (coding style), Clean Architecture (Controllers → Services → Repositories).
- **Banco**: MySQL 8.0 com charset utf8mb4, índices compostos e prepared statements obrigatórios.

### Frontend: Vanilla JS + CSS Custom (Design System VEM)
- **Justificativa**: Para um portal de links com CRUD, frameworks como React/Vue adicionam complexidade desnecessária. Vanilla JS é leve, sem build step e direto ao ponto.
- **Design**: Dark mode nativo, glassmorphism, micro-animações e Remix Icons seguindo tokens VEM.

### Autenticação: Strategy Pattern (LDAP + Local)
- **Justificativa**: Permite alternar entre autenticação AD e local sem alterar o código de negócio. Auto-provisionamento no primeiro login via AD.

## Alternativas Consideradas

| Alternativa | Por que foi descartada |
|:---|:---|
| **Node.js/Express** | Equipe sem experiência. PHP já está no ambiente de produção. |
| **Laravel** | Overhead significativo para uma aplicação de links. Prefere-se PHP puro com PSR-4. |
| **React/Vue** | Build step desnecessário. Vanilla JS atende perfeitamente o escopo. |
| **PostgreSQL** | MySQL já está no ambiente. Sem necessidade de features específicas do Postgres. |
| **JWT Stateless** | Sessão server-side é mais segura e simples para uma intranet. |

## Consequências

### Positivas
- Zero dependência de frameworks complexos
- Fácil manutenção pela equipe atual
- Deploy simples via Docker + Kubernetes
- Performance excelente (sem overhead de framework)

### Negativas (trade-offs)
- Router manual (sem routing framework)
- Sem ORM — queries SQL escritas manualmente (mitiga com Repository Pattern)
- Frontend sem componentização reativa (mitiga com state management manual)

---

*Revisado e aprovado por @ProductManager em 2026-09-10.*
