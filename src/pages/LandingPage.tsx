import { useNavigate } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import {
  ShoppingCart, ChefHat, BarChart3, Users, Package, TrendingUp,
  Star, ArrowRight, CheckCircle2, Sparkles, Shield, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/planFeatures";
import logo from "@/assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as Easing },
  }),
};

const BENEFITS = [
  { icon: ShoppingCart, title: "Compras e Vendas", desc: "Registre entradas e saídas com agilidade e tenha o fluxo de caixa na palma da mão." },
  { icon: ChefHat, title: "Receitas e Custos", desc: "Monte fichas técnicas, calcule custos e defina preços de venda com precisão." },
  { icon: Package, title: "Estoque Inteligente", desc: "Controle de insumos em tempo real com alertas de nível baixo." },
  { icon: BarChart3, title: "Relatórios Visuais", desc: "Dashboards e gráficos que mostram a saúde financeira do seu negócio." },
  { icon: Users, title: "CRM de Clientes", desc: "Gestão de clientes, encomendas e histórico completo de vendas." },
  { icon: TrendingUp, title: "Planejamento", desc: "Metas de venda, análise de concorrência e ferramentas de marketing." },
];

const TESTIMONIALS = [
  { name: "Maria Silva", role: "Confeiteira", quote: "Antes eu anotava tudo em caderno. Com o RXFin, consegui entender minha margem de lucro real e aumentar meu faturamento em 40%.", avatar: "MS" },
  { name: "João Mendes", role: "Dono de Food Truck", quote: "O controle de estoque e as fichas técnicas são incríveis. Nunca mais tive desperdício de insumos.", avatar: "JM" },
  { name: "Ana Oliveira", role: "Cake Designer", quote: "A vitrine online me trouxe clientes novos toda semana. Recomendo demais para quem trabalha com encomendas!", avatar: "AO" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img src={logo} alt="RXFin" className="h-8" />
            <span className="font-display font-bold text-lg text-foreground">RXFin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate("/auth?mode=signup")}>
              Criar conta grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Gestão financeira simplificada
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight tracking-tight"
          >
            Controle seu negócio{" "}
            <span className="text-primary">com confiança</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            O sistema completo para quem produz e vende: compras, vendas, receitas, estoque, clientes e relatórios — tudo em um só lugar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" className="gap-2 text-base px-8" onClick={() => navigate("/auth?mode=signup")}>
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" onClick={() => document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" })}>
              Conhecer recursos
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Dados seguros</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Setup em 2 min</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Plano grátis</span>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Tudo que você precisa para crescer</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Do registro de compras até a análise de concorrência — ferramentas pensadas para micro e pequenos produtores.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <b.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Quem usa, aprova</h2>
            <p className="mt-3 text-muted-foreground">Veja o que nossos usuários dizem sobre o RXFin.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Planos para cada fase</h2>
            <p className="mt-3 text-muted-foreground">Comece grátis e evolua conforme cresce.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className={`rounded-xl border p-6 space-y-5 ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  {plan.id === "free" ? "Começar grátis" : "Escolher plano"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/30 p-10 md:p-14"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold">
            Pronto para organizar seu negócio?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Crie sua conta em segundos e comece a ter controle real sobre suas finanças. É grátis para começar.
          </p>
          <Button size="lg" className="mt-8 gap-2 text-base px-10" onClick={() => navigate("/auth?mode=signup")}>
            Criar minha conta <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="RXFin" className="h-6" />
            <span className="font-semibold text-foreground">RXFin</span>
          </div>
          <div className="flex gap-6">
            <a href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="/termos" className="hover:text-foreground transition-colors">Privacidade</a>
          </div>
          <p>© {new Date().getFullYear()} RXFin. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
