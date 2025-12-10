// src/components/AdminStats.tsx
import { useState, useEffect } from 'react';

const AdminStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/download-stats', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`
        }
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🌍 Global Download Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Downloads</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalDownloads?.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Top Template</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats?.topTemplate || 'None'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Last Updated</h3>
          <p className="text-lg">
            {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Downloads by Template</h3>
          {stats?.byTemplate && Object.entries(stats.byTemplate).map(([template, count]) => (
            <div key={template} className="flex justify-between items-center mb-2">
              <span>{template}</span>
              <span className="font-semibold">{count as number}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Downloads by Device</h3>
          {stats?.byDevice && Object.entries(stats.byDevice).map(([device, count]) => (
            <div key={device} className="flex justify-between items-center mb-2">
              <span>{device}</span>
              <span className="font-semibold">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={fetchStats}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Refresh Stats
      </button>
    </div>
  );
};

export default AdminStats;