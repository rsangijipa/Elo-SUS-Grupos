import { OrganizationSettings } from "../config/settings";
import {
    buildIdentityCardPayload,
    buildClinicalReportPayload,
    buildDischargePayload,
    buildUnitReportPayload,
    type UnitReportPatient,
    type ClinicalReportPatient,
    type MoodHistoryEntry
} from './pdfTemplates';
import { toast } from 'react-hot-toast';

/**
 * 
 * SERVIÇO DE GERAÇÃO DE PDF (LOCAL / CLIENT-SIDE)
 * Usa jsPDF + html2canvas carregados via dynamic import para evitar impacto no bundle inicial.
 * 
 */

interface PdfPayload {
    data: {
        html: string;
        css: string;
    };
}

const getSafeFileName = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

export const pdfService = {

    /**
     * Helper: dynamic import de jsPDF e html2canvas
     */
    async _loadDeps() {
        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
            import('jspdf'),
            import('html2canvas'),
        ]);
        return { jsPDF, html2canvas };
    },

    /**
     * Função Helper Privada para renderizar HTML -> PDF Localmente
     */
    async _generateLocalPdf(payload: PdfPayload, filename: string) {
        const { jsPDF } = await this._loadDeps();
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const fullHtml = `
            <html>
            <head>
                <style>
                    ${payload.data.css}
                    body { width: 595pt; } 
                </style>
            </head>
            <body>
                ${payload.data.html}
            </body>
            </html>
        `;

        const element = document.createElement('div');
        element.innerHTML = fullHtml;
        element.style.width = '595pt';
        document.body.appendChild(element);

        try {
            await doc.html(element, {
                callback: (pdf) => {
                    pdf.save(filename);
                },
                x: 0,
                y: 0,
                width: 595,
                windowWidth: 800,
                html2canvas: {
                    scale: 0.75,
                    useCORS: true,
                    logging: false
                }
            });
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Erro ao gerar PDF. Tente novamente.");
        } finally {
            document.body.removeChild(element);
        }
    },

    /**
     * Captura elemento DOM por seletor e gera PDF com cabeçalho/rodapé
     */
    async captureAndExport(
        selector: string,
        unitName: string,
        kpiData?: { label: string; value: string | number }[],
        reportTitle: string = 'Relatorio da Unidade'
    ) {
        const toastId = toast.loading('Gerando relatório PDF...');

        try {
            const { jsPDF, html2canvas } = await this._loadDeps();
            const element = document.querySelector(selector) as HTMLElement | null;
            if (!element) {
                toast.error('Não foi possível encontrar os dados para exportar.', { id: toastId });
                return;
            }

            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');

            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;

            // Header
            doc.setFontSize(10);
            doc.setTextColor(0, 84, 166);
            doc.text('EloSUS Grupos', margin, margin + 8);

            doc.setFontSize(18);
            doc.setTextColor(0, 84, 166); // brand-professional
            doc.text(reportTitle, margin, margin + 28);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(unitName, margin, margin + 44);
            doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, margin + 58);

            // KPI table if provided
            let yOffset = margin + 78;
            if (kpiData?.length) {
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
                const colWidth = (pageWidth - 2 * margin) / kpiData.length;
                kpiData.forEach((kpi, i) => {
                    const x = margin + i * colWidth;
                    doc.setFont('helvetica', 'bold');
                    doc.text(String(kpi.value), x + colWidth / 2, yOffset, { align: 'center' });
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 116, 139);
                    doc.text(kpi.label, x + colWidth / 2, yOffset + 14, { align: 'center' });
                    doc.setTextColor(30, 41, 59);
                });
                yOffset += 36;
            }

            // Chart image
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const availableHeight = pageHeight - yOffset - margin - 30; // leave room for footer

            if (imgHeight > availableHeight) {
                // Scale down to fit
                const scale = availableHeight / imgHeight;
                doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth * scale, imgHeight * scale);
            } else {
                doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('Página 1/1', pageWidth / 2, pageHeight - 20, { align: 'center' });
            doc.text('EloSUS Grupos — Relatório Gerado Automaticamente', pageWidth / 2, pageHeight - 10, { align: 'center' });

            const safeName = getSafeFileName(unitName);
            const dateStr = new Date().toISOString().split('T')[0];
            doc.save(`relatorio_${safeName}_${dateStr}.pdf`);
            toast.success('PDF gerado com sucesso!', { id: toastId });
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF.', { id: toastId });
        }
    },

    /**
     * Exporta dados tabulares como CSV usando Blob API
     */
    exportCsv(headers: string[], rows: (string | number)[][], filename: string) {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exportado com sucesso!');
    },

    exportCsvSections(sections: { title: string; headers: string[]; rows: (string | number)[][] }[], filename: string) {
        const csvContent = sections
            .map((section) => [
                section.title,
                section.headers.join(','),
                ...section.rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n'))
            .join('\n\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exportado com sucesso!');
    },

    /**
     * 1. Carteirinha
     */
    async generateIdentityCardPdf(user: { name: string; createdAt?: unknown }, groupName: string) {
        let memberSince = new Date().toLocaleDateString();

        if (user.createdAt) {
            const createdAt = user.createdAt as any;
            if (typeof createdAt === 'object' && 'seconds' in createdAt) {
                memberSince = new Date(createdAt.seconds * 1000).toLocaleDateString();
            } else if (createdAt instanceof Date) {
                memberSince = createdAt.toLocaleDateString();
            } else if (typeof createdAt === 'string') {
                memberSince = new Date(createdAt).toLocaleDateString();
            }
        }

        const payload = buildIdentityCardPayload(user.name, groupName, memberSince);
        await this._generateLocalPdf(payload, `carteirinha_${user.name.split(' ')[0]}.pdf`);
    },

    /**
     * 2. Relatório Clínico (Prontuário)
     */
    async generateClinicalReportPdf(patient: ClinicalReportPatient, moodHistory: unknown[], quizResult?: unknown) {
        const enrichedMoodHistory: MoodHistoryEntry[] = (moodHistory as any[]).map(m => {
            let date = new Date();
            if (m.createdAt) {
                if (typeof m.createdAt === 'object' && 'seconds' in m.createdAt) {
                    date = new Date(m.createdAt.seconds * 1000);
                } else if (m.createdAt instanceof Date) {
                    date = m.createdAt;
                } else if (typeof m.createdAt === 'string') {
                    date = new Date(m.createdAt);
                }
            } else if (m.date) {
                date = new Date(m.date);
            }

            return {
                ...m,
                date,
                tags: m.tags || []
            };
        });

        const payload = buildClinicalReportPayload(patient, enrichedMoodHistory, quizResult);
        await this._generateLocalPdf(payload, `relatorio_clinico_${patient.name.split(' ')[0]}.pdf`);
    },

    async generateCounterReferencePDF(
        patientData: { name: string; cns?: string; motherName?: string; originUnit?: string }, 
        dischargeData: { dischargeType: string; dischargeReason: string }
    ) {
        const reasonMap: Record<string, string> = {
            'IMPROVEMENT': 'Alta por Conclusão de Ciclo Terapêutico (Melhora)',
            'REFERRAL': 'Encaminhamento para Serviço Especializado',
            'ABANDONMENT': 'Evasão / Abandono de Tratamento',
            'SHARED_CARE': 'Manutenção de Vínculo em Cuidado Compartilhado'
        };

        const reasonText = reasonMap[dischargeData.dischargeType] || dischargeData.dischargeType;
        const recommendationsText = dischargeData.dischargeReason;

        const payload = buildDischargePayload(patientData.name, reasonText, recommendationsText);
        await this._generateLocalPdf(payload, `contrarreferencia_${patientData.name.split(' ')[0]}.pdf`);
    },

    /**
     * 4. Relatório Gerencial da Unidade
     */
    async generateUnitReportPdf(patients: { id?: string; name: string; cns?: string }[], moodMap: Record<string, { value?: number; createdAt?: unknown } | null>) {
        const patientsFormatted: UnitReportPatient[] = patients.map(p => {
            const mood = p.id ? moodMap[p.id] : null;
            const riskLevel = (mood?.value && mood.value < 2) ? 'high' : 'normal';
            
            let lastVisit = '-';
            if (mood?.createdAt) {
                const createdAt = mood.createdAt as any;
                if (typeof createdAt === 'object' && 'seconds' in createdAt) {
                    lastVisit = new Date(createdAt.seconds * 1000).toLocaleDateString();
                } else if (createdAt instanceof Date) {
                    lastVisit = createdAt.toLocaleDateString();
                } else if (typeof createdAt === 'string') {
                    lastVisit = new Date(createdAt).toLocaleDateString();
                }
            }

            return {
                name: p.name,
                cns: p.cns,
                riskLevel: riskLevel,
                lastVisit: lastVisit
            };
        });

        const payload = buildUnitReportPayload(OrganizationSettings.municipalityName, patientsFormatted);
        const safeName = getSafeFileName(OrganizationSettings.municipalityName || 'unidade');
        await this._generateLocalPdf(payload, `relatorio_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

};
