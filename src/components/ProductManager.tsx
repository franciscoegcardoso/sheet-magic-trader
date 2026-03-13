import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProdutos, ProdutoVariacao, generateInternalBarcode, isValidEAN13 } from "@/hooks/useProdutos";
import { useReceitas } from "@/hooks/useReceitas";
import { ProductBarcode } from "@/components/ProductBarcode";
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  DollarSign,
  Loader2,
  ChefHat,
  Camera,
  Image as ImageIcon,
  X,
  ToggleLeft,
  Barcode,
  RefreshCw,
} from "lucide-react";

export function ProductManager() {
  const { toast } = useToast();
  const { produtos, isLoading, addProduto, updateProduto, deleteProduto, addVariacao, deleteVariacao, uploadPhoto } = useProdutos();
  const { receitas } = useReceitas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [receitaId, setReceitaId] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [codigoTipo, setCodigoTipo] = useState<"interno" | "gtin">("interno");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Variation form
  const [showVarForm, setShowVarForm] = useState<string | null>(null);
  const [varTamanho, setVarTamanho] = useState("");
  const [varPreco, setVarPreco] = useState("");

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setFotoUrl("");
    setAtivo(true);
    setReceitaId("");
    setCodigoBarras("");
    setCodigoTipo("interno");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: typeof produtos[0]) => {
    setNome(p.nome);
    setDescricao(p.descricao || "");
    setFotoUrl(p.foto_url || "");
    setAtivo(p.ativo);
    setReceitaId(p.receita_id || "");
    setCodigoBarras(p.codigo_barras || "");
    setCodigoTipo(p.codigo_barras?.startsWith("2") ? "interno" : "gtin");
    setEditingId(p.id);
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadPhoto(file);
      setFotoUrl(url);
      toast({ title: "Foto enviada!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    // Validate GTIN if user entered one
    if (codigoTipo === "gtin" && codigoBarras) {
      if (!isValidEAN13(codigoBarras)) {
        toast({ title: "GTIN inválido", description: "O código deve ter 13 dígitos numéricos com dígito verificador válido (EAN-13).", variant: "destructive" });
        return;
      }
    }
    try {
      setIsSubmitting(true);
      const barcode = codigoTipo === "gtin" && codigoBarras ? codigoBarras : undefined;
      const data = {
        nome,
        descricao: descricao || null,
        foto_url: fotoUrl || null,
        ativo,
        receita_id: receitaId && receitaId !== "none" ? receitaId : null,
        tamanho: null,
        unidade: null,
        preco_venda: 0,
      };

      if (editingId) {
        await updateProduto(editingId, { ...data, codigo_barras: barcode || codigoBarras || null });
        toast({ title: "Produto atualizado!" });
      } else {
        await addProduto({ ...data, codigo_barras: barcode }, []);
        toast({ title: "Produto cadastrado!" });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}" e todas as variações?`)) return;
    try {
      await deleteProduto(id);
      toast({ title: "Produto excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleToggleAtivo = async (id: string, current: boolean) => {
    try {
      await updateProduto(id, { ativo: !current });
      toast({ title: !current ? "Produto ativado" : "Produto desativado" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleAddVariacao = async (produtoId: string) => {
    if (!varTamanho.trim()) {
      toast({ title: "Tamanho obrigatório", variant: "destructive" });
      return;
    }
    try {
      await addVariacao(produtoId, {
        tamanho: varTamanho,
        preco_venda: Number(varPreco) || 0,
        ativo: true,
      });
      setVarTamanho("");
      setVarPreco("");
      setShowVarForm(null);
      toast({ title: "Variação adicionada!" });
    } catch {
      toast({ title: "Erro ao adicionar variação", variant: "destructive" });
    }
  };

  const handleDeleteVariacao = async (id: string) => {
    try {
      await deleteVariacao(id);
      toast({ title: "Variação removida" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent">
            <Package className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Meus Produtos</h2>
            <p className="text-sm text-muted-foreground">Cadastre o que você vende, com foto e preços</p>
          </div>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-4">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            {fotoUrl ? (
              <div className="relative">
                <img
                  src={fotoUrl}
                  alt="Foto do produto"
                  className="w-32 h-32 object-cover rounded-xl border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={() => setFotoUrl("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">Adicionar foto</span>
                  </>
                )}
              </button>
            )}
            {fotoUrl && (
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Camera className="w-4 h-4 mr-1" />}
                Trocar foto
              </Button>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bolo de Chocolate" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              <ChefHat className="w-3.5 h-3.5 inline mr-0.5" />
              Qual receita usa para fazer?
            </Label>
            <Select value={receitaId} onValueChange={setReceitaId}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {receitas.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GTIN / Código de Barras */}
          <div className="space-y-2 p-3 rounded-lg border border-border bg-secondary/20">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Barcode className="w-3.5 h-3.5" />
              Código de barras (opcional)
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={codigoTipo === "interno" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => { setCodigoTipo("interno"); setCodigoBarras(""); }}
              >
                Gerar automático
              </Button>
              <Button
                type="button"
                variant={codigoTipo === "gtin" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => { setCodigoTipo("gtin"); setCodigoBarras(""); }}
              >
                Já tenho o código
              </Button>
            </div>
            {codigoTipo === "gtin" ? (
              <div>
                <Input
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="Ex: 7891234567890"
                  maxLength={13}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Código EAN-13 do produto (13 dígitos). Prefixos 789/790 = Brasil.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">
                  Um código interno (prefixo 2, padrão GS1) será gerado automaticamente ao cadastrar.
                  Ideal para produtos artesanais ou sem registro GS1.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <Label className="text-sm text-foreground">Produto ativo</Label>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Salvar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Product list */}
      {produtos.length === 0 && !showForm ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
          Nenhum produto cadastrado. Clique em "Novo" para começar.
        </div>
      ) : (
        <div className="space-y-3">
          {produtos.map((p) => {
            const receita = receitas.find((r) => r.id === p.receita_id);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex gap-3 p-3">
                  {/* Photo */}
                  <div className="shrink-0">
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.nome}
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-border bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{p.nome}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              p.ativo
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {p.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        {p.descricao && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.descricao}</p>
                        )}
                        {receita && (
                          <span className="text-xs text-primary mt-0.5 inline-flex items-center gap-0.5">
                            <ChefHat className="w-3 h-3" /> {receita.nome}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleToggleAtivo(p.id, p.ativo)}>
                          <ToggleLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(p.id, p.nome)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Barcode / QR Code */}
                  {p.codigo_barras && (
                    <div className="px-3 pb-3">
                      <ProductBarcode codigo={p.codigo_barras} nome={p.nome} />
                    </div>
                  )}

                {/* Variations */}
                <div className="border-t border-border">
                  {(p.variacoes || []).length > 0 && (
                    <div className="divide-y divide-border">
                      {p.variacoes!.map((v) => (
                        <div key={v.id} className="flex items-center justify-between px-4 py-2 bg-secondary/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{v.tamanho}</span>
                            <span
                              className={`text-[10px] px-1 py-0.5 rounded ${
                                v.ativo ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {v.ativo ? "●" : "○"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              R$ {Number(v.preco_venda).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteVariacao(v.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add variation */}
                  {showVarForm === p.id ? (
                    <div className="flex items-end gap-2 px-3 py-2 bg-secondary/20">
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground">Tamanho</Label>
                        <Input
                          className="h-8 text-xs"
                          value={varTamanho}
                          onChange={(e) => setVarTamanho(e.target.value)}
                          placeholder="P, M, G, 500ml..."
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-[10px] text-muted-foreground">Preço (R$)</Label>
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          step="0.01"
                          min="0"
                          value={varPreco}
                          onChange={(e) => setVarPreco(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <Button size="sm" className="h-8 px-2" onClick={() => handleAddVariacao(p.id)}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => { setShowVarForm(null); setVarTamanho(""); setVarPreco(""); }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="w-full px-3 py-2 text-xs text-primary hover:bg-secondary/30 transition-colors flex items-center justify-center gap-1"
                      onClick={() => setShowVarForm(p.id)}
                    >
                      <Plus className="w-3 h-3" /> Adicionar variação
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
