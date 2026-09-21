require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // nomes numerados (001_, 002_, ...) garantem a ordem certa

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log('Rodando migração:', file);
    await pool.query(sql);
  }

  console.log('Todas as migrações concluídas.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
