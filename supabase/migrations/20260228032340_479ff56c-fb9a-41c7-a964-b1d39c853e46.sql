
-- Table for inventory reviews/adjustments
CREATE TABLE public.inventario_revisoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insumo_nome TEXT NOT NULL,
  quantidade_contada NUMERIC NOT NULL DEFAULT 0,
  quantidade_sistema NUMERIC NOT NULL DEFAULT 0,
  diferenca NUMERIC NOT NULL DEFAULT 0,
  observacao TEXT,
  data_revisao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventario_revisoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to inventario_revisoes"
ON public.inventario_revisoes
FOR ALL
USING (true)
WITH CHECK (true);
