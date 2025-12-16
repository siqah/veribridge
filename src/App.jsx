import { useState } from 'react';
import { Shield, Lock, MapPin, CheckCircle, Printer, Search, Smartphone, FileText } from 'lucide-react';
import AddressBuilder from './components/AddressBuilder';
import BankGuides from './components/BankGuides';
import BankCardGenerator from './components/BankCardGenerator';
import AffidavitGenerator from './components/AffidavitGenerator';
import OCRValidator from './components/OCRValidator';
import { useAddressStore } from './store/addressStore';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const { formattedAddress, validation } = useAddressStore();
  
  // Determine step completion status
  const isStep1Complete = formattedAddress && validation?.severity === 'success';
  
  const steps = [
    {
      number: 1,
      title: 'Address Architect',
      subtitle: 'Build your compliant address',
      icon: MapPin,
      complete: isStep1Complete,
      description: 'Build a compliant address for international KYC verification',
    },
    {
      number: 2,
      title: 'Quick Update',
      subtitle: 'Update via mobile banking',
      icon: Smartphone,
      complete: false,
      description: 'Update your bank profile instantly via mobile app - no branch visit needed!',
    },
    {
      number: 3,
      title: 'Bank Instructions',
      subtitle: 'Generate teller card',
      icon: Printer,
      complete: false,
      description: 'Generate a PDF for the bank teller if visiting a branch',
    },
    {
      number: 4,
      title: 'Affidavit',
      subtitle: 'Sworn declaration',
      icon: FileText,
      complete: false,
      description: 'Generate a legal affidavit of residence (alternative to bank statement)',
    },
    {
      number: 5,
      title: 'Validate Document',
      subtitle: 'Verify before submitting',
      icon: Search,
      complete: false,
      description: 'Scan your document to ensure it passes Google/Amazon verification',
    },
  ];

  const totalSteps = steps.length;

  return (
    <div className="app-container">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="header-logo">Veri</span>
                <span className="header-logo-accent">Bridge</span>
              </h1>
            </div>
          </div>
          
          <div className="privacy-badge">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Local Processing</span>
          </div>
        </header>
        
        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            KYC Address Verification
          </h2>
          <p className="text-gray-400">
            Format your address for Google Play Console, Amazon, PayPal & more
          </p>
        </div>
        
        {/* Main Layout - Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Step Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="step-sidebar">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isComplete = step.complete;
                
                return (
                  <div 
                    key={step.number} 
                    className="step-item cursor-pointer"
                    onClick={() => setCurrentStep(step.number)}
                  >
                    <div className={`step-icon ${isActive ? 'step-icon-active pulse-glow' : ''} ${isComplete ? 'step-icon-complete' : ''}`}>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="card fade-in">
              {/* Step Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700/50">
                <div>
                  <p className="text-sm text-blue-400 font-medium mb-1">
                    Step {currentStep}/{totalSteps}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {steps[currentStep - 1].title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>
              
              {/* Step Content */}
              <div className="fade-in">
                {currentStep === 1 && <AddressBuilder />}
                {currentStep === 2 && <BankGuides />}
                {currentStep === 3 && <BankCardGenerator />}
                {currentStep === 4 && <AffidavitGenerator />}
                {currentStep === 5 && <OCRValidator />}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                
                <button
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  disabled={currentStep === totalSteps}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === totalSteps ? 'Finish' : 'Continue'}
                </button>
              </div>
            </div>
            
            {/* Info Card */}
            <div className="mt-6 info-box">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">Your Privacy is Protected</h4>
                  <p className="text-sm text-blue-200/70">
                    All document processing happens locally in your browser. We never store, transmit, or access your personal information.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-8">
          <p className="mb-2">
            Built with ❤️ for developers navigating international compliance challenges
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
