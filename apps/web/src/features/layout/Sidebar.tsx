import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, Trophy, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/components/Logo';
import CubeLogo from '@/components/CubeLogo';

const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const TimerIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1');

    const toggleCollapsed = () => {
        setCollapsed((c) => {
            localStorage.setItem('sidebarCollapsed', c ? '0' : '1');
            return !c;
        });
    };

    const navItems = [
        { name: 'Timer', path: '/timer', icon: <TimerIcon /> },
        { name: 'Dashboard', path: '/home', icon: <DashboardIcon /> },
        { name: 'Competitions', path: '/competitions', icon: <Trophy className="w-5 h-5" strokeWidth={1.5} /> },
    ];

    const userDisplayName = user?.username || user?.email?.split('@')[0] || 'User';

    const handleSignOut = () => {
        clearAuth();
        navigate('/signin');
    };

    // The drawer is always expanded on mobile; only the desktop rail collapses.
    const content = (isCollapsed: boolean) => (
        <>
                <div className={`flex items-center ${isCollapsed ? 'flex-col gap-4 p-5' : 'justify-between px-5 py-6'}`}>
                    <Link to="/" onClick={onClose} className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
                        <CubeLogo className="w-7 h-7" />
                        {!isCollapsed && <Logo className="text-2xl font-semibold cursor-pointer" />}
                    </Link>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="md:hidden p-1.5 rounded-md text-foreground/40 hover:text-foreground/70 transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={toggleCollapsed}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="hidden md:block p-1.5 rounded-md text-foreground/30 hover:text-foreground/70 transition-colors"
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                title={isCollapsed ? item.name : undefined}
                                className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-colors duration-150 ${isActive
                                    ? 'text-foreground bg-foreground/[0.06] ring-1 ring-inset ring-foreground/10'
                                    : 'text-foreground/45 hover:text-foreground/80'
                                    }`}
                            >
                                {item.icon}
                                {!isCollapsed && <span className="text-sm font-medium tracking-tight">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`${isCollapsed ? 'p-4' : 'px-5 py-5'} border-t border-foreground/8`}>
                    <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'gap-3'}`}>
                        <div
                            title={isCollapsed ? `${userDisplayName} (${user?.email})` : undefined}
                            className="w-8 h-8 shrink-0 rounded-full border border-foreground/10 flex items-center justify-center text-xs font-medium text-foreground/50"
                        >
                            {userDisplayName[0].toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                <span className="text-xs font-medium text-foreground/90 truncate">{userDisplayName}</span>
                                <span className="text-[11px] text-foreground/35 truncate">{user?.email}</span>
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            aria-label="Sign out"
                            title="Sign out"
                            className="p-1.5 rounded-md text-foreground/30 hover:text-foreground/70 transition-colors"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
        </>
    );

    return (
        <>
            <div className={`hidden md:flex ${collapsed ? 'w-20' : 'w-64'} h-screen bg-background text-foreground flex-col border-r border-foreground/8 transition-all duration-200`}>
                {content(collapsed)}
            </div>

            <div
                className={`md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-background text-foreground flex flex-col border-r border-foreground/8 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {content(false)}
            </div>
        </>
    );
};

export default Sidebar;
