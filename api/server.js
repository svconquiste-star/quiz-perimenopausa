require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { pool, schema } = require('./db');

const app = express();
app.use(express.json({ limit: '256kb' }));

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

// Serve o quiz (frontend estático) a partir do mesmo app/domínio.
// index.html fica em public/ e é servido automaticamente na raiz ("/").
app.use(express.static(path.join(__dirname, 'public')));

const TABLE = `"${schema}".quiz_hormonal_respostas`;
const EVENTS_TABLE = `"${schema}".funil_eventos`;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Evento leve de funil (tela vista) — usado pra calcular abandono por tela.
// Fire-and-forget: validação mínima, sem retorno detalhado, aceita perder um evento ocasional.
app.post('/api/quiz-hormonal/evento', async (req, res) => {
  const body = req.body || {};
  if (!body.sessao_id || !body.tela) {
    return res.status(400).json({ ok: false });
  }
  try {
    await pool.query(
      `INSERT INTO ${EVENTS_TABLE} (sessao_id, quiz_nome, tela, evento) VALUES ($1,$2,$3,$4)`,
      [body.sessao_id, body.quiz_nome || 'perimenopausa', body.tela, body.evento || 'tela_vista']
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Erro ao gravar evento de funil:', err);
    res.status(500).json({ ok: false });
  }
});

app.post('/api/quiz-hormonal/respostas', async (req, res) => {
  const body = req.body || {};

  // validação mínima — sem os 4 campos abaixo, a resposta não é utilizável
  if (!body.idade || !body.ciclo || !body.perfil_resultado) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios ausentes: idade, ciclo, perfil_resultado.' });
  }

  const jsonb = (v) => JSON.stringify(Array.isArray(v) ? v : []);

  const query = `
    INSERT INTO ${TABLE} (
      quiz_nome,
      nome, email, idade, ciclo, tempo, incomodo, medico, medicamentos,
      gravidez, menopausa_status, interesse, perfil_resultado,
      sintomas, condicoes, motivacao, solucoes_tentadas,
      incomodo_detalhe, solucoes_tentadas_outro, desejo_produto,
      raw_payload
    ) VALUES (
      $1,
      $2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,
      $14,$15,$16,$17,
      $18,$19,$20,
      $21
    )
    RETURNING id, criado_em;
  `;

  const values = [
    body.quiz_nome || 'perimenopausa',
    body.nome || null,
    body.email || null,
    body.idade || null,
    body.ciclo || null,
    body.tempo || null,
    body.incomodo || null,
    body.medico || null,
    body.medicamentos || null,
    body.gravidez || null,
    body.menopausa_status || null,
    body.interesse || null,
    body.perfil_resultado || null,
    jsonb(body.sintomas),
    jsonb(body.condicoes),
    jsonb(body.motivacao),
    jsonb(body.solucoes_tentadas),
    body.incomodo_detalhe || null,
    body.solucoes_tentadas_outro || null,
    body.desejo_produto || null,
    JSON.stringify(body.raw_payload || {}),
  ];

  try {
    const result = await pool.query(query, values);
    res.status(201).json({ ok: true, id: result.rows[0].id, criado_em: result.rows[0].criado_em });
  } catch (err) {
    console.error('Erro ao inserir resposta do quiz:', err);
    res.status(500).json({ ok: false, error: 'Erro ao gravar no banco de dados.' });
  }
});

const port = process.env.PORT || 3300;
app.listen(port, () => {
  console.log(`quiz-hormonal-api rodando na porta ${port} (schema "${schema}")`);
});
