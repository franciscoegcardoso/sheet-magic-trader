
-- =============================================
-- MULTI-TENANT DATA ISOLATION
-- Add user_id to all data tables + proper RLS
-- =============================================

-- 1. Add user_id column to all data tables
ALTER TABLE public.compras ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.vendas ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.produtos ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.produto_variacoes ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.receitas ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.receita_ingredientes ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.clientes ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.contas ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.despesas_fixas ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.pedidos ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.producao ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.concorrentes ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.concorrente_precos ADD COLUMN user_id uuid DEFAULT auth.uid();
ALTER TABLE public.inventario_revisoes ADD COLUMN user_id uuid DEFAULT auth.uid();

-- 2. Create indexes for performance
CREATE INDEX idx_compras_user_id ON public.compras(user_id);
CREATE INDEX idx_vendas_user_id ON public.vendas(user_id);
CREATE INDEX idx_produtos_user_id ON public.produtos(user_id);
CREATE INDEX idx_produto_variacoes_user_id ON public.produto_variacoes(user_id);
CREATE INDEX idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX idx_receita_ingredientes_user_id ON public.receita_ingredientes(user_id);
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_contas_user_id ON public.contas(user_id);
CREATE INDEX idx_despesas_fixas_user_id ON public.despesas_fixas(user_id);
CREATE INDEX idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX idx_producao_user_id ON public.producao(user_id);
CREATE INDEX idx_concorrentes_user_id ON public.concorrentes(user_id);
CREATE INDEX idx_concorrente_precos_user_id ON public.concorrente_precos(user_id);
CREATE INDEX idx_inventario_revisoes_user_id ON public.inventario_revisoes(user_id);

-- 3. Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to compras" ON public.compras;
DROP POLICY IF EXISTS "Allow all access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow all access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow all access to produto_variacoes" ON public.produto_variacoes;
DROP POLICY IF EXISTS "Allow all access to receitas" ON public.receitas;
DROP POLICY IF EXISTS "Allow all access to receita_ingredientes" ON public.receita_ingredientes;
DROP POLICY IF EXISTS "Allow all access to clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow all access to contas" ON public.contas;
DROP POLICY IF EXISTS "Allow all access to despesas_fixas" ON public.despesas_fixas;
DROP POLICY IF EXISTS "Allow all access to pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Allow all access to producao" ON public.producao;
DROP POLICY IF EXISTS "Allow all access to concorrentes" ON public.concorrentes;
DROP POLICY IF EXISTS "Allow all access to concorrente_precos" ON public.concorrente_precos;
DROP POLICY IF EXISTS "Allow all access to inventario_revisoes" ON public.inventario_revisoes;

-- 4. Create per-user RLS policies for each table

-- COMPRAS
CREATE POLICY "Users can view own compras" ON public.compras FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compras" ON public.compras FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compras" ON public.compras FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compras" ON public.compras FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- VENDAS
CREATE POLICY "Users can view own vendas" ON public.vendas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vendas" ON public.vendas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vendas" ON public.vendas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vendas" ON public.vendas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PRODUTOS
CREATE POLICY "Users can view own produtos" ON public.produtos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own produtos" ON public.produtos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own produtos" ON public.produtos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own produtos" ON public.produtos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PRODUTO_VARIACOES
CREATE POLICY "Users can view own produto_variacoes" ON public.produto_variacoes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own produto_variacoes" ON public.produto_variacoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own produto_variacoes" ON public.produto_variacoes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own produto_variacoes" ON public.produto_variacoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RECEITAS
CREATE POLICY "Users can view own receitas" ON public.receitas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receitas" ON public.receitas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receitas" ON public.receitas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receitas" ON public.receitas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RECEITA_INGREDIENTES
CREATE POLICY "Users can view own receita_ingredientes" ON public.receita_ingredientes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receita_ingredientes" ON public.receita_ingredientes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receita_ingredientes" ON public.receita_ingredientes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receita_ingredientes" ON public.receita_ingredientes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CLIENTES
CREATE POLICY "Users can view own clientes" ON public.clientes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clientes" ON public.clientes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clientes" ON public.clientes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CONTAS
CREATE POLICY "Users can view own contas" ON public.contas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contas" ON public.contas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contas" ON public.contas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contas" ON public.contas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DESPESAS_FIXAS
CREATE POLICY "Users can view own despesas_fixas" ON public.despesas_fixas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own despesas_fixas" ON public.despesas_fixas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own despesas_fixas" ON public.despesas_fixas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own despesas_fixas" ON public.despesas_fixas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PEDIDOS
CREATE POLICY "Users can view own pedidos" ON public.pedidos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pedidos" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pedidos" ON public.pedidos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pedidos" ON public.pedidos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PRODUCAO
CREATE POLICY "Users can view own producao" ON public.producao FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own producao" ON public.producao FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own producao" ON public.producao FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own producao" ON public.producao FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CONCORRENTES
CREATE POLICY "Users can view own concorrentes" ON public.concorrentes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concorrentes" ON public.concorrentes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concorrentes" ON public.concorrentes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own concorrentes" ON public.concorrentes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CONCORRENTE_PRECOS
CREATE POLICY "Users can view own concorrente_precos" ON public.concorrente_precos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concorrente_precos" ON public.concorrente_precos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concorrente_precos" ON public.concorrente_precos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own concorrente_precos" ON public.concorrente_precos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- INVENTARIO_REVISOES
CREATE POLICY "Users can view own inventario_revisoes" ON public.inventario_revisoes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventario_revisoes" ON public.inventario_revisoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventario_revisoes" ON public.inventario_revisoes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventario_revisoes" ON public.inventario_revisoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Admin override policies (admins can see all data for support)
CREATE POLICY "Admins can view all compras" ON public.compras FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all vendas" ON public.vendas FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all produtos" ON public.produtos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all clientes" ON public.clientes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all pedidos" ON public.pedidos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all contas" ON public.contas FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Special policy: public catalog access (vitrine online) - products marked as active
CREATE POLICY "Public can view active produtos for catalog" ON public.produtos FOR SELECT TO anon USING (ativo = true);
