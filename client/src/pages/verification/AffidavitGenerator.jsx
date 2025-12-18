import { useState } from 'react';
import { FileText, Download, CheckCircle2, AlertCircle, Scale } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';
import { generateAffidavitPDF, downloadAffidavit } from '../../utils/affidavitTemplate';

export default function AffidavitGenerator() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const { formattedAddress, validation } = useAddressStore();
  
  const hasValidAddress = formattedAddress && validation?.severity !== 'error';
  const isFormComplete = fullName.trim() && idNumber.trim() && city.trim() && hasValidAddress;
  
  const handleGeneratePDF = async () => {
    if (!isFormComplete) return;
    
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pdf = generateAffidavitPDF({
        fullName,
        idNumber,
        formattedAddress,
        city,
      });
      
      const sanitizedName = fullName.replace(/\s+/g, '_').toUpperCase();
      downloadAffidavit(pdf, `Affidavit_${sanitizedName}.pdf`);
      
      setIsGenerated(true);
      setTimeout(() => setIsGenerated(false), 3000);
    } catch (error) {
      console.error('Error generating affidavit:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Legal Notice */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-300 mb-1">Legal Document</h4>
            <p className="text-sm text-yellow-200/70">
              This generates a statutory declaration under Kenyan law. You must sign it before a 
              <strong> Commissioner for Oaths</strong> (found at cyber cafés, Huduma Centers, or law offices).
              Making a false declaration is a criminal offence.
            </p>
          </div>
        </div>
      </div>
      
      {/* Address Preview */}
      <div>
        <label className="label flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Your Formatted Address
        </label>
        
        {formattedAddress ? (
          <div className={`address-preview ${
            validation?.severity === 'error' ? 'address-preview-error' :
            validation?.severity === 'warning' ? 'address-preview-warning' :
            'address-preview-success'
          }`}>
            <p className="text-white">{formattedAddress}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-gray-600 text-center">
            <p className="text-gray-400 text-sm">
              Complete Step 1 (Address Architect) first to generate your formatted address
            </p>
          </div>
        )}
      </div>
      
      {/* User Information Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="label">
            Full Legal Name (as on National ID)
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., JOHN KAMAU MWANGI"
            className="input-field"
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        
        <div>
          <label htmlFor="idNumber" className="label">
            National ID Number
          </label>
          <input
            id="idNumber"
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="e.g., 12345678"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="city" className="label">
            City (Where You'll Sign)
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Nairobi"
            className="input-field"
          />
        </div>
      </div>
      
      {/* What You'll Get */}
      <div className="info-box">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">What You'll Get:</h4>
        <ul className="space-y-2 text-sm text-blue-200/70">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Professional statutory declaration PDF</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Your formatted address prominently displayed</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Space for Commissioner's stamp & signature</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Compliant with Kenyan Oaths & Statutory Declarations Act</span>
          </li>
        </ul>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGeneratePDF}
        disabled={!isFormComplete || isGenerating}
        className={`w-full btn-primary flex items-center justify-center gap-2 ${
          isGenerated ? 'bg-green-600 hover:bg-green-600' : ''
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating...</span>
          </>
        ) : isGenerated ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Generate Affidavit (PDF)</span>
          </>
        )}
      </button>
      
      {/* Next Steps */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
        <h4 className="text-sm font-semibold text-white mb-3">Next Steps:</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
            <span>Download and print the affidavit</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
            <span>Visit any Commissioner for Oaths (cyber café, Huduma, law office)</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
            <span>Sign in their presence & get their stamp (~Ksh 200-500)</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
            <span>Scan or photograph the signed document</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">5</span>
            <span>Submit to Google Play Console / Amazon via the appeal process</span>
          </li>
        </ol>
      </div>
      
      {/* Warning */}
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-300 mb-1">Important</h4>
            <p className="text-sm text-red-200/70">
              The unsigned affidavit is NOT a valid document. It MUST be signed before a 
              Commissioner for Oaths with their official stamp to be legally valid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
