-- Migração: eventos de funil (telas vistas), para calcular abandono por tela.
-- Não substitui a tabela de respostas — essa aqui é leve, "fire-and-forget",
-- registrada a cada navegação (goTo) no quiz, mesmo antes de a pessoa terminar.

CREATE TABLE IF NOT EXISTS "Quiz".funil_eventos (
  id          BIGSERIAL PRIMARY KEY,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  sessao_id   TEXT NOT NULL,
  quiz_nome   TEXT NOT NULL DEFAULT 'perimenopausa',
  tela        TEXT NOT NULL,
  evento      TEXT NOT NULL DEFAULT 'tela_vista'
);

CREATE INDEX IF NOT EXISTS idx_funil_eventos_sessao ON "Quiz".funil_eventos (sessao_id);
CREATE INDEX IF NOT EXISTS idx_funil_eventos_tela ON "Quiz".funil_eventos (tela);
CREATE INDEX IF NOT EXISTS idx_funil_eventos_quiz_nome ON "Quiz".funil_eventos (quiz_nome);

-- Exemplo de query pra calcular quantas sessões chegaram em cada tela (abandono por tela):
--
-- SELECT tela, COUNT(DISTINCT sessao_id) AS sessoes
-- FROM "Quiz".funil_eventos
-- WHERE quiz_nome = 'perimenopausa'
-- GROUP BY tela
-- ORDER BY sessoes DESC;
