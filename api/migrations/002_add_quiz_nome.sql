-- Migração: adiciona identificação de qual pesquisa/quiz cada resposta pertence.
-- Necessário porque a tabela vai passar a receber respostas de mais de um tipo
-- de pesquisa de mercado (perimenopausa é a primeira, outras virão).

ALTER TABLE "Quiz".quiz_hormonal_respostas
  ADD COLUMN IF NOT EXISTS quiz_nome TEXT;

-- Respostas que já existirem sem essa coluna preenchida pertencem à pesquisa de perimenopausa
UPDATE "Quiz".quiz_hormonal_respostas
  SET quiz_nome = 'perimenopausa'
  WHERE quiz_nome IS NULL;

ALTER TABLE "Quiz".quiz_hormonal_respostas
  ALTER COLUMN quiz_nome SET NOT NULL,
  ALTER COLUMN quiz_nome SET DEFAULT 'perimenopausa';

CREATE INDEX IF NOT EXISTS idx_quiz_hormonal_respostas_quiz_nome
  ON "Quiz".quiz_hormonal_respostas (quiz_nome);
