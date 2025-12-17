import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || 'Signup failed');
    }

    setLoading(false);
  };

  const passwordStrength = formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--accent-blue)' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Start your journey with VeriBridge
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="John Doe"
                className="input-field w-full pl-12"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full pl-12"
                required
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Phone Number <span className="text-xs opacity-50">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+254 700 123 456"
                className="input-field w-full pl-12"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-12"
                required
              />
            </div>
            {formData.password && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {passwordStrength === 'strong' && (
                  <><CheckCircle className="w-4 h -4 text-green-400" /><span className="text-green-400">Strong password</span></>
                )}
                {passwordStrength === 'medium' && (
                  <span className="text-yellow-400">Medium strength - add more characters</span>
                )}
                {passwordStrength === 'weak' && (
                  <span className="text-red-400">Weak - min 8 characters required</span>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-12"
                required
              />
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-2 text-xs text-red-400">Passwords don't match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || formData.password !== formData.confirmPassword}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold hover:underline"
              style={{ color: 'var(--accent-blue)' }}
            >
              Sign in
            </button>
          </span>
        </div>

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          By creating an account, you agree to our{' '}
          <a href="/terms" className="underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
