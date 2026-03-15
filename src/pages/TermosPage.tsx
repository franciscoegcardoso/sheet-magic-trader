import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

export default function TermosPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={logo} alt="Logo" className="h-8" />
        </div>

        {/* Termos de Uso */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-display font-bold text-foreground">Termos de Uso</h1>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p><strong className="text-foreground">1. Aceitação dos Termos</strong><br />
              Ao acessar e usar o Controle Financeiro, você aceita e concorda em ficar vinculado a estes Termos de Uso. Se não concordar, não utilize o serviço.</p>
            <p><strong className="text-foreground">2. Descrição do Serviço</strong><br />
              O Controle Financeiro é uma plataforma de gestão financeira voltada para pequenos empreendedores, oferecendo ferramentas de controle de compras, vendas, estoque, receitas e relatórios.</p>
            <p><strong className="text-foreground">3. Conta do Usuário</strong><br />
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
            <p><strong className="text-foreground">4. Uso Aceitável</strong><br />
              Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido usar o serviço para atividades fraudulentas, ilegais ou que violem direitos de terceiros.</p>
            <p><strong className="text-foreground">5. Propriedade Intelectual</strong><br />
              Todo o conteúdo, design e funcionalidades do serviço são de propriedade exclusiva do Controle Financeiro.</p>
            <p><strong className="text-foreground">6. Limitação de Responsabilidade</strong><br />
              O serviço é fornecido "como está". Não garantimos que estará sempre disponível ou livre de erros. Não nos responsabilizamos por decisões financeiras tomadas com base nos dados da plataforma.</p>
            <p><strong className="text-foreground">7. Rescisão</strong><br />
              Podemos suspender ou encerrar sua conta a qualquer momento em caso de violação destes termos.</p>
            <p><strong className="text-foreground">8. Modificações</strong><br />
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por email.</p>
          </div>
        </section>

        {/* Política de Privacidade */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-foreground">Política de Privacidade</h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p><strong className="text-foreground">1. Dados Coletados</strong><br />
              Coletamos: nome, email, telefone, dados de compras, vendas, receitas, produtos e informações financeiras inseridas por você na plataforma.</p>
            <p><strong className="text-foreground">2. Finalidade do Uso</strong><br />
              Seus dados são utilizados para: fornecer e melhorar nossos serviços, gerar relatórios e análises, personalizar sua experiência e garantir a segurança da plataforma.</p>
            <p><strong className="text-foreground">3. Proteção dos Dados</strong><br />
              Implementamos medidas de segurança incluindo criptografia em trânsito e em repouso, controle de acesso baseado em funções (RLS), autenticação segura e monitoramento de atividades via logs de auditoria.</p>
            <p><strong className="text-foreground">4. Compartilhamento</strong><br />
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando exigido por lei.</p>
            <p><strong className="text-foreground">5. Retenção de Dados</strong><br />
              Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados serão removidos em até 30 dias.</p>
            <p><strong className="text-foreground">6. Seus Direitos (LGPD)</strong><br />
              Você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar a exclusão dos dados, revogar consentimento e solicitar portabilidade dos dados.</p>
            <p><strong className="text-foreground">7. Cookies</strong><br />
              Utilizamos cookies essenciais para manter sua sessão e preferências. Não utilizamos cookies de rastreamento de terceiros.</p>
            <p><strong className="text-foreground">8. Contato</strong><br />
              Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo email disponível na plataforma.</p>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Última atualização: Março de 2026
        </p>
      </div>
    </div>
  );
}
