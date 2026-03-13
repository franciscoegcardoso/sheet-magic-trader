import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  KeyRound,
  Shield,
  UserCircle,
  Search,
  Loader2,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  user_id: string;
  nome: string;
  email: string | null;
  isAdmin: boolean;
}

export default function AdminAccess() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsersWithRoles = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, nome, email")
      .order("nome");

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    const adminUserIds = new Set(
      (roles || []).filter((r) => r.role === "admin").map((r) => r.user_id)
    );

    setUsers(
      (profiles || []).map((p) => ({
        ...p,
        isAdmin: adminUserIds.has(p.user_id),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsersWithRoles();
  }, [fetchUsersWithRoles]);

  const toggleAdmin = async (user: UserWithRole) => {
    setToggling(user.user_id);
    try {
      if (user.isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.user_id)
          .eq("role", "admin");
        if (error) throw error;
        toast({ title: "Acesso admin removido", description: `${user.nome} não é mais admin.` });
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.user_id, role: "admin" });
        if (error) throw error;
        toast({ title: "Acesso admin concedido", description: `${user.nome} agora é admin.` });
      }
      fetchUsersWithRoles();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      !search.trim() ||
      u.nome?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Controle quais usuários possuem acesso administrativo à plataforma.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{adminCount}</p>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{users.length - adminCount}</p>
            <p className="text-xs text-muted-foreground">Usuários comuns</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total de contas</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border max-h-[500px] overflow-y-auto">
          {filtered.map((u) => (
            <div
              key={u.user_id}
              className="px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    u.isAdmin ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {u.isAdmin ? (
                    <Shield className="w-4 h-4 text-primary" />
                  ) : (
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{u.nome || "Sem nome"}</p>
                    {u.isAdmin && (
                      <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={u.isAdmin ? "outline" : "default"}
                    size="sm"
                    className="text-xs"
                    disabled={toggling === u.user_id}
                  >
                    {toggling === u.user_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : u.isAdmin ? (
                      <>
                        <ShieldX className="w-3.5 h-3.5 mr-1" />
                        Remover admin
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Tornar admin
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {u.isAdmin ? "Remover acesso admin?" : "Conceder acesso admin?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {u.isAdmin
                        ? `${u.nome} perderá acesso ao painel administrativo.`
                        : `${u.nome} terá acesso completo ao painel administrativo.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toggleAdmin(u)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
