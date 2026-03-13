import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Calendar, DollarSign, Package, Hash, Loader2, Camera, Image, ArrowLeft, FileText } from "lucide-react";
import { InvoiceScanner, type InvoiceScannerHandle } from "./InvoiceScanner";
import { useInsumos } from "@/hooks/useInsumos";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_GROUPS } from "@/lib/units";

interface PurchaseData {
  insumo: string;
  quantidade: string;
  unidade: string;
  dataCompra: string;
  valorCompra: string;
}

interface PurchaseFormProps {
  onSubmit: (data: PurchaseData) => void;
}

export function PurchaseForm({ onSubmit }: PurchaseFormProps) {
  const { toast } = useToast();
  const { insumos, isLoading: isLoadingInsumos } = useInsumos();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"scanner" | "manual">("manual");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<InvoiceScannerHandle>(null);
  const [formData, setFormData] = useState<PurchaseData>({
    insumo: "",
    quantidade: "",
    unidade: "",
    dataCompra: new Date().toISOString().split("T")[0],
    valorCompra: "",
  });

  // On mobile, switch to scanner mode and auto-trigger camera
  useEffect(() => {
    if (isMobile && !hasInitialized) {
      setMode("scanner");
      setHasInitialized(true);
      const timer = setTimeout(() => {
        cameraInputRef.current?.click();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isMobile, hasInitialized]);

  const handleInsumoChange = (value: string) => {
    const selectedInsumo = insumos.find((i) => i.nome === value);
    setFormData({
      ...formData,
      insumo: value,
      unidade: selectedInsumo?.unidade || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.insumo || !formData.quantidade || !formData.dataCompra || !formData.valorCompra) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    
    toast({
      title: "Compra registrada!",
      description: `Insumo "${formData.insumo}" adicionado com sucesso.`,
    });

    setFormData({
      insumo: "",
      quantidade: "",
      unidade: "",
      dataCompra: new Date().toISOString().split("T")[0],
      valorCompra: "",
    });
  };

  const handleScannedItems = (items: Array<{ produto: string; dataCompra: string; valorCompra: string }>) => {
    items.forEach((item) => {
      onSubmit({
        insumo: item.produto,
        quantidade: "1",
        unidade: "",
        dataCompra: item.dataCompra,
        valorCompra: item.valorCompra,
      });
    });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (scannerRef.current) {
      scannerRef.current.scanFile(file);
    }
    e.target.value = "";
  };

  // Mobile scanner mode
  if (isMobile && mode === "scanner") {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-8 px-4">
        {isProcessing ? (
          // Loading animation while processing
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              </div>
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground mb-2">Processando nota fiscal...</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-[260px]">
              Estamos lendo os itens da sua nota. Isso pode levar alguns segundos.
            </p>
            <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[slide-progress_2s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-accent mb-6">
              <Camera className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground mb-1">Escanear Nota Fiscal</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Tire uma foto da nota ou escolha da galeria
            </p>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelected}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
            />

            <div className="w-full space-y-3">
              <Button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full gap-2 h-12"
              >
                <Camera className="w-5 h-5" />
                Tirar Foto
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full gap-2 h-12"
              >
                <Image className="w-5 h-5" />
                Buscar na Galeria
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("manual")}
                className="w-full gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Inserir dados manualmente
              </Button>
            </div>
          </>
        )}

        {/* Hidden scanner component for processing */}
        <div className="hidden">
          <InvoiceScanner ref={scannerRef} onConfirm={handleScannedItems} onScanningChange={setIsProcessing} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-section animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-accent">
          <ShoppingCart className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Registrar Compra
          </h2>
          <p className="text-sm text-muted-foreground">
            Anote o que você comprou para usar na produção
          </p>
        </div>
      </div>

      <InvoiceScanner onConfirm={handleScannedItems} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            ou preencha manualmente
          </span>
        </div>
      </div>

      {isMobile && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("scanner")}
          className="w-full gap-2 mb-4"
        >
          <Camera className="w-4 h-4" />
          Voltar ao escaneador
        </Button>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="insumo" className="input-label">
            <Package className="w-4 h-4 inline mr-1.5" />
            O que comprou?
          </Label>
          {isLoadingInsumos ? (
            <div className="flex items-center gap-2 h-10 px-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando insumos...</span>
            </div>
          ) : (
            <Select value={formData.insumo} onValueChange={handleInsumoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o insumo" />
              </SelectTrigger>
              <SelectContent>
                {insumos.map((insumo) => (
                  <SelectItem key={insumo.codigo} value={insumo.nome}>
                    {insumo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="quantidade" className="input-label">
              <Hash className="w-4 h-4 inline mr-1.5" />
              Quanto comprou?
            </Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={formData.quantidade}
              onChange={(e) =>
                setFormData({ ...formData, quantidade: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="unidade" className="input-label">
              Unidade
            </Label>
            <Select
              value={formData.unidade}
              onValueChange={(v) => setFormData({ ...formData, unidade: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {UNIT_GROUPS.map((group) => (
                  <div key={group.group}>
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.group}
                    </div>
                    {group.units.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.abbr} — {u.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="dataCompra" className="input-label">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Quando comprou?
          </Label>
          <Input
            id="dataCompra"
            type="date"
            value={formData.dataCompra}
            onChange={(e) =>
              setFormData({ ...formData, dataCompra: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="valorCompra" className="input-label">
            <DollarSign className="w-4 h-4 inline mr-1.5" />
            Quanto pagou? (R$)
          </Label>
          <Input
            id="valorCompra"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={formData.valorCompra}
            onChange={(e) =>
              setFormData({ ...formData, valorCompra: e.target.value })
            }
          />
        </div>

        <Button type="submit" className="w-full mt-6">
          Salvar Compra
        </Button>
      </div>
    </form>
  );
}
