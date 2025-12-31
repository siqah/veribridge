import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  FileText, Download, CreditCard, Smartphone, CheckCircle, 
  Clock, AlertCircle, Building, Mail, Phone, Calendar, Loader2
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Currency configuration
const CURRENCIES = {
  KES: { symbol: 'KES', name: 'Kenyan Shilling' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  UGX: { symbol: 'UGX', name: 'Ugandan Shilling' },
  TZS: { symbol: 'TZS', name: 'Tanzanian Shilling' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
};

const InvoicePortal = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchInvoice();
    
    // Check for payment callback
    if (searchParams.get('reference')) {
      checkPaymentStatus();
    }
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/portal/invoice/${token}`);
      setInvoice(data.invoice);
      setBusiness(data.business);
    } catch (err) {
      setError(err.response?.data?.error || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/portal/invoice/${token}/status`);
      if (data.status === 'PAID') {
        setPaymentSuccess(true);
        fetchInvoice(); // Refresh invoice data
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/portal/invoice/${token}/mpesa`, {
        phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.replace(/^0/, '')}`,
      });
      
      if (data.success) {
        alert(data.message);
        // Poll for payment status
        const pollInterval = setInterval(async () => {
          const { data: status } = await axios.get(`${API_URL}/api/portal/invoice/${token}/status`);
          if (status.status === 'PAID') {
            clearInterval(pollInterval);
            setPaymentSuccess(true);
            fetchInvoice();
          }
        }, 5000);
        
        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(pollInterval), 120000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    setProcessing(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/portal/invoice/${token}/paystack`);
      
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount, currencyCode = 'KES') => {
    const curr = CURRENCIES[currencyCode] || CURRENCIES.KES;
    return `${curr.symbol} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Draft' },
      SENT: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Awaiting Payment' },
      PAID: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Paid' },
      OVERDUE: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Overdue' },
    };
    return configs[status] || configs.SENT;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invoice Not Found</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess || invoice.status === 'PAID') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400 mb-6">
            Thank you for your payment. Invoice {invoice.invoiceNumber} has been marked as paid.
          </p>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
            <p className="text-sm text-slate-400 mt-1">Amount Paid</p>
          </div>
          {invoice.pdfUrl && (
            <a
              href={`${API_URL}${invoice.pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </a>
          )}
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {business?.logo && (
            <img 
              src={business.logo} 
              alt={business.name} 
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-white">{business?.name || 'Invoice'}</h1>
          {business?.email && (
            <p className="text-slate-400 text-sm">{business.email}</p>
          )}
        </div>

        {/* Invoice Card */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Invoice Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{invoice.invoiceNumber}</h2>
                <p className="text-slate-400 text-sm">
                  Issued: {new Date(invoice.createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg}`}>
                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="p-6 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="text-lg font-semibold text-white">{invoice.clientName}</p>
            {invoice.clientEmail && (
              <p className="text-slate-400 text-sm">{invoice.clientEmail}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="p-6 border-b border-slate-800">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left pb-3">Description</th>
                  <th className="text-center pb-3">Qty</th>
                  <th className="text-right pb-3">Rate</th>
                  <th className="text-right pb-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-white">{item.description}</td>
                    <td className="py-3 text-center text-slate-400">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-400">
                      {formatCurrency(item.rate, invoice.currency)}
                    </td>
                    <td className="py-3 text-right text-white font-medium">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-6 bg-slate-800/30">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax ({invoice.taxRate}%)</span>
                  <span className="text-white">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
                <span className="text-white">Total</span>
                <span className="text-purple-400">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          {invoice.dueDate && (
            <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Due by {new Date(invoice.dueDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="p-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Section */}
        {invoice.status !== 'PAID' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Pay This Invoice</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* M-Pesa Option (KES only) */}
              {invoice.currency === 'KES' && (
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Smartphone className={`w-8 h-8 mb-2 ${paymentMethod === 'mpesa' ? 'text-green-400' : 'text-slate-400'}`} />
                  <p className="font-semibold text-white">M-Pesa</p>
                  <p className="text-xs text-slate-400">Pay with mobile money</p>
                </button>
              )}

              {/* Card/Paystack Option */}
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <CreditCard className={`w-8 h-8 mb-2 ${paymentMethod === 'card' ? 'text-purple-400' : 'text-slate-400'}`} />
                <p className="font-semibold text-white">Card / Bank</p>
                <p className="text-xs text-slate-400">Visa, Mastercard, Bank Transfer</p>
              </button>
            </div>

            {/* M-Pesa Form */}
            {paymentMethod === 'mpesa' && (
              <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  M-Pesa Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="flex items-center px-4 bg-slate-700 rounded-lg text-white">
                    +254
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="7XXXXXXXX"
                    maxLength={9}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-green-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleMpesaPayment}
                  disabled={processing || phoneNumber.length < 9}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Pay {formatCurrency(invoice.total, invoice.currency)} with M-Pesa
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Card Payment Button */}
            {paymentMethod === 'card' && (
              <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-slate-400 text-sm mb-4">
                  You'll be redirected to our secure payment partner to complete your payment.
                </p>
                <button
                  onClick={handlePaystackPayment}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {formatCurrency(invoice.total, invoice.currency)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Download PDF */}
        {invoice.pdfUrl && (
          <div className="mt-6 text-center">
            <a
              href={`${API_URL}${invoice.pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-xs">
          <p>Powered by VeriBridge</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePortal;
