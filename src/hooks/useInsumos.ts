import { useState, useEffect } from "react";

interface Insumo {
  codigo: string;
  nome: string;
  unidade: string;
}

const INSUMOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-L_lpONAuzksa_F7LEl-3fsgJZKa93_emcXyh1j0u0he-xrWnSelzYM4ioWroWMKXAF8eIjohfF5Y/pub?gid=0&single=true&output=csv";

export function useInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsumos() {
      try {
        const response = await fetch(INSUMOS_CSV_URL);
        if (!response.ok) {
          throw new Error("Falha ao carregar insumos");
        }

        const text = await response.text();
        const lines = text.split("\n");

        // Skip header row and parse data
        // Structure: ,,Cod,Nome do insumo ou Produto de Revenda,Qtde,Unidade,Fator,Porção
        const parsedInsumos: Insumo[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma, handling potential quoted values
          const columns = line.split(",");

          // Column C (index 2) = Codigo, Column D (index 3) = Nome, Column F (index 5) = Unidade
          const codigo = columns[2]?.trim() || "";
          const nome = columns[3]?.trim() || "";
          const unidade = columns[5]?.trim() || "";

          // Only add if has a valid name
          if (nome && codigo) {
            parsedInsumos.push({
              codigo,
              nome,
              unidade,
            });
          }
        }

        setInsumos(parsedInsumos);
        setError(null);
      } catch (err) {
        console.error("Error fetching insumos:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsumos();
  }, []);

  return { insumos, isLoading, error };
}
