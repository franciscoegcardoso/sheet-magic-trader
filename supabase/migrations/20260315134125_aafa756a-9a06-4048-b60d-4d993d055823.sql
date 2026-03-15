
-- Audit logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function to insert audit log (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _email text;
  _record_id text;
  _old jsonb;
  _new jsonb;
BEGIN
  _user_id := auth.uid();
  SELECT email INTO _email FROM auth.users WHERE id = _user_id;

  IF TG_OP = 'DELETE' THEN
    _record_id := OLD.id::text;
    _old := to_jsonb(OLD);
    _new := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    _record_id := NEW.id::text;
    _old := NULL;
    _new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    _record_id := NEW.id::text;
    _old := to_jsonb(OLD);
    _new := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
  VALUES (_user_id, _email, TG_OP, TG_TABLE_NAME, _record_id, _old, _new);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach triggers to all key tables
CREATE TRIGGER audit_produtos AFTER INSERT OR UPDATE OR DELETE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_vendas AFTER INSERT OR UPDATE OR DELETE ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_compras AFTER INSERT OR UPDATE OR DELETE ON public.compras FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_pedidos AFTER INSERT OR UPDATE OR DELETE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_contas AFTER INSERT OR UPDATE OR DELETE ON public.contas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_despesas_fixas AFTER INSERT OR UPDATE OR DELETE ON public.despesas_fixas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receitas AFTER INSERT OR UPDATE OR DELETE ON public.receitas FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_receita_ingredientes AFTER INSERT OR UPDATE OR DELETE ON public.receita_ingredientes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_producao AFTER INSERT OR UPDATE OR DELETE ON public.producao FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrentes AFTER INSERT OR UPDATE OR DELETE ON public.concorrentes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_concorrente_precos AFTER INSERT OR UPDATE OR DELETE ON public.concorrente_precos FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_inventario_revisoes AFTER INSERT OR UPDATE OR DELETE ON public.inventario_revisoes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_produto_variacoes AFTER INSERT OR UPDATE OR DELETE ON public.produto_variacoes FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
