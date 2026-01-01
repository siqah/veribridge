import { useState, useEffect, useRef } from 'react';
import { User, Building2, Mail, DollarSign, Camera, Save, Loader, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfileSettings = () => {
  const { user, getToken } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    defaultCurrency: 'KES',
    businessPhone: '',
    businessAddress: '',
    taxId: '',
    invoicePrefix: 'INV',
    invoiceNotes: '',
    avatarUrl: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.profile) {
        setFormData({
          businessName: data.profile.businessName || '',
          businessEmail: data.profile.businessEmail || user?.email || '',
          defaultCurrency: data.profile.defaultCurrency || 'KES',
          businessPhone: data.profile.businessPhone || '',
          businessAddress: data.profile.businessAddress || '',
          taxId: data.profile.taxId || '',
          invoicePrefix: data.profile.invoicePrefix || 'INV',
          invoiceNotes: data.profile.invoiceNotes || '',
          avatarUrl: data.profile.avatarUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const token = await getToken();
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const { data } = await axios.post(`${API_URL}/api/profile/avatar`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      const { data } = await axios.put(`${API_URL}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your business information</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Business Logo</h2>
        <div className="flex items-center gap-6">
          <div 
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden group transition-all hover:border-opacity-70"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                <Building2 className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Upload your business logo</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Recommended: 200x200px, PNG or JPG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Business Information</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Business Name
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="Your Company Ltd"
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{ 
                background: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Business Email
              </label>
              <input
                type="email"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Business Phone
              </label>
              <input
                type="tel"
                value={formData.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Business Address
            </label>
            <textarea
              value={formData.businessAddress}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              placeholder="123 Business Street, Nairobi, Kenya"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{ 
                background: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Tax ID / KRA PIN
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="A123456789X"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Invoice Settings</h2>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Invoice Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                placeholder="INV"
                maxLength={5}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Example: {formData.invoicePrefix || 'INV'}-001
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Default Invoice Notes
            </label>
            <textarea
              value={formData.invoiceNotes}
              onChange={(e) => handleChange('invoiceNotes', e.target.value)}
              placeholder="Payment terms: Due within 30 days of invoice date."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{ 
                background: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span>Changes saved!</span>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          style={{ background: 'var(--accent-blue)', color: 'white' }}
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
