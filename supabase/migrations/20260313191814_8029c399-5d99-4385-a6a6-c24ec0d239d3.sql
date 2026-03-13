
CREATE TABLE public.concorrentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.concorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to concorrentes" ON public.concorrentes FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.concorrente_precos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concorrente_id UUID NOT NULL REFERENCES public.concorrentes(id) ON DELETE CASCADE,
  produto_nome TEXT NOT NULL,
  preco NUMERIC NOT NULL DEFAULT 0,
  peso_quantidade NUMERIC NOT NULL DEFAULT 1,
  unidade TEXT NOT NULL DEFAULT 'un',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.concorrente_precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to concorrente_precos" ON public.concorrente_precos FOR ALL TO public USING (true) WITH CHECK (true);
