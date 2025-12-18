import {  useState, useEffect } from 'react';
import { Building2, Download, Clock, CheckCircle, AlertCircle, FileText, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Payment',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    icon: Clock
  },
  PAID: {
    label: 'Payment Received',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    icon: CheckCircle
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    icon: Clock
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    icon: CheckCircle
  },
  FAILED: {
    label: 'Failed',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    icon: AlertCircle
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // In production, this would be user-specific based on auth
      const response = await fetch(`${API_URL}/api/formation`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (order) => {
    if (!order.certificate_url) {
      alert('Certificate not yet available');
      return;
    }
    
    // In production, this would be a proper download
    window.open(order.certificate_url, '_blank');
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          My Company Formations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track your orders and download certificates
        </p>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'ALL'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {orders.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            All Orders
          </div>
        </button>

        {['PENDING', 'PAID', 'PROCESSING', 'COMPLETED'].map(status => {
          const count = orders.filter(o => o.status === status).length;
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === status
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {count}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {config.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {filter === 'ALL' ? 'No orders yet' : `No ${STATUS_CONFIG[filter].label.toLowerCase()} orders`}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-6">
            Start your first company formation to see orders here
          </p>
          <button className="btn-primary">
            Form a Company
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="card hover:border-gray-600 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Building2 className="w-6 h-6 mt-1" style={{ color: 'var(--accent-blue)' }} />
                      <div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {order.company_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span>{order.jurisdiction} {order.company_type}</span>
                          <span>•</span>
                          <span>Order #{order.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                      <span className={`text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Registration Number */}
                    {order.registration_number && (
                      <div className="mt-3 text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Company No: </span>
                        <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {order.registration_number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    {/* Download Certificate */}
                    {order.status === 'COMPLETED' && order.certificate_url && (
                      <button
                        onClick={() => downloadCertificate(order)}
                        className="btn-primary flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </button>
                    )}

                    {/* Payment Amount */}
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Amount</div>
                      <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                        KES {order.payment_amount?.toLocaleString() || '20,000'}
                      </div>
                    </div>

                    {/* Contact Support (if issues) */}
                    {order.status === 'FAILED' && (
                      <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
                        <Mail className="w-4 h-4" />
                        Contact Support
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin Notes (if any) */}
                {order.admin_notes && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex gap-2">
                      <FileText className="w-4 h-4 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                          Admin Note:
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {order.admin_notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      <div className="card mt-8" style={{ background: 'var(--bg-secondary)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Processing Time
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              UK companies: 1-3 business days<br/>
              US companies: 3-5 business days
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Support Email
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              support@veribadge.co.ke
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Questions?
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              We're here 9AM-6PM EAT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
