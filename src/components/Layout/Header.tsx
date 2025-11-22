import { Bell, Search } from 'lucide-react';

export default function Header({ title }: { title?: string }) {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Toggle would go here */}
                <h1 className="text-xl font-bold text-slate-800">{title || 'EloSUS'}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente ou grupo..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-slate-400 text-slate-700"
                    />
                </div>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
}
