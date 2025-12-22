import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Filter, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-500/20 text-gray-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PAID: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400'
};

const STATUS_ICONS = {
  DRAFT: Clock,
  PENDING: AlertCircle,
  PAID: CheckCircle,
  PROCESSING: Clock,
  COMPLETED: CheckCircle,
  REJECTED: XCircle
};

export default function FormationOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, searchQuery]);
  
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/formation`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...orders];
    
    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.company_name?.toLowerCase().includes(query) ||
        order.director_name?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  };
  
  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const paid = orders.filter(o => o.status === 'PAID').length;
    const processing = orders.filter(o => o.status === 'PROCESSING').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const revenue = orders
      .filter(o => ['PAID', 'PROCESSING', 'COMPLETED'].includes(o.status))
      .reduce((sum, o) => sum + (o.payment_amount || 0), 0);
    
    return { total, pending, paid, processing, completed, revenue };
  };
  
  const stats = getStats();
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Formation Orders</h1>
            <p className="text-gray-400">Manage company formation requests</p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Pending Payment</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Ready to Process</div>
          <div className="text-2xl font-bold text-blue-400">{stats.paid}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-400">
            KES {stats.revenue.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by company name, director, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Order ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Company Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Jurisdiction</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Director</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-400">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{order.company_name}</div>
                        <div className="text-xs text-gray-500">{order.company_type}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300">
                          {order.jurisdiction === 'UK' ? '🇬🇧 UK' : '🇺🇸 US'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">{order.director_name}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-green-400">
                          KES {order.payment_amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/admin/order/${order.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
