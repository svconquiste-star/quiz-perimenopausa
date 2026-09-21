# Quiz Perimenopausa

Quiz de validação de demanda (TPM/perimenopausa) — teste de campo do projeto CRIANDO INFOPRODUTO.

## Estrutura

- **`index.html`** — o quiz completo (frontend). Página única, sem build, sem dependências externas além das fontes do Google Fonts. Pode ser hospedada em qualquer host estático (GitHub Pages, Netlify, Vercel, um diretório no seu VPS servido por Nginx, etc.).
- **`api/`** — backend Node.js/Express que recebe as respostas e grava no Postgres (schema `Quiz`). Ver `api/README.md` para instruções de deploy.

## Domínio deste teste de campo

**https://quizperimenopausa.coreatendimento.online** — frontend (`index.html`) e backend (`api/`) servidos no mesmo domínio, com o backend atrás de um proxy reverso em `/api`. `CONFIG.API_ENDPOINT`/`EVENT_ENDPOINT` no `index.html` já estão configurados pra essa URL.

## Como colocar no ar

1. **Backend:**
   ```bash
   cd api
   npm install
   cp .env.example .env
   ```
   Preencha o `.env` no servidor com:
   ```bash
   DATABASE_URL=postgres://usuario:senha@host:porta/banco   # a connection string real, nunca commitada
   DB_SCHEMA=Quiz
   PORT=3300
   CORS_ORIGIN=https://quizperimenopausa.coreatendimento.online
   PGSSL=false
   ```
   Depois:
   ```bash
   npm run migrate
   pm2 start server.js --name quiz-hormonal-api   # ver api/README.md pra detalhes de pm2/systemd
   ```

2. **Nginx (proxy reverso + arquivo estático)** — exemplo de bloco de servidor:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name quizperimenopausa.coreatendimento.online;

       # ...configuração de certificado SSL (certbot/Let's Encrypt)...

       root /var/www/quizperimenopausa;   # onde este repositório fica clonado no VPS
       index index.html;

       location /api/ {
           proxy_pass http://127.0.0.1:3300;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```
   Como o `PORT` do backend é `3300` e as rotas do Express já começam com `/api/...`, o `proxy_pass http://127.0.0.1:3300;` (sem caminho depois da porta) encaminha a URL original inteira pro Node — sem precisar reescrever nada.

3. Clone este repositório em `/var/www/quizperimenopausa` (ou o caminho que usar no `root` do Nginx) e recarregue o Nginx (`nginx -s reload`).

## Sem `CONFIG.API_ENDPOINT` configurado

Se o backend ainda não estiver no ar, o quiz cai automaticamente num fallback por `mailto:` — a resposta não é perdida, mas também não é gravada no banco. Prioridade #1 antes do teste de campo: configurar `API_ENDPOINT` e `EVENT_ENDPOINT` apontando pro backend real já implantado.

## Segurança

- `.env` nunca é commitado (está no `.gitignore`).
- Os dados coletados incluem informações de saúde (dados sensíveis pela LGPD) — o quiz já pede consentimento específico antes dessas perguntas, mas trate o banco de dados com o mesmo cuidado (acesso restrito, backup, política de retenção).
