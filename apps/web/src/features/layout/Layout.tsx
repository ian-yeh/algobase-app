import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-background">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
