import { useState } from 'react';
import { Building2, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { companyOrdersAPI } from '../../services/dashboardApi';

const CompanyFormation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    companyType: '',
    proposedNames: ['', '', ''],
    directorData: {
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    passportNumber: ''
  });
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNameChange = (index, value) => {
    const newNames = [...formData.proposedNames];
    newNames[index] = value;
    handleInputChange('proposedNames', newNames);
  };
  
  const handleDirectorChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      directorData: { ...prev.directorData, [field]: value }
    }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await companyOrdersAPI.createOrder(formData);
      if (result.success) {
        setOrderId(result.order.id);
        setCurrentStep(5); // Success screen
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyType !== '';
      case 2:
        return formData.proposedNames.every(name => name.trim().length >= 3);
      case 3:
        return formData.directorData.fullName && formData.directorData.email && formData.passportNumber;
      default:
        return true;
    }
  };
  
  if (currentStep === 5 && orderId) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Submitted Successfully!</h2>
        <p className="text-gray-400 mb-6">
          Your company formation request has been received and is being processed.
        </p>
        
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="text-sm text-gray-500 mb-1">Order ID</div>
          <div className="text-lg font-mono font-bold text-blue-400">{orderId}</div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-lg mb-6" style={{ background: 'var(--bg-secondary)' }}>
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-left text-sm text-gray-300">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Our team will review your application within 24 hours</li>
              <li>• We'll check name availability with Companies House / Secretary of State</li>
              <li>• You'll receive updates via email at {formData.directorData.email}</li>
              <li>• Processing typically takes 5-7 business days</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => {
            setCurrentStep(1);
            setOrderId(null);
            setFormData({
              companyType: '',
              proposedNames: ['', '', ''],
              directorData: { fullName: '', email: '', phone: '', address: '' },
              passportNumber: ''
            });
          }}
          className="btn-primary"
        >
          Submit Another Order
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Company Formation</h1>
            <p className="text-gray-400">UK Ltd or US LLC concierge service</p>
          </div>
        </div>
      </div>
      
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8">
        {['Type', 'Names', 'Director', 'Payment'].map((label, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}
                `}>
                  {isComplete ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                <span className="text-xs mt-1 text-gray-500">{label}</span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${stepNum < currentStep ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Form card */}
      <div className="card">
        {/* Step 1: Company Type */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Select Company Type</h2>
            <div className="space-y-4">
              {[
                { value: 'UK_LTD', label: 'UK Limited Company', price: 'KES 5,000', desc: 'Perfect for accessing Stripe, PayPal, Amazon UK' },
                { value: 'US_LLC', label: 'US LLC (Delaware)', price: 'KES 5,000', desc: 'Best for US payment processors and global markets' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('companyType', option.value)}
                  className={`
                    w-full p-6 rounded-lg border-2 text-left transition-all
                    ${formData.companyType === option.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white mb-1">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.desc}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-400">{option.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Proposed Names */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Proposed Company Names</h2>
            <p className="text-sm text-gray-400 mb-6">
              We'll check availability for all 3 names. Order indicates your preference.
            </p>
            <div className="space-y-4">
              {formData.proposedNames.map((name, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {idx === 0 ? '1st Choice (Preferred)' : idx === 1 ? '2nd Choice' : '3rd Choice'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="e.g., Tech Solutions Limited"
                    className="input w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 3: Director Details */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Director Information</h2>
            <p className="text-sm text-gray-400 mb-6">Required for company registration</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.directorData.fullName}
                  onChange={(e) => handleDirectorChange('fullName', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.directorData.email}
                  onChange={(e) => handleDirectorChange('email', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.directorData.phone}
                  onChange={(e) => handleDirectorChange('phone', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  className="input w-full"
                  placeholder="A12345678"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Payment */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Payment</h2>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-8 mb-6 text-center">
              <div className="text-sm text-gray-400 mb-2">Total Amount</div>
              <div className="text-5xl font-bold text-white mb-4">KES 5,000</div>
              <div className="text-sm text-gray-400">One-time payment</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-white mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Company Type:</span>
                  <span className="text-white">{formData.companyType === 'UK_LTD' ? 'UK Limited' : 'US LLC'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred Name:</span>
                  <span className="text-white">{formData.proposedNames[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Director:</span>
                  <span className="text-white">{formData.directorData.fullName}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? 'Processing...' : 'Pay KES 5,000 via M-PESA'}
            </button>
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
          )}
          {currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1"
            >
              Next <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFormation;
