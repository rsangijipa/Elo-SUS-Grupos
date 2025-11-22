import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
