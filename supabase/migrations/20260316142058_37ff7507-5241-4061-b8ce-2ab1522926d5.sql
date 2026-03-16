
-- Tabela de configuração de gateways de pagamento por usuário
CREATE TABLE public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gateway text NOT NULL,
  ativo boolean NOT NULL DEFAULT false,
  credenciais jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, gateway)
);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gateways"
  ON public.payment_gateways
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_payment_gateways
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.insert_audit_log();
