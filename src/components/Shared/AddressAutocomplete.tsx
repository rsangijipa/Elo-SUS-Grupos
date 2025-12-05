
import React from 'react';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { MapPin, Navigation } from 'lucide-react';

interface AddressAutocompleteProps {
    onSelect: (address: string, lat: number, lng: number, components?: any) => void;
    label: string;
    placeholder?: string;
    type?: 'address' | 'establishment';
    defaultValue?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    onSelect,
    label,
    placeholder,
    type = 'address',
    defaultValue = ''
}) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            types: type === 'address' ? ['address'] : ['establishment', 'health'],
            componentRestrictions: { country: 'br' } // Restrict to Brazil
        },
        debounce: 300,
        defaultValue
    });

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            // Extract address components if needed (e.g. neighborhood)
            const components = results[0].address_components;
            onSelect(address, lat, lng, components);
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    return (
        <div className="space-y-1 relative">
            <label className="text-sm font-bold text-slate-700">{label}</label>
            <div className="relative">
                {type === 'address' ? (
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                ) : (
                    <Navigation className="absolute left-3 top-3 text-slate-400" size={18} />
                )}

                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder={placeholder || "Digite para buscar..."}
                />

                {status === 'OK' && (
                    <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto animate-fade-in">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-none transition-colors"
                            >
                                <span className="block truncate">{description}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
