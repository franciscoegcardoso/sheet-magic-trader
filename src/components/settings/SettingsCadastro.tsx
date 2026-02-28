import { useState, useRef } from "react";
import { useAuth, type Profile } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  Camera,
  Loader2,
  Save,
  Crown,
  Shield,
} from "lucide-react";

export function SettingsCadastro() {
  const { profile, user, updateProfile, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(profile?.nome || "");
  const [telefone, setTelefone] = useState(profile?.telefone || "");
  const [tipoConta, setTipoConta] = useState(profile?.tipo_conta || "pessoa_fisica");
  const [cpfCnpj, setCpfCnpj] = useState(profile?.cpf_cnpj || "");
  const [nomeEmpresa, setNomeEmpresa] = useState(profile?.nome_empresa || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        nome,
        telefone: telefone || null,
        tipo_conta: tipoConta as Profile["tipo_conta"],
        cpf_cnpj: cpfCnpj || null,
        nome_empresa: nomeEmpresa || null,
      });
      toast({ title: "Perfil atualizado!" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      toast({ title: "Foto atualizada!" });
    } catch (error: any) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const planLabels: Record<string, { label: string; color: string }> = {
    free: { label: "Free", color: "bg-muted text-muted-foreground" },
    pro: { label: "Pro", color: "bg-primary/20 text-primary" },
    premium: { label: "Premium", color: "bg-warning/20 text-warning" },
  };
  const plan = planLabels[profile?.plano || "free"];

  return (
    <div className="space-y-5">
      {/* Avatar + Plan badge */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{profile?.nome || "Sem nome"}</h3>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${plan.color}`}>
              <Crown className="w-3 h-3 inline mr-0.5" />
              {plan.label}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              <Shield className="w-3 h-3 inline mr-0.5" />
              {tipoConta === "pessoa_juridica" ? "PJ" : "PF"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Dados pessoais</h3>

        <div>
          <Label className="text-xs text-muted-foreground">Nome completo</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Telefone</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="pl-9" placeholder="(00) 00000-0000" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={user?.email || ""} disabled className="pl-9 opacity-60" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">O email não pode ser alterado aqui.</p>
        </div>
      </div>

      {/* Account type */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Tipo de conta</h3>

        <div className="grid grid-cols-2 gap-2">
          {(["pessoa_fisica", "pessoa_juridica"] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoConta(tipo)}
              className={`p-3 rounded-xl border text-center text-sm font-medium transition-colors ${
                tipoConta === tipo
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {tipo === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            {tipoConta === "pessoa_juridica" ? "CNPJ" : "CPF"}
          </Label>
          <div className="relative mt-1">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              className="pl-9"
              placeholder={tipoConta === "pessoa_juridica" ? "00.000.000/0000-00" : "000.000.000-00"}
            />
          </div>
        </div>

        {tipoConta === "pessoa_juridica" && (
          <div>
            <Label className="text-xs text-muted-foreground">Nome da Empresa</Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                className="pl-9"
                placeholder="Razão Social ou Nome Fantasia"
              />
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar alterações
      </Button>
    </div>
  );
}
