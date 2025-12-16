import { useState } from 'react';
import { Shield, Lock, MapPin, CheckCircle, Printer, Search, Smartphone, FileText, Package, Home, ChevronRight, Menu, X } from 'lucide-react';
import HomePage from './components/HomePage';
import AddressBuilder from './components/AddressBuilder';
import BankGuides from './components/BankGuides';
import BankCardGenerator from './components/BankCardGenerator';
import AffidavitGenerator from './components/AffidavitGenerator';
import VerificationPackageGenerator from './components/VerificationPackageGenerator';
import OCRValidator from './components/OCRValidator';
import { useAddressStore } from './store/addressStore';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or step number
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { formattedAddress, validation } = useAddressStore();
  
  // Determine step completion status
  const isStep1Complete = formattedAddress && validation?.severity === 'success';
  
  const navItems = [
    {
      id: 'home',
      title: 'Home',
      icon: Home,
      description: 'Learn about VeriBridge',
    },
    {
      id: 1,
      title: 'Address Architect',
      subtitle: 'Build your address',
      icon: MapPin,
      complete: isStep1Complete,
      description: 'Format your address for international KYC compliance',
    },
    {
      id: 2,
      title: 'Verification Package',
      subtitle: 'Generate documents',
      icon: Package,
      complete: false,
      badge: 'MAIN',
      description: 'Generate Certificate, Affidavit & Cover Letter',
    },
    {
      id: 3,
      title: 'Quick Update',
      subtitle: 'Mobile banking',
      icon: Smartphone,
      complete: false,
      description: 'Update your bank profile via mobile app',
    },
    {
      id: 4,
      title: 'Bank Instructions',
      subtitle: 'Teller card',
      icon: Printer,
      complete: false,
      description: 'Generate PDF for the bank teller',
    },
    {
      id: 5,
      title: 'Affidavit Only',
      subtitle: 'Sworn declaration',
      icon: FileText,
      complete: false,
      description: 'Generate just the affidavit of residence',
    },
    {
      id: 6,
      title: 'Validate Document',
      subtitle: 'OCR scan',
      icon: Search,
      complete: false,
      description: 'Scan your document before submitting',
    },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setSidebarOpen(false);
  };

  const currentNavItem = navItems.find(item => item.id === currentView);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-white">VeriBridge</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </header>

      <div className="flex">
        {/* Main Content - Left Side */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {/* Desktop Header */}
            <header className="hidden lg:flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-white">Veri</span>
                    <span className="text-blue-400">Bridge</span>
                  </h1>
                  <p className="text-xs text-gray-500">Global Address Verification</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-gray-400">100% Private</span>
              </div>
            </header>
            
            {/* Content Area */}
            {currentView === 'home' ? (
              <HomePage onGetStarted={() => setCurrentView(1)} />
            ) : (
              <div className="card">
                {/* Step Header */}
                <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
                      Home
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-blue-400">{currentNavItem?.title}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{currentNavItem?.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{currentNavItem?.description}</p>
                </div>
                
                {/* Step Content */}
                <div className="fade-in">
                  {currentView === 1 && <AddressBuilder />}
                  {currentView === 2 && <VerificationPackageGenerator />}
                  {currentView === 3 && <BankGuides />}
                  {currentView === 4 && <BankCardGenerator />}
                  {currentView === 5 && <AffidavitGenerator />}
                  {currentView === 6 && <OCRValidator />}
                </div>
              </div>
            )}
            
            {/* Footer */}
            <footer className="mt-12 text-center text-xs text-gray-600">
              <p>Built with ❤️ for developers worldwide</p>
            </footer>
          </div>
        </main>
        
        {/* Sidebar - Right Side */}
        <aside className={`
          fixed lg:relative inset-y-0 right-0 z-50
          w-72 lg:w-64 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          border-l flex-shrink-0
        `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          {/* Sidebar Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Navigation</h3>
          </div>
          
          {/* Nav Items */}
          <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isComplete = item.complete;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all
                    ${isActive 
                      ? 'bg-blue-500/20 border border-blue-500/40' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isComplete 
                      ? 'bg-green-500' 
                      : isActive 
                        ? 'bg-blue-500' 
                        : 'bg-gray-700'
                    }
                  `}>
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <span className="text-xs text-gray-500 truncate block">{item.subtitle}</span>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-600'}`} />
                </button>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3 text-green-400" />
              <span>All data stays on your device</span>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
