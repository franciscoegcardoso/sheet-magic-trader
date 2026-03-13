import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Store, Loader2 } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco_venda: number;
  foto_url: string | null;
  tamanho: string | null;
}

export default function CatalogoPublico() {
  const { userId } = useParams<{ userId: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nomeEmpresa, setNomeEmpresa] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("produtos")
          .select("id, nome, descricao, preco_venda, foto_url, tamanho")
          .eq("ativo", true)
          .order("nome");
        setProdutos(data || []);

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nome_empresa, nome")
            .eq("user_id", userId)
            .maybeSingle();
          if (profile) setNomeEmpresa(profile.nome_empresa || profile.nome || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Store className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            {nomeEmpresa || "Catálogo de Produtos"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{produtos.length} produtos disponíveis</p>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum produto disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {produtos.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-secondary/30 flex items-center justify-center">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-10 h-10 text-muted-foreground/20" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground">{p.nome}</h3>
                  {p.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.descricao}</p>}
                  {p.tamanho && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground inline-block mt-1.5">{p.tamanho}</span>}
                  <div className="text-base font-bold text-primary mt-2">
                    R$ {Number(p.preco_venda).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
