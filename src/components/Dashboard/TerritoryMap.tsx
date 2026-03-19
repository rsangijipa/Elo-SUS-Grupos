import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Patient } from '../../types/patient';
import { AlertTriangle, User, MapPin, Activity, ArrowRight } from 'lucide-react';
import { OrganizationSettings } from '../../config/settings';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '1rem'
};

const defaultCenter = OrganizationSettings.defaultCoordinates || {
    lat: -9.9133,
    lng: -63.0408
};

const options = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

interface TerritoryMapProps {
    patients: Patient[];
}

import { useSettings } from '../../contexts/SettingsContext';

const TerritoryMap: React.FC<TerritoryMapProps> = ({ patients }) => {
    const { unitAddress } = useSettings();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || ''
    });

    if (!apiKey) {
        return (
            <div className="w-full h-[500px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-200">
                <MapPin size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-slate-600">Mapa Indisponível</h3>
                <p className="max-w-md mt-2">
                    A chave de API do Google Maps não foi configurada.
                    Verifique a variável <code className="bg-slate-200 px-1 py-0.5 rounded text-xs text-slate-700">VITE_GOOGLE_MAPS_API_KEY</code> no seu arquivo .env.
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full h-[500px] bg-red-50 rounded-2xl flex flex-col items-center justify-center text-red-400 p-8 text-center border border-red-100">
                <AlertTriangle size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-red-600">Erro ao carregar o mapa</h3>
                <p>Verifique sua conexão ou a validade da chave de API.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[500px] bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse">
                <MapPin size={48} className="text-slate-200" />
            </div>
        );
    }

    const getMarkerIcon = (risk: string | undefined) => {
        // Normalize risk level to lowercase for consistency
        const safeRisk = (risk || '').toLowerCase();

        let color = 'green';
        if (safeRisk === 'high') color = 'red';
        else if (safeRisk === 'medium' || safeRisk === 'attention') color = 'yellow';

        return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
    };

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={13}
                options={options}
                data-testid="territory-map-container"
            >
                {/* Health Unit Marker */}
                {window.google && (
                    <Marker
                        position={defaultCenter}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/kml/pal2/icon2.png',
                            scaledSize: new google.maps.Size(40, 40)
                        }}
                        title={`Unidade de Saúde: ${unitAddress}`}
                    />
                )}

                {/* Patient Markers */}
                {patients.map((patient) => (
                    patient.coordinates && (
                        <Marker
                            key={patient.id}
                            position={patient.coordinates}
                            icon={getMarkerIcon(patient.riskLevel)}
                            onClick={() => setSelectedPatient(patient)}
                            data-testid="map-marker"
                        />
                    )
                ))}

                {/* Info Window */}
                {selectedPatient && selectedPatient.coordinates && (
                    <InfoWindow
                        position={selectedPatient.coordinates}
                        onCloseClick={() => setSelectedPatient(null)}
                    >
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                                <User size={14} className="text-[#0054A6]" />
                                {selectedPatient.name}
                            </h3>

                            <div className="space-y-2 text-xs text-slate-600">
                                <p className="flex items-center gap-1">
                                    <span className="font-bold">Grupo:</span>
                                    {selectedPatient.territorialTags?.[0] || 'Geral'}
                                </p>

                                {(selectedPatient.riskLevel === 'HIGH' || selectedPatient.riskLevel?.toLowerCase() === 'high') && (
                                    <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100 mt-1">
                                        <p className="font-bold flex items-center gap-1">
                                            <AlertTriangle size={10} />
                                            Alerta IA
                                        </p>
                                        <p className="mt-0.5">{selectedPatient.riskSummary || 'Risco de evasão identificado.'}</p>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <a
                                        href={`/patients/${selectedPatient.id}`}
                                        className="text-[#0054A6] font-bold hover:underline flex items-center gap-1"
                                    >
                                        Ver Prontuário <ArrowRight size={12} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default TerritoryMap;
