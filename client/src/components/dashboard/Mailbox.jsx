import { useState, useEffect } from 'react';
import { Mail, MapPin, Calendar, Package as PackageIcon, X } from 'lucide-react';
import { mailboxAPI } from '../../services/dashboardApi';

const Mailbox = () => {
  const [mailItems, setMailItems] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsResult, subResult] = await Promise.all([
        mailboxAPI.getMailboxItems(),
        mailboxAPI.getSubscription()
      ]);
      
      if (itemsResult.success) {
        setMailItems(itemsResult.items);
      }
      if (subResult.success) {
        setSubscription(subResult.subscription);
      }
    } catch (error) {
      console.error('Failed to load mailbox data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'text-blue-400 bg-blue-500/20';
      case 'read': return 'text-gray-400 bg-gray-700';
      case 'archived': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-700';
    }
  };
  
  const getMailTypeIcon = (type) => {
    switch (type) {
      case 'package': return PackageIcon;
      case 'official': return Mail;
      default: return Mail;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Digital Mailbox</h1>
            <p className="text-gray-400">Your permanent business address in Nairobi</p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading mailbox...</p>
        </div>
      ) : (
        <>
          {/* Virtual Address & Subscription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Virtual Address Card */}
            <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Your Virtual Address</h3>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>
              <div className="text-white font-medium leading-relaxed">
                {subscription?.virtualAddress || 'Suite 404, Westlands Plaza, Waiyaki Way, Nairobi, Kenya'}
              </div>
            </div>
            
            {/* Subscription Card */}
            {subscription && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Subscription</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white font-medium">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-medium">
                      {subscription.currency} {subscription.price}/{subscription.billingCycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Billing</span>
                    <span className="text-white font-medium">
                      {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mail Grid */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Received Mail ({mailItems.length})
              </h2>
              {mailItems.filter(i => i.status === 'unread').length > 0 && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-500/20 text-blue-400">
                  {mailItems.filter(i => i.status === 'unread').length} Unread
                </span>
              )}
            </div>
            
            {mailItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No mail received yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mailItems.map((item) => {
                  const Icon = getMailTypeIcon(item.mailType);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="relative p-4 rounded-lg border-2 transition-all text-left hover:border-blue-500/40"
                      style={{ 
                        borderColor: item.status === 'unread' ? 'var(--border-color)' : 'transparent',
                        background: item.status === 'unread' ? 'var(--bg-secondary)' : 'var(--bg-card)'
                      }}
                    >
                      {/* Envelope placeholder*/}
                      <div className="aspect-[3/2] bg-gradient-to-br from-gray-700 to-gray-800 rounded mb-3 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-gray-600" />
                      </div>
                      
                      {/* Mail info */}
                      <div className="mb-2">
                        <div className="font-semibold text-white text-sm mb-1 truncate">
                          {item.sender}
                        </div>
                        {item.subject && (
                          <div className="text-xs text-gray-400 truncate">{item.subject}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(item.receivedDate).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Mail Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.sender}</h2>
                {selectedItem.subject && (
                  <p className="text-gray-400">{selectedItem.subject}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Received</span>
                  <div className="text-white font-medium">
                    {new Date(selectedItem.receivedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Type</span>
                  <div className="text-white font-medium capitalize">{selectedItem.mailType}</div>
                </div>
              </div>
            </div>
            
            {/* Scanned image placeholder */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center text-gray-500">
                <Mail className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p>Scanned document preview</p>
                <p className="text-sm mt-2">(Mock - Image will appear here)</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-primary flex-1">
                Request Forwarding
              </button>
              <button className="btn-secondary flex-1">
                Mark as Archived
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mailbox;
