
-- =============================================
-- TRIGGERS: DROP + RECREATE (idempotente)
-- =============================================

-- 1A. updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.produtos;
DROP TRIGGER IF EXISTS set_updated_at ON public.pedidos;
DROP TRIGGER IF EXISTS set_updated_at ON public.produto_variacoes;
DROP TRIGGER IF EXISTS set_updated_at ON public.receitas;
DROP TRIGGER IF EXISTS set_updated_at ON public.concorrente_precos;
DROP TRIGGER IF EXISTS set_updated_at ON public.contas;
DROP TRIGGER IF EXISTS set_updated_at ON public.despesas_fixas;
DROP TRIGGER IF EXISTS set_updated_at ON public.insumos;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.clientes;
DROP TRIGGER IF EXISTS set_updated_at ON public.payment_gateways;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.produto_variacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.concorrente_precos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.despesas_fixas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payment_gateways FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1B. Audit triggers
DROP TRIGGER IF EXISTS audit_vendas ON public.vendas;
DROP TRIGGER IF EXISTS audit_compras ON public.compras;
DROP TRIGGER IF EXISTS audit_produtos ON public.produtos;
DROP TRIGGER IF EXISTS audit_pedidos ON public.pedidos;
DROP TRIGGER IF EXISTS audit_producao ON public.producao;
DROP TRIGGER IF EXISTS audit_clientes ON public.clientes;
DROP TRIGGER IF EXISTS audit_contas ON public.contas;
DROP TRIGGER IF EXISTS audit_despesas_fixas ON public.despesas_fixas;
DROP TRIGGER IF EXISTS audit_insumos ON public.insumos;
DROP TRIGGER IF EXISTS audit_receitas ON public.receitas;
DROP TRIGGER IF EXISTS audit_receita_ingredientes ON public.receita_ingredientes;
DROP TRIGGER IF EXISTS audit_concorrentes ON public.concorrentes;
DROP TRIGGER IF EXISTS audit_concorrente_precos ON public.concorrente_precos;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS audit_inventario_revisoes ON public.inventario_revisoes;

CREATE TRIGGER audit_vendas AFTER INSERT OR UPDATE OR DELETE ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_compras AFTER INSERT OR UPDATE OR DELETE ON public.compras FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_pedidos AFTER INSERT OR UPDATE OR DELETE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_producao AFTER INSERT OR UPDATE OR DELETE ON public.producao FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_contas AFTER INSERT OR UPDATE OR DELETE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_despesas_fixas AFTER INSERT OR UPDATE OR DELETE ON public.despesas_fixas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_insumos AFTER INSERT OR UPDATE OR DELETE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receitas AFTER INSERT OR UPDATE OR DELETE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receita_ingredientes AFTER INSERT OR UPDATE OR DELETE ON public.receita_ingredientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrentes AFTER INSERT OR UPDATE OR DELETE ON public.concorrentes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrente_precos AFTER INSERT OR UPDATE OR DELETE ON public.concorrente_precos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_inventario_revisoes AFTER INSERT OR UPDATE OR DELETE ON public.inventario_revisoes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();

