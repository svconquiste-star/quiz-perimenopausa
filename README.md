# Quiz Perimenopausa

Quiz de validação de demanda (TPM/perimenopausa) — teste de campo do projeto CRIANDO INFOPRODUTO.

## Estrutura

Um único app Node.js serve tanto o quiz (frontend) quanto a API — pensado pra rodar como um único serviço no Coolify (ou qualquer PaaS baseado em Docker/Railpack), sem precisar de Nginx nem de um segundo recurso pro frontend.

- **`api/server.js`** — backend Express: recebe as respostas (`POST /api/quiz-hormonal/respostas`) e eventos de funil (`POST /api/quiz-hormonal/evento`), grava no Postgres (schema `Quiz`), e serve os arquivos estáticos de `api/public/`.
- **`api/public/index.html`** — o quiz completo (frontend). Servido automaticamente na raiz (`/`) pelo próprio `server.js`.
- **`api/migrations/`** — scripts SQL de criação das tabelas.

## Domínio deste teste de campo

**https://quizperimenopausa.coreatendimento.online** — um único app (Coolify) responde tanto `/` (o quiz) quanto `/api/...` (a API). `CONFIG.API_ENDPOINT`/`EVENT_ENDPOINT` dentro do `index.html` já apontam pra essa URL.

## Deploy (Coolify)

1. Aponte o recurso do Coolify pra pasta `api/` deste repositório como "Base Directory" (é onde está o `package.json` — o Coolify/Railpack detecta e builda um app Node automaticamente).
2. Configure as variáveis de ambiente no Coolify:
   ```bash
   DATABASE_URL=postgres://usuario:senha@host:porta/banco   # a connection string real, nunca commitada
   DB_SCHEMA=Quiz
   PORT=3000
   CORS_ORIGIN=https://quizperimenopausa.coreatendimento.online
   PGSSL=false
   ```
   **Importante:** use `PORT=3000` (não `3300`) — é a porta que o Coolify espera por padrão (`ports_exposes`). Usar outro valor aqui gera "bad gateway".
3. Rode a migração uma vez (via terminal do container no Coolify, ou localmente contra o mesmo Postgres):
   ```bash
   cd api && npm run migrate
   ```
4. Aponte o domínio `quizperimenopausa.coreatendimento.online` pra esse recurso no Coolify (com SSL automático).

## Deploy manual (VPS sem Coolify, alternativa)

Se preferir rodar sem Coolify, os mesmos arquivos servem — só troque `PORT` pro valor que preferir e use `pm2`:
```bash
cd api
npm install
cp .env.example .env   # preencha com os valores reais
npm run migrate
pm2 start server.js --name quiz-hormonal-api
```
Nesse caso, um proxy reverso (Nginx) na frente só precisa encaminhar tudo (`/`) pra essa porta — não precisa de regra separada pra `/api`, já que o próprio Node serve os dois.

## Sem `CONFIG.API_ENDPOINT` configurado

Se o backend ainda não estiver no ar, o quiz cai automaticamente num fallback por `mailto:` — a resposta não é perdida, mas também não é gravada no banco. Prioridade #1 antes do teste de campo: confirmar que `API_ENDPOINT` e `EVENT_ENDPOINT` em `api/public/index.html` apontam pro domínio real e que o backend está respondendo em `/health`.

## Segurança

- `.env` nunca é commitado (está no `.gitignore`).
- Os dados coletados incluem informações de saúde (dados sensíveis pela LGPD) — o quiz já pede consentimento específico antes dessas perguntas, mas trate o banco de dados com o mesmo cuidado (acesso restrito, backup, política de retenção).
