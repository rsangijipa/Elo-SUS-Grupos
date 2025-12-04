import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-[100vh] overflow-hidden bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-300">
                <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
