import { useState } from "react";
import {
  BookOpen,
  ShoppingCart,
  Receipt,
  Package,
  ChefHat,
  Users,
  Warehouse,
  Target,
  BarChart3,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  DollarSign,
  TrendingUp,
  Calculator,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: any;
  items: { title: string; content: string }[];
}

const sections: Section[] = [
  {
    id: "inicio",
    title: "Primeiros Passos",
    icon: Lightbulb,
    items: [
      {
        title: "Como começar?",
        content:
          "O sistema funciona em 4 etapas:\n\n1. **Cadastre seus insumos** registrando compras (aba Compra)\n2. **Crie receitas** vinculando ingredientes e quantidades\n3. **Cadastre produtos** vinculando à receita correspondente\n4. **Registre vendas** selecionando produto e cliente\n\nIsso permite calcular automaticamente o CMV (Custo de Mercadoria Vendida), margem de lucro, estoque e muito mais.",
      },
      {
        title: "Ordem recomendada de cadastro",
        content:
          "Para aproveitar ao máximo a ferramenta, siga esta ordem:\n\n1. **Compras** → registre as compras de ingredientes\n2. **Receitas** → crie receitas com os ingredientes comprados\n3. **Produtos** → cadastre produtos vinculando a uma receita\n4. **Clientes (CRM)** → cadastre seus clientes\n5. **Vendas** → registre as vendas\n\nAssim todos os relatórios e cálculos funcionarão corretamente.",
      },
    ],
  },
  {
    id: "compras",
    title: "Compras (Entradas)",
    icon: ShoppingCart,
    items: [
      {
        title: "O que registrar?",
        content:
          "Registre todas as compras de **insumos e matérias-primas**. Cada compra deve conter:\n\n- **Insumo**: nome do ingrediente ou material\n- **Quantidade**: quanto comprou\n- **Unidade**: kg, litro, unidade, etc.\n- **Data**: quando foi a compra\n- **Valor**: quanto pagou no total\n\nO sistema calcula automaticamente o **custo médio** de cada insumo.",
      },
      {
        title: "Por que registrar compras?",
        content:
          "As compras alimentam 3 cálculos essenciais:\n\n- **Custo médio por insumo** → usado nas receitas\n- **Estoque virtual** → controle de quanto você tem\n- **CMV (Custo de Mercadoria Vendida)** → quanto custa produzir cada produto",
      },
    ],
  },
  {
    id: "vendas",
    title: "Vendas (Saídas)",
    icon: Receipt,
    items: [
      {
        title: "Registrando uma venda",
        content:
          "Para cada venda, informe:\n\n- **Cliente**: nome ou selecione do CRM\n- **Produto**: qual produto foi vendido\n- **Tamanho/Variação**: se houver\n- **Embalagem**: tipo de embalagem\n- **Frete**: valor do frete (se houver)\n- **Forma de pagamento**: PIX, cartão, etc.\n- **Valor da venda**: preço cobrado",
      },
      {
        title: "Impacto nos relatórios",
        content:
          "Cada venda registrada:\n\n- Atualiza o **faturamento** nos relatórios\n- Desconta insumos do **estoque virtual** (via receita)\n- Alimenta o **histórico do cliente** no CRM\n- Contribui para as **projeções de vendas**",
      },
    ],
  },
  {
    id: "produtos",
    title: "Produtos",
    icon: Package,
    items: [
      {
        title: "Cadastrando produtos",
        content:
          "Um produto é o que você vende ao cliente. Ele pode ter:\n\n- **Nome e descrição**\n- **Preço de venda**\n- **Variações** (tamanhos diferentes com preços diferentes)\n- **Receita vinculada** (essencial para calcular o CMV)\n- **Foto**\n\n⚠️ **Importante**: sem receita vinculada, o sistema não consegue calcular custos e margens.",
      },
      {
        title: "Variações de produto",
        content:
          "Se um produto tem diferentes tamanhos (ex: P, M, G), cadastre variações com preços específicos para cada tamanho. Isso permite controlar faturamento por variação.",
      },
    ],
  },
  {
    id: "receitas",
    title: "Receitas",
    icon: ChefHat,
    items: [
      {
        title: "O que é uma receita?",
        content:
          "A receita é a **ficha técnica** do seu produto. Ela define:\n\n- **Ingredientes**: quais insumos são usados\n- **Quantidades**: quanto de cada insumo por receita\n- **Rendimento**: quantas unidades a receita produz\n- **Modo de preparo**: passo a passo (opcional)\n\nO sistema calcula o custo da receita usando o **custo médio** das compras registradas.",
      },
      {
        title: "Rendimento",
        content:
          "O rendimento define quantas unidades do produto a receita produz. Exemplo:\n\n- Receita de bolo rende **1 bolo** → rendimento = 1\n- Receita de brigadeiro rende **50 unidades** → rendimento = 50\n\nO custo por unidade = custo total da receita ÷ rendimento.",
      },
    ],
  },
  {
    id: "crm",
    title: "CRM (Clientes)",
    icon: Users,
    items: [
      {
        title: "Gestão de clientes",
        content:
          "O CRM permite:\n\n- **Cadastrar clientes** com nome, telefone, email\n- **Visualizar histórico** de compras de cada cliente\n- **Total gasto** por cliente\n- **Buscar** por nome, telefone ou email\n\nClientes cadastrados aparecem automaticamente no formulário de venda.",
      },
    ],
  },
  {
    id: "estoque",
    title: "Estoque",
    icon: Warehouse,
    items: [
      {
        title: "Estoque Virtual",
        content:
          "O estoque é calculado automaticamente:\n\n**Estoque = Total Comprado − Total Consumido**\n\nO consumo é calculado pelas vendas × ingredientes das receitas. Exemplo: se você vendeu 10 bolos e cada bolo usa 500g de farinha, o sistema desconta 5kg de farinha do estoque.",
      },
      {
        title: "Sugestão de Pedido",
        content:
          "O sistema sugere quanto comprar baseado em:\n\n- **Consumo médio diário** dos últimos 30 dias\n- **Dias de estoque desejado** (parametrizável)\n- **Custo estimado** baseado no custo médio de compras\n\nIsso ajuda a manter o estoque ideal sem faltar nem sobrar.",
      },
      {
        title: "Revisão de Inventário",
        content:
          "A revisão compara o **estoque virtual** (calculado) com o **estoque físico** (contado). Isso identifica:\n\n- **Perdas** (estoque real menor que virtual)\n- **Sobras** (estoque real maior que virtual)\n- **Divergências** que precisam investigação\n\nFaça revisões periodicamente para manter a acurácia do sistema.",
      },
    ],
  },
  {
    id: "planejamento",
    title: "Planejamento de Vendas",
    icon: Target,
    items: [
      {
        title: "Histórico e Projeção",
        content:
          "O planejamento consolida todo o histórico de vendas e projeta os próximos 3 meses baseado na média recente. Use para:\n\n- Identificar **tendências** de vendas\n- Planejar **compras futuras**\n- Definir **metas** de faturamento",
      },
      {
        title: "Simulador de Elasticidade de Preço",
        content:
          "O simulador ajuda a entender o impacto de mudanças de preço:\n\n- **Preços de concorrentes**: cadastre 2-3 para ter referência\n- **Variação de preço**: simule aumentos ou reduções\n- **Coeficiente de elasticidade**: define quanto a demanda reage ao preço\n\nExemplo: com elasticidade 1.5, se você aumentar o preço em 10%, espera-se uma queda de 15% nas vendas.",
      },
      {
        title: "O que é Elasticidade de Preço?",
        content:
          "A **elasticidade-preço da demanda** mede a sensibilidade dos clientes a mudanças de preço:\n\n- **< 1.0 (Inelástico)**: clientes pouco sensíveis ao preço. Ex: produtos essenciais, sem concorrentes diretos\n- **= 1.0 (Unitário)**: variação proporcional\n- **> 1.0 (Elástico)**: clientes muito sensíveis. Ex: mercado competitivo, muitas alternativas\n\n⚠️ O preço **nunca deve ficar abaixo do CMV** (Custo de Mercadoria Vendida), senão cada venda gera prejuízo.",
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios (Admin)",
    icon: BarChart3,
    items: [
      {
        title: "Visão geral",
        content:
          "O painel administrativo mostra:\n\n- **Faturamento total** no período\n- **Quantidade de vendas**\n- **Custo estimado** (baseado em receitas)\n- **Lucro estimado**",
      },
      {
        title: "Relatórios disponíveis",
        content:
          "1. **Vendas** → gráfico diário + produtos vendidos\n2. **Receita por Produto** → faturamento por produto\n3. **Margem por Produto** → custo vs preço, margem unitária e total\n4. **Custos** → custo de produção por receita\n5. **Compras** → custo médio por ingrediente\n\nTodos com filtro por período (data início/fim).",
      },
    ],
  },
  {
    id: "conceitos",
    title: "Conceitos Financeiros",
    icon: DollarSign,
    items: [
      {
        title: "CMV (Custo de Mercadoria Vendida)",
        content:
          "O CMV é quanto custa **produzir** uma unidade do seu produto. Inclui:\n\n- Custo dos ingredientes (calculado pelo custo médio das compras)\n- Dividido pelo rendimento da receita\n\n**Exemplo**: Se a receita custa R$ 50 e rende 10 unidades, o CMV = R$ 5,00 por unidade.\n\nO CMV é a base para definir preços e calcular lucro.",
      },
      {
        title: "Margem de Contribuição",
        content:
          "**Margem = Preço de Venda − CMV**\n\nPode ser expressa em reais (margem absoluta) ou em porcentagem:\n\n**Margem % = (Preço − CMV) ÷ Preço × 100**\n\nExemplo: Preço R$ 15, CMV R$ 5\n- Margem absoluta = R$ 10\n- Margem % = 66,7%\n\nMargens saudáveis para alimentos geralmente ficam entre 60-70%.",
      },
      {
        title: "Custo Médio",
        content:
          "O custo médio pondera todas as compras de um insumo:\n\n**Custo Médio = Total Gasto ÷ Total Comprado**\n\nExemplo: Comprou 5kg por R$ 25 e depois 10kg por R$ 40\n- Total gasto: R$ 65\n- Total comprado: 15kg\n- Custo médio: R$ 4,33/kg\n\nIsso suaviza flutuações de preço entre compras.",
      },
      {
        title: "Ponto de Equilíbrio",
        content:
          "O ponto de equilíbrio é a quantidade de vendas necessária para cobrir todos os custos:\n\n**PE = Custos Fixos ÷ Margem por Unidade**\n\nAbaixo do PE, você opera com prejuízo. Acima, começa a ter lucro. Use os relatórios de margem para entender quanto precisa vender.",
      },
    ],
  },
  {
    id: "config",
    title: "Configurações",
    icon: FileSpreadsheet,
    items: [
      {
        title: "Integração Google Sheets",
        content:
          "O sistema pode enviar dados automaticamente para uma planilha do Google Sheets. Para ativar:\n\n1. Acesse a aba **Config**\n2. Configure a URL do webhook\n3. Teste a conexão\n\nQuando ativa, todas as compras e vendas são registradas simultaneamente no banco de dados e na planilha.",
      },
    ],
  },
];

export function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("inicio");
  const [expandedItem, setExpandedItem] = useState<string | null>("Como começar?");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    setExpandedItem(null);
  };

  const toggleItem = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-accent">
          <BookOpen className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Documentação & Treinamento
          </h2>
          <p className="text-sm text-muted-foreground">Aprenda a usar cada recurso da ferramenta</p>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground flex-1">
                  {section.title}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border">
                  {section.items.map((item) => {
                    const isItemOpen = expandedItem === item.title;
                    return (
                      <div key={item.title} className="border-b border-border last:border-b-0">
                        <button
                          onClick={() => toggleItem(item.title)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
                        >
                          <ArrowRight
                            className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${
                              isItemOpen ? "rotate-90" : ""
                            }`}
                          />
                          <span className="text-sm font-medium text-foreground">{item.title}</span>
                        </button>
                        {isItemOpen && (
                          <div className="px-4 pb-4 pl-9">
                            <div className="prose-sm text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {item.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                                if (part.startsWith("**") && part.endsWith("**")) {
                                  return (
                                    <span key={i} className="font-semibold text-foreground">
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return <span key={i}>{part}</span>;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
