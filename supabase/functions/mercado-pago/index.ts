import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Mercado Pago não configurado. Adicione o Access Token nas configurações." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...params } = await req.json();

    if (action === "check") {
      // Verify token is valid
      const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Token inválido ou expirado", valid: false }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ valid: true, message: "Conexão com Mercado Pago ativa" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_preference") {
      const { title, quantity, unit_price, description, payer_email } = params;

      const body: any = {
        items: [
          {
            title: title || "Venda",
            quantity: quantity || 1,
            unit_price: Number(unit_price),
            currency_id: "BRL",
            description: description || "",
          },
        ],
        auto_return: "approved",
        back_urls: {
          success: params.success_url || "https://example.com/success",
          failure: params.failure_url || "https://example.com/failure",
          pending: params.pending_url || "https://example.com/pending",
        },
      };

      if (payer_email) {
        body.payer = { email: payer_email };
      }

      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Mercado Pago error:", res.status, errText);
        return new Response(
          JSON.stringify({ error: `Erro do Mercado Pago [${res.status}]: ${errText}` }),
          { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await res.json();
      return new Response(
        JSON.stringify({
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check_payment") {
      const { payment_id } = params;
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Pagamento não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const data = await res.json();
      return new Response(
        JSON.stringify({
          id: data.id,
          status: data.status,
          status_detail: data.status_detail,
          transaction_amount: data.transaction_amount,
          date_approved: data.date_approved,
          payment_method_id: data.payment_method_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("mercado-pago error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
