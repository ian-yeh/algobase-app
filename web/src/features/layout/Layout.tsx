import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-background">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
