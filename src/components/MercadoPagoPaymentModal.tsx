import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Copy,
  QrCode,
  DollarSign,
} from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  amount: number;
  clientName?: string;
  clientEmail?: string;
  onPaymentCreated?: (paymentUrl: string) => void;
}

export function MercadoPagoPaymentModal({
  open,
  onOpenChange,
  productName,
  amount,
  clientName,
  clientEmail,
  onPaymentCreated,
}: PaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(clientEmail || "");

  const handleGenerate = async () => {
    if (amount <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mercado-pago", {
        body: {
          action: "create_preference",
          title: productName || "Venda",
          quantity: 1,
          unit_price: amount,
          description: clientName ? `Venda para ${clientName}` : "",
          payer_email: email || undefined,
          success_url: window.location.origin,
          failure_url: window.location.origin,
          pending_url: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const url = data.init_point;
      setPaymentUrl(url);
      onPaymentCreated?.(url);
      toast({ title: "Link de pagamento gerado!" });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar pagamento",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!paymentUrl) return;
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setPaymentUrl(null);
    setCopied(false);
    setEmail(clientEmail || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pagamento via Mercado Pago
          </DialogTitle>
          <DialogDescription>
            Gere um link de pagamento para o cliente
          </DialogDescription>
        </DialogHeader>

        {!paymentUrl ? (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Produto</span>
                <span className="text-sm font-medium text-foreground">{productName || "Venda"}</span>
              </div>
              {clientName && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cliente</span>
                  <span className="text-sm font-medium text-foreground">{clientName}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-xs font-semibold text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary">
                  R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs text-muted-foreground">Email do cliente (opcional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="mt-1"
              />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando link...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Gerar link de pagamento
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-accent/50 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Link gerado com sucesso!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie o link abaixo para o cliente realizar o pagamento.
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <input
                readOnly
                value={paymentUrl}
                className="flex-1 text-xs bg-transparent text-foreground outline-none truncate"
              />
              <Button variant="outline" size="sm" className="shrink-0 h-8" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCopy} className="text-xs">
                <Copy className="w-3.5 h-3.5" />
                Copiar link
              </Button>
              <Button
                onClick={() => window.open(paymentUrl, "_blank")}
                className="text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir link
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
