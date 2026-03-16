import { useState } from "react";
import { useInsumos, type Insumo } from "@/hooks/useInsumos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UNIT_GROUPS } from "@/lib/units";
import { Package, Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";

export function InsumoManager() {
  const { insumos, isLoading, addInsumo, updateInsumo, deleteInsumo } = useInsumos();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Insumo | null>(null);
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [saving, setSaving] = useState(false);

  const filtered = insumos.filter((i) =>
    i.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setNome("");
    setUnidade("un");
    setDialogOpen(true);
  };

  const openEdit = (insumo: Insumo) => {
    setEditing(insumo);
    setNome(insumo.nome);
    setUnidade(insumo.unidade);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateInsumo(editing.id, { nome: nome.trim(), unidade });
        toast({ title: "Insumo atualizado!" });
      } else {
        await addInsumo({ nome: nome.trim(), unidade });
        toast({ title: "Insumo cadastrado!" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (insumo: Insumo) => {
    if (!confirm(`Deseja excluir "${insumo.nome}"?`)) return;
    try {
      await deleteInsumo(insumo.id);
      toast({ title: "Insumo excluído!" });
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="form-section animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-accent">
          <Package className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Insumos
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os ingredientes e materiais que você usa
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar insumo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Carregando insumos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? "Nenhum insumo encontrado." : "Nenhum insumo cadastrado ainda."}
          </p>
          {!search && (
            <Button variant="outline" size="sm" className="mt-3" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1.5" />
              Cadastrar primeiro insumo
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((insumo) => (
            <div
              key={insumo.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {insumo.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  Unidade: {insumo.unidade}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(insumo)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(insumo)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Insumo" : "Novo Insumo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome do insumo</Label>
              <Input
                placeholder="Ex: Farinha de trigo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label>Unidade padrão</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {UNIT_GROUPS.map((group) => (
                    <div key={group.group}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {group.group}
                      </div>
                      {group.units.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.abbr} — {u.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
