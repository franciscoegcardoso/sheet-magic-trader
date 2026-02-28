import { FileText, Scale } from "lucide-react";

export function SettingsLegal() {
  return (
    <div className="space-y-5">
      {/* Termos de Uso */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Termos de Uso</h3>
        </div>

        <div className="prose prose-sm max-w-none text-xs text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Bem-vindo ao <strong className="text-foreground">Controle Financeiro</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">1. Aceitação dos Termos</h4>
          <p>
            Ao acessar e usar o serviço, você aceita e concorda em ficar vinculado a estes Termos de Uso. Se não concordar com alguma parte, não utilize o serviço.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">2. Descrição do Serviço</h4>
          <p>
            O Controle Financeiro é uma plataforma de gestão financeira voltada para pequenos empreendedores, oferecendo funcionalidades de registro de compras, vendas, controle de estoque, receitas e relatórios.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">3. Conta do Usuário</h4>
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais de acesso. Todas as atividades realizadas na sua conta são de sua responsabilidade.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">4. Uso Aceitável</h4>
          <p>
            Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido tentar acessar dados de outros usuários ou comprometer a segurança da plataforma.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">5. Limitação de Responsabilidade</h4>
          <p>
            O serviço é fornecido "como está". Não garantimos que estará sempre disponível, livre de erros ou que atenderá todas as suas necessidades. Não nos responsabilizamos por perdas financeiras decorrentes do uso da plataforma.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">6. Modificações</h4>
          <p>
            Podemos modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação. O uso continuado do serviço constitui aceitação dos novos termos.
          </p>
        </div>
      </div>

      {/* Política de Privacidade */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Política de Privacidade</h3>
        </div>

        <div className="prose prose-sm max-w-none text-xs text-muted-foreground space-y-3 leading-relaxed">
          <p>
            A sua privacidade é importante para nós. Esta política descreve como coletamos, usamos e protegemos suas informações.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">1. Dados Coletados</h4>
          <p>Coletamos as seguintes informações:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Informações de cadastro (nome, email, telefone, CPF/CNPJ)</li>
            <li>Dados de compras e vendas registrados por você</li>
            <li>Informações de receitas e produtos cadastrados</li>
            <li>Dados de uso da plataforma (páginas visitadas, funcionalidades utilizadas)</li>
          </ul>

          <h4 className="text-foreground font-semibold text-xs !mt-4">2. Uso dos Dados</h4>
          <p>Utilizamos seus dados para:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Gerar relatórios e análises financeiras</li>
            <li>Enviar comunicações relevantes sobre o serviço</li>
            <li>Garantir a segurança da plataforma</li>
          </ul>

          <h4 className="text-foreground font-semibold text-xs !mt-4">3. Proteção dos Dados</h4>
          <p>
            Empregamos medidas de segurança adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Seus dados são armazenados em servidores seguros com criptografia.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">4. Compartilhamento</h4>
          <p>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para fornecer o serviço (ex: processamento de pagamentos) ou quando exigido por lei.
          </p>

          <h4 className="text-foreground font-semibold text-xs !mt-4">5. Seus Direitos</h4>
          <p>Você tem o direito de:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Acessar seus dados pessoais</li>
            <li>Solicitar correção de dados incorretos</li>
            <li>Solicitar exclusão de seus dados</li>
            <li>Revogar o consentimento para o uso dos dados</li>
          </ul>

          <h4 className="text-foreground font-semibold text-xs !mt-4">6. Contato</h4>
          <p>
            Para dúvidas sobre esta política, entre em contato conosco através do email de suporte disponível na plataforma.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Última atualização: Fevereiro de 2026
      </p>
    </div>
  );
}
