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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { productName, productDescription, logoUrl, productPhotoUrl } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: "Nome do produto é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a rich prompt for marketing image generation
    const promptParts = [
      `Create a professional, eye-catching marketing promotional image for the product "${productName}".`,
      productDescription ? `Product description: "${productDescription}".` : "",
      "The image should be vibrant, modern, and suitable for WhatsApp/Instagram marketing.",
      "Include attractive typography with the product name prominently displayed.",
      "Use professional lighting and composition. Make it look like a high-end advertisement.",
      "Do NOT include any human faces. Focus on the product presentation.",
      "The style should be clean, modern, commercial photography aesthetic.",
    ];

    const content: any[] = [
      { type: "text", text: promptParts.filter(Boolean).join(" ") },
    ];

    // If logo is provided, include it
    if (logoUrl) {
      content.push({
        type: "image_url",
        image_url: { url: logoUrl },
      });
      content[0].text += " Incorporate the brand logo naturally into the design.";
    }

    // If product photo is provided, include it
    if (productPhotoUrl) {
      content.push({
        type: "image_url",
        image_url: { url: productPhotoUrl },
      });
      content[0].text += " Use this product photo as the main visual element, enhancing it with professional styling.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || "";

    if (!imageData) {
      throw new Error("Nenhuma imagem foi gerada pela IA");
    }

    // Upload the generated image to storage
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const filePath = `ai-generated/${Date.now()}.png`;

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: uploadError } = await supabase.storage
      .from("marketing")
      .upload(filePath, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Erro ao salvar imagem gerada");
    }

    const { data: urlData } = supabase.storage.from("marketing").getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        imageUrl: urlData.publicUrl,
        message: textResponse,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("generate-marketing-image error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
