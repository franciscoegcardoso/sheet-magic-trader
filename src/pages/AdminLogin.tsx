import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .rpc("has_role", { _user_id: data.user.id, _role: "admin" });

      if (roleError) throw roleError;

      if (!roleData) {
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive",
        });
        return;
      }

      onLogin();
    } catch (err: any) {
      toast({
        title: "Erro ao entrar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">Painel Admin</h1>
          </div>
          <p className="text-sm text-muted-foreground">Acesso restrito a administradores</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                placeholder="admin@email.com"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Entrar como Admin
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center">
          Este painel é exclusivo para administradores do sistema.
        </p>
      </div>
    </div>
  );
}
