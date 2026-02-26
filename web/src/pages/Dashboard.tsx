import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/api';
import StatsDashboard from '@/features/timer/StatsDashboard';
import Loading from '@/components/Loading';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [solves, setSolves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, solvesData] = await Promise.all([
          authenticatedFetch('/stats'),
          authenticatedFetch('/solve')
        ]);
        setStats(statsData);
        setSolves(solvesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-full py-8">
      <StatsDashboard stats={stats} solves={solves} />
    </div>
  );
};

export default DashboardPage;
