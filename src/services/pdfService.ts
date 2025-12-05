import { User } from '../types/user';

const ANVIL_API_KEY = 'acTY02yb4IUkmYwueBsliWDLQVAIokK1';
const ANVIL_URL = 'https://app.useanvil.com/api/v1/generate-pdf';

interface GeneratePdfOptions {
    data: any;
    title?: string;
}

export const pdfService = {
    async generatePdf(payload: any) {
        const response = await fetch(ANVIL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(ANVIL_API_KEY + ':')
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorText}`);
        }

        return response.blob();
    },

    downloadBlob(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    async generateIdentityCardPdf(user: User, groupName: string) {
        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; }
            .card {
                width: 100%;
                max-width: 500px;
                height: 300px;
                background: linear-gradient(135deg, #6C4FFE 0%, #4F46E5 100%);
                color: white;
                border-radius: 20px;
                padding: 30px;
                position: relative;
                overflow: hidden;
            }
            table { width: 100%; border-collapse: collapse; }
            td { vertical-align: top; }
            .logo { font-size: 28px; font-weight: bold; letter-spacing: 1px; }
            .chip {
                width: 60px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.3);
            }
            .user-info { margin-top: 40px; }
            .label { font-size: 12px; opacity: 0.8; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
            .cns { font-family: monospace; letter-spacing: 3px; font-size: 22px; }
            .footer { margin-top: 30px; font-size: 12px; opacity: 0.8; text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; }
        `;

        const html = `
            <div class="card">
                <table>
                    <tr>
                        <td><div class="logo">EloSUS</div></td>
                        <td align="right"><div class="chip"></div></td>
                    </tr>
                </table>
                
                <div class="user-info">
                    <table>
                        <tr>
                            <td width="60%">
                                <div class="label">Paciente</div>
                                <div class="value">${user.name}</div>
                            </td>
                            <td width="40%" align="right">
                                <div class="label">Grupo</div>
                                <div class="value">${groupName}</div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <div class="label">Cartão Nacional de Saúde</div>
                                <div class="value cns">${user.cns || '000 0000 0000 0000'}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="footer">
                    Carteira Digital do Paciente - Sistema Único de Saúde
                </div>
            </div>
        `;

        const blob = await this.generatePdf({
            data: { html, css },
            title: 'Carteirinha Digital'
        });

        this.downloadBlob(blob, `carteirinha_${user.name.split(' ')[0]}.pdf`);
    },

    async generateClinicalReportPdf(user: User, moodHistory: any[], quizResults: any) {
        const moodRows = moodHistory.map(m =>
            `| ${new Date(m.timestamp).toLocaleDateString()} | ${m.mood} | ${m.tags.join(", ")} |`
        ).join('\n');

        const markdown = `
# Relatório de Evolução - EloSUS

**Paciente:** ${user.name}  
**CNS:** ${user.cns || 'N/A'}  
**Data do Relatório:** ${new Date().toLocaleDateString()}

---

## Histórico de Humor (Últimas Entradas)

| Data | Humor | Tags |
|------|-------|------|
${moodRows}

---

## Avaliação de Saúde Mental (Última Triagem)

**Score:** ${quizResults?.score || 'N/A'}  
**Risco:** ${quizResults?.risk || 'N/A'}

---

<br><br><br>
___________________________________________________
**Assinatura do Profissional Responsável**
        `;

        const blob = await this.generatePdf({
            data: { markdown },
            title: 'Relatório Clínico'
        });

        this.downloadBlob(blob, `relatorio_${user.name.split(' ')[0]}.pdf`);
    }
};
