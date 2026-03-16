import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface PaymentGatewayConfig {
  id: string;
  gateway: string;
  ativo: boolean;
  credenciais: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type GatewayId = "mercado_pago" | "stripe" | "pix" | "pagseguro" | "stone";

export interface GatewayMeta {
  id: GatewayId;
  nome: string;
  descricao: string;
  cor: string;
  campos: { key: string; label: string; placeholder: string; secret?: boolean }[];
  docsUrl: string;
  instrucoes: string[];
}

export const GATEWAYS: GatewayMeta[] = [
  {
    id: "mercado_pago",
    nome: "Mercado Pago",
    descricao: "Pix, cartão, boleto e link de pagamento",
    cor: "#009ee3",
    campos: [
      { key: "access_token", label: "Access Token", placeholder: "APP_USR-...", secret: true },
    ],
    docsUrl: "https://www.mercadopago.com.br/developers/panel/app",
    instrucoes: [
      "Acesse o painel de desenvolvedores do Mercado Pago",
      "Crie ou selecione um aplicativo",
      "Vá em Credenciais de produção",
      "Copie o Access Token",
    ],
  },
  {
    id: "stripe",
    nome: "Stripe",
    descricao: "Cartões internacionais, Apple Pay, Google Pay",
    cor: "#635bff",
    campos: [
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", secret: true },
      { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
    ],
    docsUrl: "https://dashboard.stripe.com/apikeys",
    instrucoes: [
      "Acesse o dashboard do Stripe",
      "Vá em Developers → API keys",
      "Copie a Secret Key e a Publishable Key",
    ],
  },
  {
    id: "pix",
    nome: "PIX Direto",
    descricao: "QR Code PIX sem intermediário",
    cor: "#32bcad",
    campos: [
      { key: "chave_pix", label: "Chave PIX", placeholder: "CPF, CNPJ, email ou telefone" },
      { key: "nome_beneficiario", label: "Nome do Beneficiário", placeholder: "Seu nome ou razão social" },
      { key: "cidade_beneficiario", label: "Cidade", placeholder: "São Paulo" },
    ],
    docsUrl: "",
    instrucoes: [
      "Informe sua chave PIX (CPF, CNPJ, email ou telefone)",
      "Preencha o nome do beneficiário",
      "Um QR Code será gerado automaticamente para cada venda",
    ],
  },
  {
    id: "pagseguro",
    nome: "PagSeguro",
    descricao: "Checkout transparente brasileiro",
    cor: "#41b23b",
    campos: [
      { key: "token", label: "Token", placeholder: "Token de produção", secret: true },
      { key: "email", label: "Email da conta", placeholder: "seu@email.com" },
    ],
    docsUrl: "https://dev.pagseguro.uol.com.br/reference/charge-create",
    instrucoes: [
      "Acesse o painel do PagSeguro",
      "Vá em Integrações → Chaves de API",
      "Copie o Token de produção",
    ],
  },
  {
    id: "stone",
    nome: "Stone",
    descricao: "Maquininhas e pagamentos online",
    cor: "#00a868",
    campos: [
      { key: "stone_code", label: "Stone Code", placeholder: "Código da Stone" },
      { key: "api_key", label: "API Key", placeholder: "Chave de API", secret: true },
    ],
    docsUrl: "https://docs.stone.com.br/",
    instrucoes: [
      "Acesse o portal de desenvolvedores da Stone",
      "Copie seu Stone Code e API Key",
      "Use as credenciais de produção",
    ],
  },
];

export function usePaymentGateways() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      console.error("Erro ao carregar gateways:", error);
    } else {
      setConfigs((data || []) as unknown as PaymentGatewayConfig[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const saveGateway = async (
    gatewayId: string,
    ativo: boolean,
    credenciais: Record<string, string>
  ) => {
    if (!user) return;
    const existing = configs.find((c) => c.gateway === gatewayId);
    if (existing) {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ ativo, credenciais } as any)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("payment_gateways")
        .insert({ user_id: user.id, gateway: gatewayId, ativo, credenciais } as any);
      if (error) throw error;
    }
    await fetchConfigs();
  };

  const toggleGateway = async (gatewayId: string, ativo: boolean) => {
    const existing = configs.find((c) => c.gateway === gatewayId);
    if (existing) {
      const { error } = await supabase
        .from("payment_gateways")
        .update({ ativo } as any)
        .eq("id", existing.id);
      if (error) throw error;
      await fetchConfigs();
    }
  };

  const getConfig = (gatewayId: string) => configs.find((c) => c.gateway === gatewayId);
  const getActiveGateways = () => configs.filter((c) => c.ativo);

  return { configs, isLoading, saveGateway, toggleGateway, getConfig, getActiveGateways, refetch: fetchConfigs };
}
