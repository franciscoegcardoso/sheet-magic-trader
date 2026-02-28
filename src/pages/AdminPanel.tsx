import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "./AdminLogin";
import {
  Shield,
  Users,
  Crown,
  FileText,
  LogOut,
  Loader2,
  Search,
  Pencil,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";

type AdminTab = "usuarios" | "planos" | "termos";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo_conta: string;
  plano: string;
  created_at: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("usuarios");

  // Check if already logged in as admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (data) {
          setAuthenticated(true);
        }
      }
      setChecking(false);
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "planos", label: "Planos", icon: Crown },
    { id: "termos", label: "Termos & Política", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-6" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-display font-bold text-foreground">Painel Admin</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </Button>
      </header>

      {/* Tab nav */}
      <div className="border-b border-border bg-card px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "usuarios" && <AdminUsuarios />}
        {activeTab === "planos" && <AdminPlanos />}
        {activeTab === "termos" && <AdminTermos />}
      </main>
    </div>
  );
}

/* ===== Usuários ===== */
function AdminUsuarios() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) =>
    !search.trim() ||
    u.nome?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePlano = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plano: editPlano as "free" | "pro" | "premium" })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Plano atualizado!" });
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const planColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-primary/20 text-primary",
    premium: "bg-warning/20 text-warning",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Gestão de Usuários</h2>
        <span className="text-xs text-muted-foreground">{users.length} usuários</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 border-b border-border bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Nome</span>
            <span>Email</span>
            <span>Tipo</span>
            <span>Plano</span>
            <span>Ações</span>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {filtered.map((u) => (
              <div key={u.id} className="px-4 py-3 md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr] md:gap-2 md:items-center space-y-1 md:space-y-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.nome || "Sem nome"}</p>
                  <p className="text-[10px] text-muted-foreground md:hidden">{u.email}</p>
                </div>
                <p className="text-xs text-muted-foreground hidden md:block truncate">{u.email}</p>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {u.tipo_conta === "pessoa_juridica" ? "PJ" : "PF"}
                </span>
                <div>
                  {editingId === u.id ? (
                    <select
                      value={editPlano}
                      onChange={(e) => setEditPlano(e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${planColors[u.plano] || planColors.free}`}>
                      {u.plano?.charAt(0).toUpperCase() + u.plano?.slice(1) || "Free"}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {editingId === u.id ? (
                    <>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleSavePlano(u.id)}>
                        <Save className="w-3.5 h-3.5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => { setEditingId(u.id); setEditPlano(u.plano || "free"); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Planos ===== */
function AdminPlanos() {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "R$ 0/mês",
      limits: "50 produtos, 1 usuário, relatórios básicos",
      color: "border-border",
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 49,90/mês",
      limits: "Produtos ilimitados, simulador, CRM, Google Sheets, suporte prioritário",
      color: "border-primary",
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 99,90/mês",
      limits: "Multi-usuários, relatórios avançados, API, suporte dedicado, backup",
      color: "border-warning",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Gestão de Planos</h2>
      <p className="text-sm text-muted-foreground">
        Visualize e gerencie os planos disponíveis. A alteração de plano dos usuários é feita na aba Usuários.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-card border-2 ${plan.color} rounded-xl p-5 space-y-3`}>
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${plan.id === "premium" ? "text-warning" : plan.id === "pro" ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
            </div>
            <p className="text-lg font-bold text-foreground">{plan.price}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{plan.limits}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Termos & Política ===== */
function AdminTermos() {
  const { toast } = useToast();
  const [termos, setTermos] = useState(`Bem-vindo ao Controle Financeiro. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo.

1. Aceitação dos Termos
Ao acessar e usar o serviço, você aceita e concorda em ficar vinculado a estes Termos de Uso.

2. Descrição do Serviço
O Controle Financeiro é uma plataforma de gestão financeira voltada para pequenos empreendedores.

3. Conta do Usuário
Você é responsável por manter a confidencialidade de suas credenciais de acesso.

4. Uso Aceitável
Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.

5. Limitação de Responsabilidade
O serviço é fornecido "como está". Não garantimos que estará sempre disponível.

6. Modificações
Podemos modificar estes termos a qualquer momento.`);

  const [politica, setPolitica] = useState(`A sua privacidade é importante para nós.

1. Dados Coletados
Informações de cadastro, dados de compras e vendas, receitas e produtos.

2. Uso dos Dados
Fornecer e melhorar nossos serviços, gerar relatórios e análises.

3. Proteção dos Dados
Medidas de segurança adequadas com criptografia.

4. Compartilhamento
Não vendemos ou compartilhamos suas informações pessoais com terceiros.

5. Seus Direitos
Acessar, corrigir, solicitar exclusão ou revogar consentimento.`);

  const handleSave = () => {
    // In a real app, save to database
    toast({ title: "Textos salvos!", description: "Termos e política atualizados." });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Termos de Uso & Política de Privacidade</h2>
      <p className="text-sm text-muted-foreground">
        Edite os textos legais que são exibidos para os usuários na área de Configurações.
      </p>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Termos de Uso</h3>
        </div>
        <Textarea
          value={termos}
          onChange={(e) => setTermos(e.target.value)}
          rows={12}
          className="text-xs leading-relaxed resize-none"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Política de Privacidade</h3>
        </div>
        <Textarea
          value={politica}
          onChange={(e) => setPolitica(e.target.value)}
          rows={12}
          className="text-xs leading-relaxed resize-none"
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        <Save className="w-4 h-4" />
        Salvar alterações
      </Button>
    </div>
  );
}
