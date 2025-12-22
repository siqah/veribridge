import { useState, useEffect } from 'react';
import { Mail, Users, Upload, Search, Filter, ChevronDown } from 'lucide-react';
import AdminMailUpload from '../../components/admin/AdminMailUpload';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MailManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { getToken } = useAuth();

  // Fetch all users/customers
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Mail Management
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">
            Upload and manage customer mail from government agencies
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Total Customers</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{users.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Mail Uploaded Today</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>-</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Selected Customer</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {selectedUser ? selectedUser.email : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Selection */}
        <div className="space-y-4">
          <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Select Customer
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading customers...</p>
              ) : filteredUsers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No customers found</p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUploadForm(true);
                    }}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedUser?.id === user.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'hover:border-blue-500/50'
                    }`}
                    style={{
                      background: selectedUser?.id === user.id ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      borderColor: selectedUser?.id === user.id ? '#3b82f6' : 'var(--border-color)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {user.fullName || 'Unnamed User'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {user.email}
                        </p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          {!showUploadForm ? (
            <div className="p-12 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--border-color)' }}>
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select a Customer
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Choose a customer from the list to upload mail for them
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Upload Mail for
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {selectedUser?.email}
                </p>
              </div>

              <AdminMailUpload 
                userId={selectedUser?.supabaseId}
                onSuccess={handleUploadSuccess}
              />

              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedUser(null);
                }}
                className="mt-4 w-full px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">📬 Mail Upload Guidelines</h3>
        <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li>• Only PDF files are accepted (max 10MB)</li>
          <li>• Include government agency name in the sender field (HMRC, Companies House, etc.)</li>
          <li>• Use descriptive titles like "Tax Code Notice" or "Annual Filing Confirmation"</li>
          <li>• Users will be notified when new mail arrives</li>
        </ul>
      </div>
    </div>
  );
}
