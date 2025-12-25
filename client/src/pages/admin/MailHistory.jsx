import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Eye, Mail, Users, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MailHistory() {
  const [mailItems, setMailItems] = useState([]);
  const [stats, setStats] = useState({
    totalUploaded: 0,
    uploadedToday: 0,
    unreadCount: 0,
    customersWithMail: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    customerId: '',
    isRead: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { getToken } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMailHistory();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/mailbox/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMailHistory = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/mailbox/admin/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      
      setMailItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching mail history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleDateRangeChange = (range) => {
    const today = new Date();
    let startDate = '';
    
    switch(range) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate, endDate: startDate, page: 1 }));
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate, endDate: today.toISOString().split('T')[0], page: 1 }));
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate, endDate: today.toISOString().split('T')[0], page: 1 }));
        break;
      case 'all':
        setFilters(prev => ({ ...prev, startDate: '', endDate: '', page: 1 }));
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      customerId: '',
      isRead: '',
      page: 1,
      limit: 20
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Mail History
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">
          View and manage all uploaded customer mail
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Archive className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Total Uploaded</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalUploaded}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Uploaded Today</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.uploadedToday}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Unread Mail</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyan-500/10">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Customers</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.customersWithMail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-xl border space-y-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by title, sender, or customer..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Date Range Quick Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDateRangeChange('today')}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: filters.startDate === new Date().toISOString().split('T')[0] ? 'var(--accent-blue)' : 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: filters.startDate === new Date().toISOString().split('T')[0] ? 'white' : 'var(--text-secondary)'
              }}
            >
              Today
            </button>
            <button
              onClick={() => handleDateRangeChange('week')}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleDateRangeChange('all')}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: !filters.startDate ? 'var(--accent-blue)' : 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: !filters.startDate ? 'white' : 'var(--text-secondary)'
              }}
            >
              All Time
            </button>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.startDate || filters.endDate || filters.isRead) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg text-sm transition-colors border"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Mail Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Date</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Customer</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Title</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sender</th>
                <th className="text-center p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                <th className="text-center p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : mailItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    No mail items found
                  </td>
                </tr>
              ) : (
                mailItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(item.received_at)}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.customer.name || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.sender}</td>
                    <td className="p-4 text-center">
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: item.is_read ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: item.is_read ? '#10b981' : '#3b82f6'
                        }}
                      >
                        {item.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.open(item.file_url, '_blank')}
                          className="p-2 rounded-lg transition-colors hover:bg-blue-500/10"
                          title="View PDF"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
