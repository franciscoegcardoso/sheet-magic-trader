import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Calendar, DollarSign, Package, Hash, Loader2 } from "lucide-react";
import { InvoiceScanner } from "./InvoiceScanner";
import { useInsumos } from "@/hooks/useInsumos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [formData, setFormData] = useState<PurchaseData>({
    insumo: "",
    quantidade: "",
    unidade: "",
    dataCompra: new Date().toISOString().split("T")[0],
    valorCompra: "",
  });

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
    // Submit all scanned items - convert to PurchaseData format
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

  return (
    <form onSubmit={handleSubmit} className="form-section animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-accent">
          <ShoppingCart className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Lançamento de Insumos
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre suas compras de insumos
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

      <div className="space-y-4">
        <div>
          <Label htmlFor="insumo" className="input-label">
            <Package className="w-4 h-4 inline mr-1.5" />
            Insumo
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
              Quantidade
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
            <Input
              id="unidade"
              placeholder="kg, un, L..."
              value={formData.unidade}
              onChange={(e) =>
                setFormData({ ...formData, unidade: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dataCompra" className="input-label">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Data da Compra
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
            Valor da Compra (R$)
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
          Registrar Compra
        </Button>
      </div>
    </form>
  );
}
