# 📝 RMT-20260916-03: Correção de CORS Dinâmico e Afinidade de Sessão de Autenticação

> **RMT (Registro de Modificação Técnica)**  
> **Status**: ✅ Aplicada  
> **Data**: 2026-09-16  
> **Autor / Agente Responsável**: Antigravity AI / @FullstackDeveloper & @DevOpsSenior  
> **Tipo de Mudança**: Bugfix / Security / Infra/DevOps  
> **Versão Afetada**: v1.4.2  

---

## 1. 🎯 Contexto e Motivação
Ao realizar o login pelo navegador através de `http://localhost/`, os usuários enfrentavam falha de autenticação decorrente de dois fatores correlacionados:
1. **Bloqueio de CORS**: O header `Access-Control-Allow-Origin` estava configurado de forma estática como `http://intranet.local` pelo valor do `.env`/ConfigMap, fazendo com que requisições originadas de `http://localhost` fossem bloqueadas pelas políticas de segurança do navegador (Same-Origin Policy / CORS).
2. **Desincronização de Sessão Multi-Pod**: A aplicação estava operando com múltiplas réplicas utilizando armazenamento de sessão PHP baseado no sistema de arquivos local (`/tmp/sess_*`) sem afinidade de sessão no Ingress. Ao efetuar o login no Pod 1 e em seguida redirecionar para o dashboard (`/api/auth/me`), a requisição era balanceada para o Pod 2, que não possuía a sessão criada, resultando em status `401 Não autenticado` e expurgando o usuário de volta à tela de login.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/src/Middleware/CorsMiddleware.php` | Modificado | Suporte a origens dinâmicas permitidas (`localhost`, `127.0.0.1`, `intranet.local`, `portalvem.local`). |
| `aplicação/src/bootstrap.php` | Modificado | Ajuste de `session.cookie_samesite` de `Strict` para `Lax` garantindo preservação de cookie em navegação local. |
| `k8s/05-app-configmap.yaml` | Modificado | Ajuste de `APP_URL` para `http://localhost`. |
| `k8s/07-app-deployment.yaml` | Modificado | Ajuste de réplicas para 1 no cluster de desenvolvimento local. |
| `k8s/09-app-ingress.yaml` | Modificado | Configuração de anotações de afinidade de sessão baseada em cookie (`nginx.ingress.kubernetes.io/affinity: "cookie"`). |

---

## 3. ⚙️ Detalhamento Técnico das Modificações
- **CORS Flexível e Seguro**: `CorsMiddleware` agora inspeciona o header `HTTP_ORIGIN` da requisição e, caso pertença à whitelist local (`localhost`, `127.0.0.1`, `intranet.local`), reflete a origem autorizada com `Access-Control-Allow-Credentials: true`.
- **Persistência de Sessão**: Ingress NGINX configurado com cookie de afinidade `INGRESSCOOKIE`, garantindo que requisições subsequentes do mesmo cliente sejam sempre direcionadas para o mesmo pod.
- **Rollout e Imagem**: Rebuild de `flowti-app:latest`, injeção no Kind via `kind load docker-image` e rollout sem downtime.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não.
- **Segurança**: Mantido controle estrito de origens permitidas; requisições com origens não autorizadas continuam restritas.

---

## 5. 🧪 Testes e Validação
- [x] Requisição `POST /api/auth/login` enviando `Origin: http://localhost` respondendo com `Access-Control-Allow-Origin: http://localhost` e `Set-Cookie: OMNIFLOWTI_SESSION=...`.
- [x] Requisição encadeada `GET /api/auth/me` utilizando o cookie de sessão retornando HTTP 200 com os dados do usuário administrador `admin`.
- [x] Requisição `GET /api/dashboard/stats` autenticada retornando estatísticas do sistema.
- [x] Diagnóstico do Pipeline Guardian executado com sucesso acusando estado `HEALTHY` (0 erros).

---

## 6. 📌 Referências e Links Relacionados
- RMT anterior: [`RMT-20260916-02-reset-senha-admin.md`](RMT-20260916-02-reset-senha-admin.md)
