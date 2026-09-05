import React from 'react';
import ModalContent from './ModalContent';

interface PrivacyModalProps {
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
    return (
        <ModalContent title="Política de Privacidade" onClose={onClose}>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4">
                <p className="font-bold">Política de Privacidade – EloSUS Grupos (23/11/2025)</p>
                <h4 className="font-bold text-slate-800">1. Introdução</h4>
                <p>Esta Política explica como coletamos, utilizamos e protegemos seus dados pessoais em conformidade com a LGPD.</p>
                <h4 className="font-bold text-slate-800">2. Dados pessoais que podemos coletar</h4>
                <p>Dados de identificação, dados profissionais, dados de saúde e participação em grupos (dados sensíveis), dados de uso e navegação.</p>
                <h4 className="font-bold text-slate-800">3. Para que utilizamos seus dados</h4>
                <p>Gestão de grupos terapêuticos, organização da assistência, comunicação, monitoramento, geração de indicadores, segurança.</p>
                <h4 className="font-bold text-slate-800">4. Bases legais (LGPD)</h4>
                <p>Execução de políticas públicas, contrato, obrigação legal, legítimo interesse, consentimento.</p>
                <h4 className="font-bold text-slate-800">5. Compartilhamento de dados</h4>
                <p>Com serviços de saúde, gestores, fornecedores de tecnologia, mediante requisição legal.</p>
                <h4 className="font-bold text-slate-800">6. Armazenamento e segurança</h4>
                <p>Adotamos medidas técnicas e organizacionais para proteger os dados. Nenhum sistema é totalmente isento de riscos.</p>
                <h4 className="font-bold text-slate-800">7. Direitos do titular de dados</h4>
                <p>Confirmar, acessar, corrigir, anonimizar, portar, revogar consentimento.</p>
                <h4 className="font-bold text-slate-800">8. Cookies</h4>
                <p>Podemos utilizar cookies para manter sessão e gerar estatísticas.</p>
                <h4 className="font-bold text-slate-800">9. Retenção e descarte</h4>
                <p>Dados mantidos pelo tempo necessário para cumprimento das finalidades e obrigações legais.</p>
                <h4 className="font-bold text-slate-800">10. Crianças e adolescentes</h4>
                <p>Tratamento de dados observará disposições específicas da LGPD e vínculo com responsável legal.</p>
                <h4 className="font-bold text-slate-800">11. Atualizações</h4>
                <p>Esta política poderá ser atualizada periodicamente.</p>
            </div>
        </ModalContent>
    );
};

export default PrivacyModal;
