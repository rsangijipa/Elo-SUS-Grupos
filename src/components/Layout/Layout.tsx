import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-[#F6F8FE]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F6F8FE] p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
