import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Link, CheckCircle, AlertCircle } from "lucide-react";

interface SheetsConfigProps {
  webhookUrl?: string;
  setWebhookUrl?: (url: string) => void;
  isConnected?: boolean;
  setIsConnected?: (connected: boolean) => void;
}

export function SheetsConfig({
  webhookUrl: externalUrl,
  setWebhookUrl: externalSetUrl,
  isConnected: externalConnected,
  setIsConnected: externalSetConnected,
}: SheetsConfigProps) {
  const { toast } = useToast();
  const [internalUrl, setInternalUrl] = useState("");
  const [internalConnected, setInternalConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const webhookUrl = externalUrl ?? internalUrl;
  const setWebhookUrl = externalSetUrl ?? setInternalUrl;
  const isConnected = externalConnected ?? internalConnected;
  const setIsConnected = externalSetConnected ?? setInternalConnected;

  const handleConnect = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, insira a URL do webhook do Google Sheets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Conectado!",
        description: "Integração com Google Sheets configurada com sucesso.",
      });
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWebhookUrl("");
    toast({
      title: "Desconectado",
      description: "Integração com Google Sheets removida.",
    });
  };

  return (
    <div className="space-y-4">
      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/50 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Integração ativa
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Os lançamentos serão enviados automaticamente para sua planilha.
          </p>
          <Button variant="outline" onClick={handleDisconnect} className="w-full">
            Desconectar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-4 rounded-lg bg-muted border border-border">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Como configurar:
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Crie uma planilha no Google Sheets</li>
                <li>Acesse Extensões → Apps Script</li>
                <li>Configure um Web App para receber dados</li>
                <li>Cole a URL do deploy aqui</li>
              </ol>
            </div>
          </div>

          <div>
            <Label htmlFor="webhookUrl" className="input-label">
              <Link className="w-4 h-4 inline mr-1.5" />
              URL do Webhook
            </Label>
            <Input
              id="webhookUrl"
              placeholder="https://script.google.com/macros/s/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Conectando..." : "Conectar"}
          </Button>
        </div>
      )}
    </div>
  );
}
