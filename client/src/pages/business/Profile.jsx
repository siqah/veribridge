import { useState, useEffect } from 'react';
import { Building2, Upload, X, Save, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Profile() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profile, setProfile] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    taxId: '',
    companyNumber: '',
    defaultCurrency: 'KES',
    invoicePrefix: 'INV',
    businessLogo: null
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data.profile);
      setLogoPreview(data.profile.businessLogo);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('logo', logoFile);

      const { data } = await axios.post(`${API_URL}/api/profile/logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({ ...prev, businessLogo: data.logoUrl }));
      setLogoPreview(data.logoUrl);
      setLogoFile(null);
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Remove business logo?')) return;

    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/profile/logo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(prev => ({ ...prev, businessLogo: null }));
      setLogoPreview(null);
      setLogoFile(null);
    } catch (error) {
      console.error('Error removing logo:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const { data } = await axios.put(`${API_URL}/api/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(data.profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-400" />
          Business Profile
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your business details for professional invoices
        </p>
      </div>

      {/* Business Logo */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Business Logo</h2>
        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden bg-slate-800">
              {logoPreview ? (
                <img src={logoPreview} alt="Business Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-16 h-16 text-slate-600" />
              )}
            </div>
            {profile.businessLogo && (
              <button
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleLogoSelect}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Choose Logo
            </label>
            {logoFile && (
              <button
                onClick={handleLogoUpload}
                disabled={uploadingLogo}
                className="btn-primary ml-2"
              >
                {uploadingLogo ? 'Uploading...' : 'Upload'}
              </button>
            )}
            <p className="text-sm text-slate-500 mt-2">
              JPG, PNG, or WebP. Max 5MB. Recommended: 400x400px
            </p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={profile.businessName}
              onChange={handleInputChange}
              placeholder="Your Company Ltd"
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Business Email
            </label>
            <input
              type="email"
              name="businessEmail"
              value={profile.businessEmail}
              onChange={handleInputChange}
              placeholder="billing@company.com"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              name="businessPhone"
              value={profile.businessPhone}
              onChange={handleInputChange}
              placeholder="+254..."
              className="input w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Business Address
            </label>
            <textarea
              name="businessAddress"
              value={profile.businessAddress}
              onChange={handleInputChange}
              placeholder="Full business address for invoices"
              className="input w-full"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Tax ID / KRA PIN
            </label>
            <input
              type="text"
              name="taxId"
              value={profile.taxId}
              onChange={handleInputChange}
              placeholder="A123456789X"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Company Number
            </label>
            <input
              type="text"
              name="companyNumber"
              value={profile.companyNumber}
              onChange={handleInputChange}
              placeholder="12345678"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Invoice Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Currency
            </label>
            <select
              name="defaultCurrency"
              value={profile.defaultCurrency}
              onChange={handleInputChange}
              className="input w-full"
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Invoice Prefix
            </label>
            <input
              type="text"
              name="invoicePrefix"
              value={profile.invoicePrefix}
              onChange={handleInputChange}
              placeholder="INV"
              className="input w-full"
              maxLength="10"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: {profile.invoicePrefix}-2024-01-0001
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !profile.businessName}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
