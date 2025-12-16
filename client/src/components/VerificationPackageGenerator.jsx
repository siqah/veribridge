import { useState } from 'react';
import { FileText, Download, CheckCircle2, Package, Shield, AlertTriangle, User, Phone, Mail, CreditCard, Cloud } from 'lucide-react';
import { useAddressStore } from '../store/addressStore';
import { generateAffidavitPDF, downloadAffidavit } from '../utils/affidavitTemplate';
import { generateVerificationCertificate, generateCoverLetter, downloadDocument } from '../utils/verificationPackage';
import { createVerification } from '../services/api';

export default function VerificationPackageGenerator() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('Google Play Console');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [apiError, setApiError] = useState(null);
  
  const { formattedAddress, countryName, validation } = useAddressStore();
  
  const hasValidAddress = formattedAddress && validation?.severity !== 'error';
  const isFormComplete = fullName.trim() && idNumber.trim() && hasValidAddress;
  
  const platforms = [
    'Google Play Console',
    'Amazon Developer',
    'PayPal Business',
    'Stripe',
    'Apple Developer',
    'Facebook/Meta Business',
    'Other Platform'
  ];
  
  const handleGeneratePackage = async () => {
    if (!isFormComplete) return;
    
    setIsGenerating(true);
    setGeneratedDocs([]);
    setApiError(null);
    
    try {
      const userData = {
        fullName,
        idNumber,
        phone,
        email,
        formattedAddress,
        country: countryName,
        platform,
        city: 'Nairobi',
      };
      
      // Call backend API to create verification record
      console.log('Creating verification via API...');
      const apiResponse = await createVerification(userData);
      
      if (apiResponse.success) {
        console.log('API Response:', apiResponse.data);
        
        // Use server-generated verification ID and QR code
        userData.verificationId = apiResponse.data.verificationId;
        userData.verificationUrl = apiResponse.data.verificationUrl;
        userData.qrCode = apiResponse.data.qrCode;
        
        // Generate Certificate using server data
        const { doc: certDoc } = await generateVerificationCertificate(userData);
        
        // Generate Affidavit
        const affidavitDoc = generateAffidavitPDF(userData);
        
        // Generate Cover Letter using server data
        const coverLetterDoc = await generateCoverLetter(userData);
        
        setGeneratedDocs([
          { 
            name: 'Verification Certificate', 
            doc: certDoc, 
            filename: `VeriBadge_Certificate_${fullName.replace(/\s+/g, '_')}.pdf`,
            verificationId: userData.verificationId,
            verificationUrl: userData.verificationUrl,
          },
          { 
            name: 'Affidavit of Residence', 
            doc: affidavitDoc, 
            filename: `Affidavit_${fullName.replace(/\s+/g, '_')}.pdf` 
          },
          { 
            name: 'Cover Letter', 
            doc: coverLetterDoc, 
            filename: `Cover_Letter_${platform.replace(/\s+/g, '_')}.pdf` 
          },
        ]);
      } else {
        throw new Error(apiResponse.error || 'Failed to create verification');
      }
      
    } catch (error) {
      console.error('Error generating package:', error);
      setApiError(error.message || 'Failed to connect to backend API. Make sure the server is running on port 3001.');
      
      // Fallback to local generation if API fails
      console.log('Falling back to local generation...');
      try {
        const localUserData = {
          fullName,
          idNumber,
          phone,
          email,
          formattedAddress,
          country: countryName,
          platform,
          city: 'Nairobi',
        };
        
        const { doc: certDoc, verificationId, verificationUrl } = await generateVerificationCertificate(localUserData);
        localUserData.verificationId = verificationId;
        
        const affidavitDoc = generateAffidavitPDF(localUserData);
        const coverLetterDoc = await generateCoverLetter(localUserData);
        
        setGeneratedDocs([
          { 
            name: 'Verification Certificate', 
            doc: certDoc, 
            filename: `VeriBadge_Certificate_${fullName.replace(/\s+/g, '_')}.pdf`,
            verificationId,
            verificationUrl,
          },
          { 
            name: 'Affidavit of Residence', 
            doc: affidavitDoc, 
            filename: `Affidavit_${fullName.replace(/\s+/g, '_')}.pdf` 
          },
          { 
            name: 'Cover Letter', 
            doc: coverLetterDoc, 
            filename: `Cover_Letter_${platform.replace(/\s+/g, '_')}.pdf` 
          },
        ]);
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadDoc = (docItem) => {
    downloadDocument(docItem.doc, docItem.filename);
  };
  
  const handleDownloadAll = () => {
    generatedDocs.forEach((docItem, index) => {
      setTimeout(() => {
        downloadDocument(docItem.doc, docItem.filename);
      }, index * 500);
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Package className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-base font-semibold text-white mb-1">Complete Verification Package</h4>
            <p className="text-sm text-gray-300">
              Generate all 3 documents needed for {platform} verification in one click.
            </p>
          </div>
        </div>
      </div>
      
      {/* API Connection Status */}
      <div className="flex items-center gap-2 text-xs">
        <Cloud className="w-4 h-4 text-blue-400" />
        <span className="text-gray-400">
          Connected to VeriBridge API {apiError && '(Fallback mode)'}
        </span>
      </div>
      
      {/* API Error Alert */}
      {apiError && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-yellow-300">API Connection Issue</p>
              <p className="text-xs text-yellow-200/70 mt-1">{apiError}</p>
              <p className="text-xs text-yellow-200/50 mt-1">
                Documents generated locally (verification will not be stored online).
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Address Preview */}
      <div>
        <label className="label flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Your Verified Address
        </label>
        
        {formattedAddress ? (
          <div className={`p-4 rounded-lg ${
            validation?.severity === 'error' ? 'bg-red-500/10 border border-red-500/30' :
            validation?.severity === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
            'bg-green-500/10 border border-green-500/30'
          }`}>
            <p className="text-white font-medium">{formattedAddress}</p>
            {validation?.severity === 'success' && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Address verified and ready for submission
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-gray-600 text-center">
            <p className="text-gray-400 text-sm">
              Complete Step 1 (Address Architect) first to generate your formatted address
            </p>
          </div>
        )}
      </div>
      
      {/* Platform Selection */}
      <div>
        <label className="label">Target Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="select-field"
        >
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      
      {/* User Information Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="label flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Full Legal Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As shown on your ID"
              className="input-field"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <label htmlFor="idNumber" className="label flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              National ID / Passport Number
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
            <label htmlFor="phone" className="label flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +254 7XX XXX XXX"
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="label flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="input-field"
            />
          </div>
        </div>
      </div>
      
      {/* Documents to Generate */}
      <div className="info-box">
        <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Your Package Will Include:
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2 text-blue-200/80">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Verification Certificate</strong> - Professional document with unique ID</span>
          </li>
          <li className="flex items-start gap-2 text-blue-200/80">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Affidavit of Residence</strong> - Sworn declaration of your address</span>
          </li>
          <li className="flex items-start gap-2 text-blue-200/80">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Cover Letter</strong> - Professional letter for {platform}</span>
          </li>
        </ul>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGeneratePackage}
        disabled={!isFormComplete || isGenerating}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating Package...</span>
          </>
        ) : (
          <>
            <Package className="w-5 h-5" />
            <span>Generate Verification Package</span>
          </>
        )}
      </button>
      
      {/* Generated Documents */}
      {generatedDocs.length > 0 && (
        <div className="space-y-4 fade-in">
          {/* Verification ID Card */}
          {generatedDocs[0]?.verificationId && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300 mb-1">Your Verification ID:</p>
                  <p className="text-2xl font-mono font-bold text-white">{generatedDocs[0].verificationId}</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-1">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="text-xs text-green-300">QR Code Inside</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-500/30">
                <p className="text-xs text-green-200/70">
                  <strong>Online Verification:</strong> {generatedDocs[0].verificationUrl}
                </p>
                <p className="text-xs text-green-200/50 mt-1">
                  Google/Amazon reviewers can scan the QR code or visit this URL to verify your documents
                </p>
              </div>
            </div>
          )}
          
          {/* Documents List */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Package Ready!
              </h4>
              <button
                onClick={handleDownloadAll}
                className="btn-primary text-sm py-1.5 px-3"
              >
                Download All
              </button>
            </div>
            
            <div className="space-y-2">
              {generatedDocs.map((docItem, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{docItem.name}</p>
                      <p className="text-xs text-gray-400">{docItem.filename}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc(docItem)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Important Notice */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-300 mb-1">Important Note</h4>
            <p className="text-sm text-yellow-200/70">
              The <strong>Affidavit of Residence</strong> must be signed before a Commissioner for Oaths 
              to be legally valid. Visit any cyber café, Huduma Center, or law office (~KES 200-500).
            </p>
          </div>
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
        <h4 className="text-sm font-semibold text-white mb-3">After Generating:</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
            <span>Download all 3 documents</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
            <span>Print the Affidavit and sign before a Commissioner</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
            <span>Scan/photograph the signed affidavit</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
            <span>Submit all documents to {platform}</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">5</span>
            <span>Wait 24-72 hours for verification</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
