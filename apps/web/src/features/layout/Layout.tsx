import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from '@/components/Logo';
import { useAuthStore } from '@/stores/authStore';

export type LayoutContext = { menuOpen: boolean; openMenu: () => void };

const Layout = () => {
    const token = useAuthStore((s) => s.token);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close the mobile drawer whenever the route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [mobileOpen]);

    // The timer is full-screen: no rail, no top bar, the menu is a drawer at every width
    const immersive = location.pathname === '/timer';

    if (!token) return <Navigate to="/signin" replace />;

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} drawerOnly={immersive} />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile top bar */}
                <header className={`${immersive ? 'hidden' : 'md:hidden'} flex items-center h-14 px-4 border-b border-foreground/5 bg-background shrink-0`}>
                    <button
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        className="p-1.5 -ml-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-center">
                        <Logo className="text-lg font-semibold" />
                    </div>
                    {/* Spacer to keep the logo centered */}
                    <div className="w-9" />
                </header>

                <main className="flex-1 overflow-hidden bg-background">
                    <Outlet context={{ menuOpen: mobileOpen, openMenu: () => setMobileOpen(true) } satisfies LayoutContext} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
