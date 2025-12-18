import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles verification automatically
    // Check if we have the verification params
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (type === 'email' || token) {
      setStatus('success');
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying...</h2>
              <p className="text-blue-200">Please wait while we verify your email</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-blue-200">Your email has been successfully verified</p>
              <p className="text-white/70 text-sm mt-4">Redirecting to login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-blue-200 mb-6">The verification link is invalid or has expired</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
