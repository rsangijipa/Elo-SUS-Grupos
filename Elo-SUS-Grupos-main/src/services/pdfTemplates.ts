// src/services/pdfTemplates.ts

// Cores da Marca para uso no CSS
const colors = {
    primary: '#7A5CFF', // Roxo Aurora
    secondary: '#4E8FFF', // Azul Serenity
    text: '#1E2A40',
    lightGray: '#F8F9FC',
    border: '#D9DCE3',
    success: '#10B981',
    danger: '#EF4444'
};

export interface UnitReportPatient {
    name: string;
    cns?: string;
    riskLevel: string;
    lastVisit?: string;
}

/**
 * 1. MODELO: RELATÓRIO GERENCIAL DE UNIDADE
 * Lista pacientes, riscos e status geral.
 */
export const buildUnitReportPayload = (unitName: string, patients: UnitReportPatient[]) => {
    const date = new Date().toLocaleDateString('pt-BR');

    const rows = patients.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.cns || 'N/A'}</td>
      <td><span class="badge ${p.riskLevel === 'high' ? 'danger' : 'normal'}">${p.riskLevel === 'high' ? 'Alto Risco' : 'Normal'}</span></td>
      <td>${p.lastVisit || '-'}</td>
    </tr>
  `).join('');

    return {
        data: {
            html: `
        <div class="header">
          <h1>Relatório Gerencial - ${unitName}</h1>
          <p>Data de Emissão: ${date}</p>
        </div>
        <div class="stats">
          <div class="card">Total de Pacientes: <strong>${patients.length}</strong></div>
          <div class="card">Casos de Risco: <strong>${patients.filter(p => p.riskLevel === 'high').length}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome do Paciente</th>
              <th>CNS</th>
              <th>Classificação</th>
              <th>Última Visita</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">Gerado automaticamente pelo sistema EloSUS.</div>
      `,
            css: `
        body { font-family: 'Helvetica', sans-serif; color: ${colors.text}; font-size: 12px; }
        .header { margin-bottom: 20px; border-bottom: 2px solid ${colors.primary}; padding-bottom: 10px; }
        h1 { color: ${colors.primary}; margin: 0; font-size: 24px; }
        .stats { margin-bottom: 20px; }
        .card { display: inline-block; background: ${colors.lightGray}; padding: 10px; margin-right: 10px; border-radius: 4px; border: 1px solid ${colors.border}; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; background: ${colors.secondary}; color: white; padding: 8px; }
        td { border-bottom: 1px solid ${colors.border}; padding: 8px; }
        .badge { padding: 2px 6px; border-radius: 4px; color: white; font-size: 10px; }
        .badge.danger { background: ${colors.danger}; }
        .badge.normal { background: ${colors.success}; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; }
      `
        }
    };
};

/**
 * 2. MODELO: CARTEIRINHA DO GRUPO (ESTILO NUBANK/GLASS)
 * Usa tabelas para garantir layout lado a lado no PDF.
 */
export const buildIdentityCardPayload = (patientName: string, groupName: string, memberSince: string) => {
    return {
        data: {
            html: `
        <div class="card-container">
          <table class="card-layout">
            <tr>
              <td class="top-left">
                <div class="logo">EloSUS <small>Grupos</small></div>
              </td>
              <td class="top-right">
                <div class="chip"></div>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="content">
                <h2>${groupName}</h2>
                <p class="label">Membro Ativo desde ${memberSince}</p>
                <h1 class="name">${patientName.toUpperCase()}</h1>
              </td>
            </tr>
            <tr>
              <td class="footer-left">
                <div class="stamps">
                  <span class="dot filled"></span> <span class="dot filled"></span> <span class="dot"></span> <span class="dot"></span> <span class="dot"></span>
                </div>
                <div class="status-badge">ATIVO</div>
              </td>
              <td class="footer-right">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(patientName)}" class="qr-code" />
              </td>
            </tr>
          </table>
        </div>
      `,
            css: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        body { margin: 0; padding: 20px; font-family: 'Roboto', sans-serif; }
        
        /* O Container simula o cartão */
        .card-container {
          width: 350px;
          height: 200px;
          background-color: ${colors.primary}; /* Fallback */
          background-image: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        /* Layout via Tabela para segurança no PDF */
        table.card-layout { width: 100%; height: 100%; border-collapse: collapse; }
        td { vertical-align: top; }
        
        .top-right { text-align: right; }
        .footer-left { vertical-align: bottom; }
        .footer-right { vertical-align: bottom; text-align: right; }

        /* Elementos */
        .logo { font-weight: bold; font-size: 18px; letter-spacing: 1px; }
        .chip { 
          width: 40px; height: 30px; 
          background: rgba(255,255,255,0.2); 
          border: 1px solid rgba(255,255,255,0.4); 
          border-radius: 6px; 
          display: inline-block;
        }
        .content { padding-top: 15px; }
        h2 { font-size: 14px; margin: 0; opacity: 0.9; font-weight: normal; }
        .label { font-size: 10px; opacity: 0.7; margin: 2px 0 10px 0; text-transform: uppercase; }
        .name { font-size: 16px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }

        .stamps .dot { 
          display: inline-block; width: 10px; height: 10px; 
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.5); 
          margin-right: 4px; 
        }
        .stamps .dot.filled { background: white; box-shadow: 0 0 5px white; }
        
        .status-badge {
          display: inline-block; margin-top: 5px;
          font-size: 9px; background: #10B981; padding: 2px 6px; border-radius: 4px; font-weight: bold;
        }

        .qr-code { width: 50px; height: 50px; border-radius: 4px; background: white; padding: 2px; }
      `
        }
    };
};

