import { useState } from 'react';
import { Building2, ChevronRight, CheckCircle, AlertCircle, Search, Loader, Shield, X, Check } from 'lucide-react';
import axios from 'axios';
import PaystackCheckout from '../../components/PaystackCheckout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CompanyFormation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [nameCheckResult, setNameCheckResult] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    jurisdiction: '', // 'UK' or 'US'
    companyType: '', // 'LTD' or 'LLC'
    companyName: '',
    altName1: '',
    altName2: '',
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    directorAddress: '',
    industryCode: ''
  });

  // Mock KYC status - in production, fetch from user profile
  const [kycStatus] = useState({
    isVerified: true, // Set to false to show KYC gate
    fullName: 'John Doe',
    email: 'john@example.com'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset name check when name changes
    if (field === 'companyName') {
      setNameCheckResult(null);
    }
  };

  // Check UK company name availability
  const checkNameAvailability = async () => {
    if (!formData.companyName || formData.companyName.trim().length < 3) {
      return;
    }

    setNameCheckLoading(true);
    setNameCheckResult(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/formation/uk-check-name`,
        { params: { query: formData.companyName } }
      );

      setNameCheckResult(response.data);
    } catch (error) {
      console.error('Name check error:', error);
      setNameCheckResult({
        available: false,
        error: 'Unable to check name availability. Please try again.'
      });
    } finally {
      setNameCheckLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/formation`, formData);
      
      if (response.data.success) {
        setOrderId(response.data.order.id);
        setCurrentStep(5); // Success screen
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      
      // Check for specific error codes
      if (error.response?.data?.code === 'COMPLIANCE_CHECK_FAILED') {
        alert('Unable to process your request. Please contact support.');
      } else if (error.response?.data?.redirectTo === '/verify-identity') {
        alert('KYC verification required. Please complete identity verification first.');
      } else {
        alert(error.response?.data?.error || 'Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.jurisdiction && formData.companyType;
      case 2:
        if (formData.jurisdiction === 'UK') {
          return formData.companyName && nameCheckResult?.available;
        }
        return formData.companyName && formData.altName1 && formData.altName2;
      case 3:
        return formData.directorName && formData.directorEmail && formData.directorAddress;
      case 4:
        return agreedToTerms;
      default:
        return true;
    }
  };

  // KYC Gate - Block access if not verified
  if (!kycStatus.isVerified) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Identity Verification Required
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          To register a company, you must first complete our identity verification process.
          This is required by UK and US regulations for company formation.
        </p>
        
        <div className="p-4 rounded-lg mb-6" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
            <div className="text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p className="font-semibold mb-2">Why is this needed?</p>
              <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>• Prevents fraudulent company registrations</li>
                <li>• Required by AML (Anti-Money Laundering) regulations</li>
                <li>• Ensures you are the authorized director</li>
                <li>• Takes only 5 minutes to complete</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/verify-identity'}
          className="btn-primary"
        >
          Complete Identity Verification
        </button>
      </div>
    );
  }

  // Success screen
  if (currentStep === 5 && orderId) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Formation Order Submitted!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Your company formation request has been received and is being processed.
        </p>
        
        <div className="p-6 rounded-lg mb-6" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Order ID</div>
          <div className="text-lg font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>
            {orderId}
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-lg mb-6" style={{ background: 'var(--bg-secondary)' }}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
          <div className="text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="font-semibold mb-2">What happens next?</p>
            <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>• Our team will review your application within 24 hours</li>
              <li>• We'll verify name availability with Companies House</li>
              <li>• You'll receive updates via email at {formData.directorEmail}</li>
              <li>• Processing typically takes 5-7 business days</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => {
            setCurrentStep(1);
            setOrderId(null);
            setFormData({
              jurisdiction: '',
              companyType: '',
              companyName: '',
              altName1: '',
              altName2: '',
              directorName: '',
              directorEmail: '',
              directorPhone: '',
              directorAddress: '',
              industryCode: ''
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
          <Building2 className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Company Formation
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Register a UK Ltd or US LLC in 5-7 business days
            </p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8">
        {['Jurisdiction', 'Company Name', 'Director Info', 'Review & Pay'].map((label, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}
                `}>
                  {isComplete ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                <span className="text-xs mt-1 text-gray-500 hidden sm:block">{label}</span>
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
        {/* Step 1: Jurisdiction Selection */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Select Jurisdiction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  jurisdiction: 'UK',
                  type: 'LTD',
                  label: 'United Kingdom 🇬🇧',
                  price: 'KES 20,000',
                  features: ['Stripe, PayPal ready', 'EU market access', 'Real-time name check', 'Professional image']
                },
                {
                  jurisdiction: 'US',
                  type: 'LLC',
                  label: 'United States 🇺🇸',
                  price: 'KES 25,000',
                  features: ['Global credibility', 'US payment processors', 'Tax advantages', 'Privacy protection']
                }
              ].map(option => (
                <button
                  key={option.jurisdiction}
                  onClick={() => {
                    handleInputChange('jurisdiction', option.jurisdiction);
                    handleInputChange('companyType', option.type);
                  }}
                  className={`
                    p-6 rounded-lg border-2 text-left transition-all
                    ${formData.jurisdiction === option.jurisdiction
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {option.label}
                  </div>
                  <div className="text-2xl font-bold mb-3" style={{ color: 'var(--accent-blue)' }}>
                    {option.price}
                  </div>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Company Name */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {formData.jurisdiction === 'UK' ? 'Check Company Name' : 'Propose Company Names'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {formData.jurisdiction === 'UK'
                ? 'We\'ll check real-time availability with Companies House'
                : 'Provide 3 name options in order of preference'}
            </p>

            {/* UK: Real-time name check */}
            {formData.jurisdiction === 'UK' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., Innovation Hub Limited"
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && checkNameAvailability()}
                  />
                  <button
                    onClick={checkNameAvailability}
                    disabled={nameCheckLoading || !formData.companyName}
                    className="btn-primary px-6"
                  >
                    {nameCheckLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Check
                      </>
                    )}
                  </button>
                </div>

                {nameCheckResult && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    nameCheckResult.available ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {nameCheckResult.available ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-400">Name is available!</p>
                          <p className="text-sm text-green-300">
                            "{formData.companyName}" can be registered.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-400">Name is already taken</p>
                          <p className="text-sm text-red-300">
                            {nameCheckResult.error || 'Please try a different name.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* US: 3 name options */}
            {formData.jurisdiction === 'US' && (
              <div className="space-y-4">
                {['companyName', 'altName1', 'altName2'].map((field, idx) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {idx === 0 ? '1st Choice (Preferred)' : idx === 1 ? '2nd Choice' : '3rd Choice'}
                    </label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder="e.g., Tech Solutions LLC"
                      className="input-field w-full"
                    />
                  </div>
                ))}
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    💡 Tip: We'll check availability with the Secretary of State and use your first
                    available name.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Director Details */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Director Information
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Required for company registration (kept confidential)
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name (as on passport)
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => handleInputChange('directorName', e.target.value)}
                  placeholder="John Doe"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.directorEmail}
                  onChange={(e) => handleInputChange('directorEmail', e.target.value)}
                  placeholder="john@example.com"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.directorPhone}
                  onChange={(e) => handleInputChange('directorPhone', e.target.value)}
                  placeholder="+254 700 123 456"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Residential Address
                </label>
                <textarea
                  value={formData.directorAddress}
                  onChange={(e) => handleInputChange('directorAddress', e.target.value)}
                  placeholder="123 Valley Road, Westlands, Nairobi, Kenya"
                  className="input-field w-full"
                  rows="3"
                />
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5" style={{ color: 'var(--success)' }} />
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p className="font-semibold mb-1">Your Kenyan address is private</p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      We provide a registered office address in {formData.jurisdiction === 'UK' ? 'London' : 'Delaware'} for
                      public records. Your home address is kept confidential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Payment */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Review & Payment
            </h2>

            <div className="p-6 rounded-lg mb-6" style={{ background: 'var(--bg-secondary)' }}>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Company Type:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {formData.jurisdiction} {formData.companyType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Company Name:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {formData.companyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Director:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    {formData.directorName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Processing Time:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                    5-7 business days
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg text-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Total Amount</div>
              <div className="text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                KES {formData.jurisdiction === 'UK' ? '20,000' : '25,000'}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>One-time payment</div>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  I authorize VeriBridge to submit company formation filings on my behalf and agree that
                  VeriBridge acts as a filing assistant (not a law firm). I understand processing takes
                  5-7 business days.
                </span>
              </label>
            </div>

            {!orderId ? (
              <PaystackCheckout
                amount={formData.jurisdiction === 'UK' ? 20000 : 25000}
                email={formData.directorEmail || kycStatus.email}
                metadata={{
                  orderType: 'COMPANY_FORMATION',
                  companyName: formData.companyName,
                  jurisdiction: formData.jurisdiction,
                  directorName: formData.directorName
                }}
                onSuccess={async (reference) => {
                  setLoading(true);
                  try {
                    // First, create the order
                    const orderResponse = await handleSubmit();
                    
                    if (orderResponse?.order?.id) {
                      // Then verify payment
                      await axios.post(`${API_URL}/api/payments/paystack/verify`, {
                        reference: reference.reference,
                        orderId: orderResponse.order.id,
                        orderType: 'COMPANY_FORMATION'
                      });
                      
                      setOrderId(orderResponse.order.id);
                      alert('✅ Payment successful! Order ID: ' + orderResponse.order.id);
                    }
                  } catch (error) {
                    console.error('Payment verification error:', error);
                    alert('Payment verification failed. Please contact support.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onClose={() => console.log('Payment cancelled')}
                buttonText={`Pay KES ${formData.jurisdiction === 'UK' ? '20,000' : '25,000'}`}
              />
            ) : (
              <div className="text-center p-6 rounded-lg" style={{ background: 'var(--bg-success)' }}>
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--success)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Order ID: {orderId}</p>
              </div>
            )}

            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              🔒 Secure payment powered by Paystack
            </p>
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
