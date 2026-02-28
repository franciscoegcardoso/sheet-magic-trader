import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerId = "barcode-scanner-container";

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {}
      )
      .catch((err) => {
        console.error("Scanner error:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Escanear código</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div
          id={containerId}
          className="w-full aspect-square rounded-xl overflow-hidden bg-black"
        />

        {error && (
          <p className="text-destructive text-sm text-center mt-4">{error}</p>
        )}

        <p className="text-white/60 text-xs text-center mt-4">
          Aponte a câmera para o código de barras ou QR Code do produto
        </p>
      </div>
    </div>
  );
}
