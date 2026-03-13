import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificacoesPanel } from "./NotificacoesPanel";
import { usePedidos } from "@/hooks/usePedidos";
import { useVendas } from "@/hooks/useVendas";
import { useClientesDB } from "@/hooks/useClientesDB";
import logo from "@/assets/logo.png";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { pedidos } = usePedidos();
  const { vendas } = useVendas();
  const { clientes } = useClientesDB();

  const notificationCount = useMemo(() => {
    let count = 0;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Overdue orders
    count += pedidos.filter(
      (p) => p.status !== "entregue" && p.status !== "cancelado" && p.data_entrega < todayStr
    ).length;

    // Today/tomorrow deliveries
    count += pedidos.filter(
      (p) =>
        (p.data_entrega === todayStr || p.data_entrega === tomorrowStr) &&
        p.status !== "entregue" &&
        p.status !== "cancelado"
    ).length;

    // Churned clients (60+ days without purchase)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    clientes.forEach((c) => {
      const lastSale = vendas
        .filter((v) => v.cliente === c.nome)
        .sort((a, b) => b.data_venda.localeCompare(a.data_venda))[0];
      if (lastSale && new Date(lastSale.data_venda + "T00:00:00") < sixtyDaysAgo) {
        count++;
      }
    });

    return count;
  }, [pedidos, vendas, clientes]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center justify-between">
      <img src={logo} alt="VerticeA" className="h-8" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
          <div className="p-4">
            <NotificacoesPanel />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
