import { UserProfile } from '../types/schema';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas'; // Import html2canvas for jsPDF .html() usage
import { OrganizationSettings } from "../config/settings";
import {
    buildIdentityCardPayload,
    buildClinicalReportPayload,
    buildDischargePayload,
    buildUnitReportPayload
} from './pdfTemplates';
import { DischargeType, DischargeStatus } from '../types/shared';

/**
 * 
 * SERVIÇO DE GERAÇÃO DE PDF (LOCAL / CLIENT-SIDE)
 * Usa jsPDF + html2canvas para renderizar os templates HTML/CSS definidos em pdfTemplates.ts
 * 
 */

export const pdfService = {

    /**
     * Função Helper Privada para renderizar HTML -> PDF Localmente
     */
    async _generateLocalPdf(payload: { data: { html: string, css: string } }, filename: string) {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        // 1. Monta o HTML Completo (Injetando CSS)
        // Isso cria um elemento invisível ou string completa para o jsPDF processar
        const fullHtml = `
            <html>
            <head>
                <style>
                    ${payload.data.css}
                    /* Ajustes para impressão em A4 podem ser necessários aqui */
                    body { width: 595pt; } 
                </style>
            </head>
            <body>
                ${payload.data.html}
            </body>
            </html>
        `;

        // 2. Renderiza usando a API .html() do jsPDF (que usa html2canvas por baixo)
        // Nota: Precisamos criar um elemento temporário no DOM para o jsPDF capturar corretamente os estilos
        const element = document.createElement('div');
        element.innerHTML = fullHtml;
        element.style.width = '595pt'; // Largura A4 em points
        document.body.appendChild(element);

        try {
            await doc.html(element, {
                callback: (pdf) => {
                    pdf.save(filename);
                },
                x: 0,
                y: 0,
                width: 595, // Target width in PDF document unit
                windowWidth: 800, // Window width in CSS pixels
                html2canvas: {
                    scale: 0.75, // Ajuste de escala para caber melhor na página se necessário
                    useCORS: true, // Permitir carregar imagens externas (QR Code)
                    logging: false
                }
            });
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF. Verifique o console.");
        } finally {
            document.body.removeChild(element);
        }
    },

    /**
     * 1. Carteirinha
     */
    async generateIdentityCardPdf(user: any, groupName: string) {
        const memberSince = user.createdAt?.seconds
            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
            : new Date().toLocaleDateString();

        const payload = buildIdentityCardPayload(user.name, groupName, memberSince);

        // Ajuste específico para a carteirinha (landscape ou tamanho customizado se quiser, mas aqui usaremos A4 padrao com o container no meio)
        await this._generateLocalPdf(payload, `carteirinha_${user.name.split(' ')[0]}.pdf`);
    },

    /**
     * 2. Relatório Clínico (Prontuário)
     */
    async generateClinicalReportPdf(patient: any, moodHistory: any[], quizResult: any) {
        // Enriquecendo o histórico com tags (simulado se não tiver)
        const enrichedMoodHistory = moodHistory.map(m => ({
            ...m,
            date: m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000) : new Date(),
            tags: m.tags || []
        }));

        const payload = buildClinicalReportPayload(patient, enrichedMoodHistory);
        await this._generateLocalPdf(payload, `relatorio_clinico_${patient.name.split(' ')[0]}.pdf`);
    },

    /**
     * 3. Contrarreferência / Alta
     */
    async generateCounterReferencePDF(patientData: any, dischargeData: any) {
        // Mapeia o Texto da Razão para algo legível no campo "Motivo"
        const reasonMap: Record<string, string> = {
            'IMPROVEMENT': 'Alta por Conclusão de Ciclo Terapêutico (Melhora)',
            'REFERRAL': 'Encaminhamento para Serviço Especializado',
            'ABANDONMENT': 'Evasão / Abandono de Tratamento',
            'SHARED_CARE': 'Manutenção de Vínculo em Cuidado Compartilhado'
        };

        const reasonText = reasonMap[dischargeData.dischargeType] || dischargeData.dischargeType;

        // O "dischargeReason" que vem do modal contém o Texto Longo gerado pelo template de texto
        // Vamos usar esse texto longo no campo "Recomendações"
        const recommendationsText = dischargeData.dischargeReason;

        const payload = buildDischargePayload(patientData.name, reasonText, recommendationsText);
        await this._generateLocalPdf(payload, `contrarreferencia_${patientData.name.split(' ')[0]}.pdf`);
    },

    /**
     * 4. Relatório Gerencial da Unidade
     */
    async generateUnitReportPdf(patients: any[], moodMap: any) {
        // Prepara os dados lisos para o template
        const patientsFormatted = patients.map(p => {
            const mood = moodMap[p.id];
            const riskLevel = (mood?.value && mood.value < 2) ? 'high' : 'normal';

            return {
                name: p.name,
                cns: p.cns,
                riskLevel: riskLevel,
                lastVisit: mood ? new Date(mood.createdAt.seconds * 1000).toLocaleDateString() : '-'
            };
        });

        const payload = buildUnitReportPayload(OrganizationSettings.municipalityName, patientsFormatted);
        await this._generateLocalPdf(payload, `relatorio_unidade_${new Date().toISOString().split('T')[0]}.pdf`);
    }

};
