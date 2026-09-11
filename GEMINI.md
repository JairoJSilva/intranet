# 🤖 Diretrizes e Regras do Projeto (Workspace Rules)

## 📌 Regra de Ouro: Registro Obrigatório de Modificações Técnicas

> [!IMPORTANT]
> **SEMPRE que qualquer modificação técnica for realizada no projeto** (seja no código PHP, nos componentes JS, estilos CSS, DDL de banco de dados, Dockerfiles, docker-compose, scripts de automação ou dependências):
> 
> 1. **Criar um novo arquivo de registro técnico** no diretório `Documentações/modificacoes-tecnicas/`.
> 2. **Padrão de nomenclatura obrigatório**:
>    ```
>    Documentações/modificacoes-tecnicas/RMT-YYYYMMDD-XX-descricao-curta.md
>    ```
>    - `YYYYMMDD`: Data da alteração (ano, mês e dia).
>    - `XX`: Sequencial do dia (`01`, `02`, etc.).
>    - `descricao-curta`: Resumo em minúsculas separado por hífen.
> 3. **Seguir o modelo padrão**:
>    Utilize os tópicos definidos no modelo oficial em [`Documentações/modificacoes-tecnicas/TEMPLATE-RMT.md`](Documenta%C3%A7%C3%B5es/modificacoes-tecnicas/TEMPLATE-RMT.md).
> 4. **Atualizar o índice geral**:
>    Adicionar a linha correspondente na tabela de histórico em [`Documentações/modificacoes-tecnicas/README.md`](Documenta%C3%A7%C3%B5es/modificacoes-tecnicas/README.md).

---

## 🏛️ Padrões de Arquitetura & Código
- **Backend**: PHP 8.2+ estrito (`declare(strict_types=1);`), PSR-4, PSR-12, Clean Architecture (Controllers → Services → Repositories → PDO).
- **Frontend**: Vanilla JS moderno, ES6+, Modular, CSS Custom Properties com temas escuros e Glassmorphism. Zero dependência de frameworks ou transpilação.
- **Banco de Dados**: MySQL 8.0 utf8mb4, transações quando aplicável, prepared statements em 100% das consultas.
- **Auditoria**: Ações de mutação em dados (criação, edição, exclusão) devem ser registradas na tabela `audit_log`.
