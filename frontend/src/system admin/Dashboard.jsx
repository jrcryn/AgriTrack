import { useState, useEffect } from 'react';
import { Users, Shield, Activity, Lock, Archive, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    recentActions: 0,
    lockedAccounts: 0,
    archivedAccounts: 0,
    activeAccounts: 0
  });

  // Mock data for now
  useEffect(() => {
    setStats({
      totalEmployees: 45,
      totalAdmins: 5,
      recentActions: 128,
      lockedAccounts: 3,
      archivedAccounts: 12,
      activeAccounts: 35
    });
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
        </div>
        <div className={`p-4 rounded-full ${bgColor}`}>
          <Icon size={28} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const recentActivities = [
    { action: 'User registered', user: 'john.doe@agritrack.com', time: '5 minutes ago', type: 'success' },
    { action: 'Password changed', user: 'jane.smith@agritrack.com', time: '15 minutes ago', type: 'info' },
    { action: 'Account locked', user: 'test.user@agritrack.com', time: '1 hour ago', type: 'warning' },
    { action: 'Roles updated', user: 'admin.user@agritrack.com', time: '2 hours ago', type: 'info' },
    { action: 'Account archived', user: 'old.user@agritrack.com', time: '3 hours ago', type: 'error' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Total Employees" 
          value={stats.totalEmployees} 
          color="#3B82F6"
          bgColor="bg-blue-100"
        />
        <StatCard 
          icon={Shield} 
          title="System Admins" 
          value={stats.totalAdmins} 
          color="#8B5CF6"
          bgColor="bg-purple-100"
        />
        <StatCard 
          icon={Activity} 
          title="Recent Actions" 
          value={stats.recentActions} 
          color="#10B981"
          bgColor="bg-green-100"
        />
        <StatCard 
          icon={UserCheck} 
          title="Active Accounts" 
          value={stats.activeAccounts} 
          color="#06B6D4"
          bgColor="bg-cyan-100"
        />
        <StatCard 
          icon={Lock} 
          title="Locked Accounts" 
          value={stats.lockedAccounts} 
          color="#F59E0B"
          bgColor="bg-amber-100"
        />
        <StatCard 
          icon={Archive} 
          title="Archived Accounts" 
          value={stats.archivedAccounts} 
          color="#EF4444"
          bgColor="bg-red-100"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-amber-500' :
                  activity.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
