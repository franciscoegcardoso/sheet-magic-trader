import { useState } from "react";
import { usePaymentGateways, GATEWAYS, type GatewayMeta } from "@/hooks/usePaymentGateways";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";

function GatewayCard({ meta }: { meta: GatewayMeta }) {
  const { toast } = useToast();
  const { getConfig, saveGateway, toggleGateway } = usePaymentGateways();
  const config = getConfig(meta.id);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const creds = (config?.credenciais || {}) as Record<string, string>;
    const initial: Record<string, string> = {};
    meta.campos.forEach((c) => (initial[c.key] = creds[c.key] || ""));
    return initial;
  });

  const isActive = config?.ativo || false;
  const hasCredentials = meta.campos.every((c) => {
    const val = (config?.credenciais as Record<string, string>)?.[c.key];
    return val && val.trim().length > 0;
  });

  const handleSave = async () => {
    const missing = meta.campos.filter((c) => !fields[c.key]?.trim());
    if (missing.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${missing.map((m) => m.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await saveGateway(meta.id, true, fields);
      toast({ title: `${meta.nome} configurado!`, description: "Gateway ativado com sucesso." });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (checked && !hasCredentials) {
      setOpen(true);
      return;
    }
    try {
      await toggleGateway(meta.id, checked);
      toast({
        title: checked ? `${meta.nome} ativado` : `${meta.nome} desativado`,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.cor}15` }}
          >
            <CreditCard className="w-5 h-5" style={{ color: meta.cor }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">{meta.nome}</h4>
              {isActive && hasCredentials ? (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                  <CheckCircle className="w-3 h-3 mr-0.5" /> Ativo
                </Badge>
              ) : hasCredentials ? (
                <Badge variant="outline" className="text-[10px] border-warning/30 text-warning bg-warning/5">
                  <AlertCircle className="w-3 h-3 mr-0.5" /> Inativo
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground truncate">{meta.descricao}</p>
          </div>

          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            className="shrink-0"
          />

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            {/* Instructions */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning" /> Como configurar:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs text-muted-foreground">
                {meta.instrucoes.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
              {meta.docsUrl && (
                <a
                  href={meta.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> Acessar painel
                </a>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {meta.campos.map((campo) => (
                <div key={campo.key}>
                  <Label className="text-xs text-muted-foreground">{campo.label}</Label>
                  <div className="relative mt-1">
                    <Input
                      type={campo.secret && !showSecrets[campo.key] ? "password" : "text"}
                      placeholder={campo.placeholder}
                      value={fields[campo.key]}
                      onChange={(e) =>
                        setFields({ ...fields, [campo.key]: e.target.value })
                      }
                    />
                    {campo.secret && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowSecrets((s) => ({ ...s, [campo.key]: !s[campo.key] }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets[campo.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Salvar e ativar
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              Suas credenciais são armazenadas de forma criptografada e nunca expostas no frontend.
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function PaymentGatewaysConfig() {
  const { isLoading } = usePaymentGateways();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent">
          <CreditCard className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Meios de Pagamento</h3>
          <p className="text-xs text-muted-foreground">
            Configure e ative os gateways para cobrar nas vendas
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {GATEWAYS.map((gw) => (
            <GatewayCard key={gw.id} meta={gw} />
          ))}
        </div>
      )}
    </div>
  );
}
