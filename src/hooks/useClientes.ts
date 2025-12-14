import { useState, useEffect } from "react";

interface Cliente {
  nome: string;
  telefone: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const csvUrl =
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-L_lpONAuzksa_F7LEl-3fsgJZKa93_emcXyh1j0u0he-xrWnSelzYM4ioWroWMKXAF8eIjohfF5Y/pub?gid=1010235172&single=true&output=csv";

        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error("Erro ao buscar dados do Google Sheets");
        }

        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim());

        // Skip header row
        const dataLines = lines.slice(1);

        const parsedClientes: Cliente[] = dataLines
          .map((line) => {
            const columns = line.split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
            // Columns: 0-1 empty, 2=Cod, 3=Nome, 4=Telefone
            return {
              nome: columns[3] || "",
              telefone: columns[4] || "",
            };
          })
          .filter((cliente) => cliente.nome);

        setClientes(parsedClientes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return { clientes, isLoading, error };
}
