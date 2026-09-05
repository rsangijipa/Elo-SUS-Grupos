export interface BPARecord {
    cnsPatient: string;
    cboProfessional: string;
    procedureCode: string;
    date: string;
    cid: string;
}

export const generateBPA = (sessionData: any): BPARecord[] => {
    // Mock logic to transform session data into BPA records
    // In a real app, this would map over patients and create records

    const records: BPARecord[] = (sessionData.patients || []).map((patient: any) => ({
        cnsPatient: patient.cns || '0000000000000000',
        cboProfessional: '251510', // Psicólogo Clínico
        procedureCode: '03.01.08.016-8', // Atendimento em Grupo
        date: new Date().toLocaleDateString('pt-BR'),
        cid: 'F17.2' // Ex: Tabagismo
    }));

    return records;
};

export const downloadBPA = (records: BPARecord[]) => {
    // Mock download action
    const csvContent = "data:text/csv;charset=utf-8,"
        + "CNS_PACIENTE,CBO_PROFISSIONAL,COD_PROCEDIMENTO,DATA,CID\n"
        + records.map(r => `${r.cnsPatient},${r.cboProfessional},${r.procedureCode},${r.date},${r.cid}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bpa_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
