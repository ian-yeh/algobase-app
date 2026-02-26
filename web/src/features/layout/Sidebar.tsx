import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';

const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const TimerIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Sidebar = () => {
    const location = useLocation();
    const { session } = useAuth();
    const user = session?.user;

    const navItems = [
        { name: 'Dashboard', path: '/home', icon: <DashboardIcon /> },
        { name: 'Timer', path: '/timer', icon: <TimerIcon /> },
    ];

    const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.avatar_url;

    return (
        <div className="w-64 h-screen bg-background text-foreground flex flex-col border-r border-foreground/5 font-sans">
            <div className="p-8">
                <Link to="/">
                    <Logo className="text-2xl font-semibold hover:opacity-80 transition-opacity cursor-pointer" />
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-foreground text-background shadow-md shadow-foreground/5'
                                : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                                }`}
                        >
                            <span className="opacity-80">{item.icon}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-foreground/5">
                <div className="flex items-center space-x-3">
                    {userAvatar ? (
                        <img src={userAvatar} alt="" className="w-8 h-8 rounded-full border border-foreground/10" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-sm font-bold text-foreground/40">
                            {userDisplayName[0].toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{userDisplayName}</span>
                        <span className="text-[10px] text-foreground/40 truncate">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
