import { useState } from 'react';
import { Upload, Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminMailUpload({ userId, orderID, onSuccess }) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    sender: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!formData.title) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = await getToken();

      // 1. Upload file to Supabase Storage
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('userId', userId);
      
      const uploadResponse = await axios.post(
        `${API_URL}/api/upload/mail`,
        formDataUpload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const fileUrl = uploadResponse.data.url;

      // 2. Create mailbox item
      await axios.post(
        `${API_URL}/api/mailbox/upload`,
        {
          user_id: userId,
          order_id: orderID || null,
          title: formData.title,
          sender: formData.sender,
          file_url: fileUrl
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setFormData({ title: '', sender: '' });
      setFile(null);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload mail');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upload Mail</h3>
          <p className="text-sm text-slate-400">Add scanned mail to this user's mailbox</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">Document Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., HMRC UTR Number Letter"
            className="input-field w-full"
            required
          />
        </div>

        {/* Sender */}
        <div>
          <label className="label">Sender (Optional)</label>
          <input
            type="text"
            value={formData.sender}
            onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
            placeholder="e.g., HMRC, Companies House"
            className="input-field w-full"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="label">PDF File *</label>
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="mail-file-upload"
            />
            <label
              htmlFor="mail-file-upload"
              className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-700 rounded-xl hover:border-slate-600 cursor-pointer transition-colors bg-slate-900/50"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-1">
                  {file ? file.name : 'Click to upload PDF'}
                </p>
                <p className="text-xs text-slate-500">
                  Maximum file size: 10MB
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-400">Mail uploaded successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to User's Mailbox
            </>
          )}
        </button>
      </form>
    </div>
  );
}
