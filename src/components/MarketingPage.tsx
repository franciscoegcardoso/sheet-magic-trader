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
  Search,
  X,
  MessageSquare,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Package,
  FileText,
  Stamp,
} from "lucide-react";

type ImageMode = "ready" | "ai";

export function MarketingPage() {
  const { toast } = useToast();
  const { clientes, isLoading: loadingClientes } = useClientesDB();
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const productPhotoRef = useRef<HTMLInputElement>(null);

  // Image mode
  const [imageMode, setImageMode] = useState<ImageMode>("ai");

  // Ready image (direct upload)
  const [readyImageFile, setReadyImageFile] = useState<File | null>(null);
  const [readyImagePreview, setReadyImagePreview] = useState<string | null>(null);
  const [readyImageUrl, setReadyImageUrl] = useState<string | null>(null);
  const [uploadingReady, setUploadingReady] = useState(false);

  // AI generation fields
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [productPhotoFile, setProductPhotoFile] = useState<File | null>(null);
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null);
  const [productPhotoUrl, setProductPhotoUrl] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);

  // Common
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

  // The final image URL to send
  const finalImageUrl = imageMode === "ready" ? readyImageUrl : aiImageUrl;

  // --- Upload helpers ---
  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("marketing")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("marketing").getPublicUrl(path);
    return data.publicUrl;
  };

  // --- Ready image handlers ---
  const handleReadyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReadyImageFile(file);
    setReadyImagePreview(URL.createObjectURL(file));
    setReadyImageUrl(null);
  };

  const handleUploadReadyImage = async () => {
    if (!readyImageFile) return;
    setUploadingReady(true);
    try {
      const url = await uploadToStorage(readyImageFile, "campaigns");
      setReadyImageUrl(url);
      toast({ title: "Imagem enviada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploadingReady(false);
    }
  };

  const removeReadyImage = () => {
    setReadyImageFile(null);
    setReadyImagePreview(null);
    setReadyImageUrl(null);
  };

  // --- AI image handlers ---
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
    setUrl: (u: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setUrl(null);
  };

  const handleGenerateAIImage = async () => {
    if (!productName.trim()) {
      toast({ title: "Informe o nome do produto", variant: "destructive" });
      return;
    }

    setGeneratingAI(true);
    try {
      // Upload logo and product photo if provided
      let uploadedLogoUrl = logoUrl;
      let uploadedProductPhotoUrl = productPhotoUrl;

      if (logoFile && !logoUrl) {
        uploadedLogoUrl = await uploadToStorage(logoFile, "logos");
        setLogoUrl(uploadedLogoUrl);
      }
      if (productPhotoFile && !productPhotoUrl) {
        uploadedProductPhotoUrl = await uploadToStorage(productPhotoFile, "product-photos-mkt");
        setProductPhotoUrl(uploadedProductPhotoUrl);
      }

      const { data, error } = await supabase.functions.invoke("generate-marketing-image", {
        body: {
          productName,
          productDescription,
          logoUrl: uploadedLogoUrl || null,
          productPhotoUrl: uploadedProductPhotoUrl || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiImageUrl(data.imageUrl);
      setAiImagePreview(data.imageUrl);
      toast({ title: "Imagem gerada com sucesso!", description: "A IA criou sua imagem de marketing." });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar imagem",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const removeAiImage = () => {
    setAiImageUrl(null);
    setAiImagePreview(null);
  };

  // --- Contact & Send ---
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
    let digits = phone.replace(/\D/g, "");
    if (!digits.startsWith("55")) digits = "55" + digits;
    return digits;
  };

  const buildWhatsAppUrl = (phone: string) => {
    const formattedPhone = formatPhone(phone);
    let text = mensagem;
    if (finalImageUrl) {
      text += `\n\n📷 ${finalImageUrl}`;
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

    setSending(true);
    const selected = activeClientes.filter((c) => selectedIds.has(c.id));

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
          <p className="text-sm text-muted-foreground">Crie campanhas visuais e envie para seus clientes</p>
        </div>
      </div>

      {/* Step 1: Image Mode Selector */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">1. Imagem da Campanha</h3>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setImageMode("ready")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              imageMode === "ready"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            Inserir imagem pronta
          </button>
          <button
            onClick={() => setImageMode("ai")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              imageMode === "ai"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Criar imagem com IA
          </button>
        </div>

        {/* Ready image mode */}
        {imageMode === "ready" && (
          <div className="space-y-3 animate-fade-in">
            {readyImagePreview ? (
              <div className="relative">
                <img
                  src={readyImagePreview}
                  alt="Preview"
                  className="w-full max-h-56 object-cover rounded-lg border border-border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {readyImageUrl ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enviada
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleUploadReadyImage}
                      disabled={uploadingReady}
                    >
                      {uploadingReady ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enviar"}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={removeReadyImage}
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
                <Upload className="w-6 h-6" />
                <span className="text-xs">Clique para selecionar sua imagem pronta</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReadyImageSelect}
            />
          </div>
        )}

        {/* AI image mode */}
        {imageMode === "ai" && (
          <div className="space-y-4 animate-fade-in">
            {/* Logo + Product Photo row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-primary" />
                  Logo da marca (opcional)
                </Label>
                {logoPreview ? (
                  <div className="relative h-28 border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        setLogoUrl(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Stamp className="w-5 h-5" />
                    <span className="text-[10px]">Adicionar logo</span>
                  </button>
                )}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, setLogoFile, setLogoPreview, setLogoUrl)}
                />
              </div>

              {/* Product Photo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Foto do produto (opcional)
                </Label>
                {productPhotoPreview ? (
                  <div className="relative h-28 border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                    <img src={productPhotoPreview} alt="Produto" className="max-h-full max-w-full object-contain p-2" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        setProductPhotoFile(null);
                        setProductPhotoPreview(null);
                        setProductPhotoUrl(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => productPhotoRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[10px]">Adicionar foto</span>
                  </button>
                )}
                <input
                  ref={productPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, setProductPhotoFile, setProductPhotoPreview, setProductPhotoUrl)}
                />
              </div>
            </div>

            {/* Product name */}
            <div>
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                Nome do produto *
              </Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Bolo de Chocolate Artesanal"
              />
            </div>

            {/* Product description */}
            <div>
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Descrição do produto (opcional)
              </Label>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Ex: Bolo artesanal feito com chocolate belga, cobertura ganache e decoração personalizada..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerateAIImage}
              disabled={generatingAI || !productName.trim()}
              className="w-full"
              size="lg"
            >
              {generatingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando imagem com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar imagem com IA
                </>
              )}
            </Button>

            {/* AI generated result */}
            {aiImagePreview && (
              <div className="relative animate-fade-in">
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gerado por IA
                  </span>
                </div>
                <img
                  src={aiImagePreview}
                  alt="Imagem gerada"
                  className="w-full max-h-72 object-cover rounded-lg border border-border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={removeAiImage}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              💡 A IA usará o nome, descrição, logo e foto do produto para criar uma imagem profissional de marketing.
            </p>
          </div>
        )}
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
          {finalImageUrl && " · 📷 A imagem será incluída como link na mensagem"}
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
