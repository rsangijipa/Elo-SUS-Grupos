import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, PlusCircle, Save, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { useZodForm } from '../../hooks/useZodForm';
import { PatientSchema, type PatientFormValues } from '../../schemas';
import { groupService } from '../../services/groupService';
import { healthUnitService } from '../../services/healthUnitService';
import { MapService } from '../../services/MapService';
import { patientService } from '../../services/patientService';
import type { Group } from '../../types/group';
import type { HealthUnit } from '../../types/HealthUnit';
import type { Patient } from '../../types/patient';
import { formatCNS } from '../../utils/validators';
import { useCepLookup } from '../../hooks/useCepLookup';

const AddressAutocomplete = lazy(async () => {
    const module = await import('../../components/Shared/AddressAutocomplete');
    return { default: module.AddressAutocomplete };
});

const initialValues: PatientFormValues = {
    name: '',
    birthDate: '',
    sexo: 'M',
    cpf: '',
    cns: '',
    motherName: '',
    originUnit: '',
    phone: '',
    whatsappResponsavel: '',
    nomeResponsavel: '',
    address: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    observacoes: '',
    unidadeSaudeId: '',
    status: 'active'
};

const AddressAutocompleteFallback = () => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Carregando busca de endereco...
    </div>
);

const PatientForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { unitAddress } = useSettings();
    const [loading, setLoading] = useState(false);
    const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
    const [activeGroups, setActiveGroups] = useState<Group[]>([]);
    const [mapPreview, setMapPreview] = useState<{ lat: number; lng: number } | null>(null);
    const [showAddressSearch, setShowAddressSearch] = useState(false);
    const {
        values: formData,
        errors,
        handleChange,
        validate,
        setValues,
        setFieldValue
    } = useZodForm<PatientFormValues>(PatientSchema, initialValues);
    const { loading: cepLoading, error: cepError, lookup: lookupCep, formatCep } = useCepLookup();

    const composedAddress = useMemo(() => {
        return [
            [formData.street, formData.number, formData.complement].filter(Boolean).join(', '),
            [formData.neighborhood, formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ')
        ].filter(Boolean).join(', ');
    }, [formData.city, formData.complement, formData.neighborhood, formData.number, formData.state, formData.street, formData.zipCode]);

    useEffect(() => {
        void loadHealthUnits();
        if (id) {
            void loadPatient(id);
            void loadActiveGroups();
        }
    }, [id]);

    useEffect(() => {
        if (formData.neighborhood && healthUnits.length > 0 && !id) {
            const neighborhoodLower = formData.neighborhood.toLowerCase();
            const matchedUBS = healthUnits.find((ubs) =>
                ubs.name.toLowerCase().includes(neighborhoodLower) || ubs.address.toLowerCase().includes(neighborhoodLower)
            );

            if (matchedUBS) {
                setFieldValue('unidadeSaudeId', matchedUBS.id);
            }
        }
    }, [formData.neighborhood, healthUnits, id, setFieldValue]);

    useEffect(() => {
        if (!composedAddress) {
            setMapPreview(null);
            return;
        }

        const timeout = window.setTimeout(async () => {
            const coordinates = await MapService.getCoordinates(composedAddress);
            setMapPreview(coordinates);
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [composedAddress]);

    const loadHealthUnits = async () => setHealthUnits(await healthUnitService.getAll());

    const loadPatient = async (patientId: string) => {
        const patient = await patientService.getById(patientId);
        if (!patient) {
            return;
        }

        setValues({
            ...initialValues,
            name: patient.name || '',
            birthDate: patient.birthDate || '',
            sexo: patient.sexo || 'M',
            cpf: patient.cpf || '',
            cns: patient.cns || '',
            motherName: patient.motherName || '',
            originUnit: patient.originUnit || '',
            phone: patient.phone || '',
            whatsappResponsavel: patient.whatsappResponsavel || '',
            nomeResponsavel: patient.nomeResponsavel || '',
            address: patient.address || patient.street || '',
            street: patient.street || patient.address || '',
            number: patient.number || '',
            complement: patient.complement || '',
            neighborhood: patient.neighborhood || '',
            city: patient.city || '',
            state: patient.state || '',
            zipCode: patient.zipCode || '',
            observacoes: patient.observacoes || '',
            unidadeSaudeId: patient.unidadeSaudeId || '',
            status: patient.status || 'active'
        });
        setMapPreview(patient.coordinates || null);
    };

    const loadActiveGroups = async () => {
        const groups = await groupService.getAll();
        setActiveGroups(groups.filter((group) => group.status === 'active'));
    };

    const handleAddToGroup = async (groupId: string) => {
        if (!id) return;
        await groupService.addParticipant(groupId, id, unitAddress);
        toast.success('Paciente adicionado ao grupo com sucesso!');
        await loadActiveGroups();
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'cpf') {
            let nextValue = value.replace(/\D/g, '').slice(0, 11);
            nextValue = nextValue.replace(/(\d{3})(\d)/, '$1.$2');
            nextValue = nextValue.replace(/(\d{3})(\d)/, '$1.$2');
            nextValue = nextValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            setFieldValue('cpf', nextValue);
            return;
        }

        if (name === 'cns') {
            setFieldValue('cns', formatCNS(value));
            return;
        }

        if (name === 'zipCode') {
            setFieldValue('zipCode', formatCep(value));
            return;
        }

        handleChange(e);
    };

    const handleCepBlur = async () => {
        const result = await lookupCep(formData.zipCode || '');
        if (!result) {
            setShowAddressSearch(true);
            return;
        }

        setFieldValue('street', result.logradouro || '');
        setFieldValue('complement', result.complemento || formData.complement);
        setFieldValue('neighborhood', result.bairro || '');
        setFieldValue('city', result.localidade || '');
        setFieldValue('state', result.uf || '');
        setFieldValue('address', result.logradouro || '');
        setShowAddressSearch(false);
    };

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFieldValue('street', address);
        setFieldValue('address', address);
        setMapPreview({ lat, lng });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = validate();
        if (!result.success) {
            toast.error('Revise os campos obrigatorios do formulario.');
            return;
        }

        setLoading(true);
        const payload: Patient = {
            ...(result.data as Patient),
            address: [result.data.street, result.data.number, result.data.complement].filter(Boolean).join(', ')
        };

        try {
            if (id) {
                await patientService.update(id, payload);
            } else {
                await patientService.create(payload);
            }
            navigate('/patients');
        } finally {
            setLoading(false);
        }
    };

    const staticMapUrl = mapPreview && import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${mapPreview.lat},${mapPreview.lng}&zoom=15&size=800x280&markers=color:red%7C${mapPreview.lat},${mapPreview.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        : null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/patients')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors" aria-label="Voltar para pacientes">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{id ? 'Editar Paciente' : 'Novo Paciente'}</h2>
                    <p className="text-sm text-slate-500">Campos de endereco sao opcionais e ajudam no mapa territorial.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
                        <input data-testid="input-patient-name" name="name" value={formData.name} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo *</label>
                        <select name="sexo" value={formData.sexo} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                            <option value="M">Masculino</option><option value="F">Feminino</option><option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label><input name="cpf" value={formData.cpf} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">CNS *</label><input name="cns" value={formData.cns} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Mae *</label><input name="motherName" value={formData.motherName} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Telefone *</label><input name="phone" value={formData.phone} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Unidade de Origem</label><input name="originUnit" value={formData.originUnit} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Status</label><select name="status" value={formData.status} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"><option value="active">Ativo</option><option value="waiting">Aguardando</option><option value="discharged">Alta</option><option value="dropout">Abandono</option><option value="inactive">Inativo</option></select></div>

                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><MapPin size={18} className="text-blue-600" /> Endereco para mapa territorial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">CEP</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input name="zipCode" value={formData.zipCode} onChange={handleFieldChange} onBlur={handleCepBlur} className="block w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm" placeholder="00000-000" />
                                </div>
                                {cepLoading && <p className="mt-1 text-xs text-blue-600 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Buscando CEP...</p>}
                                {cepError && <p className="mt-1 text-xs text-red-500">{cepError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Unidade de Referencia</label>
                                <select name="unidadeSaudeId" value={formData.unidadeSaudeId} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                                    <option value="">Selecione a UBS...</option>
                                    {healthUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Logradouro</label>
                                <input data-testid="input-patient-address" name="street" value={formData.street} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" placeholder="Rua, avenida ou travessa" />
                            </div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Numero</label><input name="number" value={formData.number} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Complemento</label><input name="complement" value={formData.complement} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Bairro</label><input name="neighborhood" value={formData.neighborhood} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Cidade</label><input name="city" value={formData.city} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">UF</label><input name="state" maxLength={2} value={formData.state} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm uppercase" /></div>
                            <div className="md:col-span-2">
                                <button type="button" onClick={() => setShowAddressSearch((current) => !current)} className="text-sm font-bold text-brand-professional hover:underline">
                                    {showAddressSearch ? 'Ocultar busca avancada' : 'Usar busca alternativa com Google Places'}
                                </button>
                                {showAddressSearch && (
                                    <div className="mt-3">
                                        <Suspense fallback={<AddressAutocompleteFallback />}>
                                            <AddressAutocomplete label="Busca alternativa" type="address" onSelect={handleAddressSelect} defaultValue={formData.street} />
                                        </Suspense>
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-700 mb-3">Confirmacao visual do endereco</p>
                                {staticMapUrl ? (
                                    <img src={staticMapUrl} alt="Mapa do endereco informado" className="h-56 w-full rounded-xl object-cover border border-slate-200" />
                                ) : (
                                    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-500 text-center px-6">
                                        Preencha CEP ou endereco para gerar a miniatura do mapa territorial.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Contato e Responsavel</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Responsavel</label><input name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp do Responsavel</label><input name="whatsappResponsavel" value={formData.whatsappResponsavel} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
                        </div>
                    </div>

                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-1">Observacoes</label><textarea name="observacoes" rows={4} value={formData.observacoes} onChange={handleFieldChange} className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>

                    {id && (
                        <div className="md:col-span-2 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-600" /> Grupos Disponiveis na UBS</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                                {activeGroups.map((group) => {
                                    const participantCount = group.participants?.length || 0;
                                    const maxParticipants = group.maxParticipants || 10;
                                    const isFull = participantCount >= maxParticipants;
                                    const isParticipating = group.participants?.includes(id);
                                    if (isParticipating) return null;
                                    return (
                                        <div key={group.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-slate-50">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{group.schedule} • {group.room}</p>
                                            </div>
                                            <button type="button" disabled={isFull} onClick={() => void handleAddToGroup(group.id)} className={`p-2 rounded-lg transition-colors ${isFull ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`} aria-label={`Adicionar ao grupo ${group.name}`}>
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/patients')} className="w-full md:w-auto px-6 py-3 md:py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} data-testid="btn-save-patient" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 text-sm font-bold text-white bg-[#0054A6] hover:bg-[#004080] rounded-lg shadow-sm disabled:opacity-50">
                        <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientForm;
