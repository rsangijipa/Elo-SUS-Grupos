import React from 'react';
import ModalContent from './ModalContent';

interface TermsModalProps {
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
    return (
        <ModalContent title="Termos de Uso" onClose={onClose}>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4">
                <p className="font-bold">1. Termos de Uso – EloSUS Grupos (23/11/2025)</p>
                <h4 className="font-bold text-slate-800">1. Quem somos</h4>
                <p>O EloSUS Grupos é uma plataforma digital destinada ao apoio à gestão e participação em grupos terapêuticos no âmbito do SUS, podendo ser utilizada por: Profissionais de saúde e Usuários/pacientes.</p>
                <h4 className="font-bold text-slate-800">2. Objetivo do aplicativo</h4>
                <p>Profissionais: auxiliar na organização, registro e acompanhamento de grupos terapêuticos. Usuários/pacientes: atuar como um companion de saúde mental.</p>
                <h4 className="font-bold text-slate-800">3. Público-alvo e perfis de acesso</h4>
                <p>O aplicativo pode ser utilizado em dois perfis principais: Profissional de saúde / SUS e Usuário/paciente.</p>
                <h4 className="font-bold text-slate-800">4. Cadastro e autenticação</h4>
                <p>Para utilizar todas as funcionalidades, é necessário realizar cadastro e login. Você se compromete a informar dados verdadeiros e manter sua senha em sigilo.</p>
                <h4 className="font-bold text-slate-800">5. Responsabilidades do usuário</h4>
                <p>Não utilizar o aplicativo para fins ilícitos. Respeitar a confidencialidade das informações.</p>
                <h4 className="font-bold text-slate-800">6. Responsabilidades do EloSUS Grupos</h4>
                <p>Empregar esforços de segurança e manter a disponibilidade do serviço. O aplicativo não substitui atendimento clínico individual.</p>
                <h4 className="font-bold text-slate-800">7. Funcionalidades principais</h4>
                <p>Cadastro e gestão de grupos, registro de presenças, agenda, painéis de indicadores, visualização de encontros, check-in emocional.</p>
                <h4 className="font-bold text-slate-800">8. Privacidade e proteção de dados</h4>
                <p>O tratamento de dados pessoais é regulado pela Política de Privacidade.</p>
                <h4 className="font-bold text-slate-800">9. Propriedade intelectual</h4>
                <p>Marcas e elementos do EloSUS Grupos são protegidos por direitos de propriedade intelectual.</p>
                <h4 className="font-bold text-slate-800">10. Suspensão, alteração e encerramento</h4>
                <p>O EloSUS Grupos poderá suspender o acesso ou alterar estes termos com aviso prévio.</p>
                <h4 className="font-bold text-slate-800">11. Contato e suporte</h4>
                <p>E-mail: [richardbraian@hotmail.com]</p>
                <h4 className="font-bold text-slate-800">12. Foro</h4>
                <p>Fica eleito o foro da Comarca de [cidade/UF].</p>
            </div>
        </ModalContent>
    );
};

export default TermsModal;
