import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuthStore } from '@/stores/authStore';
import StatsDashboard from '@/features/stats-dashboard/Dashboard';
import Loading from '@/components/Loading';

const DashboardPage = () => {
  const token = useAuthStore((s) => s.token);

  const statsData = useQuery(api.solve.getStats, token ? { token } : 'skip');
  const recentData = useQuery(api.solve.getRecentSolves, token ? { token, limit: 12 } : 'skip');

  if (!statsData || !recentData) {
    return <Loading />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <StatsDashboard stats={statsData} recent={recentData} />
    </div>
  );
};

export default DashboardPage;
