import React, { useState, useEffect } from 'react';
import { FileText, Download, Share, FileCheck, Printer, Upload, X, CheckCircle2 } from 'lucide-react';
import { contentService, ClinicalDocument, Material } from '../../services/integrations/contentService';
import { toast } from 'react-hot-toast';

const Materials: React.FC = () => {
    const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
    const [groupMaterials, setGroupMaterials] = useState<Material[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string; date: string; status: 'enviado' | 'analise' }>>([
        { id: 'u1', name: 'Exame de Sangue.pdf', date: new Date().toISOString(), status: 'enviado' }
    ]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        contentService.getClinicalDocuments().then(setDocuments);
        contentService.getMaterials().then(setGroupMaterials);
    }, []);

    const handleFileUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            const newDoc = {
                id: Math.random().toString(36).substr(2, 9),
                name: 'Novo Documento.pdf',
                date: new Date().toISOString(),
                status: 'enviado' as const
            };
            setUploadedDocs([newDoc, ...uploadedDocs]);
            setIsUploading(false);
            toast.success('Documento enviado com sucesso!');
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Meus Documentos</h2>
                    <p className="text-slate-500 mt-1">Sua pasta digital de saúde e relatórios clínicos.</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                    <Printer size={16} /> Imprimir Lista
                </button>
            </div>

            {/* Upload Section */}
            <section>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Enviar Documento</h3>
                        <p className="text-sm text-blue-700 mb-4">
                            Precisa enviar exames ou relatórios externos para seu terapeuta? Utilize esta área para anexar arquivos.
                        </p>
                        <button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                        >
                            {isUploading ? 'Enviando...' : <><Upload size={20} /> Selecionar Arquivo</>}
                        </button>
                    </div>
                    <div className="w-full md:w-1/3 bg-white rounded-xl border border-blue-100 p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Meus Envios Recentes</h4>
                        <div className="space-y-2">
                            {uploadedDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={16} className="text-slate-400 shrink-0" />
                                        <span className="text-sm text-slate-700 truncate">{doc.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {doc.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Clinical Documents Section */}
            <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileCheck className="text-blue-600" size={20} />
                    Relatórios & Encaminhamentos
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {documents.map(doc => (
                            <div key={doc.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                                <div className={`p-3 rounded-xl shrink-0 ${doc.type === 'encaminhamento' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {doc.type === 'encaminhamento' ? <Share size={24} /> : <FileText size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{doc.title}</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{doc.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Emitido por <span className="font-medium text-slate-700">{doc.doctorName}</span> ({doc.specialty})
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Data: {new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors">
                                        <Download size={16} /> Baixar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Group Materials Section */}
            <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="text-green-600" size={20} />
                    Materiais do Grupo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupMaterials.map(material => (
                        <div key={material.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 text-sm">{material.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3">Material de apoio</p>
                                <a href={material.url} className="text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                                    <Download size={14} /> Download PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Materials;
