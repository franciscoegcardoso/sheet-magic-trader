import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { products } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um consultor de negócios especializado em precificação e posicionamento estratégico para pequenos empreendedores brasileiros (confeiteiros, artesãos, produtores caseiros).

Analise os dados de comparação de preços com concorrentes e forneça insights claros e acionáveis. Use linguagem simples, sem jargões técnicos.

Responda SEMPRE em português brasileiro e em formato markdown com:
1. **Resumo Geral** - Uma visão rápida da posição competitiva
2. **Seus Pontos Fortes** - Onde você está bem posicionado
3. **Oportunidades** - Onde pode melhorar ou ajustar preços
4. **Sugestões Práticas** - 3 a 5 ações concretas que o empreendedor pode tomar agora

Considere:
- Preços normalizados por unidade/peso para comparação justa
- Se o preço está muito abaixo pode indicar que está perdendo dinheiro
- Se está muito acima pode indicar oportunidade de diferenciação ou necessidade de ajuste
- O mix de produtos e quais são os "carros-chefe"`;

    const userPrompt = `Aqui estão os dados de comparação dos meus produtos com os concorrentes:

${JSON.stringify(products, null, 2)}

Para cada produto, os preços foram normalizados para a mesma unidade de medida para comparação justa.

Por favor, analise e me dê insights de posicionamento estratégico.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar insights." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar insights" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Não foi possível gerar insights.";

    return new Response(JSON.stringify({ insights: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("competitor-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
