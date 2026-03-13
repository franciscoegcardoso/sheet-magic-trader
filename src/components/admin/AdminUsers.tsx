import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Pencil,
  Save,
  X,
  Loader2,
  MoreHorizontal,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo_conta: string;
  plano: string;
  created_at: string;
  avatar_url: string | null;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlano, setEditPlano] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search.trim() ||
      u.nome?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plano === filterPlan;
    return matchSearch && matchPlan;
  });

  const handleSavePlano = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plano: editPlano as "free" | "pro" | "premium" })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Plano atualizado com sucesso!" });
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const planBadge = (plano: string) => {
    const variants: Record<string, string> = {
      free: "bg-muted text-muted-foreground",
      pro: "bg-primary/15 text-primary border border-primary/20",
      premium: "bg-warning/15 text-warning border border-warning/20",
    };
    return variants[plano] || variants.free;
  };

  const planCounts = users.reduce(
    (acc, u) => {
      acc[u.plano] = (acc[u.plano] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie todos os usuários cadastrados na plataforma.
        </p>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {users.length} usuários
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "free", "pro", "premium"].map((plan) => (
            <Button
              key={plan}
              variant={filterPlan === plan ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPlan(plan)}
              className="text-xs"
            >
              {plan === "all" ? "Todos" : plan.charAt(0).toUpperCase() + plan.slice(1)}
              {plan !== "all" && (
                <span className="ml-1 opacity-70">({planCounts[plan] || 0})</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Carregando usuários...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[2.5fr_2fr_1fr_1fr_120px] gap-3 px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Usuário
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Contato
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Plano
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
              Ações
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="px-5 py-4 lg:grid lg:grid-cols-[2.5fr_2fr_1fr_1fr_120px] lg:gap-3 lg:items-center space-y-2 lg:space-y-0 hover:bg-muted/20 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.nome || "Sem nome"}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(u.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    {u.email || "—"}
                  </p>
                  {u.telefone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      {u.telefone}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {u.tipo_conta === "pessoa_juridica" ? "PJ" : "PF"}
                  </span>
                </div>

                {/* Plan */}
                <div>
                  {editingId === u.id ? (
                    <select
                      value={editPlano}
                      onChange={(e) => setEditPlano(e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground w-full"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block ${planBadge(u.plano)}`}
                    >
                      {u.plano?.charAt(0).toUpperCase() + u.plano?.slice(1) || "Free"}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1">
                  {editingId === u.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSavePlano(u.id)}
                      >
                        <Save className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingId(u.id);
                            setEditPlano(u.plano || "free");
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          Alterar plano
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <UserCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
