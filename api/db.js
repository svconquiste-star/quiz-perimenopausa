const { Pool } = require('pg');

const schema = process.env.DB_SCHEMA || 'public';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Postgres gerenciados fora de VPS costumam exigir SSL; ajuste conforme seu provedor.
  // Se o seu Postgres for local/VPS sem TLS, pode remover este bloco.
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', (client) => {
  // garante que toda conexão nova já busca a tabela no schema certo
  client.query(`SET search_path TO "${schema}", public`).catch((err) => {
    console.error('Falha ao definir search_path:', err);
  });
});

module.exports = { pool, schema };
