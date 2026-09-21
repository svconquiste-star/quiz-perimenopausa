-- Migração: tabela de respostas do quiz hormonal (TPM/perimenopausa)
-- Schema alvo: "Quiz" (não é o schema "public" padrão)

CREATE SCHEMA IF NOT EXISTS "Quiz";

CREATE TABLE IF NOT EXISTS "Quiz".quiz_hormonal_respostas (
  id                        BIGSERIAL PRIMARY KEY,
  criado_em                 TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- identificação
  nome                      TEXT,
  email                     TEXT,

  -- perguntas estruturadas
  idade                     TEXT,
  ciclo                     TEXT,
  tempo                     TEXT,
  incomodo                  TEXT,
  medico                    TEXT,
  medicamentos              TEXT,
  gravidez                  TEXT,
  menopausa_status          TEXT,
  interesse                 TEXT,
  perfil_resultado          TEXT,

  -- campos de múltipla escolha (arrays)
  sintomas                  JSONB DEFAULT '[]'::jsonb,
  condicoes                 JSONB DEFAULT '[]'::jsonb,
  motivacao                 JSONB DEFAULT '[]'::jsonb,
  solucoes_tentadas         JSONB DEFAULT '[]'::jsonb,

  -- campos de sub-dor (o foco desta melhoria: texto livre / voz do cliente)
  incomodo_detalhe          TEXT,
  solucoes_tentadas_outro   TEXT,
  desejo_produto            TEXT,

  -- cópia completa do estado do quiz, para nunca perder dado
  -- por causa de um campo que ainda não existe nesta tabela
  raw_payload                JSONB
);

CREATE INDEX IF NOT EXISTS idx_quiz_hormonal_respostas_criado_em
  ON "Quiz".quiz_hormonal_respostas (criado_em);

CREATE INDEX IF NOT EXISTS idx_quiz_hormonal_respostas_incomodo
  ON "Quiz".quiz_hormonal_respostas (incomodo);

-- Opcional: busca por padrões de texto nos campos de sub-dor (incomodo_detalhe, desejo_produto).
-- Exige a extensão pg_trgm (pode precisar de privilégio de superusuário no Postgres gerenciado).
-- Rode manualmente só se tiver permissão:
--   CREATE EXTENSION IF NOT EXISTS pg_trgm;
--   CREATE INDEX idx_quiz_hormonal_respostas_incomodo_detalhe_trgm
--     ON "Quiz".quiz_hormonal_respostas USING gin (incomodo_detalhe gin_trgm_ops);
