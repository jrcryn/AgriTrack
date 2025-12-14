import { useState } from 'react';
import { UserPlus, Mail, Phone, User, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: '',
    roles: [],
    officePosition: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const availableRoles = ['HVC', 'DMS', 'MACHINERIES', 'DOC_TRACK'];
  const officePositions = ['CFS', 'LPMS', 'ANMS', 'RTSS'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    if (formData.roles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one role.' });
      setLoading(false);
      return;
    }

    if (formData.roles.includes('DMS') && !formData.officePosition) {
      setMessage({ type: 'error', text: 'Office position is required for DMS role.' });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `Employee ${formData.firstName} ${formData.lastName} registered successfully! Default password sent to ${formData.email}` 
      });
      setLoading(false);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        suffix: '',
        email: '',
        phone: '',
        roles: [],
        officePosition: ''
      });
    }, 1500);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Register Employee</h1>
        <p className="text-gray-600 mt-2">Create a new employee account</p>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl bg-white rounded-xl shadow-md p-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={24} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dela Cruz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Santos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suffix
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jr., Sr., III"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={24} />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan.delacruz@agritrack.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+63 912 345 6789"
                  required
                />
              </div>
            </div>
          </div>

          {/* Roles & Position */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={24} />
              Roles & Position
            </h2>
            
            {/* Roles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Roles <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      formData.roles.includes(role)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Office Position (conditional) */}
            {formData.roles.includes('DMS') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="officePosition"
                  value={formData.officePosition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select office position</option>
                  {officePositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <UserPlus size={20} />
              {loading ? 'Registering...' : 'Register Employee'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  middleName: '',
                  suffix: '',
                  email: '',
                  phone: '',
                  roles: [],
                  officePosition: ''
                });
                setMessage({ type: '', text: '' });
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Clear Form
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A randomly generated password will be sent to the employee's email address upon successful registration. 
              The employee will be prompted to change their password on first login.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployee;
