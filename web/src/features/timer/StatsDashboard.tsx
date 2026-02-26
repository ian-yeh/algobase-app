import React from 'react';

interface StatsDashboardProps {
    stats: {
        best_ao5: number;
        best_ao12: number;
        best_ao100: number;
        best_time: number;
        total_solves: number;
    } | null;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
    if (!stats) return null;

    const formatTime = (seconds: number) => {
        if (!seconds || seconds === 0 || seconds === Infinity) return '--';
        const ms = seconds * 1000;
        const s = Math.floor(ms / 1000);
        const m = Math.floor((ms % 1000) / 10);
        return `${s}.${m.toString().padStart(2, '0')}`;
    };

    const StatCard = ({ label, value, subtext }: { label: string; value: string; subtext?: string }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-start shadow-sm transition-all hover:shadow-md cursor-default group">
            <div className="flex justify-between items-center w-full mb-4">
                <span className="text-gray-400 text-sm font-medium tracking-tight uppercase">{label}</span>
                <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                    </svg>
                </div>
            </div>
            <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
                {subtext && <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">{subtext}</span>}
            </div>
            <div className="mt-4 flex items-center space-x-2 text-gray-400 text-xs font-medium">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <span>Total Solves: {stats.total_solves}</span>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto py-10 px-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-400 text-sm mt-1">Whole data about your cubing progress</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">This Week</button>
                    <button className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Change View</button>
                    <div className="text-gray-400">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Average of 5" value={formatTime(stats.best_ao5)} subtext="+13.5%" />
                <StatCard label="Average of 12" value={formatTime(stats.best_ao12)} subtext="+13.5%" />
                <StatCard label="Personal Best" value={formatTime(stats.best_time)} subtext="+13.5%" />
            </div>
        </div>
    );
};

export default StatsDashboard;
