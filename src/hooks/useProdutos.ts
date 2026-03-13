import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProdutoVariacao {
  id: string;
  produto_id: string;
  tamanho: string;
  preco_venda: number;
  ativo: boolean;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  tamanho: string | null;
  unidade: string | null;
  peso_quantidade: number;
  preco_venda: number;
  receita_id: string | null;
  foto_url: string | null;
  ativo: boolean;
  codigo_barras: string | null;
  created_at: string;
  updated_at: string;
  variacoes?: ProdutoVariacao[];
}

// Generate an internal EAN-13 code (prefix 2 = internal use per GS1 standard)
export function generateInternalBarcode(): string {
  const prefix = "2"; // GS1 prefix for internal/restricted use
  const random = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join("");
  const base = prefix + random;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

// Validate EAN-13 check digit
export function isValidEAN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(code[12]);
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: prodData, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;

      const { data: varData } = await supabase
        .from("produto_variacoes")
        .select("*")
        .order("tamanho", { ascending: true });

      const produtosComVariacoes = (prodData || []).map((p) => ({
        ...p,
        variacoes: (varData || []).filter((v) => v.produto_id === p.id),
      }));

      setProdutos(produtosComVariacoes);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = async (
    produto: Omit<Produto, "id" | "created_at" | "updated_at" | "variacoes" | "codigo_barras"> & { codigo_barras?: string | null },
    variacoes: Omit<ProdutoVariacao, "id" | "produto_id" | "created_at">[]
  ) => {
    const codigo_barras = produto.codigo_barras || generateInternalBarcode();
    const { data, error } = await supabase
      .from("produtos")
      .insert({
        nome: produto.nome,
        descricao: produto.descricao,
        foto_url: produto.foto_url,
        ativo: produto.ativo,
        tamanho: produto.tamanho,
        unidade: produto.unidade,
        preco_venda: produto.preco_venda,
        receita_id: produto.receita_id,
        codigo_barras,
      })
      .select()
      .single();
    if (error) throw error;

    if (variacoes.length > 0) {
      const { error: varError } = await supabase
        .from("produto_variacoes")
        .insert(variacoes.map((v) => ({ ...v, produto_id: data.id })));
      if (varError) throw varError;
    }

    await fetchProdutos();
    return data;
  };

  const findByBarcode = (code: string) => {
    return produtos.find((p) => p.codigo_barras === code);
  };

  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    const { variacoes, ...rest } = updates as any;
    const { error } = await supabase.from("produtos").update(rest).eq("id", id);
    if (error) throw error;
    await fetchProdutos();
  };

  const deleteProduto = async (id: string) => {
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) throw error;
    await fetchProdutos();
  };

  const addVariacao = async (produtoId: string, variacao: Omit<ProdutoVariacao, "id" | "produto_id" | "created_at">) => {
    const { error } = await supabase
      .from("produto_variacoes")
      .insert({ ...variacao, produto_id: produtoId });
    if (error) throw error;
    await fetchProdutos();
  };

  const deleteVariacao = async (id: string) => {
    const { error } = await supabase.from("produto_variacoes").delete().eq("id", id);
    if (error) throw error;
    await fetchProdutos();
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-photos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    produtos,
    isLoading,
    addProduto,
    updateProduto,
    deleteProduto,
    addVariacao,
    deleteVariacao,
    uploadPhoto,
    findByBarcode,
    refetch: fetchProdutos,
  };
}
