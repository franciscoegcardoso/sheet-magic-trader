import { useState, useRef, useMemo } from "react";
import { useClientesDB } from "@/hooks/useClientesDB";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone,
  ImagePlus,
  Send,
  Users,
  Loader2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  X,
  MessageSquare,
} from "lucide-react";

export function MarketingPage() {
  const { toast } = useToast();
  const { clientes, isLoading: loadingClientes } = useClientesDB();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const activeClientes = useMemo(
    () => (clientes || []).filter((c) => c.ativo && c.telefone),
    [clientes]
  );

  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return activeClientes;
    const q = searchQuery.toLowerCase();
    return activeClientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.telefone?.toLowerCase().includes(q)
    );
  }, [activeClientes, searchQuery]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(null);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const ext = imageFile.name.split(".").pop();
      const path = `campaigns/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("marketing")
        .upload(path, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("marketing").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast({ title: "Imagem enviada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
  };

  const toggleClient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredClientes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClientes.map((c) => c.id)));
    }
  };

  const formatPhone = (phone: string) => {
    // Remove tudo que não é número
    let digits = phone.replace(/\D/g, "");
    // Adiciona código do Brasil se não tiver
    if (!digits.startsWith("55")) digits = "55" + digits;
    return digits;
  };

  const buildWhatsAppUrl = (phone: string) => {
    const formattedPhone = formatPhone(phone);
    let text = mensagem;
    if (imageUrl) {
      text += `\n\n📷 ${imageUrl}`;
    }
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSendAll = () => {
    if (!mensagem.trim()) {
      toast({ title: "Escreva uma mensagem primeiro", variant: "destructive" });
      return;
    }
    if (selectedIds.size === 0) {
      toast({ title: "Selecione ao menos 1 contato", variant: "destructive" });
      return;
    }

    // Upload image first if not uploaded yet
    if (imageFile && !imageUrl) {
      toast({ title: "Envie a imagem antes de disparar", variant: "destructive" });
      return;
    }

    setSending(true);

    const selected = activeClientes.filter((c) => selectedIds.has(c.id));
    
    // Open first link immediately, rest with small delay
    selected.forEach((client, i) => {
      setTimeout(() => {
        const url = buildWhatsAppUrl(client.telefone!);
        window.open(url, "_blank");
        setSentIds((prev) => new Set(prev).add(client.id));
        
        if (i === selected.length - 1) {
          setSending(false);
          toast({
            title: "Lista de transmissão enviada!",
            description: `${selected.length} contatos abertos no WhatsApp.`,
          });
        }
      }, i * 800);
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent">
          <Megaphone className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Marketing</h2>
          <p className="text-sm text-muted-foreground">Envie mensagens para sua lista de clientes</p>
        </div>
      </div>

      {/* Step 1: Image */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">1. Imagem (opcional)</h3>
        </div>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-lg border border-border"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {imageUrl ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enviada
                </span>
              ) : (
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleUploadImage}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enviar"}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={removeImage}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">Clique para selecionar uma imagem</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <p className="text-[10px] text-muted-foreground">
          💡 A imagem será enviada como link junto à mensagem. O cliente verá o link e poderá abrir a imagem.
        </p>
      </div>

      {/* Step 2: Message */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">2. Mensagem</h3>
        </div>
        <Textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Escreva sua mensagem aqui... Ex: Olá! Temos uma novidade especial para você 🎉"
          rows={4}
          className="resize-none"
        />
        <p className="text-[10px] text-muted-foreground">
          {mensagem.length} caracteres
        </p>
      </div>

      {/* Step 3: Contact list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                3. Lista de Transmissão
              </h3>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {selectedIds.size} de {activeClientes.length} selecionados
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8"
                placeholder="Buscar contato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={selectAll}>
              {selectedIds.size === filteredClientes.length ? "Desmarcar" : "Selecionar"} todos
            </Button>
          </div>
        </div>

        {loadingClientes ? (
          <div className="p-6 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : activeClientes.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Nenhum cliente com telefone cadastrado. Cadastre clientes no CRM primeiro.
          </div>
        ) : (
          <div className="divide-y divide-border max-h-64 overflow-y-auto">
            {filteredClientes.map((client) => {
              const isSelected = selectedIds.has(client.id);
              const wasSent = sentIds.has(client.id);
              return (
                <label
                  key={client.id}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleClient(client.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{client.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{client.telefone}</p>
                  </div>
                  {wasSent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Enviado
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Send button */}
      <Button
        onClick={handleSendAll}
        disabled={sending || selectedIds.size === 0 || !mensagem.trim()}
        className="w-full"
        size="lg"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Enviar para {selectedIds.size} contato{selectedIds.size !== 1 ? "s" : ""} via WhatsApp
      </Button>

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        Cada contato abrirá uma nova aba no WhatsApp Web com a mensagem pré-preenchida.
        Você precisará clicar em "Enviar" em cada conversa.
      </p>
    </div>
  );
}
