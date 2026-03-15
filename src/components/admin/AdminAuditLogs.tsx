import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Filter, Clock, User, Database, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  INSERT: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-400",
};

const actionLabels: Record<string, string> = {
  INSERT: "Criação",
  UPDATE: "Edição",
  DELETE: "Exclusão",
};

const tableLabels: Record<string, string> = {
  produtos: "Produtos",
  vendas: "Vendas",
  compras: "Compras",
  pedidos: "Pedidos",
  clientes: "Clientes",
  contas: "Contas",
  despesas_fixas: "Despesas Fixas",
  receitas: "Receitas",
  receita_ingredientes: "Ingredientes",
  producao: "Produção",
  concorrentes: "Concorrentes",
  concorrente_precos: "Preços Concorrentes",
  inventario_revisoes: "Inventário",
  produto_variacoes: "Variações",
  profiles: "Perfis",
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchLogs = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterTable) query = query.eq("table_name", filterTable);
    if (filterAction) query = query.eq("action", filterAction);
    if (search) query = query.ilike("user_email", `%${search}%`);

    const { data } = await query;
    setLogs((data as unknown as AuditLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterTable, filterAction, search]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tables = Object.keys(tableLabels);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent">
          <Clock className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Logs de Auditoria</h2>
          <p className="text-sm text-muted-foreground">Rastreabilidade de todas as ações no sistema</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <select
          value={filterTable}
          onChange={(e) => { setFilterTable(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        >
          <option value="">Todas as tabelas</option>
          {tables.map((t) => (
            <option key={t} value={t}>{tableLabels[t]}</option>
          ))}
        </select>
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        >
          <option value="">Todas as ações</option>
          <option value="INSERT">Criação</option>
          <option value="UPDATE">Edição</option>
          <option value="DELETE">Exclusão</option>
        </select>
      </div>

      {/* Logs list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum log encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors"
                >
                  <Badge className={`text-[10px] shrink-0 ${actionColors[log.action] || ""}`}>
                    {actionLabels[log.action] || log.action}
                  </Badge>
                  <span className="text-xs font-medium text-foreground truncate">
                    {tableLabels[log.table_name] || log.table_name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {log.user_email || "Sistema"}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                    {formatDate(log.created_at)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-t border-border p-3 space-y-2 bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">
                      ID do registro: <span className="font-mono text-foreground">{log.record_id || "—"}</span>
                    </p>
                    {log.action === "UPDATE" && log.old_data && log.new_data && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Antes</p>
                          <pre className="text-[10px] bg-background rounded-lg p-2 overflow-auto max-h-48 text-foreground">
                            {JSON.stringify(log.old_data, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Depois</p>
                          <pre className="text-[10px] bg-background rounded-lg p-2 overflow-auto max-h-48 text-foreground">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    {log.action === "INSERT" && log.new_data && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Dados criados</p>
                        <pre className="text-[10px] bg-background rounded-lg p-2 overflow-auto max-h-48 text-foreground">
                          {JSON.stringify(log.new_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.action === "DELETE" && log.old_data && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Dados excluídos</p>
                        <pre className="text-[10px] bg-background rounded-lg p-2 overflow-auto max-h-48 text-foreground">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">Página {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={logs.length < PAGE_SIZE}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
