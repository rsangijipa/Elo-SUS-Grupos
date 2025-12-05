import { UserProfile } from '../types/schema';

const ANVIL_API_KEY = import.meta.env.VITE_ANVIL_API_KEY;
const ANVIL_URL = 'https://app.useanvil.com/api/v1/generate-pdf';

if (!ANVIL_API_KEY) {
    console.error("Anvil API Key missing! Check your .env file.");
}

interface GeneratePdfOptions {
    data: any;
    title?: string;
}

import { jsPDF } from "jspdf";
import { OrganizationSettings } from "../config/settings";

// ... existing imports

export const pdfService = {
    async generateIdentityCardPdf(user: any, groupName: string) {
        const doc = new jsPDF();

        // Simulating a card layout
        doc.setFillColor(240, 240, 250);
        doc.rect(20, 20, 170, 100, "F");
        doc.setDrawColor(0, 0, 0);
        doc.rect(20, 20, 170, 100, "S");

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("CARTEIRA DE IDENTIFICAÇÃO - ELOSUS", 105, 40, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Participante: ${user.name}`, 30, 60);
        doc.text(`CNS: ${user.cns || 'Não informado'}`, 30, 70);
        doc.text(`Grupo: ${groupName}`, 30, 80);
        doc.text(`Membro desde: ${new Date().toLocaleDateString()}`, 30, 90);

        doc.setFontSize(10);
        doc.text("Apresente esta carteirinha nas unidades de saúde.", 105, 110, { align: "center" });

        doc.save(`carteirinha_${user.name.split(' ')[0]}.pdf`);
    },

    async generateClinicalReportPdf(patient: any, moodHistory: any[], quizResult: any) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let y = 20;

        // Cabeçalho Simplificado
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(OrganizationSettings.municipalityName.toUpperCase(), pageWidth / 2, y, { align: "center" });
        y += 10;
        doc.setFontSize(16);
        doc.text("RELATÓRIO CLÍNICO DE SAÚDE MENTAL", pageWidth / 2, y, { align: "center" });
        y += 15;

        // Dados do Paciente
        doc.setFontSize(12);
        doc.text(`Paciente: ${patient.name}`, margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`CNS: ${patient.cns || 'N/A'}`, margin, y);
        doc.text(`Data de Nasc.: ${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}`, margin + 100, y);
        y += 15;

        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Resultado da Triagem
        if (quizResult) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Última Triagem / Avaliação", margin, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Pontuação: ${quizResult.score}/${quizResult.totalQuestions}`, margin, y);
            doc.text(`Nível de Risco: ${quizResult.riskLevel === 'high' ? 'ALTO' : quizResult.riskLevel === 'moderate' ? 'MÉDIO' : 'BAIXO'}`, margin + 50, y);
            doc.text(`Data: ${quizResult.createdAt?.seconds ? new Date(quizResult.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`, margin + 100, y);
            y += 15;
        }

        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Histórico de Humor
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Histórico Recente de Humor (Últimos Registros)", margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        if (moodHistory && moodHistory.length > 0) {
            moodHistory.slice(0, 10).forEach(log => {
                const date = log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleDateString() : 'Hoje';
                const valueMap = ['😡', '😢', '😐', '🙂', '😁'];
                const labelMap = ['Muito Mal', 'Mal', 'Normal', 'Bem', 'Muito Bem'];
                // jsPDF might not support emojis well by default without specific fonts, using text labels
                const label = labelMap[log.value - 1] || log.value;

                doc.text(`${date} - ${label} (${log.value}/5)`, margin, y);
                if (log.note) {
                    y += 5;
                    doc.setFont("helvetica", "italic");
                    doc.text(`   "${log.note}"`, margin, y);
                    doc.setFont("helvetica", "normal");
                }
                y += 7;
            });
        } else {
            doc.text("Nenhum registro de humor encontrado.", margin, y);
            y += 10;
        }

        // Rodapé
        y = 280;
        doc.setFontSize(8);
        doc.text("Gerado automaticamente pelo sistema EloSUS.", pageWidth / 2, y, { align: "center" });

        doc.save(`relatorio_clinico_${patient.name.split(' ')[0]}.pdf`);
    },

    generateCounterReferencePDF(patientData: any, dischargeData: any) {
        const doc = new jsPDF();

        // Configurações visuais
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let y = 20;

        // 1. Cabeçalho
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(OrganizationSettings.municipalityName.toUpperCase(), pageWidth / 2, y, { align: "center" });
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(OrganizationSettings.healthUnitType.toUpperCase(), pageWidth / 2, y, { align: "center" });
        y += 5;
        doc.text("SISTEMA ÚNICO DE SAÚDE - SUS", pageWidth / 2, y, { align: "center" });
        y += 15;

        // Linha divisória
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // 2. Título
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("RELATÓRIO DE CONTRARREFERÊNCIA", pageWidth / 2, y, { align: "center" });
        y += 15;

        // 3. Dados de Identificação
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("IDENTIFICAÇÃO DO USUÁRIO", margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Nome: ${patientData.name}`, margin, y);
        doc.text(`CNS: ${patientData.cns || 'Não informado'}`, margin + 100, y);
        y += 6;
        doc.text(`Nome da Mãe: ${patientData.motherName || 'Não informado'}`, margin, y);
        y += 6;
        doc.text(`Unidade de Origem: ${patientData.originUnit || 'Não informada'}`, margin, y);
        y += 10;

        // Linha divisória
        doc.setLineWidth(0.1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // 4. Relatório / Conduta
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("RELATÓRIO DE EVOLUÇÃO E CONDUTA", margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const splitText = doc.splitTextToSize(dischargeData.dischargeReason, contentWidth);
        doc.text(splitText, margin, y);
        y += (splitText.length * 5) + 10;

        // 5. Situação / Desfecho (Visual Checkboxes)
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("SITUAÇÃO ATUAL", margin, y);
        y += 10;

        const options = [
            { label: "Alta (Conclusão de Ciclo)", checked: dischargeData.dischargeType === 'IMPROVEMENT' },
            { label: "Manutenção de Vínculo (Cuidado Compartilhado)", checked: dischargeData.dischargeType === 'SHARED_CARE' },
            { label: "Encaminhamento", checked: dischargeData.dischargeType === 'REFERRAL' },
            { label: "Evasão / Abandono", checked: dischargeData.dischargeType === 'ABANDONMENT' }
        ];

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        options.forEach(opt => {
            const check = opt.checked ? "[ X ]" : "[   ]";
            doc.text(`${check} ${opt.label}`, margin + 5, y);
            y += 7;
        });

        if (dischargeData.destinationUnit) {
            y += 2;
            doc.setFont("helvetica", "bold");
            doc.text(`Destino Sugerido: ${dischargeData.destinationUnit}`, margin + 5, y);
        }

        // Espaço para rodapé
        y = 250; // Joga para o final da página

        // 6. Assinatura
        doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
        y += 5;
        doc.setFontSize(9);
        doc.text("Profissional Responsável", pageWidth / 2, y, { align: "center" });
        y += 5;
        doc.text(new Date().toLocaleDateString(), pageWidth / 2, y, { align: "center" });

        // 7. Rodapé Legal
        y = 280;
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text("Este documento é parte integrante do prontuário do paciente, conforme Resolução CFP nº 01/2009.", pageWidth / 2, y, { align: "center" });
        doc.text(`Gerado via EloSUS - ${OrganizationSettings.appVersion}`, pageWidth / 2, y + 4, { align: "center" });

        // Salvar/Download
        doc.save(`contrarreferencia_${patientData.name.split(' ')[0]}.pdf`);
    }
};

