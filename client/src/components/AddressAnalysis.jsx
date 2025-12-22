import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { analyzeAddressIssues, generateKenyaAddressOptions } from '../utils/kenyaLocations';

export default function AddressAnalysis({ addressComponents, formattedAddress }) {
  const { building, street, area, city, state, postalCode, countryName } = addressComponents;
  
  // Only show for Kenya
  if (countryName !== 'Kenya') return null;
  
  // Analyze issues
  const issues = analyzeAddressIssues(addressComponents);
  
  // Generate options
  const { optionA, optionB } = generateKenyaAddressOptions(addressComponents);
  
  return (
    <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        VeriBridge Analysis
      </h3>
      
      {/* Issues Detection */}
      {issues.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Our system found {issues.length} issue{issues.length > 1 ? 's' : ''}:</p>
          {issues.map((issue, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                issue.severity === 'error' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {issue.severity === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${
                    issue.severity === 'error' ? 'text-red-300' : 'text-yellow-300'
                  }`}>
                    {issue.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-semibold">Fix:</span> {issue.fix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Success Message */}
      {issues.length === 0 && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-300">
              ✓ No major issues detected! Your address looks good.
            </p>
          </div>
        </div>
      )}
      
      {/* Output Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Info className="w-4 h-4" />
          Recommended Formats (Copy & Paste Ready)
        </h4>
        
        {/* Option A */}
        <div className={`p-4 rounded-lg border-2 ${
          optionA.recommended 
            ? 'bg-blue-500/10 border-blue-500/50' 
            : 'bg-white/5 border-gray-700'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Option A: {optionA.label}
                {optionA.recommended && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                    Recommended
                  </span>
                )}
              </h5>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{optionA.description}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-3">
              <span className="text-xs w-32" style={{ color: 'var(--text-muted)' }}>Address Line 1:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent-blue)' }}>
                {optionA.lines.line1}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs w-32" style={{ color: 'var(--text-muted)' }}>Address Line 2:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent-blue)' }}>
                {optionA.lines.line2}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs w-32" style={{ color: 'var(--text-muted)' }}>City / Town:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent-blue)' }}>
                {optionA.lines.city}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs w-32" style={{ color: 'var(--text-muted)' }}>Postal Code:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent-blue)' }}>
                {optionA.lines.postalCode}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs w-32" style={{ color: 'var(--text-muted)' }}>Country:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent-blue)' }}>
                {optionA.lines.country}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const formatted = `Address Line 1: ${optionA.lines.line1}\nAddress Line 2: ${optionA.lines.line2}\nCity / Town: ${optionA.lines.city}\nPostal Code: ${optionA.lines.postalCode}\nCountry: ${optionA.lines.country}`;
              navigator.clipboard.writeText(formatted);
            }}
            className="mt-3 text-xs px-3 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
          >
            Copy Option A
          </button>
        </div>
        
        {/* Option B */}
        <div className="p-4 rounded-lg border-2 bg-white/5 border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Option B: {optionB.label}
              </h5>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{optionB.description}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 w-32">Address Line 1:</span>
              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                {optionB.lines.line1}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 w-32">Address Line 2:</span>
              <span className="text-sm font-mono text-gray-300">
                {optionB.lines.line2}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 w-32">City / Town:</span>
              <span className="text-sm font-mono text-gray-300">
                {optionB.lines.city}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 w-32">Postal Code:</span>
              <span className="text-sm font-mono text-gray-300">
                {optionB.lines.postalCode}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 w-32">Country:</span>
              <span className="text-sm font-mono text-gray-300">
                {optionB.lines.country}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const formatted = `Address Line 1: ${optionB.lines.line1}\nAddress Line 2: ${optionB.lines.line2}\nCity / Town: ${optionB.lines.city}\nPostal Code: ${optionB.lines.postalCode}\nCountry: ${optionB.lines.country}`;
              navigator.clipboard.writeText(formatted);
            }}
            className="mt-3 text-xs px-3 py-1.5 rounded bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Copy Option B
          </button>
        </div>
      </div>
      
      {/* Why This Works */}
      {issues.length > 0 && (
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          <h5 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            🎯 Why This Works (The "Secret Sauce")
          </h5>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {issues.find(i => i.type === 'WRONG_POSTAL_CODE') && (
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>We fixed the postal code to match your actual area location</span>
              </li>
            )}
            {issues.find(i => i.type === 'FORBIDDEN_KEYWORD') && (
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>We replaced religious landmarks with recognizable road names</span>
              </li>
            )}
            {issues.find(i => i.type === 'CONFLICT') && (
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>We fixed the sub-county to match GPS coordinates</span>
              </li>
            )}
            {issues.find(i => i.type === 'REDUNDANCY') && (
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>We removed redundant location information</span>
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Next Steps */}
      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs" style={{ color: '#000000' }}>
          💡 <span className="font-semibold">Pro Tip:</span> Copy Option A and give it to your bank teller. 
          Don't say "I live near the Mosque." Say "Please update my address to: [Option A]"
        </p>
      </div>
    </div>
  );
}
