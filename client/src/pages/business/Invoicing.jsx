import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Download, Send, CheckCircle, 
  Clock, AlertCircle, ChevronRight, DollarSign,
  Calendar, User, Mail, Building, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Currency configuration
const CURRENCIES = [
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', hasTax: true, taxRate: 0.015, taxName: 'KRA Tax' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', hasTax: false },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', hasTax: false },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', hasTax: false },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', hasTax: false },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', hasTax: false },
  { code: 'UGX', symbol: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', hasTax: false },
  { code: 'TZS', symbol: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', hasTax: false },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', hasTax: false },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', hasTax: false },
];

const Invoicing = () => {
  const { getToken } = useAuth();
  const [view, setView] = useState('list');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [profile, setProfile] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    currency: 'KES',
    dueDate: '',
    notes: '',
    lineItems: [{ description: '', quantity: 1, rate: '' }],
  });
  
  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES[0];

  useEffect(() => {
    fetchProfile();
    loadInvoices();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data.profile);
      if (data.profile?.defaultCurrency) {
        setFormData(prev => ({ ...prev, currency: data.profile.defaultCurrency }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };
  
  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const { data } = await axios.get(`${API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };
  
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, rate: '' }]
    }));
  };
  
  const removeLineItem = (index) => {
    if (formData.lineItems.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };
  
  const updateLineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const formatCurrency = (amount, currencyCode = 'KES') => {
    const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    return `${curr.symbol} ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }, 0);
  };

  const calculateTax = () => {
    if (!selectedCurrency.hasTax) return 0;
    return calculateSubtotal() * selectedCurrency.taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!formData.clientName.trim()) {
      alert('Please enter a client name');
      return;
    }

    const validItems = formData.lineItems.filter(
      item => item.description.trim() && Number(item.rate) > 0
    );

    if (validItems.length === 0) {
      alert('Please add at least one line item with a description and rate');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();

      const invoiceData = {
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim() || null,
        clientAddress: formData.clientAddress.trim() || null,
        currency: formData.currency,
        dueDate: formData.dueDate || null,
        notes: formData.notes.trim() || null,
        lineItems: validItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
        })),
      };

      await axios.post(`${API_URL}/api/invoices`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and go back to list
      setFormData({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        currency: profile?.defaultCurrency || 'KES',
        dueDate: '',
        notes: '',
        lineItems: [{ description: '', quantity: 1, rate: '' }],
      });
      setView('list');
      loadInvoices();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/invoices/${invoiceId}/payment`, { paid: true }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadInvoices();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const handleSend = async (invoiceId) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/invoices/${invoiceId}/send`, {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadInvoices();
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-200 dark:bg-slate-500/20', label: 'Draft' },
      SENT: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'Sent' },
      PAID: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20', label: 'Paid' },
      OVERDUE: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', label: 'Overdue' },
      CANCELLED: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', label: 'Cancelled' },
    };
    return configs[status] || configs.DRAFT;
  };

  const filteredInvoices = filter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total), 0),
  };
  
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  // =====================
  // LIST VIEW
  // =====================
  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Invoicing</h1>
                <p className="text-emerald-200">Professional invoices for your business</p>
              </div>
            </div>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sent}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Paid</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{formatCurrency(stats.paidAmount, 'KES')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800/50 rounded-xl w-fit">
          {['ALL', 'DRAFT', 'SENT', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700/50'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No invoices yet</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">Create your first invoice to get started</p>
              <button onClick={() => setView('create')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {filteredInvoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                return (
                  <div key={invoice.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{invoice.invoiceNumber}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                        <span>{invoice.clientName}</span>
                        <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {invoice.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSend(invoice.id)}
                          className="p-2 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-lg text-blue-600 dark:text-blue-400"
                          title="Mark as Sent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="p-2 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.pdfUrl && (
                        <button
                          onClick={() => window.open(`${API_URL}${invoice.pdfUrl}`, '_blank')}
                          className="p-2 bg-gray-100 dark:bg-slate-500/20 hover:bg-gray-200 dark:hover:bg-slate-500/30 rounded-lg text-gray-600 dark:text-slate-400"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =====================
  // CREATE VIEW
  // =====================
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
            <p className="text-gray-500 dark:text-slate-400">Fill in the details below</p>
          </div>
        </div>
        {profile && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50">
            <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-gray-900 dark:text-white">{profile.businessName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Details */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Enter client or company name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
              </div>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 mb-3 px-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Rate ({selectedCurrency.symbol})</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            
            <div className="space-y-3">
              {formData.lineItems.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                return (
                  <div 
                    key={index} 
                    className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-700/50 group"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Service or product"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-center focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-right focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(lineTotal, formData.currency)}
                      </span>
                      {formData.lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(index)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={addLineItem} 
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Line Item
            </button>
          </div>

          {/* Notes */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Notes / Payment Terms (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment is due within 30 days of invoice date..."
              rows="3"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-gray-200 dark:border-slate-700/50 sticky top-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(subtotal, formData.currency)}</span>
              </div>
              
              {selectedCurrency.hasTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">
                    {selectedCurrency.taxName} ({(selectedCurrency.taxRate * 100).toFixed(1)}%)
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">{formatCurrency(tax, formData.currency)}</span>
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-slate-700" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(total, formData.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.clientName.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Create Invoice
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-center text-gray-500 dark:text-slate-500">
              Invoice will be saved as draft
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoicing;
