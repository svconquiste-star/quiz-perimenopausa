# quiz-hormonal-api

Endpoint mínimo (Node.js + Express + Postgres) que recebe as respostas do `quiz-hormonal-v2.html` e grava no schema `Quiz` do Postgres.

## Rodar localmente / no VPS

```bash
cd backend/quiz-api
npm install
cp .env.example .env
# edite o .env e cole a DATABASE_URL real (com a senha), DB_SCHEMA=Quiz, PORT e CORS_ORIGIN
npm run migrate   # cria o schema "Quiz" e a tabela quiz_hormonal_respostas, se ainda não existirem
npm start         # sobe o servidor na porta definida em PORT (padrão 3300)
```

## Testar

```bash
curl -X POST http://localhost:3300/api/quiz-hormonal/respostas \
  -H "Content-Type: application/json" \
  -d '{"idade":"2","ciclo":"2","perfil_resultado":"Perfil B - teste","email":"teste@teste.com"}'
```

Deve responder `201` com `{ ok: true, id: ..., criado_em: ... }`. Depois de confirmar, apague o registro de teste:

```sql
DELETE FROM "Quiz".quiz_hormonal_respostas WHERE email = 'teste@teste.com';
```

## Deixar rodando no VPS (produção)

Recomendado usar `pm2` (mantém o processo vivo e reinicia sozinho se cair):

```bash
npm install -g pm2
pm2 start server.js --name quiz-hormonal-api
pm2 save
pm2 startup   # segue as instruções que aparecerem para o pm2 iniciar sozinho com o servidor
```

Depois, aponte um domínio/subdomínio (via Nginx ou proxy reverso já usado no VPS) para a porta do `PORT` definida no `.env`, e use essa URL pública no `CONFIG.API_ENDPOINT` do `quiz-hormonal-v2.html`.

## Segurança

- **Nunca** commite o `.env` real (com a senha do Postgres) — ele já está fora do controle de versão por padrão neste projeto (não há `.gitignore` ainda porque a pasta não é um repositório git; se virar um, adicione `.env` ao `.gitignore` antes do primeiro commit).
- A senha do banco foi compartilhada em texto puro numa conversa de chat durante o planejamento deste endpoint — recomenda-se trocá-la após configurar o `.env` real.
- O CORS está restrito à origem configurada em `CORS_ORIGIN` — atualize esse valor para o domínio real onde o quiz for hospedado (não deixe em `*` em produção).
