import { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ActionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  // Mock data
  useEffect(() => {
    const mockLogs = [
      {
        id: 1,
        action: 'USER_REGISTER',
        module: 'SYSTEM ADMIN',
        description: 'User registered: juan.delacruz@agritrack.com',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T10:30:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 2,
        action: 'USER_PASSWORD_CHANGED',
        module: 'SYSTEM ADMIN',
        description: 'Password changed for user 67890',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T09:45:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 3,
        action: 'USER_EMAIL_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Email update error: User not found',
        status: 'FAILED',
        userId: 'admin456',
        userName: 'Maria Santos',
        timestamp: '2024-12-15T09:15:00',
        ipAddress: '192.168.1.105'
      },
      {
        id: 4,
        action: 'USER_ROLES_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Roles updated for user 12345: HVC -> HVC, DMS',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-15T08:30:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 5,
        action: 'USER_ARCHIVED',
        module: 'SYSTEM ADMIN',
        description: 'User archived: 54321',
        status: 'SUCCESS',
        userId: 'admin789',
        userName: 'Pedro Reyes',
        timestamp: '2024-12-14T16:20:00',
        ipAddress: '192.168.1.110'
      },
      {
        id: 6,
        action: 'USER_2FA_RESET',
        module: 'SYSTEM ADMIN',
        description: '2FA reset for user 98765',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-14T15:10:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 7,
        action: 'SYSTEM_ADMIN_REGISTER',
        module: 'SYSTEM ADMIN',
        description: 'System admin registered: newadmin@agritrack.com',
        status: 'SUCCESS',
        userId: 'admin123',
        userName: 'Admin User',
        timestamp: '2024-12-14T14:00:00',
        ipAddress: '192.168.1.100'
      },
      {
        id: 8,
        action: 'USER_PHONE_UPDATED',
        module: 'SYSTEM ADMIN',
        description: 'Phone updated for user 11111: +63 912 345 6789 -> +63 923 456 7890',
        status: 'SUCCESS',
        userId: 'admin456',
        userName: 'Maria Santos',
        timestamp: '2024-12-14T13:30:00',
        ipAddress: '192.168.1.105'
      },
    ];
    setLogs(mockLogs);
  }, []);

  const actionTypes = ['USER_REGISTER', 'USER_PASSWORD_CHANGED', 'USER_EMAIL_UPDATED', 'USER_ROLES_UPDATED', 'USER_ARCHIVED', 'USER_2FA_RESET', 'SYSTEM_ADMIN_REGISTER'];
  const modules = ['SYSTEM ADMIN', 'HVC', 'DMS', 'MACHINERIES', 'DOC_TRACK'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesAction && matchesModule && matchesStatus;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'FAILED':
        return <XCircle size={18} className="text-red-600" />;
      case 'WARNING':
        return <AlertTriangle size={18} className="text-amber-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      WARNING: 'bg-amber-100 text-amber-800',
      INFO: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || styles.INFO;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Exporting logs to CSV...');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Action Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and track all system activities</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Module</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 max-w-md">{log.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                      <p className="text-xs text-gray-500">{log.ipAddress}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{log.module}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Info size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionLogs;
