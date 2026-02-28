import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function SettingsPreferencias() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const options: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
    { value: "light", label: "Claro", icon: Sun, desc: "Tema claro padrão" },
    { value: "dark", label: "Escuro", icon: Moon, desc: "Menos cansaço visual" },
    { value: "system", label: "Sistema", icon: Monitor, desc: "Segue o dispositivo" },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Aparência</h3>
        <p className="text-xs text-muted-foreground">Escolha o tema visual da aplicação.</p>

        <div className="grid grid-cols-3 gap-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
