import { useState } from 'react';
import { Shield, Lock, MapPin, Package, Smartphone, Printer, FileText, Search, Home, ChevronRight, Menu, X, Building2, Mail, Key, Sun, Moon, PanelLeftClose, PanelLeft, ChevronDown } from 'lucide-react';
import HomePage from './components/HomePage';
import AddressBuilder from './components/AddressBuilder';
import BankGuides from './components/BankGuides';
import BankCardGenerator from './components/BankCardGenerator';
import AffidavitGenerator from './components/AffidavitGenerator';
import VerificationPackageGenerator from './components/VerificationPackageGenerator';
import OCRValidator from './components/OCRValidator';
// Dashboard components
import CompanyFormation from './components/dashboard/CompanyFormation';
import Invoicing from './components/dashboard/Invoicing';
import Mailbox from './components/dashboard/Mailbox';
import ApiKeys from './components/dashboard/ApiKeys';
// Admin components
import FormationOrders from './components/admin/FormationOrders';
import { useAddressStore } from './store/addressStore';
import { useTheme } from './utils/useTheme';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar ONLY
  const { theme, toggleTheme } = useTheme();
  const { formattedAddress, validation } = useAddressStore();
  
  // Determine step completion status
  const isStep1Complete = formattedAddress && validation?.severity === 'success';
  
  // Unified navigation items
  const navItems = [
    {
      id: 'home',
      title: 'Home',
      icon: Home,
      description: 'Overview',
      category: 'main'
    },
    // VERIFICATION TOOLS
    {
      id: 1,
      title: 'Address Architect',
      subtitle: 'Build your address',
      icon: MapPin,
      complete: isStep1Complete,
      description: 'Format address for KYC',
      category: 'verification'
    },
    {
      id: 2,
      title: 'Verification Package',
      subtitle: 'Generate documents',
      icon: Package,
      complete: false,
      badge: 'MAIN',
      description: 'Certificate & Affidavit',
      category: 'verification'
    },
    {
      id: 3,
      title: 'Quick Update',
      subtitle: 'Mobile banking',
      icon: Smartphone,
      complete: false,
      description: 'Update bank profile',
      category: 'verification'
    },
    {
      id: 4,
      title: 'Bank Instructions',
      subtitle: 'Teller card',
      icon: Printer,
      complete: false,
      description: 'PDF for bank teller',
      category: 'verification'
    },
    {
      id: 5,
      title: 'Affidavit Only',
      subtitle: 'Sworn declaration',
      icon: FileText,
      complete: false,
      description: 'Affidavit of residence',
      category: 'verification'
    },
    {
      id: 6,
      title: 'Validate Document',
      subtitle: 'OCR scan',
      icon: Search,
      complete: false,
      description: 'Scan before submitting',
      category: 'verification'
    },
    // BUSINESS SERVICES
    {
      id: 'company-formation',
      title: 'Company Formation',
      subtitle: 'UK/US companies',
      icon: Building2,
      description: 'Register UK Ltd / US LLC',
      category: 'business'
    },
    {
      id: 'invoicing',
      title: 'Invoicing',
      subtitle: 'Professional invoices',
      icon: FileText,
      description: 'KRA-compliant invoices',
      category: 'business'
    },
    {
      id: 'mailbox',
      title: 'Digital Mailbox',
      subtitle: 'Virtual address',
      icon: Mail,
      description: 'Correspondence management',
      category: 'business'
    },
    {
      id: 'api',
      title: 'API Keys',
      subtitle: 'Developer access',
      icon: Key,
      description: 'API for integrations',
      category: 'business'
    },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setSidebarOpen(false);
  };

  const currentNavItem = navItems.find(item => item.id === currentView);

  // Group items by category for sidebar rendering
  const verificationItems = navItems.filter(item => item.category === 'verification');
  const businessItems = navItems.filter(item => item.category === 'business');

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile Header */}
      <header className="lg:hidden flex-shrink-0 flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg"
            style={{ background: 'var(--bg-secondary)' }}
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            )}
          </button>
        </div>
      </header>

      {/* Desktop Header - TOP NAV */}
      <header className="hidden lg:flex flex-shrink-0 items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <Shield className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
          </div>

          <nav className="flex items-center gap-1">
             <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'home'
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Home
              </button>

             {/* Verification Dropdown */}
             <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-md transition-colors">
                  <span>Verification</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden backdrop-blur-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                    <div className="p-1">
                      {verificationItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          {item.badge && <span className="text-[10px] font-bold text-blue-600 px-1 border border-blue-200 rounded">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
             </div>

             {/* Business Dropdown */}
             <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-md transition-colors">
                  <span>Business</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden backdrop-blur-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                    <div className="p-1">
                      {businessItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
            {/* Admin Link */}
            <button
              onClick={() => handleNavClick('admin-formations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentView === 'admin-formations'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              Admin
            </button>
            
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full text-xs" 
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <Lock className="w-3 h-3" style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--text-muted)' }}>100% Private</span>
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar - Drawer Only */}
        <aside className={`
          absolute inset-y-0 left-0 z-50
          w-72 h-full lg:hidden
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r flex flex-col shadow-2xl
        `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          {/* Sidebar Header */}
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Digital Notary Platform</p>
          </div>
          
          {/* Nav Items - Independent Scroll */}
          <nav className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            {/* Home */}
            {navItems.filter(item => item.category === 'main').map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg mb-2 text-left transition-all
                    ${isActive 
                      ? 'border' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                  style={isActive ? { 
                    background: 'var(--accent-blue-glow)', 
                    borderColor: 'var(--accent-blue)' 
                  } : {}}
                >
                   <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  `} style={{ background: isActive ? 'var(--accent-blue)' : 'var(--bg-primary)' }}>
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block" style={{ 
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' 
                    }}>
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0`} style={{ 
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' 
                  }} />
                </button>
              );
            })}

            {/* Verification Tools Section */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider px-3 py-2" 
                  style={{ color: 'var(--text-muted)' }}>
                Verification Tools
              </h3>
              {verificationItems.map((item) => {
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
                        ? 'border' 
                        : 'hover:bg-white/5 border border-transparent'
                      }
                    `}
                     style={isActive ? { 
                      background: 'var(--accent-blue-glow)', 
                      borderColor: 'var(--accent-blue)' 
                    } : {}}
                  >
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    `} style={{ 
                      background: isComplete ? 'var(--success)' : isActive ? 'var(--accent-blue)' : 'var(--bg-primary)' 
                    }}>
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: isActive || isComplete ? '#ffffff' : 'var(--text-secondary)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ 
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' 
                        }}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span className="text-xs truncate block" style={{ color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0`} style={{ 
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' 
                    }} />
                  </button>
                );
              })}
            </div>

            {/* Business Services Section */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider px-3 py-2" 
                  style={{ color: 'var(--text-muted)' }}>
                Business Services
              </h3>
              {businessItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all
                      ${isActive 
                        ? 'border' 
                        : 'hover:bg-white/5 border border-transparent'
                      }
                    `}
                   style={isActive ? { 
                      background: 'var(--accent-blue-glow)', 
                      borderColor: 'var(--accent-blue)' 
                    } : {}}
                  >
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    `} style={{ background: isActive ? 'var(--accent-blue)' : 'var(--bg-primary)' }}>
                      <Icon className="w-4 h-4" style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block" style={{ 
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' 
                      }}>
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs truncate block" style={{ color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0`} style={{ 
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' 
                    }} />
                  </button>
                );
              })}
            </div>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t flex-shrink-0" 
               style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Lock className="w-3 h-3" style={{ color: 'var(--success)' }} />
              <span>All data stays on device</span>
            </div>
          </div>
        </aside>
        
        {/* Main Content - Independent Scroll Area */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex-1">
             <div className="mb-4">
                  {currentView !== 'home' && (
                    <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      <button onClick={() => setCurrentView('home')} className="hover:underline">
                        Home
                      </button>
                      <ChevronRight className="w-4 h-4" />
                      <span style={{ color: 'var(--accent-blue)' }}>{currentNavItem?.title}</span>
                    </div>
                  )}
                  {currentView !== 'home' && (
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {currentNavItem?.title}
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {currentNavItem?.description}
                      </p>
                    </div>
                  )}
            </div>
            
            {/* Content Area */}
            <div className="fade-in pb-12">
              {currentView === 'home' ? (
                <HomePage onNavigate={handleNavClick} />
              ) : currentView === 1 ? (
                <div className="card">
                  <AddressBuilder />
                </div>
              ) : currentView === 2 ? (
                <div className="card">
                  <VerificationPackageGenerator />
                </div>
              ) : currentView === 3 ? (
                <div className="card">
                  <BankGuides />
                </div>
              ) : currentView === 4 ? (
                <div className="card">
                  <BankCardGenerator />
                </div>
              ) : currentView === 5 ? (
                <div className="card">
                  <AffidavitGenerator />
                </div>
              ) : currentView === 6 ? (
                <div className="card">
                  <OCRValidator />
                </div>
              ) : currentView === 'company-formation' ? (
                <CompanyFormation />
              ) : currentView === 'invoicing' ? (
                <Invoicing />
              ) : currentView === 'mailbox' ? (
                <Mailbox />
              ) : currentView === 'api' ? (
                <ApiKeys />
              ) : currentView === 'admin-formations' ? (
                <FormationOrders />
              ) : null}
            </div>
            
            {/* Footer */}
            <footer className="mt-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Built with ❤️ for developers worldwide</p>
            </footer>
          </div>
        </main>
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
