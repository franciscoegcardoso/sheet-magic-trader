import { useState, useEffect } from "react";

export interface Product {
  cod: string;
  nome: string;
  tamanho: string;
  unidade: string;
}

const SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-L_lpONAuzksa_F7LEl-3fsgJZKa93_emcXyh1j0u0he-xrWnSelzYM4ioWroWMKXAF8eIjohfF5Y/pub?gid=420227481&single=true&output=csv";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(SHEETS_URL);
        const text = await response.text();
        
        const lines = text.split("\n");
        const parsedProducts: Product[] = [];

        // Skip header line (index 0)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          // Columns: [empty, empty, Cod, Nome, Tamanho, Unidade, ...]
          const cod = cols[2]?.trim() || "";
          const nome = cols[3]?.trim() || "";
          const tamanho = cols[4]?.trim() || "";
          const unidade = cols[5]?.trim() || "";

          // Only include products with a valid name (not empty and not just the code)
          if (nome && nome !== "" && nome !== cod) {
            parsedProducts.push({ cod, nome, tamanho, unidade });
          }
        }

        setProducts(parsedProducts);
      } catch (err) {
        setError("Erro ao carregar produtos da planilha");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, isLoading, error };
}
