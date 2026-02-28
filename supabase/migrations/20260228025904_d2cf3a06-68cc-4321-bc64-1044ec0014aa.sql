
-- Tabela de receitas
CREATE TABLE public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  modo_preparo TEXT,
  foto_url TEXT,
  rendimento NUMERIC DEFAULT 1,
  unidade_rendimento TEXT DEFAULT 'un',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ingredientes da receita
CREATE TABLE public.receita_ingredientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID NOT NULL REFERENCES public.receitas(id) ON DELETE CASCADE,
  insumo_nome TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT,
  custo_unitario NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public access for now - single business tool)
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receita_ingredientes ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth for this business tool)
CREATE POLICY "Allow all access to receitas" ON public.receitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to receita_ingredientes" ON public.receita_ingredientes FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_receita_ingredientes_receita_id ON public.receita_ingredientes(receita_id);
