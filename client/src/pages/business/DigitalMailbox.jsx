import { useState, useEffect } from 'react';
import { FileText, Download, Mail, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function DigitalMailbox() {
  const { user, getToken } = useAuth();
  const [mailItems, setMailItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMailItems();
  }, []);

  const fetchMailItems = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/api/mailbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMailItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching mail:', err);
      setError('Failed to load mailbox');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (itemId) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/mailbox/${itemId}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setMailItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const downloadPDF = async (item) => {
    try {
      markAsRead(item.id);
      
      // Open PDF in new tab
      window.open(item.file_url, '_blank');
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-blue-400" />
            London Digital Mailbox
          </h2>
          <p className="text-sm text-slate-400">
            📍 71-75 Shelton Street, Covent Garden, London WC2H 9JQ
          </p>
        </div>
        
        {/* Unread count */}
        {mailItems.filter(item => !item.is_read).length > 0 && (
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-blue-400 font-semibold">
              {mailItems.filter(item => !item.is_read).length} unread
            </span>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-slate-300 font-medium mb-1">What mail do I receive?</p>
            <p className="text-slate-400">
              ✅ <strong>Government Mail:</strong> HMRC tax codes, Companies House authentication codes, official notices
              <br />
              ❌ <strong>Not included:</strong> Bank cards, general business mail, packages
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error loading mailbox</p>
            <p className="text-sm text-red-300/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Mail Items */}
      <div className="grid gap-4">
        {mailItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-800">
            <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No mail received yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Official government mail (HMRC, Companies House) sent to your London address will appear here.
            </p>
          </div>
        ) : (
          mailItems
            .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
            .map((item) => (
              <div
                key={item.id}
                className={`
                  p-5 rounded-xl border transition-all
                  ${item.is_read 
                    ? 'bg-slate-900/30 border-slate-800' 
                    : 'bg-slate-800/50 border-l-4 border-l-blue-500 border-slate-700'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon & Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`
                      p-3 rounded-xl
                      ${item.is_read 
                        ? 'bg-slate-800 text-slate-500' 
                        : 'bg-blue-500/10 text-blue-400'
                      }
                    `}>
                      <FileText className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!item.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <h4 className={`font-semibold ${item.is_read ? 'text-slate-300' : 'text-white'}`}>
                          {item.sender ? `${item.sender}: ` : ''}{item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500">
                        Received: {new Date(item.received_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => downloadPDF(item)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Help Text */}
      {mailItems.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-slate-500">
            Mail is scanned and uploaded within 24-48 hours of arrival at your London address
          </p>
        </div>
      )}
    </div>
  );
}
