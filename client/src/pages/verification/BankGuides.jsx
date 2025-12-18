import { useState } from 'react';
import { Smartphone, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, Copy, Check } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';

// Bank-specific update guides
const BANK_GUIDES = {
  equity: {
    name: 'Equity Bank',
    color: '#8B0000',
    methods: [
      {
        title: 'Equitel App (Mobile)',
        steps: [
          'Open the Equitel SIM Toolkit or Equity Mobile App',
          'Go to "My Account" → "Profile Settings"',
          'Select "Update Address"',
          'Enter your new physical address exactly as formatted',
          'Confirm with your PIN',
          'Go to "Statements" → "Mini Statement" or "Full Statement"',
          'Download/Screenshot the statement showing new address',
        ],
      },
      {
        title: 'USSD (*247#)',
        steps: [
          'Dial *247# on your Equitel line',
          'Select "My Account"',
          'Select "Update Details"',
          'Follow prompts to update address',
          'Request e-statement via "Account Services"',
        ],
      },
      {
        title: 'Equity Online Banking',
        steps: [
          'Visit equityonline.co.ke',
          'Login with your credentials',
          'Go to "Settings" → "Profile"',
          'Update your physical address',
          'Navigate to "Accounts" → "Statements"',
          'Download a recent statement',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.equity.eos',
    hotline: '0763 063 000',
  },
  kcb: {
    name: 'KCB Bank',
    color: '#008751',
    methods: [
      {
        title: 'KCB Mobile App',
        steps: [
          'Open KCB Mobile Banking App',
          'Tap "More" → "My Profile"',
          'Select "Update Personal Details"',
          'Enter your formatted physical address',
          'Submit and wait for SMS confirmation',
          'Go to "Accounts" → "View Statement"',
          'Download the statement as PDF',
        ],
      },
      {
        title: 'KCB Internet Banking',
        steps: [
          'Visit ibank.kcbgroup.com',
          'Login with your credentials',
          'Go to "Self Service" → "Profile Update"',
          'Update your address details',
          'Download statement from "Accounts" section',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.kcb.mbanking',
    hotline: '0711 087 000',
  },
  coop: {
    name: 'Co-operative Bank',
    color: '#003366',
    methods: [
      {
        title: 'MCo-op Cash App',
        steps: [
          'Open MCo-op Cash App',
          'Go to "My Account" settings',
          'Select "Update Profile"',
          'Enter your new physical address',
          'Confirm changes',
          'Request statement via "Bank Services" → "Statement"',
        ],
      },
      {
        title: 'Co-op Online Banking',
        steps: [
          'Visit colobank.co-opbank.co.ke',
          'Login with your credentials',
          'Navigate to "Profile" → "Personal Details"',
          'Update address information',
          'Download statement from "Accounts"',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.mfs.mcoopcash.ke',
    hotline: '0703 027 000',
  },
  ncba: {
    name: 'NCBA Bank',
    color: '#00A651',
    methods: [
      {
        title: 'NCBA Mobile App',
        steps: [
          'Open NCBA Mobile Banking App',
          'Go to "More" → "Settings"',
          'Select "Personal Information"',
          'Update your physical address',
          'Save changes',
          'Navigate to "Accounts" → "Statements"',
          'Generate and download statement',
        ],
      },
      {
        title: 'NCBA Internet Banking',
        steps: [
          'Visit online.ncbagroup.com',
          'Login to your account',
          'Go to "Profile Settings"',
          'Update address details',
          'Download statement from account section',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.ncba.ke.mobile',
    hotline: '0711 056 444',
  },
  stanbic: {
    name: 'Stanbic Bank',
    color: '#0033A0',
    methods: [
      {
        title: 'Stanbic Mobile App',
        steps: [
          'Open Stanbic Mobile Banking',
          'Go to "Profile" settings',
          'Update your address details',
          'Request e-statement from "Accounts"',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.stanbic.mbanking.ke',
    hotline: '0722 228 844',
  },
  absa: {
    name: 'Absa Bank Kenya',
    color: '#AF0C2F',
    methods: [
      {
        title: 'Absa Mobile App',
        steps: [
          'Open Absa Banking App',
          'Tap "More" → "Profile & Settings"',
          'Select "Update Contact Details"',
          'Enter your physical address',
          'Confirm with OTP',
          'Go to "Accounts" → "Statements"',
          'Download your statement',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.barclays.kenya',
    hotline: '0722 111 333',
  },
  dtb: {
    name: 'Diamond Trust Bank',
    color: '#0066B3',
    methods: [
      {
        title: 'DTB Mobile App',
        steps: [
          'Open DTB Mobile Banking',
          'Go to "Settings" → "Profile"',
          'Update address information',
          'Request statement from "Account Services"',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.dtb.mbanking',
    hotline: '0719 031 000',
  },
  im: {
    name: 'I&M Bank',
    color: '#00529B',
    methods: [
      {
        title: 'I&M Mobile App',
        steps: [
          'Open I&M Mobile Banking',
          'Navigate to "Profile Settings"',
          'Update your address',
          'Download statement from "Accounts"',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.imbank.mbanking',
    hotline: '0719 088 000',
  },
  family: {
    name: 'Family Bank',
    color: '#ED1C24',
    methods: [
      {
        title: 'PesaPap App',
        steps: [
          'Open Family Bank PesaPap App',
          'Go to "More" → "Profile"',
          'Update your address details',
          'Request statement via app',
        ],
      },
    ],
    appLink: 'https://play.google.com/store/apps/details?id=com.familybank.pesapap',
    hotline: '0703 095 000',
  },
};

export default function BankGuides() {
  const [selectedBank, setSelectedBank] = useState('');
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [copiedStep, setCopiedStep] = useState(null);
  
  const { formattedAddress } = useAddressStore();
  
  const handleCopyAddress = async () => {
    if (formattedAddress) {
      await navigator.clipboard.writeText(formattedAddress);
      setCopiedStep('address');
      setTimeout(() => setCopiedStep(null), 2000);
    }
  };
  
  const selectedGuide = BANK_GUIDES[selectedBank];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="info-box">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          <h4 className="text-sm font-semibold text-blue-300">Skip the Bank Visit!</h4>
        </div>
        <p className="text-sm text-blue-200/70">
          Update your address via mobile banking and download an e-statement instantly.
        </p>
      </div>
      
      {/* Your Formatted Address */}
      {formattedAddress && (
        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Your Formatted Address:</span>
            <button
              onClick={handleCopyAddress}
              className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              {copiedStep === 'address' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedStep === 'address' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-white font-mono text-sm">{formattedAddress}</p>
        </div>
      )}
      
      {/* Bank Selection */}
      <div>
        <label className="label">Select Your Bank</label>
        <select
          value={selectedBank}
          onChange={(e) => {
            setSelectedBank(e.target.value);
            setExpandedMethod(null);
          }}
          className="select-field"
        >
          <option value="">Choose a bank...</option>
          {Object.entries(BANK_GUIDES).map(([id, bank]) => (
            <option key={id} value={id}>{bank.name}</option>
          ))}
        </select>
      </div>
      
      {/* Bank Guide */}
      {selectedGuide && (
        <div className="space-y-4 fade-in">
          {/* Bank Header */}
          <div className="flex items-center justify-between p-4 rounded-lg" 
               style={{ background: `${selectedGuide.color}20`, border: `1px solid ${selectedGuide.color}50` }}>
            <div>
              <h3 className="font-bold text-white">{selectedGuide.name}</h3>
              <p className="text-sm text-gray-400">Hotline: {selectedGuide.hotline}</p>
            </div>
            <a
              href={selectedGuide.appLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-4 h-4" />
              Get App
            </a>
          </div>
          
          {/* Methods */}
          <div className="space-y-3">
            {selectedGuide.methods.map((method, index) => (
              <div 
                key={index}
                className="rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                {/* Method Header */}
                <button
                  onClick={() => setExpandedMethod(expandedMethod === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white">{method.title}</span>
                  {expandedMethod === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {/* Steps */}
                {expandedMethod === index && (
                  <div className="px-4 pb-4 border-t border-gray-700/50">
                    <ol className="space-y-3 mt-4">
                      {method.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-gray-300 pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                    
                    {/* Pro Tip */}
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-xs text-green-400">
                        <strong>💡 Pro Tip:</strong> Copy your formatted address above and paste it exactly when prompted!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Checklist */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Before Submitting to Google
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Address updated in bank profile</span>
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Downloaded new statement (PDF or screenshot)</span>
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Statement shows updated physical address</span>
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>No P.O. Box anywhere on document</span>
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Validated with VeriBridge OCR (Step 3)</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
