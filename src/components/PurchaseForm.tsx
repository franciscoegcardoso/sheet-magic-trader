import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Calendar, DollarSign } from "lucide-react";

interface PurchaseData {
  produto: string;
  dataCompra: string;
  valorCompra: string;
}

interface PurchaseFormProps {
  onSubmit: (data: PurchaseData) => void;
}

export function PurchaseForm({ onSubmit }: PurchaseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PurchaseData>({
    produto: "",
    dataCompra: new Date().toISOString().split("T")[0],
    valorCompra: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produto || !formData.dataCompra || !formData.valorCompra) {
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
      description: `Produto "${formData.produto}" adicionado com sucesso.`,
    });

    setFormData({
      produto: "",
      dataCompra: new Date().toISOString().split("T")[0],
      valorCompra: "",
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
            Lançamento de Compra
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre suas compras de produtos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="produto" className="input-label">
            Produto
          </Label>
          <Input
            id="produto"
            placeholder="Nome do produto"
            value={formData.produto}
            onChange={(e) =>
              setFormData({ ...formData, produto: e.target.value })
            }
          />
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
