import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/stores/authStore';

const Layout = () => {
    const token = useAuthStore((s) => s.token);
    if (!token) return <Navigate to="/signin" replace />;

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
