import { useMemo, useState } from "react";
import { useProdutos } from "@/hooks/useProdutos";
import { useReceitas } from "@/hooks/useReceitas";
import { useCompras } from "@/hooks/useCompras";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GrossProfitCalculator } from "@/components/GrossProfitCalculator";
import {
  Calculator,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Star,
  Magnet,
  ArrowDown,
  ArrowUp,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function PriceSimulator() {
  const { produtos, isLoading: loadingProdutos } = useProdutos();
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();

  const isLoading = loadingProdutos || loadingReceitas || loadingCompras;

  const [selectedProduct, setSelectedProduct] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [impostoPercent, setImpostoPercent] = useState("6");
  const [taxaPercent, setTaxaPercent] = useState("3.5");
  const [embalagemCusto, setEmbalagemCusto] = useState("");
  const [entregaCusto, setEntregaCusto] = useState("");
  const [showStrategy, setShowStrategy] = useState(false);

  // Calculate CMV for products
  const productsWithCMV = useMemo(() => {
    const custoMap = new Map(custoMedioPorInsumo.map((c) => [c.insumo_nome, c.custo_medio]));
    return produtos.map((p) => {
      const receita = receitas.find((r) => r.id === p.receita_id);
      let cmv = 0;
      if (receita && receita.ingredientes) {
        const rendimento = receita.rendimento && receita.rendimento > 0 ? receita.rendimento : 1;
        cmv = receita.ingredientes.reduce((sum, ing) => {
          const custoMedio = custoMap.get(ing.insumo_nome) || ing.custo_unitario || 0;
          return sum + (ing.quantidade * custoMedio) / rendimento;
        }, 0);
      }
      return { ...p, cmv, hasCMV: cmv > 0 };
    });
  }, [produtos, receitas, custoMedioPorInsumo]);

  const selectedProd = productsWithCMV.find((p) => p.id === selectedProduct);

  // DRE calculation
  const calc = useMemo(() => {
    if (!selectedProd) return null;
    const receita = Number(precoVenda) || 0;
    const impostos = receita * (Number(impostoPercent) / 100);
    const taxas = receita * (Number(taxaPercent) / 100);
    const cmv = selectedProd.cmv;
    const embalagem = Number(embalagemCusto) || 0;
    const entrega = Number(entregaCusto) || 0;
    const lucroBruto = receita - impostos - taxas - cmv - embalagem - entrega;
    const lucroBrutoPercent = receita > 0 ? (lucroBruto / receita) * 100 : 0;

    return {
      receita,
      impostos,
      taxas,
      cmv,
      embalagem,
      entrega,
      lucroBruto,
      lucroBrutoPercent,
    };
  }, [selectedProd, precoVenda, impostoPercent, taxaPercent, embalagemCusto, entregaCusto]);

  // Health level
  const healthLevel = calc
    ? calc.lucroBrutoPercent >= 40
      ? "excellent"
      : calc.lucroBrutoPercent >= 25
      ? "good"
      : calc.lucroBrutoPercent >= 15
      ? "attention"
      : "danger"
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-accent">
          <Calculator className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Calculadora de Preço
          </h2>
          <p className="text-sm text-muted-foreground">Descubra quanto cobrar para ter lucro de verdade</p>
        </div>
      </div>

      {/* Product selector */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <Label className="text-xs font-semibold text-foreground">Qual produto quer calcular?</Label>
        <select
          value={selectedProduct}
          onChange={(e) => {
            setSelectedProduct(e.target.value);
            const prod = productsWithCMV.find((p) => p.id === e.target.value);
            if (prod) setPrecoVenda(String(prod.preco_venda));
          }}
          className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
        >
          <option value="">Escolha um produto...</option>
          {productsWithCMV.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} {p.hasCMV ? `(custo: R$${p.cmv.toFixed(2)})` : "(sem custo definido)"}
            </option>
          ))}
        </select>
      </div>

      {/* No CMV warning */}
      {selectedProd && !selectedProd.hasCMV && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Custo do produto não definido</p>
            <p className="text-xs text-destructive/80 mt-1">
              Para calcular o preço ideal, precisamos saber quanto custa produzir. 
              Vá em "Minhas Receitas", cadastre uma receita com os ingredientes e vincule ao produto.
              Depois registre as compras desses ingredientes em "Compras".
            </p>
          </div>
        </div>
      )}

      {selectedProd && selectedProd.hasCMV && (
        <>
          {/* Input form */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Por quanto quer vender?</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="pl-9 h-10"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Impostos (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={impostoPercent}
                  onChange={(e) => setImpostoPercent(e.target.value)}
                  className="h-9 mt-1 text-sm"
                  placeholder="6"
                />
                <p className="text-[9px] text-muted-foreground mt-0.5">Ex: MEI paga ~5%</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Taxas de máquina (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={taxaPercent}
                  onChange={(e) => setTaxaPercent(e.target.value)}
                  className="h-9 mt-1 text-sm"
                  placeholder="3.5"
                />
                <p className="text-[9px] text-muted-foreground mt-0.5">Maquininha, iFood, etc.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Embalagem (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={embalagemCusto}
                  onChange={(e) => setEmbalagemCusto(e.target.value)}
                  className="h-9 mt-1 text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Entrega (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={entregaCusto}
                  onChange={(e) => setEntregaCusto(e.target.value)}
                  className="h-9 mt-1 text-sm"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* DRE Visual */}
          {calc && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-display font-semibold text-sm text-foreground">
                  DRE do Produto — {selectedProd.nome}
                </h3>
              </div>

              <div className="divide-y divide-border">
                <DRERow label="Receita Bruta" value={calc.receita} isTotal />
                <DRERow label="(-) Impostos" value={-calc.impostos} percent={Number(impostoPercent)} />
                <DRERow label="(-) Taxas" value={-calc.taxas} percent={Number(taxaPercent)} />
                <DRERow label="(-) CMV" value={-calc.cmv} highlight />
                {calc.embalagem > 0 && <DRERow label="(-) Embalagem" value={-calc.embalagem} />}
                {calc.entrega > 0 && <DRERow label="(-) Entrega" value={-calc.entrega} />}
                <div
                  className={`px-4 py-3 flex items-center justify-between ${
                    healthLevel === "danger"
                      ? "bg-destructive/10"
                      : healthLevel === "attention"
                      ? "bg-warning/10"
                      : "bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">(=) Lucro Bruto</span>
                    <HealthBadge level={healthLevel!} percent={calc.lucroBrutoPercent} />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      calc.lucroBruto >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    R$ {calc.lucroBruto.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Visual bar */}
              <div className="px-4 py-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-2">Composição do preço</p>
                <div className="flex h-6 rounded-full overflow-hidden">
                  {calc.receita > 0 && (
                    <>
                      <div
                        className="bg-primary/80 flex items-center justify-center"
                        style={{ width: `${Math.max(0, calc.lucroBrutoPercent)}%` }}
                      >
                        <span className="text-[8px] text-primary-foreground font-bold truncate px-1">
                          {calc.lucroBrutoPercent > 8 ? `Lucro ${calc.lucroBrutoPercent.toFixed(0)}%` : ""}
                        </span>
                      </div>
                      <div
                        className="bg-destructive/60 flex items-center justify-center"
                        style={{ width: `${((calc.cmv / calc.receita) * 100)}%` }}
                      >
                        <span className="text-[8px] text-destructive-foreground font-bold truncate px-1">
                          {(calc.cmv / calc.receita) * 100 > 8 ? "CMV" : ""}
                        </span>
                      </div>
                      <div
                        className="bg-muted-foreground/30 flex items-center justify-center"
                        style={{
                          width: `${(((calc.impostos + calc.taxas + calc.embalagem + calc.entrega) / calc.receita) * 100)}%`,
                        }}
                      >
                        <span className="text-[8px] text-foreground font-bold truncate px-1">
                          {((calc.impostos + calc.taxas + calc.embalagem + calc.entrega) / calc.receita) * 100 > 8
                            ? "Custos"
                            : ""}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price suggestion slider */}
          {calc && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <Label className="text-xs font-semibold text-foreground">
                Ajustar preço rapidamente
              </Label>
              <Slider
                value={[Number(precoVenda) || 0]}
                onValueChange={([v]) => setPrecoVenda(String(v.toFixed(2)))}
                min={Math.max(0, selectedProd.cmv * 0.8)}
                max={selectedProd.cmv * 5}
                step={0.5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Abaixo CMV ⚠️</span>
                <span>CMV: R$ {selectedProd.cmv.toFixed(2)}</span>
                <span>5x CMV</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== LUCRO BRUTO MÍNIMO IDEAL ===== */}
      <GrossProfitCalculator />

      {/* ===== STRATEGY SECTION ===== */}
      <div className="space-y-3">
        <button
          onClick={() => setShowStrategy(!showStrategy)}
          className="w-full bg-card border border-border rounded-xl p-4 text-left flex items-start gap-3"
        >
          <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Estratégia: Produto Chamariz vs Premium
              </h3>
              {showStrategy ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {showStrategy && (
          <div className="bg-accent/30 border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              Nem todo produto precisa ter a mesma margem! Uma estratégia inteligente é ter uma{" "}
              <strong>mistura de produtos</strong> com papéis diferentes:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Chamariz */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                    <Magnet className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">🎣 Produto Chamariz</h4>
                    <p className="text-[10px] text-muted-foreground">Margem menor, volume maior</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  É o produto que <strong>atrai clientes</strong>. Tem preço competitivo e margem reduzida
                  (10-20%), mas gera <strong>tráfego e volume</strong>.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                  <ArrowDown className="w-3 h-3 text-warning" />
                  <span className="text-warning font-medium">Margem menor</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <ArrowUp className="w-3 h-3 text-primary" />
                  <span className="text-primary font-medium">Volume maior</span>
                </div>
              </div>

              {/* Premium */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">⭐ Produto Premium</h4>
                    <p className="text-[10px] text-muted-foreground">Margem maior, valor percebido</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  É o produto que <strong>gera lucro real</strong>. Tem margem alta (40-60%+) por agregar
                  mais valor: personalização, ingredientes especiais, apresentação diferenciada.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                  <ArrowUp className="w-3 h-3 text-primary" />
                  <span className="text-primary font-medium">Margem maior</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <ArrowDown className="w-3 h-3 text-warning" />
                  <span className="text-warning font-medium">Volume menor</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                <strong>Na prática:</strong> use o simulador acima para testar cada produto.
                Garanta que a <strong>margem média ponderada</strong> do seu mix de produtos
                seja suficiente para cobrir todos os custos fixos + lucro desejado.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function DRERow({
  label,
  value,
  percent,
  isTotal,
  highlight,
}: {
  label: string;
  value: number;
  percent?: number;
  isTotal?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`px-4 py-2.5 flex items-center justify-between ${highlight ? "bg-muted/30" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${isTotal ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
        {percent !== undefined && (
          <span className="text-[10px] text-muted-foreground">({percent}%)</span>
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          isTotal ? "text-foreground font-semibold" : value < 0 ? "text-destructive" : "text-foreground"
        }`}
      >
        R$ {Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}

function HealthBadge({ level, percent }: { level: string; percent: number }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: "bg-primary/20", text: "text-primary", label: "Excelente" },
    good: { bg: "bg-primary/15", text: "text-primary", label: "Saudável" },
    attention: { bg: "bg-warning/20", text: "text-warning", label: "Atenção" },
    danger: { bg: "bg-destructive/20", text: "text-destructive", label: "Perigo" },
  };
  const c = config[level] || config.danger;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label} ({percent.toFixed(1)}%)
    </span>
  );
}
