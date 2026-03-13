
-- Enum for order status
CREATE TYPE public.pedido_status AS ENUM ('pendente', 'em_producao', 'pronto', 'entregue', 'cancelado');

-- Enum for financial account type
CREATE TYPE public.conta_tipo AS ENUM ('pagar', 'receber');
CREATE TYPE public.conta_status AS ENUM ('pendente', 'pago', 'atrasado');

-- Orders/appointments table
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  produto TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  data_entrega DATE NOT NULL,
  status pedido_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

-- Financial accounts table
CREATE TABLE public.contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo conta_tipo NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status conta_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contas" ON public.contas FOR ALL USING (true) WITH CHECK (true);
