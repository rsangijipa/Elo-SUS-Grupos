import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tobaccoService } from '../../services/tobaccoService';
import { referralService } from '../../services/referralService';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import TobaccoAnamnesisForm from '../Protocols/Tobacco/TobaccoAnamnesisForm';
import { TobaccoAnamnesis } from '../../types/protocols/tobacco';

const AnamnesisPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pendingInviteId = searchParams.get('pendingInvite');

    const [loading, setLoading] = useState(true);
    const [protocol, setProtocol] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const checkProtocol = async () => {
            if (!pendingInviteId) {
                // If no invite, maybe default to Tobacco or show selection?
                // For now, let's assume Tobacco if accessed directly, or handle gracefully.
                setProtocol('TABAGISMO');
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Referral
                const referralRef = doc(db, 'referrals', pendingInviteId);
                const referralSnap = await getDoc(referralRef);

                if (referralSnap.exists()) {
                    const referralData = referralSnap.data();
                    if (referralData.groupId) {
                        // 2. Fetch Group
                        const groupRef = doc(db, 'grupos', referralData.groupId);
                        const groupSnap = await getDoc(groupRef);
                        if (groupSnap.exists()) {
                            const groupData = groupSnap.data();
                            setProtocol(groupData.protocol);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching protocol:", err);
                setError("Não foi possível identificar o protocolo do grupo.");
            } finally {
                setLoading(false);
            }
        };

        checkProtocol();
    }, [pendingInviteId]);

    const handleTobaccoSave = async (data: TobaccoAnamnesis) => {
        if (!user) return;
        try {
            // 1. Save Anamnesis
            await tobaccoService.saveAnamnesis({
                ...data,
                patientId: user.id,
                patientName: user.name
            });

            // 2. If pending invite, accept it
            if (pendingInviteId) {
                await referralService.acceptInvite(pendingInviteId, user.name, user.id);
                toast.success('Anamnese salva! Você foi adicionado ao grupo com sucesso.');
            } else {
                toast.success('Anamnese salva com sucesso!');
            }

            // 3. Redirect to Dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving anamnesis:', error);
            toast.error('Erro ao salvar anamnese. Tente novamente.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <FileText size={32} />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Ficha de Anamnese</h1>
                            <p className="text-blue-100 max-w-lg mx-auto">
                                Responda ao questionário abaixo para completar seu perfil e ingressar no grupo terapêutico.
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {protocol === 'TABAGISMO' ? (
                            <TobaccoAnamnesisForm
                                patientId={user?.id || ''}
                                patientName={user?.name || ''}
                                onSave={handleTobaccoSave}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Tudo pronto!</h2>
                                <p className="text-slate-600 mb-8">
                                    Este grupo não requer uma anamnese específica no momento.
                                </p>
                                <button
                                    onClick={async () => {
                                        if (pendingInviteId && user) {
                                            try {
                                                await referralService.acceptInvite(pendingInviteId, user.name, user.id);
                                                toast.success('Você foi adicionado ao grupo com sucesso!');
                                                navigate('/dashboard');
                                            } catch (e) {
                                                console.error(e);
                                                toast.error('Erro ao entrar no grupo.');
                                            }
                                        } else {
                                            navigate('/dashboard');
                                        }
                                    }}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Confirmar Entrada no Grupo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnamnesisPage;
