import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Receipt,
  Package,
  BarChart3,
  ChefHat,
  Warehouse,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Store,
  CheckCircle2,
} from "lucide-react";

interface OnboardingFlowProps {
  userName: string;
  onComplete: (data: {
    nome_empresa: string;
    tipo_negocio: string;
    tempo_atuacao: string;
  }) => void;
}

const TIPOS_NEGOCIO = [
  { value: "doces_bolos", label: "Doces e Bolos", emoji: "🎂" },
  { value: "salgados", label: "Salgados", emoji: "🥟" },
  { value: "marmitas", label: "Marmitas", emoji: "🍱" },
  { value: "artesanato", label: "Artesanato", emoji: "🧶" },
  { value: "cosmeticos", label: "Cosméticos", emoji: "💄" },
  { value: "roupas", label: "Roupas e Acessórios", emoji: "👗" },
  { value: "bebidas", label: "Bebidas", emoji: "🧃" },
  { value: "outro", label: "Outro", emoji: "📦" },
];

const TEMPOS_ATUACAO = [
  { value: "iniciando", label: "Estou começando agora" },
  { value: "menos_1ano", label: "Menos de 1 ano" },
  { value: "1_3anos", label: "De 1 a 3 anos" },
  { value: "mais_3anos", label: "Mais de 3 anos" },
];

const TOUR_ITEMS = [
  {
    icon: ShoppingCart,
    title: "Compras",
    desc: "Registre tudo o que comprou para produzir",
    color: "text-primary",
  },
  {
    icon: Receipt,
    title: "Vendas",
    desc: "Anote cada venda feita — com cliente e produto",
    color: "text-primary",
  },
  {
    icon: Package,
    title: "Produtos",
    desc: "Cadastre seus produtos com preço e variações",
    color: "text-primary",
  },
  {
    icon: ChefHat,
    title: "Receitas",
    desc: "Monte suas receitas com ingredientes e custos",
    color: "text-primary",
  },
  {
    icon: Warehouse,
    title: "Estoque",
    desc: "Acompanhe o que tem disponível para vender",
    color: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Resultados",
    desc: "Veja quanto está ganhando de verdade",
    color: "text-primary",
  },
];

export function OnboardingFlow({ userName, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState("");
  const [tempoAtuacao, setTempoAtuacao] = useState("");

  const [direction, setDirection] = useState(1);

  const firstName = userName?.split(" ")[0] || "Empreendedor(a)";
  const totalSteps = 4;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const canAdvance = () => {
    if (step === 1) return nomeEmpresa.trim().length > 0 && tipoNegocio && tempoAtuacao;
    return true;
  };

  const handleFinish = () => {
    onComplete({
      nome_empresa: nomeEmpresa.trim(),
      tipo_negocio: tipoNegocio,
      tempo_atuacao: tempoAtuacao,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
              animate={{ scaleX: i <= step ? 1 : 1 }}
              transition={{ duration: 0.3 }}
              layout
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-center space-y-6"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Olá, {firstName}! 👋
                </h1>
                <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                  Que bom ter você aqui! Vou te ajudar a organizar seu negócio em poucos minutos.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full text-base gap-2"
                onClick={() => goTo(1)}
              >
                Vamos começar <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Business Data */}
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                >
                  <Store className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Me conta sobre seu negócio
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Isso nos ajuda a personalizar a ferramenta pra você
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-empresa">Como seu negócio se chama?</Label>
                  <Input
                    id="nome-empresa"
                    placeholder="Ex: Doces da Maria, Ateliê das Flores..."
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>O que você vende?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_NEGOCIO.map((tipo, i) => (
                      <motion.button
                        key={tipo.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        onClick={() => setTipoNegocio(tipo.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-colors ${
                          tipoNegocio === tipo.value
                            ? "border-primary bg-accent text-accent-foreground font-medium"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="text-lg">{tipo.emoji}</span>
                        {tipo.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Há quanto tempo você empreende?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPOS_ATUACAO.map((tempo, i) => (
                      <motion.button
                        key={tempo.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + 0.05 * i }}
                        onClick={() => setTempoAtuacao(tempo.value)}
                        className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                          tempoAtuacao === tempo.value
                            ? "border-primary bg-accent text-accent-foreground font-medium"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        {tempo.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => goTo(0)} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => goTo(2)}
                  disabled={!canAdvance()}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tour */}
          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Conheça suas ferramentas
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Tudo que você precisa para controlar seu negócio
                </p>
              </div>

              <div className="space-y-2">
                {TOUR_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.3 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => goTo(1)} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button className="flex-1 gap-2" onClick={() => goTo(3)}>
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Finish */}
          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-center space-y-6"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Tudo pronto! 🎉
                </h2>
                <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                  Seu espaço está configurado. Para começar, que tal cadastrar seu primeiro produto ou registrar uma venda?
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full text-base gap-2"
                  onClick={handleFinish}
                >
                  <Sparkles className="w-4 h-4" /> Entrar no RXFin
                </Button>
                <p className="text-xs text-muted-foreground">
                  Você pode explorar todas as funcionalidades no menu lateral
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
