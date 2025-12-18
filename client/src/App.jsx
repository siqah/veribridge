import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Lock, MapPin, Package, Smartphone, Printer, FileText, Search, Home, ChevronRight, Menu, X, Building2, Mail, Key, Sun, Moon, ChevronDown } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DemoPage from './pages/DemoPage';

// Verification Pages
import AddressBuilder from './pages/verification/AddressBuilder';
import VerificationPackageGenerator from './pages/verification/VerificationPackageGenerator';
import BankGuides from './pages/verification/BankGuides';
import BankCardGenerator from './pages/verification/BankCardGenerator';
import AffidavitGenerator from './pages/verification/AffidavitGenerator';
import OCRValidator from './pages/verification/OCRValidator';

// Business Pages
import CompanyFormation from './pages/business/CompanyFormation';
import Invoicing from './pages/business/Invoicing';
import Mailbox from './pages/business/Mailbox';
import MailboxSubscription from './pages/business/MailboxSubscription';
import ApiKeys from './pages/business/ApiKeys';
import MyOrders from './pages/business/MyOrders';

// Admin Pages
import FormationOrders from './pages/admin/FormationOrders';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { ProtectedRoute, AdminRoute } from './pages/auth/ProtectedRoute';

// Legal Pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

import { useAddressStore } from './store/addressStore';
import { useTheme } from './utils/useTheme';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Auth Routes - Fullscreen */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Public Landing Page - No Layout */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Demo Page - Public */}
      <Route path="/demo" element={<DemoPage />} />
      
      {/* Main App with Layout */}
      <Route path="/" element={<AppLayout />}>
        {/* Dashboard - Protected */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Verification Tools - Public (no auth required) */}
        <Route path="address-builder" element={<AddressBuilder />} />
        <Route path="verification-package" element={<VerificationPackageGenerator />} />
        <Route path="bank-guides" element={<BankGuides />} />
        <Route path="bank-card" element={<BankCardGenerator />} />
        <Route path="affidavit" element={<AffidavitGenerator />} />
        <Route path="ocr-validator" element={<OCRValidator />} />
        
        {/* Business Services - Protected (auth required) */}
        <Route path="my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="company-formation" element={<ProtectedRoute><CompanyFormation /></ProtectedRoute>} />
        <Route path="invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
        <Route path="mailbox" element={<ProtectedRoute><Mailbox /></ProtectedRoute>} />
        <Route path="mailbox/subscribe" element={<ProtectedRoute><MailboxSubscription /></ProtectedRoute>} />
        <Route path="api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        
        {/* Admin - Admin Only */}
        <Route path="admin/formations" element={<AdminRoute><FormationOrders /></AdminRoute>} />
        
        {/* Legal - Public */}
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { formattedAddress, validation } = useAddressStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = !!user;
  const isStep1Complete = formattedAddress && validation?.severity === 'success';
  
  // Route mapping for breadcrumbs
  const routeMap = {
    '/': { title: 'Home', category: 'main' },
    '/address-builder': { title: 'Address Architect', description: 'Format address for KYC', category: 'verification' },
    '/verification-package': { title: 'Verification Package', description: 'Certificate & Affidavit', category: 'verification' },
    '/bank-guides': { title: 'Quick Update', description: 'Update bank profile', category: 'verification' },
    '/bank-card': { title: 'Bank Instructions', description: 'PDF for bank teller', category: 'verification' },
    '/affidavit': { title: 'Affidavit Only', description: 'Affidavit of residence', category: 'verification' },
    '/ocr-validator': { title: 'Validate Document', description: 'Scan before submitting', category: 'verification'},
    '/my-orders': { title: 'My Orders', description: 'View company formations', category: 'business' },
    '/company-formation': { title: 'Company Formation', description: 'Register UK Ltd / US LLC', category: 'business' },
    '/invoicing': { title: 'Invoicing', description: 'KRA-compliant invoices', category: 'business' },
    '/mailbox': { title: 'Digital Mailbox', description: 'Correspondence management', category: 'business' },
    '/mailbox/subscribe': { title: 'Subscribe to Mailbox', description: 'Get your virtual address', category: 'business' },
    '/api-keys': { title: 'API Keys', description: 'API for integrations', category: 'business' },
    '/admin/formations': { title: 'Admin - Formation Orders', description: 'Manage company formations', category: 'admin' },
    '/terms': { title: 'Terms of Service', category: 'legal' },
    '/privacy': { title: 'Privacy Policy', category: 'legal' },
  };

  const currentRoute = routeMap[location.pathname] || { title: 'Page', category: 'main' };
  const isHomePage = location.pathname === '/';

  // Navigation items for dropdowns
  const verificationItems = [
    { path: '/address-builder', title: 'Address Architect', icon: MapPin, badge: null },
    { path: '/verification-package', title: 'Verification Package', icon: Package, badge: 'MAIN' },
    { path: '/bank-guides', title: 'Quick Update', icon: Smartphone },
    { path: '/bank-card', title: 'Bank Instructions', icon: Printer },
    { path: '/affidavit', title: 'Affidavit Only', icon: FileText },
    { path: '/ocr-validator', title: 'Validate Document', icon: Search },
  ];

  const businessItems = [
    { path: '/my-orders', title: 'My Orders', icon: Building2 },
    { path: '/company-formation', title: 'Company Formation', icon: Building2 },
    { path: '/invoicing', title: 'Invoicing', icon: FileText },
    { path: '/mailbox', title: 'Digital Mailbox', icon: Mail },
    { path: '/api-keys', title: 'API Keys', icon: Key },
  ];

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

      {/* Desktop Header */}
      <header className="hidden lg:flex flex-shrink-0 items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
          </div>

          <nav className="flex items-center gap-1">
             <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/' || location.pathname === '/dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={(location.pathname !== '/' && location.pathname !== '/dashboard') ? { color: 'var(--text-primary)' } : {}}
              >
                Home
              </button>

             {/* Verification Dropdown */}
             <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                  <span>Verification</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden backdrop-blur-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                    <div className="p-1">
                      {verificationItems.map(item => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
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
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                  <span>Business</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden backdrop-blur-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                    <div className="p-1">
                      {businessItems.map(item => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
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
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
              >
                Login
              </button>
            )}
            
            <button
              onClick={() => navigate('/admin/formations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border ${
                location.pathname === '/admin/formations'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
              }`}
              style={location.pathname !== '/admin/formations' ? { color: 'var(--text-primary)' } : {}}
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
        {/* Mobile Sidebar */}
        <aside className={`
          absolute inset-y-0 left-0 z-50
          w-72 h-full lg:hidden
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r flex flex-col shadow-2xl
        `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Digital Notary Platform</p>
          </div>
          
          <nav className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            {/* Home */}
            <button
              onClick={() => { navigate('/'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 text-left transition-all ${
                location.pathname === '/' ? 'border bg-blue-500/10' : 'hover:bg-white/5 border border-transparent'
              }`}
              style={location.pathname === '/' ? { borderColor: 'var(--accent-blue)' } : {}}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" 
                   style={{ background: location.pathname === '/' ? 'var(--accent-blue)' : 'var(--bg-primary)' }}>
                <Home className="w-4 h-4" style={{ color: location.pathname === '/' ? '#ffffff' : 'var(--text-secondary)' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Home</span>
            </button>

            {/* Verification Tools */}
            <h3 className="text-xs font-semibold uppercase tracking-wider px-3 py-2 mt-4" style={{ color: 'var(--text-muted)' }}>
              Verification Tools
            </h3>
            {verificationItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all ${
                  location.pathname === item.path ? 'border bg-blue-500/10' : 'hover:bg-white/5 border border-transparent'
                }`}
                style={location.pathname === item.path ? { borderColor: 'var(--accent-blue)' } : {}}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" 
                     style={{ background: location.pathname === item.path ? 'var(--accent-blue)' : 'var(--bg-primary)' }}>
                  <item.icon className="w-4 h-4" style={{ color: location.pathname === item.path ? '#ffffff' : 'var(--text-secondary)' }} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                {item.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">{item.badge}</span>}
              </button>
            ))}

            {/* Business Services */}
            <h3 className="text-xs font-semibold uppercase tracking-wider px-3 py-2 mt-4" style={{ color: 'var(--text-muted)' }}>
              Business Services
            </h3>
            {businessItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all ${
                  location.pathname === item.path ? 'border bg-blue-500/10' : 'hover:bg-white/5 border border-transparent'
                }`}
                style={location.pathname === item.path ? { borderColor: 'var(--accent-blue)' } : {}}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" 
                     style={{ background: location.pathname === item.path ? 'var(--accent-blue)' : 'var(--bg-primary)' }}>
                  <item.icon className="w-4 h-4" style={{ color: location.pathname === item.path ? '#ffffff' : 'var(--text-secondary)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Lock className="w-3 h-3" style={{ color: 'var(--success)' }} />
              <span>All data stays on device</span>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex-1">
            {!isHomePage && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => navigate('/')} className="hover:underline">Home</button>
                  <ChevronRight className="w-4 h-4" />
                  <span style={{ color: 'var(--accent-blue)' }}>{currentRoute.title}</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {currentRoute.title}
                  </h2>
                  {currentRoute.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {currentRoute.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Content Area - Render child routes via Outlet */}
            <div className="fade-in pb-12">
              <Outlet />
            </div>
            
            {/* Footer */}
            <footer className="mt-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Built with ❤️ for developers worldwide</p>
              <div className="mt-2 flex justify-center gap-4">
                <button onClick={() => navigate('/terms')} className="hover:underline">Terms of Service</button>
                <span>•</span>
                <button onClick={() => navigate('/privacy')} className="hover:underline">Privacy Policy</button>
              </div>
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
