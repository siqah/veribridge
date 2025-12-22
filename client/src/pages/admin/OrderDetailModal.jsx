import { useState } from 'react';
import { X, Save, Upload, FileText, User, Building, MapPin, Calendar, Shield } from 'lucide-react';
import CopyField from './components/CopyField';

const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'];

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [registrationNumber, setRegistrationNumber] = useState(order.registration_number || '');
  const [certificateFile, setCertificateFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Parse director data from JSON if exists
  const directorData = order.director_data || {};
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update status and details
      const response = await fetch(`${API_URL}/api/formation/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          registrationNumber: registrationNumber || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Upload certificate if provided
        if (certificateFile) {
          const formData = new FormData();
          formData.append('certificate', certificateFile);
          
          await fetch(`${API_URL}/api/formation/${order.id}/upload-certificate`, {
            method: 'POST',
            body: formData
          });
        }
        
        alert('Order updated successfully!');
        onUpdate?.();
        onClose();
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
        const response = await fetch(`${API_URL}/api/formation/${order.id}/notify-customer`, {
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
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">📋 Rapid Formations Copy-Paste</h2>
            <p className="text-sm text-gray-400">Order ID: {order.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Company Information - Copy-Paste Ready */}
          <div>
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
          
          {/* Director Information - Copy-Paste Ready */}
          <div>
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
          
          {/* Security Questions (IN01) - Copy-Paste Ready */}
          <div>
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
          
          {/* Addresses - Copy-Paste Ready */}
          <div>
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
        
        {/* Payment & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">Created</label>
            </div>
            <div className="text-white text-sm">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">Payment</label>
            </div>
            <div className="text-green-400 text-sm font-semibold">
              KES {order.payment_amount?.toLocaleString()}
            </div>
            {order.payment_ref && (
              <button
                onClick={() => navigator.clipboard.writeText(order.payment_ref)}
                className="text-xs text-gray-500 hover:text-blue-400 transition-colors font-mono"
                title="Copy Paystack Reference"
              >
                {order.payment_ref.slice(0, 10)}...
              </button>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">Status</label>
            </div>
            <div className="text-sm">
              {order.kyc_verified ? (
                <span className="text-green-400">✓ Verified</span>
              ) : (
                <span className="text-yellow-400">⚠ Pending</span>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-gray-400">Contact</label>
            </div>
            <a
              href={`https://wa.me/${order.director_phone?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm transition-colors"
            >
              📱 WhatsApp
            </a>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
          
          <div className="space-y-4">
            {/* Status Update */}
            <div>
              <label className="label">Order Status</label>
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
            
            {/* Registration Number */}
            <div>
              <label className="label">Company Registration Number</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g., 12345678 (UK) or EIN (US)"
                className="input-field"
              />
            </div>
            
            {/* Certificate Upload */}
            <div>
              <label className="label">Upload Certificate of Incorporation</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCertificateFile(e.target.files[0])}
                  className="hidden"
                  id="certificate-upload"
                />
                <label
                  htmlFor="certificate-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {certificateFile ? certificateFile.name : 'Choose PDF file'}
                  </span>
                </label>
                {order.certificate_url && (
                  <a
                    href={order.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Current
                  </a>
                )}
              </div>
            </div>
            
            {/* Admin Notes */}
            <div>
              <label className="label">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {status === 'COMPLETED' && registrationNumber && (
            <button
              onClick={handleSendEmail}
              className="btn-secondary"
            >
              📧 Send Email to Customer
            </button>
          )}
          
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
