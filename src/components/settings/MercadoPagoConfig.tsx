import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";

export function MercadoPagoConfig() {
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");

  const handleCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("mercado-pago", {
        body: { action: "check" },
      });
      if (error) throw error;
      if (data?.valid) {
        setStatus("connected");
        toast({ title: "Mercado Pago conectado!", description: "A integração está ativa." });
      } else {
        setStatus("error");
        toast({ title: "Token inválido", description: data?.error, variant: "destructive" });
      }
    } catch (err: any) {
      setStatus("error");
      toast({ title: "Erro ao verificar", description: err.message, variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#009ee3]/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#009ee3]" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Mercado Pago</h4>
          <p className="text-xs text-muted-foreground">Gere links de pagamento para suas vendas</p>
        </div>
      </div>

      {status === "connected" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Integração ativa</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Links de pagamento estão disponíveis ao registrar uma venda.
          </p>
          <Button variant="outline" size="sm" onClick={handleCheck} disabled={checking}>
            {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verificar conexão"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Como obter o Access Token:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener" className="text-primary underline">Mercado Pago Developers</a></li>
                <li>Crie um aplicativo ou selecione um existente</li>
                <li>Vá em <strong>Credenciais de produção</strong></li>
                <li>Copie o <strong>Access Token</strong></li>
              </ol>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            O token é armazenado de forma segura no servidor e nunca é exposto no frontend.
            Para configurar, adicione o token como segredo do projeto com o nome <code className="bg-muted px-1 rounded">MERCADOPAGO_ACCESS_TOKEN</code>.
          </p>

          <Button onClick={handleCheck} disabled={checking} className="w-full" size="sm">
            {checking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
            Verificar conexão
          </Button>

          {status === "error" && (
            <p className="text-xs text-destructive">
              Token não configurado ou inválido. Adicione o segredo MERCADOPAGO_ACCESS_TOKEN nas configurações do projeto.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
