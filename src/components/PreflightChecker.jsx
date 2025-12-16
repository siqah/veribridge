import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react';
import { useAddressStore } from '../store/addressStore';
import { verifySyntax, getVerificationBadge } from '../utils/preflightVerification';

export default function PreflightChecker() {
  const { formattedAddress } = useAddressStore();
  const [verificationResult, setVerificationResult] = useState(null);
  const [expandedChecks, setExpandedChecks] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Auto-verify when address changes
  useEffect(() => {
    if (formattedAddress) {
      runVerification();
    } else {
      setVerificationResult(null);
    }
  }, [formattedAddress]);
  
  const runVerification = () => {
    setIsVerifying(true);
    
    // Simulate slight delay for UX
    setTimeout(() => {
      const result = verifySyntax(formattedAddress);
      setVerificationResult(result);
      setIsVerifying(false);
    }, 300);
  };
  
  if (!formattedAddress) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-gray-600 text-center">
        <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          Enter an address above to run pre-flight verification
        </p>
      </div>
    );
  }
  
  if (isVerifying) {
    return (
      <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
        <RefreshCw className="w-6 h-6 text-blue-400 mx-auto mb-2 animate-spin" />
        <p className="text-gray-400 text-sm">Verifying address...</p>
      </div>
    );
  }
  
  if (!verificationResult) return null;
  
  const badge = getVerificationBadge(verificationResult.score);
  const hasBlockers = verificationResult.blockers.length > 0;
  const hasWarnings = verificationResult.warnings.length > 0;
  
  return (
    <div className="space-y-4">
      {/* Score Header */}
      <div className={`p-4 rounded-lg border ${
        hasBlockers 
          ? 'bg-red-500/10 border-red-500/40' 
          : verificationResult.score >= 75 
            ? 'bg-green-500/10 border-green-500/40'
            : 'bg-yellow-500/10 border-yellow-500/40'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasBlockers 
                ? 'bg-red-500' 
                : verificationResult.score >= 75 
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
            }`}>
              <span className="text-2xl font-bold text-white">{verificationResult.score}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">Pre-Flight Score</h3>
              <p className={`text-sm ${
                hasBlockers ? 'text-red-300' : verificationResult.score >= 75 ? 'text-green-300' : 'text-yellow-300'
              }`}>
                {badge.icon} {badge.text}
              </p>
            </div>
          </div>
          
          <button
            onClick={runVerification}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Re-run verification"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Blockers (Critical Issues) */}
      {hasBlockers && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            CRITICAL ISSUES ({verificationResult.blockers.length})
          </h4>
          {verificationResult.blockers.map((blocker, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <p className="text-sm text-red-200">{blocker}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Warnings */}
      {hasWarnings && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            WARNINGS ({verificationResult.warnings.length})
          </h4>
          {verificationResult.warnings.map((warning, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <p className="text-sm text-yellow-200">{warning}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Detailed Checks */}
      <div className="rounded-lg" style={{ background: 'var(--bg-card)' }}>
        <button
          onClick={() => setExpandedChecks(!expandedChecks)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="text-sm font-semibold text-gray-300">
            Detailed Checks ({verificationResult.checks.length})
          </span>
          {expandedChecks ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedChecks && (
          <div className="px-4 pb-4 space-y-2">
            {verificationResult.checks.map((check, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0"
              >
                <span className="text-sm text-gray-400">{check.name}</span>
                <span className={`text-sm font-medium ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {check.passed ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Failed
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recommendation */}
      {!hasBlockers && verificationResult.score >= 75 && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-300">Ready for Next Step!</h4>
              <p className="text-sm text-green-200/70 mt-1">
                Your address passes pre-flight checks. Proceed to generate your verification package.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
