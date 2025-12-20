import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Building, User, MapPin, Calendar, FileText, Shield } from 'lucide-react';
import CopyField from './components/CopyField';

const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/formation`);
      const data = await response.json();
      
      if (data.success) {
        const foundOrder = data.orders.find(o => o.id === id);
        if (foundOrder) {
          setOrder(foundOrder);
          setStatus(foundOrder.status);
          setAdminNotes(foundOrder.admin_notes || '');
          setRegistrationNumber(foundOrder.registration_number || '');
        }
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/formation/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, registrationNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Order updated successfully!');
        loadOrder();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (status !== 'COMPLETED') {
      alert('Order must be marked as COMPLETED before sending email to customer');
      return;
    }
    
    if (!registrationNumber) {
      alert('Please enter Company Registration Number before sending email');
      return;
    }
    
    if (confirm('Send completion email to customer?')) {
      try {
        const response = await fetch(`${API_URL}/api/formation/${id}/notify-customer`, {
          method: 'POST',
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('✅ Customer notified successfully!');
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Send email error:', error);
        alert('Failed to send email to customer');
      }
    }
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      alert('Please select a PDF file first');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);

      const response = await fetch(`${API_URL}/api/formation/${id}/upload-certificate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Certificate uploaded successfully!');
        setCertificateFile(null);
        loadOrder(); // Reload to show new certificate
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload certificate');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Order not found</p>
        <button onClick={() => navigate('/admin')} className="btn-secondary mt-4">
          Back to Orders
        </button>
      </div>
    );
  }

  const directorData = order.director_data || {};

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📋 Order Details</h1>
            <p className="text-gray-400">Order ID: {id.slice(0, 8)}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            
            {status === 'COMPLETED' && registrationNumber && (
              <button onClick={handleSendEmail} className="btn-secondary">
                📧 Send Email
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
            </div>
            <div className="space-y-2">
              <CopyField label="Company Name" value={`${order.company_name} ${order.company_type}`} />
              <CopyField label="SIC Code" value={directorData.sicCode || order.industry_code} />
              <CopyField label="Jurisdiction" value={order.jurisdiction} />
            </div>
          </div>

          {/* Director Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Director Information</h3>
            </div>
            <div className="space-y-2">
              <CopyField label="Full Name" value={order.director_name} />
              <CopyField label="Date of Birth" value={directorData.directorDob} />
              <CopyField label="Nationality" value={directorData.nationality} />
              <CopyField label="Occupation" value={directorData.occupation} />
              <CopyField label="Email" value={order.director_email} />
              <CopyField label="Phone" value={order.director_phone} />
            </div>
          </div>

          {/* Security Questions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Security Questions (IN01)</h3>
            </div>
            <div className="space-y-2">
              <CopyField label="Town of Birth" value={directorData.townOfBirth} />
              <CopyField label="Mother's Maiden Name" value={directorData.mothersMaidenName} />
              <CopyField label="Father's First Name" value={directorData.fathersFirstName} />
            </div>
          </div>

          {/* Addresses */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Addresses</h3>
            </div>
            <div className="space-y-2">
              <CopyField 
                label="Service Address (PUBLIC)" 
                value="71-75 Shelton Street, Covent Garden, London WC2H 9JQ" 
              />
              <CopyField 
                label="Residential Address" 
                value={order.director_address} 
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Admin Controls */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400">Created</label>
                <div className="text-white">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <label className="text-gray-400">Payment</label>
                <div className="text-green-400 font-semibold">
                  KES {order.payment_amount?.toLocaleString()}
                </div>
                {order.payment_ref && (
                  <button
                    onClick={() => navigator.clipboard.writeText(order.payment_ref)}
                    className="text-xs text-gray-500 hover:text-blue-400 font-mono"
                    title="Copy Paystack Reference"
                  >
                    {order.payment_ref.slice(0, 10)}...
                  </button>
                )}
              </div>
              <div>
                <label className="text-gray-400">Contact</label>
                <a
                  href={`https://wa.me/${order.director_phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm transition-colors mt-1"
                >
                  📱 WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select-field"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Registration Number</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g., 12345678"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Upload Certificate</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                    className="input-field text-sm"
                    id="certificate-upload"
                  />
                  <button
                    onClick={handleUploadCertificate}
                    disabled={!certificateFile || isUploading}
                    className="btn-secondary w-full disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Certificate PDF'}
                  </button>
                  {order.certificate_url && (
                    <a
                      href={order.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-400 hover:underline block"
                    >
                      ✓ Certificate uploaded - View →
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="input-field h-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
