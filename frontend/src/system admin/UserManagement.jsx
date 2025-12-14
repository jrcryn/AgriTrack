import { useState, useEffect } from 'react';
import { Search, Edit2, Lock, Unlock, Archive, MoreVertical, Mail, Phone, Users as UsersIcon, Filter } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockUsers = [
      { 
        id: 1, 
        firstName: 'Juan', 
        lastName: 'Dela Cruz',
        middleName: 'Santos',
        email: 'juan.delacruz@agritrack.com',
        phone: '+63 912 345 6789',
        roles: ['HVC', 'DMS'],
        officePosition: 'CFS',
        accountType: 'EMPLOYEE',
        isLocked: false,
        isArchived: false,
        createdAt: '2024-01-15'
      },
      { 
        id: 2, 
        firstName: 'Maria', 
        lastName: 'Santos',
        middleName: 'Garcia',
        email: 'maria.santos@agritrack.com',
        phone: '+63 923 456 7890',
        roles: ['MACHINERIES'],
        officePosition: 'LPMS',
        accountType: 'EMPLOYEE',
        isLocked: false,
        isArchived: false,
        createdAt: '2024-02-20'
      },
      { 
        id: 3, 
        firstName: 'Admin', 
        lastName: 'User',
        middleName: '',
        email: 'admin@agritrack.com',
        phone: '+63 934 567 8901',
        roles: [],
        officePosition: null,
        accountType: 'SYSTEM_ADMIN',
        isLocked: false,
        isArchived: false,
        createdAt: '2023-12-01'
      },
      { 
        id: 4, 
        firstName: 'Pedro', 
        lastName: 'Reyes',
        middleName: 'Lopez',
        email: 'pedro.reyes@agritrack.com',
        phone: '+63 945 678 9012',
        roles: ['DOC_TRACK', 'HVC'],
        officePosition: 'ANMS',
        accountType: 'EMPLOYEE',
        isLocked: true,
        isArchived: false,
        createdAt: '2024-03-10'
      },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !user.isLocked && !user.isArchived) ||
      (filterStatus === 'locked' && user.isLocked) ||
      (filterStatus === 'archived' && user.isArchived);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleLockToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isLocked: !user.isLocked } : user
    ));
  };

  const handleArchive = (userId) => {
    if (confirm('Are you sure you want to archive this user?')) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isArchived: true } : user
      ));
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'HVC': 'bg-green-100 text-green-800',
      'DMS': 'bg-blue-100 text-blue-800',
      'MACHINERIES': 'bg-purple-100 text-purple-800',
      'DOC_TRACK': 'bg-amber-100 text-amber-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage employee and system admin accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="HVC">HVC</option>
              <option value="DMS">DMS</option>
              <option value="MACHINERIES">Machineries</option>
              <option value="DOC_TRACK">Doc Track</option>
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
              <option value="active">Active</option>
              <option value="locked">Locked</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roles</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.middleName && user.middleName[0] + '.'} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      {user.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.officePosition ? (
                      <span className="text-sm text-gray-600">{user.officePosition}</span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.accountType === 'SYSTEM_ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.accountType === 'SYSTEM_ADMIN' ? 'Admin' : 'Employee'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isArchived ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Archived
                      </span>
                    ) : user.isLocked ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Locked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleLockToggle(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isLocked 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-amber-600 hover:bg-amber-50'
                        }`}
                        title={user.isLocked ? 'Unlock' : 'Lock'}
                        disabled={user.isArchived}
                      >
                        {user.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button
                        onClick={() => handleArchive(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Archive"
                        disabled={user.isArchived}
                      >
                        <Archive size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UsersIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
