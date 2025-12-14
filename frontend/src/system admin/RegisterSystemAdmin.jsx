import { useState } from 'react';
import { Shield, Mail, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterSystemAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Simulate API call
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `System Admin ${formData.firstName} ${formData.lastName} registered successfully! Default password sent to ${formData.email}` 
      });
      setLoading(false);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        suffix: '',
        email: '',
        phone: ''
      });
    }, 1500);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Register System Admin</h1>
        <p className="text-gray-600 mt-2">Create a new system administrator account</p>
      </div>

      {/* Warning Banner */}
      <div className="max-w-4xl mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Important Notice</h3>
            <p className="text-sm text-amber-800">
              System administrators have full access to all system functions and user data. 
              Only register trusted personnel as system administrators.
            </p>
          </div>
        </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@agritrack.com"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+63 912 345 6789"
                  required
                />
              </div>
            </div>
          </div>

          {/* Permissions Info */}
          <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Shield size={20} />
              System Admin Permissions
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Full access to all system modules and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Ability to create, edit, and manage all user accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Access to view and manage action logs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Permission to register other system administrators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Ability to lock, unlock, and archive accounts</span>
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Shield size={20} />
              {loading ? 'Registering...' : 'Register System Admin'}
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
                  phone: ''
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
              <strong>Note:</strong> A randomly generated password will be sent to the admin's email address upon successful registration. 
              The new administrator will be prompted to change their password and set up 2FA on first login.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterSystemAdmin;