-- 1C. Auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- =============================================
-- ÍNDICES DE PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON public.vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_compras_user_id ON public.compras(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_producao_user_id ON public.producao(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_contas_user_id ON public.contas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_fixas_user_id ON public.despesas_fixas(user_id);
CREATE INDEX IF NOT EXISTS idx_insumos_user_id ON public.insumos(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_user_id ON public.receita_ingredientes(user_id);
CREATE INDEX IF NOT EXISTS idx_concorrentes_user_id ON public.concorrentes(user_id);
CREATE INDEX IF NOT EXISTS idx_concorrente_precos_user_id ON public.concorrente_precos(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_inventario_revisoes_user_id ON public.inventario_revisoes(user_id);
CREATE INDEX IF NOT EXISTS idx_produto_variacoes_user_id ON public.produto_variacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_vendas_data_venda ON public.vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_compras_data_compra ON public.compras(data_compra);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_entrega ON public.pedidos(data_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON public.pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_producao_data_producao ON public.producao(data_producao);
CREATE INDEX IF NOT EXISTS idx_contas_data_vencimento ON public.contas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_inventario_data_revisao ON public.inventario_revisoes(data_revisao);

CREATE INDEX IF NOT EXISTS idx_vendas_user_data ON public.vendas(user_id, data_venda DESC);
CREATE INDEX IF NOT EXISTS idx_compras_user_data ON public.compras(user_id, data_compra DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_user_status ON public.pedidos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contas_user_status ON public.contas(user_id, status);

CREATE INDEX IF NOT EXISTS idx_produtos_receita_id ON public.produtos(receita_id);
CREATE INDEX IF NOT EXISTS idx_produto_variacoes_produto_id ON public.produto_variacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_receita_id ON public.receita_ingredientes(receita_id);
CREATE INDEX IF NOT EXISTS idx_concorrente_precos_concorrente_id ON public.concorrente_precos(concorrente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_producao_produto_id ON public.producao(produto_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON public.vendas(cliente_id);

-- =============================================
-- USER_ID NOT NULL
-- =============================================

DELETE FROM public.vendas WHERE user_id IS NULL;
DELETE FROM public.compras WHERE user_id IS NULL;
DELETE FROM public.produtos WHERE user_id IS NULL;
DELETE FROM public.pedidos WHERE user_id IS NULL;
DELETE FROM public.producao WHERE user_id IS NULL;
DELETE FROM public.clientes WHERE user_id IS NULL;
DELETE FROM public.contas WHERE user_id IS NULL;
DELETE FROM public.despesas_fixas WHERE user_id IS NULL;
DELETE FROM public.insumos WHERE user_id IS NULL;
DELETE FROM public.receitas WHERE user_id IS NULL;
DELETE FROM public.receita_ingredientes WHERE user_id IS NULL;
DELETE FROM public.concorrentes WHERE user_id IS NULL;
DELETE FROM public.concorrente_precos WHERE user_id IS NULL;
DELETE FROM public.inventario_revisoes WHERE user_id IS NULL;
DELETE FROM public.produto_variacoes WHERE user_id IS NULL;

ALTER TABLE public.vendas ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.compras ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.produtos ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.pedidos ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.producao ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.clientes ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.contas ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.despesas_fixas ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.insumos ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.receitas ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.receita_ingredientes ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.concorrentes ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.concorrente_precos ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.inventario_revisoes ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.produto_variacoes ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();

-- =============================================
-- DB FUNCTIONS PARA AGREGAÇÕES SERVER-SIDE
-- =============================================

CREATE OR REPLACE FUNCTION public.get_custo_medio_insumos()
RETURNS TABLE (
  insumo_nome text,
  total_comprado numeric,
  total_gasto numeric,
  custo_medio numeric,
  ultima_compra date,
  num_compras bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.insumo_nome,
    SUM(c.quantidade) AS total_comprado,
    SUM(c.valor_compra) AS total_gasto,
    CASE WHEN SUM(c.quantidade) > 0 THEN SUM(c.valor_compra) / SUM(c.quantidade) ELSE 0 END AS custo_medio,
    MAX(c.data_compra) AS ultima_compra,
    COUNT(*) AS num_compras
  FROM public.compras c
  WHERE c.user_id = auth.uid()
  GROUP BY c.insumo_nome
  ORDER BY c.insumo_nome
$$;

CREATE OR REPLACE FUNCTION public.get_vendas_totais(p_inicio date DEFAULT NULL, p_fim date DEFAULT NULL)
RETURNS TABLE (
  total_vendas numeric,
  total_frete numeric,
  num_vendas bigint,
  ticket_medio numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(v.valor_venda), 0) AS total_vendas,
    COALESCE(SUM(v.valor_frete), 0) AS total_frete,
    COUNT(*) AS num_vendas,
    CASE WHEN COUNT(*) > 0 THEN SUM(v.valor_venda) / COUNT(*) ELSE 0 END AS ticket_medio
  FROM public.vendas v
  WHERE v.user_id = auth.uid()
    AND (p_inicio IS NULL OR v.data_venda >= p_inicio)
    AND (p_fim IS NULL OR v.data_venda <= p_fim)
$$;
