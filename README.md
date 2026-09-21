# Quiz Perimenopausa

Quiz de validação de demanda (TPM/perimenopausa) — teste de campo do projeto CRIANDO INFOPRODUTO.

## Estrutura

- **`index.html`** — o quiz completo (frontend). Página única, sem build, sem dependências externas além das fontes do Google Fonts. Pode ser hospedada em qualquer host estático (GitHub Pages, Netlify, Vercel, um diretório no seu VPS servido por Nginx, etc.).
- **`api/`** — backend Node.js/Express que recebe as respostas e grava no Postgres (schema `Quiz`). Ver `api/README.md` para instruções de deploy.

## Como colocar no ar

1. **Backend primeiro:**
   ```bash
   cd api
   npm install
   cp .env.example .env
   # edite o .env com a DATABASE_URL real (schema Quiz) e o domínio de origem em CORS_ORIGIN
   npm run migrate
   npm start   # ou pm2 start server.js --name quiz-hormonal-api (ver api/README.md)
   ```
2. **Frontend:** abra `index.html`, edite o objeto `CONFIG` no `<script>` final:
   ```js
   const CONFIG = {
     QUIZ_NOME: "perimenopausa",
     API_ENDPOINT: "https://SEU-DOMINIO/api/quiz-hormonal/respostas",
     EVENT_ENDPOINT: "https://SEU-DOMINIO/api/quiz-hormonal/evento",
     ...
   };
   ```
3. Hospede o `index.html` (estático) e divulgue o link pro teste de campo.

## Sem `CONFIG.API_ENDPOINT` configurado

Se o backend ainda não estiver no ar, o quiz cai automaticamente num fallback por `mailto:` — a resposta não é perdida, mas também não é gravada no banco. Prioridade #1 antes do teste de campo: configurar `API_ENDPOINT` e `EVENT_ENDPOINT` apontando pro backend real já implantado.

## Segurança

- `.env` nunca é commitado (está no `.gitignore`).
- Os dados coletados incluem informações de saúde (dados sensíveis pela LGPD) — o quiz já pede consentimento específico antes dessas perguntas, mas trate o banco de dados com o mesmo cuidado (acesso restrito, backup, política de retenção).
