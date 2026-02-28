
-- Table for monthly fixed expenses
CREATE TABLE public.despesas_fixas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.despesas_fixas ENABLE ROW LEVEL SECURITY;

-- Allow all access (matching existing pattern)
CREATE POLICY "Allow all access to despesas_fixas"
  ON public.despesas_fixas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Timestamp trigger
CREATE TRIGGER update_despesas_fixas_updated_at
  BEFORE UPDATE ON public.despesas_fixas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
