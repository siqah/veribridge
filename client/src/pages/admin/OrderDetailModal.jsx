import { useState } from 'react';
import { X, Save, Upload, FileText, User, Building, MapPin, Calendar, Shield } from 'lucide-react';

const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'];

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [registrationNumber, setRegistrationNumber] = useState(order.registration_number || '');
  const [certificateFile, setCertificateFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
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
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Order Details</h2>
            <p className="text-sm text-gray-400">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Company Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400">Company Name</label>
                <div className="text-white font-medium">{order.company_name}</div>
              </div>
              
              {order.alt_name_1 && (
                <div>
                  <label className="text-gray-400">Alternative Name 1</label>
                  <div className="text-white">{order.alt_name_1}</div>
                </div>
              )}
              
              {order.alt_name_2 && (
                <div>
                  <label className="text-gray-400">Alternative Name 2</label>
                  <div className="text-white">{order.alt_name_2}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400">Jurisdiction</label>
                  <div className="text-white font-medium">
                    {order.jurisdiction === 'UK' ? '🇬🇧 United Kingdom' : '🇺🇸 United States'}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400">Type</label>
                  <div className="text-white">{order.company_type}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Director Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Director Information</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400">Full Name</label>
                <div className="text-white font-medium">{order.director_name}</div>
              </div>
              
              {order.director_email && (
                <div>
                  <label className="text-gray-400">Email</label>
                  <div className="text-white">{order.director_email}</div>
                </div>
              )}
              
              {order.director_phone && (
                <div>
                  <label className="text-gray-400">Phone</label>
                  <div className="text-white">{order.director_phone}</div>
                </div>
              )}
              
              {order.director_address && (
                <div>
                  <label className="text-gray-400">Address</label>
                  <div className="text-white text-xs leading-relaxed">{order.director_address}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Payment & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-white/5">
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
              <label className="text-xs text-gray-400">Payment Amount</label>
            </div>
            <div className="text-green-400 text-sm font-semibold">
              KES {order.payment_amount?.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-400">KYC Status</label>
            </div>
            <div className="text-sm">
              {order.kyc_verified ? (
                <span className="text-green-400">✓ Verified</span>
              ) : (
                <span className="text-yellow-400">⚠ Pending</span>
              )}
            </div>
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
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
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
