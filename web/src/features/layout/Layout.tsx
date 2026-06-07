import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from '@/components/Logo';

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close the mobile drawer whenever the route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile top bar */}
                <header className="md:hidden flex items-center h-14 px-4 border-b border-foreground/5 bg-background shrink-0">
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
