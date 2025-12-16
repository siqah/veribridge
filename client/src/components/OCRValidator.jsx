import { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useAddressStore } from '../store/addressStore';

// P.O. Box patterns to detect - moved outside component
const PO_BOX_PATTERNS = [
  /p\.?\s*o\.?\s*box/gi,
  /po\s*box/gi,
  /pobox/gi,
  /private\s*bag/gi,
  /p\s*o\s*box/gi,
];

// Colloquialism patterns - moved outside component
const COLLOQUIALISM_PATTERNS = [
  /\bnear\b/gi,
  /\bopposite\b/gi,
  /\bbehind\b/gi,
  /\bnext\s+to\b/gi,
];

export default function OCRValidator() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { formattedAddress } = useAddressStore();
  
  // Validate extracted text
  const validateText = useCallback((text) => {
    const lowerText = text.toLowerCase();
    
    // Check for P.O. Box
    for (const pattern of PO_BOX_PATTERNS) {
      if (pattern.test(text)) {
        return {
          status: 'error',
          severity: 'error',
          title: 'REJECTED - P.O. Box Detected',
          message: 'Your bank statement contains a P.O. Box address. Global platforms will reject this. Return to your bank and update using the instructions.',
        };
      }
    }
    
    // Check for colloquialisms
    for (const pattern of COLLOQUIALISM_PATTERNS) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        return {
          status: 'warning',
          severity: 'warning',
          title: 'WARNING - Informal Address',
          message: `Statement contains "${match[0]}" which may cause compliance issues.`,
        };
      }
    }
    
    // Check if formatted address appears in the text
    if (formattedAddress && lowerText.includes(formattedAddress.toLowerCase())) {
      return {
        status: 'success',
        severity: 'success',
        title: 'SUCCESS - Address Verified',
        message: 'Your bank statement contains the correct formatted address!',
      };
    }
    
    if (formattedAddress) {
      return {
        status: 'warning',
        severity: 'warning',
        title: 'WARNING - Address Mismatch',
        message: 'The address doesn\'t match exactly. Double-check with your bank.',
      };
    }
    
    return {
      status: 'info',
      severity: 'info',
      title: 'Scan Complete',
      message: 'Complete Step 1 to validate against your formatted address.',
    };
  }, [formattedAddress]);
  
  // Process image with Tesseract OCR
  const processImage = useCallback(async (file) => {
    setIsProcessing(true);
    setValidationResult(null);
    setOcrText('');
    
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      setOcrText(text);
      const result = validateText(text);
      setValidationResult(result);
    } catch (error) {
      console.error('OCR Error:', error);
      setValidationResult({
        status: 'error',
        severity: 'error',
        title: 'OCR Failed',
        message: 'Failed to scan image. Ensure the image is clear and try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [validateText]);
  
  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setValidationResult({
        status: 'error',
        severity: 'error',
        title: 'Invalid File',
        message: 'Please upload an image file (JPG, PNG, etc.)',
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setValidationResult({
        status: 'error',
        severity: 'error',
        title: 'File Too Large',
        message: 'Max file size is 10MB. Please compress the image.',
      });
      return;
    }
    
    setUploadedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    
    processImage(file);
  }, [processImage]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }, [handleFileSelect]);
  
  const handleFileInput = useCallback((e) => {
    handleFileSelect(e.target.files[0]);
  }, [handleFileSelect]);
  
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setOcrText('');
    setValidationResult(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="info-box">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">How it works</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-200/70">
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Upload your bank statement photo</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>OCR scans the text</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>We check for P.O. Box & colloquialisms</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Get instant Pass/Fail result</span>
          </div>
        </div>
      </div>
      
      {/* Upload Zone */}
      {!uploadedImage && !isProcessing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-500'}`} />
          <p className="text-lg font-semibold text-white mb-2">
            Drop your bank statement here
          </p>
          <p className="text-sm text-gray-400 mb-4">
            JPG, PNG • Max 10MB
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
            Choose File
          </label>
        </div>
      )}
      
      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg font-semibold text-white mb-2">Scanning document...</p>
          <p className="text-sm text-gray-400">This may take 10-30 seconds</p>
        </div>
      )}
      
      {/* Image Preview & Results */}
      {uploadedImage && !isProcessing && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Uploaded Document</h3>
              <button onClick={handleReset} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                Upload Different Image
              </button>
            </div>
            <img
              src={imagePreview}
              alt="Bank statement"
              className="w-full max-w-md mx-auto rounded-lg border border-gray-700"
            />
          </div>
          
          {/* Validation Result */}
          {validationResult && (
            <div className={`p-5 rounded-lg border ${
              validationResult.severity === 'error' ? 'bg-red-500/10 border-red-500/50' :
              validationResult.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50' :
              validationResult.severity === 'success' ? 'bg-green-500/10 border-green-500/50' :
              'bg-blue-500/10 border-blue-500/50'
            }`}>
              <div className="flex items-start gap-3">
                {validationResult.severity === 'error' && <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                {validationResult.severity === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />}
                {validationResult.severity === 'success' && <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />}
                {validationResult.severity === 'info' && <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />}
                
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    validationResult.severity === 'error' ? 'text-red-400' :
                    validationResult.severity === 'warning' ? 'text-yellow-400' :
                    validationResult.severity === 'success' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    {validationResult.title}
                  </h3>
                  <p className="text-sm text-gray-300">{validationResult.message}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* OCR Text (Collapsible) */}
          {ocrText && (
            <details className="rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <summary className="px-4 py-3 cursor-pointer hover:bg-white/5 font-medium text-sm text-gray-300">
                View Extracted Text (OCR)
              </summary>
              <div className="px-4 py-3 border-t border-gray-700">
                <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {ocrText}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
