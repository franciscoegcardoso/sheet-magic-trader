
-- Add foto_url to produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Create product variations table
CREATE TABLE public.produto_variacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tamanho TEXT NOT NULL,
  preco_venda NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produto_variacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to produto_variacoes"
ON public.produto_variacoes FOR ALL
USING (true) WITH CHECK (true);

CREATE INDEX idx_produto_variacoes_produto ON public.produto_variacoes (produto_id);

-- Add produto_id to receitas (recipe belongs to product)
ALTER TABLE public.receitas ADD COLUMN IF NOT EXISTS produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_receitas_produto ON public.receitas (produto_id);

-- Create storage bucket for product photos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-photos', 'product-photos', true);

CREATE POLICY "Anyone can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "Anyone can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-photos');

CREATE POLICY "Anyone can update product photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-photos');

CREATE POLICY "Anyone can delete product photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-photos');
