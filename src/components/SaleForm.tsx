import { useState, useCallback, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt, User, Package, Truck, CreditCard, DollarSign, Loader2, Ruler, Phone, UserPlus, ScanLine, ArrowLeft } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useClientes } from "@/hooks/useClientes";
import { useProdutos } from "@/hooks/useProdutos";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { MercadoPagoPaymentModal } from "@/components/MercadoPagoPaymentModal";
import { useIsMobile } from "@/hooks/use-mobile";

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
  telefoneCliente: string;
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

const NEW_CLIENT_VALUE = "__new_client__";

export function SaleForm({ onSubmit }: SaleFormProps) {
  const { toast } = useToast();
  const { products, isLoading: loadingProducts } = useProducts();
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { produtos, findByBarcode } = useProdutos();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"scanner" | "manual">("manual");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState<SaleData>({
    cliente: "",
    telefoneCliente: "",
    produto: "",
    tamanho: "",
    embalagem: "",
    valorFrete: "",
    formaPagamento: "",
    valorVenda: "",
  });

  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ nome: "", telefone: "" });
  const [localClientes, setLocalClientes] = useState<{ nome: string; telefone: string }[]>([]);

  const allClientes = [...clientes, ...localClientes];

  const selectedProduct = products.find((p) => p.cod === formData.produto);
  const selectedCliente = allClientes.find((c) => c.nome === formData.cliente);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handleClientChange = (value: string) => {
    if (value === NEW_CLIENT_VALUE) {
      setShowNewClientDialog(true);
    } else {
      const cliente = allClientes.find((c) => c.nome === value);
      setFormData({ 
        ...formData, 
        cliente: value,
        telefoneCliente: cliente?.telefone || ""
      });
    }
  };

  const handleAddNewClient = () => {
    if (!newClientData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    const phonePattern = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (newClientData.telefone && !phonePattern.test(newClientData.telefone)) {
      toast({
        title: "Formato inválido",
        description: "O telefone deve estar no formato (XX) XXXXX-XXXX",
        variant: "destructive",
      });
      return;
    }

    setLocalClientes([...localClientes, { ...newClientData }]);
    setFormData({
      ...formData,
      cliente: newClientData.nome,
      telefoneCliente: newClientData.telefone,
    });
    setNewClientData({ nome: "", telefone: "" });
    setShowNewClientDialog(false);

    toast({
      title: "Cliente adicionado",
      description: `"${newClientData.nome}" foi adicionado à lista.`,
    });
  };

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
      telefoneCliente: "",
      produto: "",
      tamanho: "",
      embalagem: "",
      valorFrete: "",
      formaPagamento: "",
      valorVenda: "",
    });
  };

  const handleBarcodeScan = useCallback((code: string) => {
    setShowScanner(false);
    const produto = findByBarcode(code);
    if (produto) {
      const sheetProduct = products.find((p) => p.nome.toLowerCase() === produto.nome.toLowerCase());
      setFormData((prev) => ({
        ...prev,
        produto: sheetProduct?.cod || produto.nome,
        tamanho: sheetProduct?.tamanho || produto.tamanho || "",
      }));
      toast({ title: "Produto identificado!", description: produto.nome });
    } else {
      toast({ title: "Produto não encontrado", description: `Código: ${code}`, variant: "destructive" });
    }
  }, [findByBarcode, products, toast]);

  // On mobile, auto-switch to scanner mode
  useEffect(() => {
    if (isMobile && !hasInitialized) {
      setMode("scanner");
      setHasInitialized(true);
      const timer = setTimeout(() => {
        setShowScanner(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMobile, hasInitialized]);

  // Mobile scanner landing screen
  if (isMobile && mode === "scanner" && !showScanner) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-8 px-4">
        <div className="p-4 rounded-2xl bg-accent mb-6">
          <ScanLine className="w-10 h-10 text-accent-foreground" />
        </div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-1">Escanear Produto</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Escaneie o código de barras do produto para preencher automaticamente
        </p>

        <div className="w-full space-y-3">
          <Button
            type="button"
            onClick={() => setShowScanner(true)}
            className="w-full gap-2 h-12"
          >
            <ScanLine className="w-5 h-5" />
            Escanear Código de Barras
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
      </div>
    );
  }

  return (
    <>
      {showScanner && (
        <BarcodeScanner onScan={(code) => { handleBarcodeScan(code); setMode("manual"); }} onClose={() => { setShowScanner(false); if (mode === "scanner") setMode("manual"); }} />
      )}
      <form onSubmit={handleSubmit} className="form-section animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-accent">
            <Receipt className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              Registrar Venda
            </h2>
            <p className="text-sm text-muted-foreground">
              Anote o que você vendeu e para quem
            </p>
          </div>
        </div>

        {/* Barcode Scanner Button */}
        <div className="mb-2 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowScanner(true)}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Escanear Código do Produto
          </Button>
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("scanner")}
              className="w-full gap-2"
            >
              <ScanLine className="w-4 h-4" />
              Voltar ao escaneador
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="input-label">
              <User className="w-4 h-4 inline mr-1.5" />
              Para quem vendeu?
            </Label>
            <Select
              value={formData.cliente}
              onValueChange={handleClientChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClientes ? "Carregando..." : "Selecione o cliente"} />
              </SelectTrigger>
              <SelectContent>
                {loadingClientes ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    {allClientes.map((cliente) => (
                      <SelectItem key={cliente.nome} value={cliente.nome}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_CLIENT_VALUE}>
                      <span className="flex items-center gap-1.5 text-primary">
                        <UserPlus className="w-4 h-4" />
                        Cadastrar novo cliente
                      </span>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="input-label">
              <Phone className="w-4 h-4 inline mr-1.5" />
              Telefone
            </Label>
            <Input
              value={selectedCliente?.telefone || formData.telefoneCliente}
              readOnly
              placeholder="Selecione um cliente"
              className="bg-muted"
            />
          </div>

          <div>
            <Label className="input-label">
              <Package className="w-4 h-4 inline mr-1.5" />
              O que vendeu?
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
              Cobrou entrega? (R$)
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
              Como recebeu?
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
              Quanto cobrou? (R$)
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

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" className="flex-1 mt-2">
              Registrar Venda
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              disabled={!formData.valorVenda || Number(formData.valorVenda) <= 0}
              onClick={() => setShowPaymentModal(true)}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Mercado Pago</span>
            </Button>
          </div>
        </div>
      </form>

      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="newClientName" className="input-label">
                <User className="w-4 h-4 inline mr-1.5" />
                Nome do Cliente
              </Label>
              <Input
                id="newClientName"
                placeholder="Nome completo"
                value={newClientData.nome}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, nome: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="newClientPhone" className="input-label">
                <Phone className="w-4 h-4 inline mr-1.5" />
                Telefone
              </Label>
              <Input
                id="newClientPhone"
                placeholder="(XX) XXXXX-XXXX"
                value={newClientData.telefone}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, telefone: formatPhone(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewClientDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewClient}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MercadoPagoPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        productName={formData.produto}
        amount={Number(formData.valorVenda) || 0}
        clientName={formData.cliente}
      />
    </>
  );
}
