import { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { apiKeysAPI } from '../../services/dashboardApi';

const ApiKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  useEffect(() => {
    loadKeys();
  }, []);
  
  const loadKeys = async () => {
    try {
      const result = await apiKeysAPI.listKeys();
      if (result.success) {
        setKeys(result.keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };
  
  const handleGenerateKey = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }
    
    setLoading(true);
    try {
      const result = await apiKeysAPI.generateKey(formData.name, formData.description);
      if (result.success) {
        setNewKeyData(result);
        setFormData({ name: '', description: '' });
        loadKeys();
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
      alert('Failed to generate API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };
  
  const handleRevoke = async (keyId, keyName) => {
    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await apiKeysAPI.revokeKey(keyId);
      if (result.success) {
        loadKeys();
      }
    } catch (error) {
      console.error('Failed to revoke key:', error);
      alert('Failed to revoke key. Please try again.');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">API Keys</h1>
            <p className="text-gray-400">Manage access to the VeriBridge Address API</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Generate New Key
        </button>
      </div>
      
      {/* API Documentation Card */}
      <div className="card mb-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
        <div className="flex items-start gap-3 mb-4">
          <Code className="w-6 h-6 text-blue-400 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">API Documentation</h3>
            <p className="text-sm text-gray-400 mb-4">
              Use our Address Cleaning API to parse and format Kenyan addresses programmatically.
            </p>
            
            {/* cURL Example */}
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400">
{`curl -X POST http://localhost:3001/api/v1/clean-address \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"raw_string": "Near Naivas, Kiambu Road, Nairobi"}'`}
              </pre>
            </div>
            
            {/* Response Example */}
            <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <div className="text-xs text-gray-500 mb-2">Response:</div>
              <pre className="text-xs text-blue-400">
{`{
  "success": true,
  "output": {
    "street": "Kiambu Road",
    "landmark": "Naivas",
    "city": "Nairobi",
    "country": "Kenya"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      {/* API Keys Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Your API Keys</h2>
        
        {keys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No API keys yet</p>
            <button onClick={() => setShowNewKeyModal(true)} className="btn-primary">
              Generate Your First Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Key</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Created</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-4 px-4">
                      <div className="text-white font-medium">{key.name}</div>
                      {key.description && (
                        <div className="text-xs text-gray-500">{key.description}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm font-mono text-gray-400">{key.maskedKey}</code>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${key.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                        }
                      `}>
                        {key.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {key.usageCount || 0} requests
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(key.id, key.name)}
                            className="text-red-400 hover:text-red-300 text-sm"
                            title="Revoke key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Generate API Key</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Production API"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}placeholder="Used for production address cleaning"
                  className="input w-full"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setFormData({ name: '', description: '' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateKey}
                disabled={loading || !formData.name.trim()}
                className="btn-primary flex-1"
              >
                {loading ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Key Success Modal */}
      {newKeyData && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-xl w-full">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">API Key Generated!</h2>
            <p className="text-gray-400 mb-6">
              Save this key securely. You won't be able to see it again!
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">
                This is the only time you'll see the full API key. Copy it now and store it safely.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Your API Key:</span>
                <button
                  onClick={() => handleCopy(newKeyData.apiKey)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
              <code className="text-sm font-mono text-green-400 break-all">
                {newKeyData.apiKey}
              </code>
            </div>
            
            <button
              onClick={() => {
                setNewKeyData(null);
                setShowNewKeyModal(false);
              }}
              className="btn-primary w-full"
            >
              I've Saved My Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
