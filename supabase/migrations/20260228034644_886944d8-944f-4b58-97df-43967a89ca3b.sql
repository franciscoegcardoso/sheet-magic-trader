
-- Add barcode column to produtos
ALTER TABLE public.produtos
ADD COLUMN codigo_barras TEXT UNIQUE;

-- Create index for fast barcode lookups
CREATE INDEX idx_produtos_codigo_barras ON public.produtos (codigo_barras);
