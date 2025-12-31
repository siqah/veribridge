import { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Trash2, Play, Pause, Calendar, 
  Clock, DollarSign, User, Mail, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: 'Every 7 days' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every 14 days' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
  { value: 'yearly', label: 'Yearly', description: 'Once a year' },
];

const CURRENCIES = [
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

const RecurringInvoices = () => {
  const { getToken } = useAuth();
  const [view, setView] = useState('list');
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    items: [{ description: '', quantity: 1, rate: '' }],
    currency: 'KES',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/recurring`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecurring(data.recurring || []);
    } catch (error) {
      console.error('Failed to load recurring invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: '' }]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }, 0);
  };

  const formatCurrency = (amount, currencyCode = 'KES') => {
    const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    return `${curr.symbol} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleSubmit = async () => {
    if (!formData.clientName.trim() || !formData.clientEmail.trim()) {
      alert('Client name and email are required');
      return;
    }

    const validItems = formData.items.filter(item => 
      item.description.trim() && Number(item.rate) > 0
    );

    if (validItems.length === 0) {
      alert('Add at least one line item');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/recurring`, {
        ...formData,
        items: validItems.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
        })),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        items: [{ description: '', quantity: 1, rate: '' }],
        currency: 'KES',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
      await loadRecurring();
      setView('list');
    } catch (error) {
      console.error('Failed to create recurring invoice:', error);
      alert(error.response?.data?.error || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/recurring/${id}`, 
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadRecurring();
    } catch (error) {
      console.error('Failed to toggle recurring invoice:', error);
    }
  };

  const handleGenerate = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(`${API_URL}/api/recurring/${id}/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Invoice ${data.invoice.invoiceNumber} generated!`);
      loadRecurring();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert(error.response?.data?.error || 'Failed to generate');
    }
  };

  const total = calculateTotal();

  // List View
  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Recurring Invoices</h1>
                <p className="text-emerald-200">Automate your billing cycle</p>
              </div>
            </div>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Template
            </button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : recurring.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recurring invoices</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">Set up automatic billing for retainers and subscriptions</p>
              <button onClick={() => setView('create')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Create Template
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {recurring.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-gray-400 dark:bg-slate-500'}`} />
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.clientName}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">
                        {item.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {item.clientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Next: {new Date(item.nextDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Generated Count */}
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{item.generatedCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Generated</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right min-w-[120px]">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.items.reduce((s, i) => s + (i.quantity * i.rate), 0), item.currency)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerate(item.id)}
                      className="p-2 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400"
                      title="Generate Now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={`p-2 rounded-lg ${
                        item.isActive 
                          ? 'bg-yellow-100 dark:bg-yellow-500/20 hover:bg-yellow-200 dark:hover:bg-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                          : 'bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400'
                      }`}
                      title={item.isActive ? 'Pause' : 'Resume'}
                    >
                      {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create View
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('list')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Recurring Invoice</h1>
          <p className="text-gray-500 dark:text-slate-400">Set up automatic billing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Details */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Client Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Client or company name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Schedule
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  {FREQUENCIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">End Date (optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                Line Items
              </h2>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none text-sm"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-700/50">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Service description"
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
                  <div className="col-span-2 flex items-center justify-end">
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeLineItem(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addLineItem} className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Item
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-gray-200 dark:border-slate-700/50 sticky top-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Amount per invoice</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(total, formData.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Frequency</span>
                <span className="text-gray-900 dark:text-white font-medium capitalize">{formData.frequency}</span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-slate-700" />
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-semibold">Per Period</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(total, formData.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !formData.clientName || !formData.clientEmail}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Create Template
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-center text-gray-500 dark:text-slate-500">
              First invoice will be generated on {formData.startDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringInvoices;
