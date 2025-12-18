import { useEffect, useState } from 'react';
import { MapPin, Copy, Check, Globe, Home, AlertCircle, CheckCircle2, Lightbulb, Building2, CreditCard, Mail } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';

export default function AddressBuilder() {
  const [copied, setCopied] = useState({ option1: false, option2: false });
  
  const {
    country,
    countryName,
    building,
    street,
    area,
    city,
    postalCode,
    setCountry,
    setBuilding,
    setStreet,
    setArea,
    setCity,
    setPostalCode,
  } = useAddressStore();
  
  // Generate two formatted address options in proper Western format
  const generateAddressOptions = () => {
    if (!street || !city) return { option1: '', option2: '' };
    
    // WESTERN FORMAT STRUCTURE:
    // Line 1: Physical Location (Street Number + Street Name)
    // Line 2: Building Context (Building Name, Apartment, Floor)
    // Line 3: City, Postal Code
    // Line 4: Country
    
    // Option 1: Full format (2-line version for forms)
    const line1 = street; // e.g., "Plot 45, Sheikh Mahmoud Road"
    const line2 = building; // e.g., "Makina Building, 2nd Floor"
    const cityLine = postalCode ? `${city}, ${postalCode}` : city;
    
    const option1Parts = [line1, line2, cityLine, countryName].filter(Boolean);
    const option1 = option1Parts.join('\n');
    
    // Option 2: Single-line compact version
    const option2Parts = [];
    if (building) option2Parts.push(building);
    option2Parts.push(street);
    if (postalCode) {
      option2Parts.push(`${city} ${postalCode}`);
    } else {
      option2Parts.push(city);
    }
    option2Parts.push(countryName);
    
    const option2 = option2Parts.join(', ');
    
    return { 
      option1, 
      option2,
      line1, // For display purposes
      line2,
      cityLine
    };
  };
  
  const { option1, option2, line1, line2, cityLine } = generateAddressOptions();
  const hasAddress = option1 || option2;
  
  const handleCopy = (text, optionKey) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [optionKey]: true });
      setTimeout(() => setCopied({ ...copied, [optionKey]: false }), 2000);
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-3">Address Architect</h1>
        <p className="text-gray-400">
          Enter your address details below. We'll format it into 2 western-style options you can use for Google, Stripe, banks, and other international platforms.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Works in 35+ Countries • 100% Free</span>
        </div>
      </div>

      {/* Simple Input Form */}
      <div className="card max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Your Address Details</h2>
        </div>

        <div className="space-y-4">
          {/* Street - LINE 1 */}
          <div>
            <label className="label">
              Address Line 1 - Street / Road
              <span className="ml-2 text-xs text-blue-400">(Required)</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g., 123 Main Road, Plot 45, Rua dos Santos"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              <strong>Physical location:</strong> Include street number/plot + street name
            </p>
          </div>

          {/* Building - LINE 2 */}
          <div>
            <label className="label">Address Line 2 - Building / Apartment (Optional)</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g., Green Apartments Flat 5B, Victoria Plaza 3rd Floor"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              <strong>Building context:</strong> Building name, floor, apartment number, or estate name
            </p>
          </div>

          {/* City */}
          <div>
            <label className="label">
              City / Town
              <span className="ml-2 text-xs text-blue-400">(Required)</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Lagos, Manila, Mumbai, Nairobi"
              className="input-field"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="label">Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g., 100001 (use your local postal code)"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              <strong>Tip:</strong> Use your area-specific postal code if available
            </p>
          </div>
        </div>
      </div>

      {/* Formatted Address Options */}
      {hasAddress && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-300 mb-1">Address Formatted Successfully!</h3>
                <p className="text-sm text-green-200/70">
                  Choose one of the options below to use with Google Play Console, Stripe, your bank, or any international platform.
                </p>
              </div>
            </div>
          </div>

          {/* Option 1 - Multi-line Format */}
          {option1 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="text-base font-semibold text-white">Multi-Line Format</h3>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">
                  For Online Forms
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-gray-700 mb-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Address Line 1:</p>
                  <p className="text-white font-mono text-sm">{line1}</p>
                </div>
                {line2 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address Line 2:</p>
                    <p className="text-white font-mono text-sm">{line2}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">City, Postal Code:</p>
                  <p className="text-white font-mono text-sm">{cityLine}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Country:</p>
                  <p className="text-white font-mono text-sm">{countryName}</p>
                </div>
              </div>

              <button
                onClick={() => handleCopy(option1, 'option1')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {copied.option1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Multi-Line Format
                  </>
                )}
              </button>
            </div>
          )}

          {/* Option 2 - Single-line Format */}
          {option2 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="text-base font-semibold text-white">Single-Line Format</h3>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-medium">
                  Compact Version
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-gray-700 mb-3">
                <p className="text-white font-mono text-sm leading-relaxed">{option2}</p>
              </div>

              <button
                onClick={() => handleCopy(option2, 'option2')}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                {copied.option2 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Single-Line Format
                  </>
                )}
              </button>
            </div>
          )}

          {/* How to Use Instructions */}
          <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-white mb-1">How to Use Your Formatted Address</h3>
                <p className="text-sm text-gray-300">
                  Copy one of the addresses above and use it consistently across all platforms:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Update Your Bank Statement</p>
                  <p className="text-xs text-gray-400">
                    Call your bank or use online banking to update your address. This will appear on your bank statement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Use for Google Play Console</p>
                  <p className="text-xs text-gray-400">
                    Enter this exact address when registering or verifying your Google Play Console account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Use for Stripe, PayPal & Payment Platforms</p>
                  <p className="text-xs text-gray-400">
                    This formatted address meets international KYC requirements for payment processors worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Keep It Consistent</p>
                  <p className="text-xs text-gray-400">
                    Use the SAME address everywhere - your bank, ID documents, and all online platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-300 mb-1">Important</h4>
                <p className="text-sm text-yellow-200/70">
                  <strong>Update your bank statement first!</strong> Platforms like Google and Stripe will ask you to upload a bank statement showing this exact address. Make sure your bank has this address on file before submitting.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Update Bank Address</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    Use internet banking or visit your branch to update your address to match this format.
                  </p>
                  <p className="text-xs text-blue-400 font-medium">
                    Works with any bank worldwide
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Verify Instantly</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    Once your bank statement shows this address, you're ready to submit!
                  </p>
                  <p className="text-xs text-purple-400 font-medium">
                    Google • Stripe • PayPal • Amazon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Services Upsell */}
          <div className="card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white mb-2">🚀 Ready to Go Global?</h3>
              <p className="text-sm text-gray-300">
                Your address is just the first step. Unlock global payments with our premium services.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = '/company-formation'}
                className="p-4 rounded-lg bg-white/5 border border-purple-500/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      UK Company Formation
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      Unlock Stripe & PayPal payments worldwide
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">KES 5,000</span>
                      <span className="text-xs text-gray-500">5-10 days</span>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/mailbox'}
                className="p-4 rounded-lg bg-white/5 border border-blue-500/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                      Digital Mailbox
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      Real London address for your business
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">KES 500/mo</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">New</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAddress && (
        <div className="card max-w-3xl mx-auto text-center py-12">
          <Home className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Start Building Your Address</h3>
          <p className="text-sm text-gray-500">
            Fill in the form above to generate your formatted western-style address
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">100% Free Tool</span>
          </div>
        </div>
      )}
    </div>
  );
}
