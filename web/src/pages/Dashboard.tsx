import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/api';

interface Stats {
  best_time: number | null;
  total_solves: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authenticatedFetch('/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <p>Loading stats...</p>
      ) : stats ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Best Time</p>
              <p className="text-3xl font-mono text-purple-400">{stats.best_time ?? 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Total Solves</p>
              <p className="text-3xl font-mono text-pink-400">{stats.total_solves}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>No stats available.</p>
      )}
    </div>
  );
}

export default DashboardPage;
