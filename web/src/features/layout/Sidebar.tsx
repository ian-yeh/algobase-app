import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
    const location = useLocation();
    const { session } = useAuth();
    const user = session?.user;

    const navItems = [
        { name: 'Dashboard', path: '/home', icon: '📊' },
        { name: 'Timer', path: '/timer', icon: '⏱️' },
    ];

    const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.avatar_url;

    return (
        <div className="w-64 h-screen bg-background text-foreground flex flex-col border-r border-foreground/5 font-sans">
            <div className="p-8">
                <Link to="/">
                    <h1 className="text-2xl font-serif font-semibold hover:opacity-80 transition-opacity cursor-pointer tracking-tight">
                        Algobase
                    </h1>
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
                            <span className="text-xl opacity-80">{item.icon}</span>
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
