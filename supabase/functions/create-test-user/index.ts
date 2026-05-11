import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // List users with email teste@teste.com
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      console.error("List users error:", usersError);
    }

    const testUsers = users?.users?.filter((u: any) => u.email?.includes("teste")) || [];

    // Try to create user again with full error details
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "teste@teste.com",
      password: "Teste@123",
      email_confirm: true,
    });

    return new Response(
      JSON.stringify({
        existingTestUsers: testUsers.map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at })),
        createResult: { newUser, createError },
      }, null, 2),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Caught error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
