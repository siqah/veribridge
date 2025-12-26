import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, User, Calendar, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Invoicing = () => {
  const { getToken } = useAuth();
  const [view, setView] = useState('create'); // 'create' or 'list'
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    currency: 'KES',
    dueDate: '',
    notes: '',
    lineItems: [{ description: '', quantity: 1, rate: 0 }],
    paymentDetails: {
      bankName: '',
      accountNumber: '',
      iban: '',
      swift: ''
    }
  });
  
  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (view === 'list') {
      loadInvoices();
    }
  }, [view]);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data.profile);
      // Set default currency from profile
      if (data.profile.defaultCurrency) {
        setFormData(prev => ({ ...prev, currency: data.profile.defaultCurrency }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };
  
  const loadInvoices = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };
  
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, rate: 0 }]
    }));
  };
  
  const removeLineItem = (index) => {
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
  
  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.rate));
    }, 0);
  };
  
  const calculateKraTax = () => {
    if (formData.currency !== 'KES') return 0;
    return calculateSubtotal() * 0.015;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateKraTax();
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(`${API_URL}/api/invoices`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        alert(`Invoice ${data.invoice.invoiceNumber} created successfully!`);
        // Download PDF if available
        if (data.invoice.pdfUrl) {
          window.open(`${API_URL}${data.invoice.pdfUrl}`, '_blank');
        }
        // Reset form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientAddress: '',
          currency: profile?.defaultCurrency || 'KES',
          dueDate: '',
          notes: '',
          lineItems: [{ description: '', quantity: 1, rate: 0 }],
          paymentDetails: { bankName: '', accountNumber: '', iban: '', swift: '' }
        });
        setView('list');
      }
    } catch (error) {
      console.error('Invoice creation failed:', error);
      alert('Failed to create invoice: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const subtotal = calculateSubtotal();
  const kraTax = calculateKraTax();
  const total = calculateTotal();
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Invoicing</h1>
            <p className="text-slate-400">Professional invoices with KRA tax calculation</p>
          </div>
        </div>
        <button
          onClick={() => setView(view === 'create' ? 'list' : 'create')}
          className="btn-secondary"
        >
          {view === 'create' ? 'View Invoices' : 'Create New'}
        </button>
      </div>
      
      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - Left side */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Create Invoice</h2>
              
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="ABC Corporation"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@company.com"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input w-full"
                  >
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Client Address
                  </label>
                  <textarea
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    placeholder="Full client address"
                    className="input w-full"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>
              
              {/* Line Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-400">Line Items *</label>
                  <button onClick={addLineItem} className="btn-secondary text-sm">
                    <Plus className="w-4 h-4 inline mr-1" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="input w-full text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="input w-full text-sm"
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                          placeholder="Rate"
                          className="input w-full text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="p-2 hover:bg-red-500/10 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Details (Optional) */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.bankName}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, bankName: e.target.value }
                      })}
                      placeholder="KCB Bank"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.accountNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, accountNumber: e.target.value }
                      })}
                      placeholder="1234567890"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.iban}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, iban: e.target.value }
                      })}
                      placeholder="GB29 NWBK 6016 1331 9268 19"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      SWIFT/BIC
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.swift}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, swift: e.target.value }
                      })}
                      placeholder="NWBKGB2L"
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or payment terms..."
                  className="input w-full"
                  rows="3"
                />
              </div>
            </div>
          </div>
          
          {/* Summary - Right side */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Invoice Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="text-white font-medium">{formData.currency} {subtotal.toFixed(2)}</span>
                </div>
                {formData.currency === 'KES' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">KRA Tax (1.5%):</span>
                    <span className="text-orange-400 font-medium">KES {kraTax.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="text-xl font-bold text-blue-400">{formData.currency} {total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.clientName || formData.lineItems.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>

              {profile && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Business Details:</p>
                  <p className="text-sm text-white font-medium">{profile.businessName}</p>
                  {profile.businessEmail && (
                    <p className="text-xs text-slate-400">{profile.businessEmail}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Invoice List
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Your Invoices</h2>
          
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No invoices yet</p>
              <button
                onClick={() => setView('create')}
                className="btn-primary mt-4"
              >
                Create Your First Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{invoice.invoiceNumber}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.paymentStatus === 'PAID'
                            ? 'bg-green-500/10 text-green-400'
                            : invoice.paymentStatus === 'OVERDUE'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{invoice.clientName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {invoice.currency} {Number(invoice.total).toFixed(2)}
                      </p>
                      {invoice.pdfUrl && (
                        <button
                          onClick={() => window.open(`${API_URL}${invoice.pdfUrl}`, '_blank')}
                          className="btn-secondary text-sm mt-2"
                        >
                          <Download className="w-3 h-3 inline mr-1" />
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoicing;
