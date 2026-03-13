import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceItem {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  selected: boolean;
}

interface InvoiceScannerProps {
  onConfirm: (items: Array<{ produto: string; dataCompra: string; valorCompra: string }>) => void;
  onScanningChange?: (scanning: boolean) => void;
}

export interface InvoiceScannerHandle {
  scanFile: (file: File) => void;
}

export const InvoiceScanner = forwardRef<InvoiceScannerHandle, InvoiceScannerProps>(function InvoiceScanner({ onConfirm, onScanningChange }, ref) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  const scanFileFromExternal = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await scanInvoice(base64);
    };
    reader.readAsDataURL(file);
  };

  useImperativeHandle(ref, () => ({ scanFile: scanFileFromExternal }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem da nota fiscal.",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await scanInvoice(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanInvoice = async (imageBase64: string) => {
    setIsScanning(true);
    onScanningChange?.(true);

    try {
      const { data, error } = await supabase.functions.invoke("scan-invoice", {
        body: { imageBase64 },
      });

      if (error) {
        throw new Error(error.message || "Erro ao escanear nota fiscal");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.items && Array.isArray(data.items)) {
        const itemsWithSelection = data.items.map((item: any) => ({
          ...item,
          selected: true,
        }));
        setItems(itemsWithSelection);
        setInvoiceTotal(data.total || 0);
        setShowValidation(true);
        
        toast({
          title: "Nota escaneada!",
          description: `${data.items.length} item(s) encontrado(s).`,
        });
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Error scanning invoice:", error);
      toast({
        title: "Erro ao escanear",
        description: error instanceof Error ? error.message : "Não foi possível processar a nota fiscal.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      onScanningChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleConfirm = () => {
    const selectedItems = items.filter((item) => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos um item para registrar.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const formattedItems = selectedItems.map((item) => ({
      produto: item.nome,
      dataCompra: today,
      valorCompra: item.valorTotal.toFixed(2),
    }));

    onConfirm(formattedItems);
    setShowValidation(false);
    setItems([]);
    
    toast({
      title: "Itens registrados!",
      description: `${selectedItems.length} item(s) adicionado(s) à planilha.`,
    });
  };

  const selectedTotal = items
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.valorTotal, 0);

  return (
    <>
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="w-full gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando nota fiscal...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Escanear Nota Fiscal
            </>
          )}
        </Button>
      </div>

      <Dialog open={showValidation} onOpenChange={setShowValidation}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Validar Itens da Nota
            </DialogTitle>
            <DialogDescription>
              Revise os itens extraídos e selecione quais deseja registrar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {items.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  item.selected
                    ? "bg-accent/50 border-accent"
                    : "bg-muted/30 border-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.nome}
                      onChange={(e) => updateItem(index, "nome", e.target.value)}
                      className="font-medium"
                      placeholder="Nome do produto"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Qtd</Label>
                        <Input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) =>
                            updateItem(index, "quantidade", parseFloat(e.target.value) || 0)
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Unitário</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.valorUnitario}
                          onChange={(e) =>
                            updateItem(index, "valorUnitario", parseFloat(e.target.value) || 0)
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.valorTotal}
                          onChange={(e) =>
                            updateItem(index, "valorTotal", parseFloat(e.target.value) || 0)
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                {items.filter((i) => i.selected).length} de {items.length} itens selecionados
              </span>
              <span className="font-semibold">
                Total: R$ {selectedTotal.toFixed(2)}
              </span>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowValidation(false)}
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="gap-1">
                <Check className="w-4 h-4" />
                Confirmar Itens
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
