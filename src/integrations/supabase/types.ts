export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      compras: {
        Row: {
          created_at: string
          data_compra: string
          id: string
          insumo_nome: string
          quantidade: number
          unidade: string | null
          user_id: string | null
          valor_compra: number
        }
        Insert: {
          created_at?: string
          data_compra?: string
          id?: string
          insumo_nome: string
          quantidade?: number
          unidade?: string | null
          user_id?: string | null
          valor_compra?: number
        }
        Update: {
          created_at?: string
          data_compra?: string
          id?: string
          insumo_nome?: string
          quantidade?: number
          unidade?: string | null
          user_id?: string | null
          valor_compra?: number
        }
        Relationships: []
      }
      concorrente_precos: {
        Row: {
          concorrente_id: string
          created_at: string
          id: string
          peso_quantidade: number
          preco: number
          produto_nome: string
          unidade: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          concorrente_id: string
          created_at?: string
          id?: string
          peso_quantidade?: number
          preco?: number
          produto_nome: string
          unidade?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          concorrente_id?: string
          created_at?: string
          id?: string
          peso_quantidade?: number
          preco?: number
          produto_nome?: string
          unidade?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concorrente_precos_concorrente_id_fkey"
            columns: ["concorrente_id"]
            isOneToOne: false
            referencedRelation: "concorrentes"
            referencedColumns: ["id"]
          },
        ]
      }
      concorrentes: {
        Row: {
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contas: {
        Row: {
          categoria: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["conta_status"]
          tipo: Database["public"]["Enums"]["conta_tipo"]
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["conta_status"]
          tipo: Database["public"]["Enums"]["conta_tipo"]
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["conta_status"]
          tipo?: Database["public"]["Enums"]["conta_tipo"]
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      despesas_fixas: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      inventario_revisoes: {
        Row: {
          created_at: string
          data_revisao: string
          diferenca: number
          id: string
          insumo_nome: string
          observacao: string | null
          quantidade_contada: number
          quantidade_sistema: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_revisao?: string
          diferenca?: number
          id?: string
          insumo_nome: string
          observacao?: string | null
          quantidade_contada?: number
          quantidade_sistema?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_revisao?: string
          diferenca?: number
          id?: string
          insumo_nome?: string
          observacao?: string | null
          quantidade_contada?: number
          quantidade_sistema?: number
          user_id?: string | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string
          created_at: string
          data_entrega: string
          data_pedido: string
          descricao: string | null
          id: string
          observacoes: string | null
          produto: string
          quantidade: number
          status: Database["public"]["Enums"]["pedido_status"]
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome: string
          created_at?: string
          data_entrega: string
          data_pedido?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto: string
          quantidade?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string
          created_at?: string
          data_entrega?: string
          data_pedido?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto?: string
          quantidade?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      producao: {
        Row: {
          created_at: string
          data_producao: string
          id: string
          observacao: string | null
          produto_id: string
          produto_nome: string
          quantidade: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_producao?: string
          id?: string
          observacao?: string | null
          produto_id: string
          produto_nome: string
          quantidade?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_producao?: string
          id?: string
          observacao?: string | null
          produto_id?: string
          produto_nome?: string
          quantidade?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_variacoes: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          preco_venda: number
          produto_id: string
          tamanho: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          preco_venda?: number
          produto_id: string
          tamanho: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          preco_venda?: number
          produto_id?: string
          tamanho?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produto_variacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          nome: string
          peso_quantidade: number
          preco_venda: number
          receita_id: string | null
          tamanho: string | null
          unidade: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          peso_quantidade?: number
          preco_venda?: number
          receita_id?: string | null
          tamanho?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          peso_quantidade?: number
          preco_venda?: number
          receita_id?: string | null
          tamanho?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          nome_empresa: string | null
          plano: Database["public"]["Enums"]["account_plan"]
          telefone: string | null
          tipo_conta: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          nome_empresa?: string | null
          plano?: Database["public"]["Enums"]["account_plan"]
          telefone?: string | null
          tipo_conta?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          nome_empresa?: string | null
          plano?: Database["public"]["Enums"]["account_plan"]
          telefone?: string | null
          tipo_conta?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receita_ingredientes: {
        Row: {
          created_at: string
          custo_unitario: number | null
          id: string
          insumo_nome: string
          quantidade: number
          receita_id: string
          unidade: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          insumo_nome: string
          quantidade?: number
          receita_id: string
          unidade?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          insumo_nome?: string
          quantidade?: number
          receita_id?: string
          unidade?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receita_ingredientes_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          modo_preparo: string | null
          nome: string
          produto_id: string | null
          rendimento: number | null
          unidade_rendimento: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          modo_preparo?: string | null
          nome: string
          produto_id?: string | null
          rendimento?: number | null
          unidade_rendimento?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          modo_preparo?: string | null
          nome?: string
          produto_id?: string | null
          rendimento?: number | null
          unidade_rendimento?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receitas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente: string
          cliente_id: string | null
          created_at: string
          data_venda: string
          embalagem: string | null
          forma_pagamento: string | null
          id: string
          produto: string
          tamanho: string | null
          telefone_cliente: string | null
          user_id: string | null
          valor_frete: number | null
          valor_venda: number
        }
        Insert: {
          cliente: string
          cliente_id?: string | null
          created_at?: string
          data_venda?: string
          embalagem?: string | null
          forma_pagamento?: string | null
          id?: string
          produto: string
          tamanho?: string | null
          telefone_cliente?: string | null
          user_id?: string | null
          valor_frete?: number | null
          valor_venda?: number
        }
        Update: {
          cliente?: string
          cliente_id?: string | null
          created_at?: string
          data_venda?: string
          embalagem?: string | null
          forma_pagamento?: string | null
          id?: string
          produto?: string
          tamanho?: string | null
          telefone_cliente?: string | null
          user_id?: string | null
          valor_frete?: number | null
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_plan: "free" | "pro" | "premium"
      account_type: "pessoa_fisica" | "pessoa_juridica"
      app_role: "admin" | "user"
      conta_status: "pendente" | "pago" | "atrasado"
      conta_tipo: "pagar" | "receber"
      pedido_status:
        | "pendente"
        | "em_producao"
        | "pronto"
        | "entregue"
        | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_plan: ["free", "pro", "premium"],
      account_type: ["pessoa_fisica", "pessoa_juridica"],
      app_role: ["admin", "user"],
      conta_status: ["pendente", "pago", "atrasado"],
      conta_tipo: ["pagar", "receber"],
      pedido_status: [
        "pendente",
        "em_producao",
        "pronto",
        "entregue",
        "cancelado",
      ],
    },
  },
} as const
