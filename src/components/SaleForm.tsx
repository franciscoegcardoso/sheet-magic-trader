import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Receipt, User, Package, Truck, CreditCard, DollarSign, Loader2, Ruler } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const EMBALAGENS = [
  "Marmitex P (500ml)",
  "Marmitex M (750ml)",
  "Marmitex G (1L)",
  "Bandeja Alumínio",
  "Pote Plástico Retornável",
  "Embalagem Térmica",
  "Sacola Kraft",
  "Caixa de Papelão",
];

const FORMAS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "credito", label: "Cartão de Crédito" },
  { value: "debito", label: "Cartão de Débito" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "crediario", label: "Crediário" },
];

interface SaleData {
  cliente: string;
  produto: string;
  tamanho: string;
  embalagem: string;
  valorFrete: string;
  formaPagamento: string;
  valorVenda: string;
}

interface SaleFormProps {
  onSubmit: (data: SaleData) => void;
}

export function SaleForm({ onSubmit }: SaleFormProps) {
  const { toast } = useToast();
  const { products, isLoading: loadingProducts } = useProducts();
  const [formData, setFormData] = useState<SaleData>({
    cliente: "",
    produto: "",
    tamanho: "",
    embalagem: "",
    valorFrete: "",
    formaPagamento: "",
    valorVenda: "",
  });

  const selectedProduct = products.find((p) => p.cod === formData.produto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.cliente ||
      !formData.produto ||
      !formData.embalagem ||
      !formData.formaPagamento ||
      !formData.valorVenda
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);

    toast({
      title: "Venda registrada!",
      description: `Venda para "${formData.cliente}" registrada com sucesso.`,
    });

    setFormData({
      cliente: "",
      produto: "",
      tamanho: "",
      embalagem: "",
      valorFrete: "",
      formaPagamento: "",
      valorVenda: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-section animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-accent">
          <Receipt className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Lançamento de Venda
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre suas vendas de produtos
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="cliente" className="input-label">
            <User className="w-4 h-4 inline mr-1.5" />
            Cliente
          </Label>
          <Input
            id="cliente"
            placeholder="Nome do cliente"
            value={formData.cliente}
            onChange={(e) =>
              setFormData({ ...formData, cliente: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="input-label">
            <Package className="w-4 h-4 inline mr-1.5" />
            Produto
          </Label>
          <Select
            value={formData.produto}
            onValueChange={(value) => {
              const product = products.find((p) => p.cod === value);
              setFormData({ 
                ...formData, 
                produto: value,
                tamanho: product?.tamanho || ""
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingProducts ? "Carregando..." : "Selecione o produto"} />
            </SelectTrigger>
            <SelectContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                products.map((produto) => (
                  <SelectItem key={produto.cod} value={produto.cod}>
                    {produto.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="input-label">
            <Ruler className="w-4 h-4 inline mr-1.5" />
            Tamanho
          </Label>
          <Input
            value={selectedProduct?.tamanho || ""}
            readOnly
            placeholder="Selecione um produto"
            className="bg-muted"
          />
        </div>

        <div>
          <Label className="input-label">
            <Package className="w-4 h-4 inline mr-1.5" />
            Embalagem
          </Label>
          <Select
            value={formData.embalagem}
            onValueChange={(value) =>
              setFormData({ ...formData, embalagem: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a embalagem" />
            </SelectTrigger>
            <SelectContent>
              {EMBALAGENS.map((embalagem) => (
                <SelectItem key={embalagem} value={embalagem}>
                  {embalagem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="valorFrete" className="input-label">
            <Truck className="w-4 h-4 inline mr-1.5" />
            Valor do Frete (R$)
          </Label>
          <Input
            id="valorFrete"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00 (opcional)"
            value={formData.valorFrete}
            onChange={(e) =>
              setFormData({ ...formData, valorFrete: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="input-label">
            <CreditCard className="w-4 h-4 inline mr-1.5" />
            Forma de Pagamento
          </Label>
          <Select
            value={formData.formaPagamento}
            onValueChange={(value) =>
              setFormData({ ...formData, formaPagamento: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {FORMAS_PAGAMENTO.map((forma) => (
                <SelectItem key={forma.value} value={forma.value}>
                  {forma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="valorVenda" className="input-label">
            <DollarSign className="w-4 h-4 inline mr-1.5" />
            Valor da Venda (R$)
          </Label>
          <Input
            id="valorVenda"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={formData.valorVenda}
            onChange={(e) =>
              setFormData({ ...formData, valorVenda: e.target.value })
            }
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full mt-2">
            Registrar Venda
          </Button>
        </div>
      </div>
    </form>
  );
}
