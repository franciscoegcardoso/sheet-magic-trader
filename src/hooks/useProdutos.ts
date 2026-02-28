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
  preco_venda: number;
  receita_id: string | null;
  foto_url: string | null;
  ativo: boolean;
  codigo_barras: string | null;
  created_at: string;
  updated_at: string;
  variacoes?: ProdutoVariacao[];
}

function generateBarcode(): string {
  // Generate a 13-digit EAN-like code
  const prefix = "789"; // Brazil prefix
  const random = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  const base = prefix + random;
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
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
    produto: Omit<Produto, "id" | "created_at" | "updated_at" | "variacoes" | "codigo_barras">,
    variacoes: Omit<ProdutoVariacao, "id" | "produto_id" | "created_at">[]
  ) => {
    const codigo_barras = generateBarcode();
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
