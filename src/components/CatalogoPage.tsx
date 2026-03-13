import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProdutos } from "@/hooks/useProdutos";
import { useAuth } from "@/hooks/useAuth";
import {
  Store, Copy, ExternalLink, Share2, Loader2, Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CatalogoPage() {
  const { toast } = useToast();
  const { produtos, isLoading } = useProdutos();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const catalogUrl = `${window.location.origin}/catalogo/${user?.id || ""}`;
  const produtosAtivos = produtos.filter(p => p.ativo);
  const filtered = produtosAtivos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const copyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    toast({ title: "Link copiado!" });
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Confira nosso catálogo: ${catalogUrl}`)}`, "_blank");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent"><Store className="w-5 h-5 text-accent-foreground" /></div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Catálogo Digital</h2>
            <p className="text-sm text-muted-foreground">Compartilhe seus produtos</p>
          </div>
        </div>
      </div>

      {/* Share section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Compartilhar Catálogo</h3>
        <div className="flex gap-2">
          <Input value={catalogUrl} readOnly className="text-xs" />
          <Button variant="outline" size="sm" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareWhatsApp} className="flex-1">
            <Share2 className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(catalogUrl, "_blank")} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-1" /> Visualizar
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Prévia ({produtosAtivos.length} produtos)</h3>
          {produtosAtivos.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-40" />
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
            Nenhum produto ativo para exibir no catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="aspect-square bg-secondary/30 flex items-center justify-center">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-foreground truncate">{p.nome}</h4>
                  {p.descricao && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{p.descricao}</p>}
                  {p.tamanho && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground inline-block mt-1">{p.tamanho}</span>}
                  <div className="text-sm font-bold text-primary mt-2">
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
