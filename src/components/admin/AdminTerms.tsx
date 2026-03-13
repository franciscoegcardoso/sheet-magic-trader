import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AdminTerms() {
  const { toast } = useToast();
  const [termos, setTermos] = useState(`Bem-vindo ao Controle Financeiro. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo.

1. Aceitação dos Termos
Ao acessar e usar o serviço, você aceita e concorda em ficar vinculado a estes Termos de Uso.

2. Descrição do Serviço
O Controle Financeiro é uma plataforma de gestão financeira voltada para pequenos empreendedores.

3. Conta do Usuário
Você é responsável por manter a confidencialidade de suas credenciais de acesso.

4. Uso Aceitável
Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.

5. Limitação de Responsabilidade
O serviço é fornecido "como está". Não garantimos que estará sempre disponível.

6. Modificações
Podemos modificar estes termos a qualquer momento.`);

  const [politica, setPolitica] = useState(`A sua privacidade é importante para nós.

1. Dados Coletados
Informações de cadastro, dados de compras e vendas, receitas e produtos.

2. Uso dos Dados
Fornecer e melhorar nossos serviços, gerar relatórios e análises.

3. Proteção dos Dados
Medidas de segurança adequadas com criptografia.

4. Compartilhamento
Não vendemos ou compartilhamos suas informações pessoais com terceiros.

5. Seus Direitos
Acessar, corrigir, solicitar exclusão ou revogar consentimento.`);

  const handleSave = () => {
    toast({ title: "Textos salvos!", description: "Termos e política atualizados com sucesso." });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Edite os textos legais exibidos para os usuários na área de Configurações.
      </p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Termos de Uso</h3>
        </div>
        <Textarea
          value={termos}
          onChange={(e) => setTermos(e.target.value)}
          rows={14}
          className="text-xs leading-relaxed resize-none"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Política de Privacidade</h3>
        </div>
        <Textarea
          value={politica}
          onChange={(e) => setPolitica(e.target.value)}
          rows={14}
          className="text-xs leading-relaxed resize-none"
        />
      </div>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="w-4 h-4" />
        Salvar alterações
      </Button>
    </div>
  );
}
