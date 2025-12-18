import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Eye, Calculator } from 'lucide-react';
import { invoicesAPI } from '../../services/dashboardApi';

const Invoicing = () => {
  const [view, setView] = useState('create'); // 'create' or 'list'
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    currency: 'KES',
    lineItems: [{ description: '', quantity: 1, rate: 0 }],
    paymentDetails: {
      bankName: '',
      accountNumber: '',
      iban: '',
      swift: ''
    }
  });
  
  useEffect(() => {
    if (view === 'list') {
      loadInvoices();
    }
  }, [view]);
  
  const loadInvoices = async () => {
    try {
      const result = await invoicesAPI.listInvoices();
      if (result.success) {
        setInvoices(result.invoices);
      }
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
      const result = await invoicesAPI.createInvoice({
        ...formData,
        userProfile: {
          name: 'Your Business Name',
          email: 'your@email.com',
          phone: '+254 XXX XXX XXX'
        }
      });
      
      if (result.success) {
        alert(`Invoice ${result.invoice.invoiceNumber} created successfully!`);
        // Download PDF if available
        if (result.invoice.pdfUrl) {
          window.open(`http://localhost:3001${result.invoice.pdfUrl}`, '_blank');
        }
        // Reset form
        setFormData({
          clientName: '',
          currency: 'KES',
          lineItems: [{ description: '', quantity: 1, rate: 0 }],
          paymentDetails: { bankName: '', accountNumber: '', iban: '', swift: '' }
        });
        setView('list');
      }
    } catch (error) {
      console.error('Invoice creation failed:', error);
      alert('Failed to create invoice. Please try again.');
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
            <p className="text-gray-400">Professional invoices with KRA tax calculation</p>
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
              
              {/* Client & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="ABC Corporation"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
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
              </div>
              
              {/* Line Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-400">Line Items</label>
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
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm text-white font-semibold">
                          {(item.quantity * item.rate).toLocaleString()}
                        </span>
                        {formData.lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Payment Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.paymentDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, bankName: e.target.value }
                    })}
                    placeholder="Bank Name"
                    className="input w-full"
                  />
                  <input
                    type="text"
                    value={formData.paymentDetails.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, accountNumber: e.target.value }
                    })}
                    placeholder="Account Number"
                    className="input w-full"
                  />
                  <input
                    type="text"
                    value={formData.paymentDetails.iban}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, iban: e.target.value }
                    })}
                    placeholder="IBAN (Optional)"
                    className="input w-full"
                  />
                  <input
                    type="text"
                    value={formData.paymentDetails.swift}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentDetails: { ...formData.paymentDetails, swift: e.target.value }
                    })}
                    placeholder="SWIFT/BIC (Optional)"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* KRA Tax Widget - Right side */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="card sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Summary</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-semibold">
                    {formData.currency} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {formData.currency === 'KES' && (
                  <div className="flex justify-between text-sm p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-blue-400">KRA Tax (1.5%)</span>
                    <span className="text-blue-400 font-semibold">
                      KES {kraTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {formData.currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!formData.clientName || formData.lineItems.some(i => !i.description) || loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? 'Generating...' : (
                  <>
                    <FileText className="w-4 h-4 inline mr-2" />
                    Generate Invoice PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Invoice List */
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Invoice History</h2>
          
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No invoices yet. Create your first invoice!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Invoice #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-blue-400">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-4 px-4 text-white">{invoice.clientName}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-white">
                          {invoice.currency} {invoice.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {invoice.pdfUrl && (
                          <a
                            href={`http://localhost:3001${invoice.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" /> Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoicing;