export interface ClinicalReportPatient {
    name: string;
    cns?: string;
    phone?: string;
}

export interface MoodHistoryEntry {
    date: string | Date;
    mood?: number;
    tags: string[];
    note?: string;
}

/**
 * 3. MODELO: RELATÓRIO CLÍNICO (PRONTUÁRIO)
 * Focado em texto, evolução e histórico.
 */
export const buildClinicalReportPayload = (patient: ClinicalReportPatient, moodHistory: MoodHistoryEntry[], quizResult?: any) => {
    const date = new Date().toLocaleDateString('pt-BR');

    const moodRows = moodHistory.slice(0, 10).map(m => `
    <tr>
      <td>${new Date(m.date).toLocaleDateString()}</td>
      <td>${m.mood ?? '-'}/5</td>
      <td>${m.tags.join(', ')}</td>
      <td>${m.note || '-'}</td>
    </tr>
  `).join('');

    return {
        data: {
            html: `
        <div class="header">
          <div class="logo">EloSUS <span style="color:#7A5CFF">Prontuário</span></div>
          <div class="meta">Emitido em: ${date}</div>
        </div>

        <div class="section">
          <h3>Identificação do Paciente</h3>
          <p><strong>Nome:</strong> ${patient.name}</p>
          <p><strong>CNS:</strong> ${patient.cns || 'Não informado'}</p>
          <p><strong>Telefone:</strong> ${patient.phone || '-'}</p>
        </div>

        <div class="section">
          <h3>Evolução Emocional (Últimos Registros)</h3>
          <table>
            <thead><tr><th>Data</th><th>Humor</th><th>Fatores</th><th>Anotação</th></tr></thead>
            <tbody>${moodRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h3>Avaliação Profissional</h3>
          <div class="box">
            <p>O paciente apresenta adesão regular ao tratamento. Recomendado continuidade no grupo terapêutico.</p>
            ${quizResult ? `<p><strong>Resultado do Questionário:</strong> ${JSON.stringify(quizResult)}</p>` : ''}
          </div>
        </div>

        <div class="signature">
          ______________________________________<br>
          Assinatura do Responsável Técnico
        </div>
      `,
            css: `
        body { font-family: 'Times New Roman', serif; color: #333; line-height: 1.5; padding: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; }
        .logo { font-size: 20px; font-weight: bold; font-family: sans-serif; }
        .section { margin-bottom: 25px; }
        h3 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; color: #555; }
        p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .box { border: 1px solid #ddd; padding: 15px; background: #fafafa; min-height: 100px; }
        .signature { margin-top: 60px; text-align: center; font-size: 12px; }
      `
        }
    };
};

/**
 * 4. MODELO: CONTRARREFERÊNCIA (ALTA/ENCAMINHAMENTO)
 * Documento formal e oficial.
 */
export const buildDischargePayload = (patientName: string, reason: string, recommendations: string) => {
    const date = new Date().toLocaleDateString('pt-BR');

    return {
        data: {
            html: `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="margin:0;">SISTEMA ÚNICO DE SAÚDE</h2>
          <h3 style="margin:5px 0;">SECRETARIA MUNICIPAL DE SAÚDE</h3>
          <p style="font-size: 12px;">Rede de Atenção Psicossocial - EloSUS</p>
        </div>

        <h1 style="text-align: center; text-decoration: underline;">CONTRARREFERÊNCIA</h1>

        <div style="margin: 40px 0;">
          <p>Ao Colega / Unidade de Destino,</p>
          <p>Encaminhamos o(a) paciente <strong>${patientName}</strong>, que esteve sob nossos cuidados no Grupo Terapêutico.</p>
        </div>

        <div class="field">
          <strong>Motivo da Alta / Encaminhamento:</strong>
          <p>${reason}</p>
        </div>

        <div class="field">
          <strong>Conduta e Recomendações:</strong>
          <p>${recommendations}</p>
        </div>

        <div style="margin-top: 80px; text-align: center;">
          <p>${date}</p>
          <br><br>
          __________________________________________<br>
          <strong>Psicólogo(a) Responsável</strong><br>
          CRP: 00/00000
        </div>
      `,
            css: `
        body { font-family: 'Arial', sans-serif; font-size: 12pt; padding: 40px; }
        .field { margin-bottom: 30px; }
        .field p { border: 1px solid #ccc; padding: 10px; min-height: 50px; background: #fff; margin-top: 5px; }
      `
        }
    };
};
