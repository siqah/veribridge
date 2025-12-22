import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Protected route - requires authentication
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Admin route - requires authentication AND admin role
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to admin login page (not regular login)
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user is admin
  // Admin check: either has 'admin' role in metadata OR is the owner email
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'faruoqmuhammed@gmail.com';

  if (!isAdmin) {
    // Redirect to home if not admin
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="max-w-md text-center p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-blue-200 mb-6">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}

// Default export for backwards compatibility
export default ProtectedRoute;
