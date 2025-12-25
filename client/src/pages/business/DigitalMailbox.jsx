import { useState, useEffect } from 'react';
import { FileText, Download, Mail, Package, AlertCircle, MapPin, Building2, CheckCircle2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAILBOX_ADDRESS = import.meta.env.VITE_MAILBOX_ADDRESS || '71-75 Shelton Street, Covent Garden, London WC2H 9JQ';
const MAILBOX_CITY = import.meta.env.VITE_MAILBOX_CITY || 'London';
const IS_DEMO_ADDRESS = !import.meta.env.VITE_MAILBOX_ADDRESS; // True if using default demo address

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

  const unreadCount = mailItems.filter(item => !item.is_read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Enhanced Header with Address Card */}
      <div className="relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-3xl"></div>
        
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Title & Address */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Your London Mailbox</h1>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">UK Business Address</span>
                  </div>
                </div>
              </div>

              {/* Address Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 font-semibold text-sm">Active</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono text-sm">
                  {MAILBOX_ADDRESS}
                </span>
                {IS_DEMO_ADDRESS && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-amber-400 text-xs font-medium px-2 py-0.5 bg-amber-500/10 rounded">
                      Demo
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Unread Counter */}
            {unreadCount > 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl min-w-[140px]">
                <Mail className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-3xl font-bold text-blue-400 mb-1">{unreadCount}</div>
                <div className="text-sm text-blue-300/80 font-medium">Unread Mail</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner - Redesigned */}
      <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg flex-shrink-0">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              What mail do I receive?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm mb-1">Included</p>
                  <p className="text-slate-400 text-sm">HMRC tax codes, Companies House authentication codes, official government notices</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-medium text-sm mb-1">Not Included</p>
                  <p className="text-slate-500 text-sm">Bank cards, general business mail, packages, marketing materials</p>
                </div>
              </div>
            </div>
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

      {/* Mail Items - Enhanced Design */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            Your Mail
          </h2>
          {mailItems.length > 0 && (
            <span className="text-sm text-slate-500">
              {mailItems.length} {mailItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {mailItems.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
              <div className="inline-flex p-6 bg-slate-800/50 rounded-full mb-6">
                <Mail className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No mail received yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Official government mail sent to your London address will appear here within 24-48 hours of arrival.
              </p>
            </div>
          ) : (
            mailItems
              .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
              .map((item) => (
                <div
                  key={item.id}
                  className={`
                    group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-xl
                    ${item.is_read 
                      ? 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700' 
                      : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-blue-500/30 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10'
                    }
                  `}
                >
                  {/* Unread Indicator Stripe */}
                  {!item.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  )}

                  <div className="p-5 pl-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Icon & Content */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Document Icon */}
                        <div className={`
                          relative p-3 rounded-xl flex-shrink-0 transition-all
                          ${item.is_read 
                            ? 'bg-slate-800/50' 
                            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                          }
                        `}>
                          {!item.is_read && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></div>
                          )}
                          <FileText className={`w-6 h-6 ${item.is_read ? 'text-slate-500' : 'text-blue-400'}`} />
                        </div>
                        
                        {/* Mail Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              {/* Sender Badge */}
                              {item.sender && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-md mb-2">
                                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                                    {item.sender}
                                  </span>
                                </div>
                              )}
                              
                              {/* Title */}
                              <h4 className={`text-lg font-semibold mb-1 truncate ${item.is_read ? 'text-slate-400' : 'text-white'}`}>
                                {item.title}
                              </h4>
                              
                              {/* Date */}
                              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Received {new Date(item.received_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>

                            {/* Read Status */}
                            {item.is_read && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md">
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs text-slate-500 font-medium">Read</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => downloadPDF(item)}
                        className={`
                          group/btn flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm
                          transition-all duration-200 flex-shrink-0 shadow-lg
                          ${item.is_read
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white shadow-slate-900/20'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
                          }
                        `}
                      >
                        <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="hidden sm:inline">View PDF</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Footer Help Text */}
      {mailItems.length > 0 && (
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-lg">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-slate-400">
              Mail is scanned and uploaded within 24-48 hours of arrival
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
