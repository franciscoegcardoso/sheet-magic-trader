
-- Table for purchases (local copy for reports)
CREATE TABLE public.compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insumo_nome TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_compra NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to compras"
ON public.compras FOR ALL
USING (true) WITH CHECK (true);

CREATE INDEX idx_compras_insumo ON public.compras (insumo_nome);
CREATE INDEX idx_compras_data ON public.compras (data_compra);

-- Table for sales (local copy for reports)
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  produto TEXT NOT NULL,
  tamanho TEXT,
  embalagem TEXT,
  valor_frete NUMERIC DEFAULT 0,
  forma_pagamento TEXT,
  valor_venda NUMERIC NOT NULL DEFAULT 0,
  data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to vendas"
ON public.vendas FOR ALL
USING (true) WITH CHECK (true);

CREATE INDEX idx_vendas_produto ON public.vendas (produto);
CREATE INDEX idx_vendas_data ON public.vendas (data_venda);
