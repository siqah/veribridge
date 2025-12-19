import { useState } from 'react';
import { Building2, ChevronRight, CheckCircle, AlertCircle, Search, Loader, Shield, X, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PaystackCheckout from '../../components/PaystackCheckout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CompanyFormation = () => {
  const { user, getToken } = useAuth(); // Get authenticated user and token
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [nameCheckResult, setNameCheckResult] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    jurisdiction: '', // 'UK' or 'US'
    companyType: 'LTD', // 'LTD' or 'LLC'
    companyName: '',
    altName1: '',
    altName2: '',
    directorName: '',
    directorDob: '', // Date of Birth (required by IN01)
    nationality: 'Kenyan', // Default to Kenyan
    directorEmail: user?.email || '', // Pre-fill with user email
    directorPhone: '',
    directorAddress: '',
    occupation: '', // e.g., "Software Developer"
    sicCode: '62020', // Default to IT Consultancy
    customSicCode: '',
    // Security Questions (UK Government requirement for digital signature)
    townOfBirth: '', // First 3 letters
    mothersMaidenName: '', // First 3 letters
    fathersFirstName: '', // First 3 letters
    industryCode: ''
  });

  // Mock KYC status - in production, fetch from user profile
  const [kycStatus] = useState({
    isVerified: true, // Set to false to show KYC gate
    fullName: 'John Doe',
    email: 'john@example.com'
  });

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Authentication Required
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          You must be logged in to form a company.
        </p>
        <a href="/login" className="btn-primary inline-block">
          Log In
        </a>
        <span className="mx-4" style={{ color: 'var(--text-muted)' }}>or</span>
        <a href="/signup" className="btn-secondary inline-block">
          Sign Up
        </a>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check UK company name availability
  const checkNameAvailability = async () => {
    if (!formData.companyName) {
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
        available: null, // null means API error (not false which means taken)
        error: 'Unable to check name availability. Please try again.'
      });
    } finally {
      setNameCheckLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get authentication token
      const token = await getToken();
      
      const response = await axios.post(`${API_URL}/api/formation`, formData, {
        headers: {
          'Authorization': `Bearer ${token}` // Send auth token
        }
      });
      
      if (response.data.success) {
        setOrderId(response.data.order.id);
        // Show success modal/message
        alert(`🎉 Success! Your UK company formation order has been submitted!\n\nOrder ID: ${response.data.order.id}\n\nWhat happens next:\n1. You'll receive a confirmation email\n2. We'll process your order with Rapid Formations\n3. You'll get your company certificate in 2-3 business days\n4. Total time: 24-48 hours\n\nThank you for choosing VeriBridge!`);
        
        // Optionally redirect or reset form
        // window.location.href = '/dashboard';
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
          return formData.companyName && formData.sicCode;
        }
        return formData.companyName && formData.altName1 && formData.altName2;
      case 3:
        if (formData.jurisdiction === 'UK') {
          return formData.directorName && formData.directorDob && formData.nationality && formData.directorEmail && formData.directorAddress && formData.occupation;
        }
        return formData.directorName && formData.directorEmail && formData.directorAddress && formData.occupation;
      case 4:
        // Security questions - UK only
        if (formData.jurisdiction === 'UK') {
          return formData.townOfBirth && formData.mothersMaidenName && formData.fathersFirstName;
        }
        return true; // US doesn't need security questions
      case 5:
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
              <li>• Your order will be submitted to Rapid Formations (licensed UK agent) within 24 hours</li>
              <li>• They'll verify name availability with Companies House</li>
              <li>• You'll receive a London office address (71-75 Shelton Street, Covent Garden)</li>
              <li>• Your Kenyan home address will stay 100% private</li>
              <li>• Registration typically takes 24-48 hours</li>
              <li>• Digital certificate PDF will be emailed to {formData.directorEmail}</li>
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
        
        {/* Partner Disclaimer */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5" style={{ color: 'var(--accent-blue)' }} />
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p className="font-semibold mb-1">Powered by Rapid Formations</p>
              <p style={{ color: 'var(--text-muted)' }}>
                Company registration handled by <strong>Rapid Formations</strong>, the UK's leading formation agent.
                Privacy Package includes London registered office (71-75 Shelton Street) + director service address.
                Your Kenyan home address stays 100% private. VeriBridge facilitates your order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8">
        {['Jurisdiction', 'Company Name', 'Director Info', formData.jurisdiction === 'UK' ? 'Security Questions' : null, 'Review & Pay'].filter(Boolean).map((label, idx) => {
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
                  price: 'KES 25,000',
                  badge: '🔥 Privacy Package',
                  features: ['✅ London office address', '✅ Your address stays private', '✅ 24-48 hour processing', '✅ Wise banking fast-track']
                },
                {
                  jurisdiction: 'US',
                  type: 'LLC',
                  label: 'United States 🇺🇸',
                  price: 'KES 20,000',
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
                    p-6 rounded-lg border-2 text-left transition-all relative
                    ${formData.jurisdiction === option.jurisdiction
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  {option.badge && (
                    <div className="absolute top-3 right-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-bold">
                      {option.badge}
                    </div>
                  )}
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
                    nameCheckResult.available === true ? 'bg-green-500/10' : 
                    nameCheckResult.available === false ? 'bg-red-500/10' : 
                    'bg-yellow-500/10'
                  }`}>
                    {nameCheckResult.available === true ? (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-400">Name is available!</p>
                          <p className="text-sm text-green-300">
                            "{formData.companyName}" can be registered.
                          </p>
                        </div>
                      </div>
                    ) : nameCheckResult.available === false ? (
                      <div className="flex items-start gap-3">
                        <X className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-400">Name is already taken</p>
                          <p className="text-sm text-red-300">
                            Please try a different name.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-400">Unable to check availability</p>
                          <p className="text-sm text-yellow-300">
                            {nameCheckResult.error || 'Please try again in a moment.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SIC Code - Industry Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Business Activity (SIC Code)
                  </label>
                  <select
                    value={formData.sicCode}
                    onChange={(e) => handleInputChange('sicCode', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="62020">62020 - IT Consultancy</option>
                    <option value="62012">62012 - Business Software Development</option>
                    <option value="74100">74100 - Specialized Design Activities</option>
                    <option value="47910">47910 - Retail via Internet</option>
                    <option value="82990">82990 - Business Support Services</option>
                    <option value="other">Other (Enter Custom)</option>
                  </select>
                  
                  {formData.sicCode === 'other' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={formData.customSicCode || ''}
                        onChange={(e) => handleInputChange('customSicCode', e.target.value)}
                        placeholder="Enter your business activity (e.g., 70221 - Financial Consulting)"
                        className="input-field w-full"
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Find SIC codes at: <a href="https://resources.companieshouse.gov.uk/sic/" target="_blank" className="text-blue-400 hover:underline">Companies House SIC codes</a>
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Select the industry that best matches your business
                  </p>
                </div>
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

              {/* Date of Birth - Required by IN01 */}
              {formData.jurisdiction === 'UK' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.directorDob}
                      onChange={(e) => handleInputChange('directorDob', e.target.value)}
                      className="input-field w-full"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Must be 16+ years old
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Nationality
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="Kenyan">Kenyan</option>
                      <option value="Nigerian">Nigerian</option>
                      <option value="Ghanaian">Ghanaian</option>
                      <option value="South African">South African</option>
                      <option value="Ugandan">Ugandan</option>
                      <option value="Tanzanian">Tanzanian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g., Software Developer, Entrepreneur, Consultant"
                  className="input-field w-full"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Your current job title or profession
                </p>
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

        {/* Step 4: Security Questions (UK Government Requirement) - UK ONLY */}
        {currentStep === 4 && formData.jurisdiction === 'UK' && (
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Security Questions
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Required by UK Government for digital signature (first 3 letters only)
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Town of Birth (First 3 Letters)
                </label>
                <input
                  type="text"
                  value={formData.townOfBirth}
                  onChange={(e) => handleInputChange('townOfBirth', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="e.g., NAI (for Nairobi)"
                  className="input-field w-full uppercase"
                  maxLength={3}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Example: If born in Nairobi, enter "NAI"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Mother's Maiden Name (First 3 Letters)
                </label>
                <input
                  type="text"
                  value={formData.mothersMaidenName}
                  onChange={(e) => handleInputChange('mothersMaidenName', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="e.g., KAM"
                  className="input-field w-full uppercase"
                  maxLength={3}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Her surname before marriage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Father's First Name (First 3 Letters)
                </label>
                <input
                  type="text"
                  value={formData.fathersFirstName}
                  onChange={(e) => handleInputChange('fathersFirstName', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="e.g., JOH (for John)"
                  className="input-field w-full uppercase"
                  maxLength={3}
                />
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5" style={{ color: 'var(--success)' }} />
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p className="font-semibold mb-1">Why is this needed?</p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      UK Companies House uses these 3 questions as your digital signature instead of a physical signature. 
                      This is a legal requirement to register your company.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons for Step 4 */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary px-6 py-3"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="btn-primary px-6 py-3 flex items-center"
              >
                Next Step <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 (US) or 5 (UK): Review & Payment */}
        {((currentStep === 4 && formData.jurisdiction === 'US') || (currentStep === 5 && formData.jurisdiction === 'UK')) && (
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
                KES {formData.jurisdiction === 'UK' ? '25,000' : '25,000'}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>One-time • Includes £50 UK Govt fee + Privacy</div>
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
                  I authorize VeriBridge to submit my order to <strong>Rapid Formations</strong> (licensed formation agent) on my behalf. 
                  I understand the Privacy Package includes a London office address and my home address stays private. Processing takes 24-48 hours.
                </span>
              </label>
            </div>

            {!orderId ? (
              <PaystackCheckout
                amount={25000}
                email={formData.directorEmail}
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
                buttonText="Pay KES 25,000 - Privacy Package"
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
