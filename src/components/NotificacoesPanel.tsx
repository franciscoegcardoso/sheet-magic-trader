import { useMemo } from "react";
import { usePedidos } from "@/hooks/usePedidos";
import { useVendas } from "@/hooks/useVendas";
import { useClientesDB } from "@/hooks/useClientesDB";
import {
  Bell, CalendarDays, AlertTriangle, Users, Package, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "pedido_atrasado" | "pedido_hoje" | "pedido_amanha" | "cliente_churn";
  title: string;
  description: string;
  icon: typeof Bell;
  color: string;
  action?: { label: string; href: string };
}

export function NotificacoesPanel() {
  const { pedidos } = usePedidos();
  const { vendas } = useVendas();
  const { clientes } = useClientesDB();

  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Overdue orders
    pedidos
      .filter(p => p.status !== "entregue" && p.status !== "cancelado" && p.data_entrega < todayStr)
      .forEach(p => {
        notifs.push({
          id: `overdue-${p.id}`,
          type: "pedido_atrasado",
          title: `Pedido atrasado: ${p.cliente_nome}`,
          description: `${p.produto} - entrega era ${new Date(p.data_entrega + "T00:00:00").toLocaleDateString("pt-BR")}`,
          icon: AlertTriangle,
          color: "text-destructive bg-destructive/10",
        });
      });

    // Today's orders
    pedidos
      .filter(p => p.data_entrega === todayStr && p.status !== "entregue" && p.status !== "cancelado")
      .forEach(p => {
        notifs.push({
          id: `today-${p.id}`,
          type: "pedido_hoje",
          title: `Entrega hoje: ${p.cliente_nome}`,
          description: `${p.produto} × ${p.quantidade}`,
          icon: CalendarDays,
          color: "text-yellow-600 bg-yellow-500/10",
        });
      });

    // Tomorrow's orders
    pedidos
      .filter(p => p.data_entrega === tomorrowStr && p.status !== "entregue" && p.status !== "cancelado")
      .forEach(p => {
        notifs.push({
          id: `tomorrow-${p.id}`,
          type: "pedido_amanha",
          title: `Entrega amanhã: ${p.cliente_nome}`,
          description: `${p.produto} × ${p.quantidade}`,
          icon: Package,
          color: "text-blue-600 bg-blue-500/10",
        });
      });

    // Churn clients (no purchase in 60+ days)
    clientes.forEach(c => {
      const vendasCliente = vendas.filter(
        v => v.cliente_id === c.id || v.cliente.toLowerCase() === c.nome.toLowerCase()
      );
      if (vendasCliente.length === 0) return;
      const lastDate = vendasCliente.sort((a, b) => b.data_venda.localeCompare(a.data_venda))[0]?.data_venda;
      if (!lastDate) return;
      const daysSince = Math.floor((today.getTime() - new Date(lastDate + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 60) {
        notifs.push({
          id: `churn-${c.id}`,
          type: "cliente_churn",
          title: `Cliente inativo: ${c.nome}`,
          description: `Sem compras há ${daysSince} dias`,
          icon: Users,
          color: "text-orange-600 bg-orange-500/10",
          action: c.telefone ? {
            label: "WhatsApp",
            href: `https://wa.me/55${c.telefone.replace(/\D/g, "")}?text=Ol%C3%A1%20${encodeURIComponent(c.nome)}%2C%20sentimos%20sua%20falta!`,
          } : undefined,
        });
      }
    });

    return notifs;
  }, [pedidos, vendas, clientes]);

  if (notifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Tudo em dia! Nenhuma notificação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Notificações</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">
          {notifications.length}
        </span>
      </div>
      {notifications.slice(0, 8).map(n => {
        const Icon = n.icon;
        return (
          <div key={n.id} className="flex items-start gap-3 bg-card border border-border rounded-xl p-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground">{n.title}</div>
              <div className="text-[11px] text-muted-foreground">{n.description}</div>
            </div>
            {n.action && (
              <a href={n.action.href} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-7 text-[10px] shrink-0">
                  <MessageCircle className="w-3 h-3 mr-1" />{n.action.label}
                </Button>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
