import { useContext } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { AuthContext } from '@/contexts/AuthContext';
import StatsDashboard from '@/features/timer/StatsDashboard';
import Loading from '@/components/Loading';

const DashboardPage = () => {
  const auth = useContext(AuthContext);

  const statsData = useQuery(api.solve.getStats, auth?.token ? { token: auth.token } : 'skip');
  const solvesData = useQuery(api.solve.getSolves, auth?.token ? { token: auth.token } : 'skip');

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
