import { useState } from 'react';
import { FileDown, Printer, CheckCircle2, Building } from 'lucide-react';
import { useAddressStore } from '../store/addressStore';
import { generateBankInstructionPDF, downloadPDF, getAvailableBanks } from '../utils/pdfTemplates';

export default function BankCardGenerator() {
  const [selectedBank, setSelectedBank] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const { formattedAddress, validation } = useAddressStore();
  const banks = getAvailableBanks();
  
  const handleGeneratePDF = async () => {
    if (!selectedBank || !formattedAddress) return;
    
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pdf = generateBankInstructionPDF(selectedBank, formattedAddress);
      downloadPDF(pdf, `VeriBridge_${selectedBank.replace(/\s+/g, '_')}_Instructions.pdf`);
      setIsGenerated(true);
      setTimeout(() => setIsGenerated(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const hasValidAddress = formattedAddress && validation?.severity !== 'error';
  
  return (
    <div className="space-y-6">
      {/* Current Address Display */}
      <div>
        <label className="label flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
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
              Complete Step 1 to see your formatted address here
            </p>
          </div>
        )}
      </div>
      
      {/* Bank Selection */}
      <div>
        <label htmlFor="bank-select" className="label">
          Select Your Bank
        </label>
        <select
          id="bank-select"
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="select-field"
          disabled={!hasValidAddress}
        >
          <option value="">Choose a bank...</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.name}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* What You'll Get Section */}
      <div className="info-box">
        <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
          <Printer className="w-4 h-4" />
          What you'll get
        </h4>
        <ul className="space-y-2 text-sm text-blue-200/70">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Professional PDF with your exact address for the bank teller</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Clear warning labels about P.O. Box restrictions</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Request for an interim statement with the new address</span>
          </li>
        </ul>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGeneratePDF}
        disabled={!selectedBank || !hasValidAddress || isGenerating}
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
            <FileDown className="w-5 h-5" />
            <span>Generate Bank Instructions (PDF)</span>
          </>
        )}
      </button>
      
      {/* Next Steps */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
        <h4 className="text-sm font-semibold text-white mb-3">Next Steps</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
            <span>Print or save the PDF to your phone</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
            <span>Visit any branch of {selectedBank || 'your selected bank'}</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
            <span>Show the PDF to the teller and request an update</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
            <span>Get your interim statement with the new address</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
