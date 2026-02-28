import { HelpCircle } from "lucide-react";

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
      title="Ajuda"
      aria-label="Ajuda"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
}
