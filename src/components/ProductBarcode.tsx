import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductBarcodeProps {
  codigo: string;
  nome: string;
}

export function ProductBarcode({ codigo, nome }: ProductBarcodeProps) {
  const { toast } = useToast();
  const isInternal = codigo.startsWith("2");
  const label = isInternal ? "Código Interno" : "GTIN (EAN-13)";

  const handleCopy = () => {
    navigator.clipboard.writeText(codigo);
    toast({ title: "Código copiado!" });
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
      <QRCodeSVG value={codigo} size={64} level="M" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <QrCode className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <p className="text-xs font-mono font-medium text-foreground mt-0.5 truncate">{codigo}</p>
        {!isInternal && codigo.startsWith("789") && (
          <span className="text-[10px] text-primary">🇧🇷 Brasil</span>
        )}
      </div>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={handleCopy} title="Copiar código">
        <Copy className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
