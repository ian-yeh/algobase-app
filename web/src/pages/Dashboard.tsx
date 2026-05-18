import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuthStore } from '@/stores/authStore';
import StatsDashboard from '@/features/timer/StatsDashboard';
import Loading from '@/components/Loading';

const DashboardPage = () => {
  const token = useAuthStore((s) => s.token);

  const statsData = useQuery(api.solve.getStats, token ? { token } : 'skip');
  const solvesData = useQuery(api.solve.getSolves, token ? { token } : 'skip');

  if (!statsData || !solvesData) {
    return <Loading />;
  }

  return (
    <div className="min-h-full py-8">
      <StatsDashboard stats={statsData} solves={solvesData} />
    </div>
  );
};

export default DashboardPage;
