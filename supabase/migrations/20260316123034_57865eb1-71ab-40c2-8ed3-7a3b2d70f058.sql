
-- Drop existing audit triggers if any, then recreate
DROP TRIGGER IF EXISTS audit_vendas ON public.vendas;
DROP TRIGGER IF EXISTS audit_produtos ON public.produtos;
DROP TRIGGER IF EXISTS audit_pedidos ON public.pedidos;
DROP TRIGGER IF EXISTS audit_compras ON public.compras;
DROP TRIGGER IF EXISTS audit_clientes ON public.clientes;
DROP TRIGGER IF EXISTS audit_contas ON public.contas;
DROP TRIGGER IF EXISTS audit_despesas_fixas ON public.despesas_fixas;
DROP TRIGGER IF EXISTS audit_receitas ON public.receitas;
DROP TRIGGER IF EXISTS audit_receita_ingredientes ON public.receita_ingredientes;
DROP TRIGGER IF EXISTS audit_producao ON public.producao;
DROP TRIGGER IF EXISTS audit_concorrentes ON public.concorrentes;
DROP TRIGGER IF EXISTS audit_concorrente_precos ON public.concorrente_precos;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS audit_produto_variacoes ON public.produto_variacoes;

-- Drop existing updated_at triggers if any
DROP TRIGGER IF EXISTS set_updated_at_produtos ON public.produtos;
DROP TRIGGER IF EXISTS set_updated_at_pedidos ON public.pedidos;
DROP TRIGGER IF EXISTS set_updated_at_receitas ON public.receitas;
DROP TRIGGER IF EXISTS set_updated_at_clientes ON public.clientes;
DROP TRIGGER IF EXISTS set_updated_at_contas ON public.contas;
DROP TRIGGER IF EXISTS set_updated_at_despesas_fixas ON public.despesas_fixas;
DROP TRIGGER IF EXISTS set_updated_at_concorrente_precos ON public.concorrente_precos;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;

-- 1. AUDIT TRIGGERS
CREATE TRIGGER audit_vendas AFTER INSERT OR UPDATE OR DELETE ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_pedidos AFTER INSERT OR UPDATE OR DELETE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_compras AFTER INSERT OR UPDATE OR DELETE ON public.compras FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_contas AFTER INSERT OR UPDATE OR DELETE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_despesas_fixas AFTER INSERT OR UPDATE OR DELETE ON public.despesas_fixas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receitas AFTER INSERT OR UPDATE OR DELETE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receita_ingredientes AFTER INSERT OR UPDATE OR DELETE ON public.receita_ingredientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_producao AFTER INSERT OR UPDATE OR DELETE ON public.producao FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrentes AFTER INSERT OR UPDATE OR DELETE ON public.concorrentes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrente_precos AFTER INSERT OR UPDATE OR DELETE ON public.concorrente_precos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_produto_variacoes AFTER INSERT OR UPDATE OR DELETE ON public.produto_variacoes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();

-- 2. UPDATED_AT TRIGGERS
CREATE TRIGGER set_updated_at_produtos BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_pedidos BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_receitas BEFORE UPDATE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_clientes BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_contas BEFORE UPDATE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_despesas_fixas BEFORE UPDATE ON public.despesas_fixas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_concorrente_precos BEFORE UPDATE ON public.concorrente_precos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. INSUMOS TABLE
CREATE TABLE IF NOT EXISTS public.insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade text NOT NULL DEFAULT 'un',
  ativo boolean NOT NULL DEFAULT true,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insumos" ON public.insumos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insumos" ON public.insumos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insumos" ON public.insumos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insumos" ON public.insumos FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all insumos" ON public.insumos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_updated_at_insumos BEFORE UPDATE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_insumos AFTER INSERT OR UPDATE OR DELETE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
