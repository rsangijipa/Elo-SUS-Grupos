import React from 'react';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 ml-64">
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    {/* Breadcrumbs or Page Title could go here */}
                    Visão Geral
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
