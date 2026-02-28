
-- Table to track finished product production entries
CREATE TABLE public.producao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 1,
  data_producao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.producao ENABLE ROW LEVEL SECURITY;

-- Allow all access (matching existing pattern)
CREATE POLICY "Allow all access to producao"
  ON public.producao
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_producao_produto_id ON public.producao(produto_id);
CREATE INDEX idx_producao_data ON public.producao(data_producao);
