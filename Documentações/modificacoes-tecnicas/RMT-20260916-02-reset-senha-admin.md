# 📝 RMT-20260916-02: Redefinição da Senha Padrão do Usuário Administrador

> **RMT (Registro de Modificação Técnica)**  
> **Status**: ✅ Aplicada  
> **Data**: 2026-09-16  
> **Autor / Agente Responsável**: Antigravity AI / @DevOpsSenior & @FullstackDeveloper  
> **Tipo de Mudança**: Security / Database  
> **Versão Afetada**: v1.4.2  

---

## 1. 🎯 Contexto e Motivação
Ajuste da credencial de acesso do usuário administrador (`admin`) para a senha solicitada (`BHU*nji9`), garantindo que o hash BCrypt correspondente esteja devidamente gravado no banco de dados do cluster Kubernetes (`portal-cluster`, namespace `intranet`) e sincronizado com os artefatos de sementes (`seed.sql`), documentação e manifestos ConfigMap.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `senhas-padrão` | Modificado | Atualização da anotação da senha do usuário `admin` para `BHU*nji9`. |
| `database/seed.sql` | Modificado | Atualização do hash BCrypt do usuário `admin` para `$2y$12$ePgV/XPT.plecIKXSEJ7tOyvhRYuhS1lpk8kInLBGBT1gA2OloEJy`. |
| `k8s/03-mysql-initdb-configmap.yaml` | Modificado | Sincronização do ConfigMap de inicialização do MySQL no cluster. |
| Banco de Dados MySQL (`users`) | Modificado | Execução de update atômico via PDO no banco em produção no cluster Kind. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações
- Gerado hash BCrypt com custo 12 via `password_hash('BHU*nji9', PASSWORD_BCRYPT, ['cost' => 12])`.
- Atualizado registro do usuário `admin` na tabela `users` do banco `intranet_flowti` no pod `mysql` do namespace `intranet`.
- Testada e validada a autenticação via API `/api/auth/login`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Apenas a senha do usuário `admin` local foi alterada.
- **Sessões ativas**: Novas autenticações devem utilizar a nova senha.

---

## 5. 🧪 Testes e Validação
- [x] Geração e verificação do hash via PHP `password_verify("BHU*nji9", $hash)` retornando verdadeiro.
- [x] Atualização executada com sucesso no MySQL do cluster Kubernetes.
- [x] Requisição `POST /api/auth/login` com payload `{"username":"admin","password":"BHU*nji9"}` retornando HTTP 200 e `success: true`.

---

## 6. 📌 Referências e Links Relacionados
- RMT anterior: [`RMT-20260916-01-deploy-cluster-kind-e-bot-pipeline-guardian.md`](RMT-20260916-01-deploy-cluster-kind-e-bot-pipeline-guardian.md)
