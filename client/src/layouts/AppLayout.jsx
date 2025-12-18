import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Shield, MapPin, Package, Smartphone, Printer, FileText, Search, 
  Building2, Mail, Key, Menu, X, Sun, Moon, Lock, Home, 
  ChevronRight, LogOut, Bell, User, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../utils/useTheme';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = !!user;

  // Route metadata
  const getPageTitle = (path) => {
    const map = {
      '/': 'Home',
      '/dashboard': 'Dashboard',
      '/address-builder': 'Address Architect',
      '/verification-package': 'Verification Package',
      '/bank-card': 'Bank Instructions',
      '/bank-guides': 'Quick Update',
      '/affidavit': 'Affidavit Generator',
      '/ocr-validator': 'Document Scanner',
      '/company-formation': 'Company Formation',
      '/invoicing': 'Invoicing Suite',
      '/mailbox': 'Digital Mailbox',
      '/api-keys': 'Developer API',
      '/my-orders': 'Order History',
      '/admin/formations': 'Admin Panel',
      '/terms': 'Terms of Service',
      '/privacy': 'Privacy Policy',
    };
    return map[path] || 'VeriBridge';
  };

  // Navigation Groups
  const navGroups = [
    {
      label: 'Platform',
      items: [
        { path: '/dashboard', title: 'Dashboard', icon: Home },
        { path: '/my-orders', title: 'My Orders', icon: Package },
      ]
    },
    {
      label: 'Verification',
      items: [
        { path: '/address-builder', title: 'Address Architect', icon: MapPin },
        { path: '/verification-package', title: 'Full Package', icon: Package },
        { path: '/bank-card', title: 'Bank Instructions', icon: Printer },
        { path: '/bank-guides', title: 'Quick Update', icon: Smartphone },
        { path: '/ocr-validator', title: 'Document Scanner', icon: Search },
      ]
    },
    {
      label: 'Global Business',
      items: [
        { path: '/company-formation', title: 'Company Formation', icon: Building2, badge: 'Hot' },
        { path: '/invoicing', title: 'Invoicing', icon: FileText },
        { path: '/mailbox', title: 'Digital Mailbox', icon: Mail },
        { path: '/api-keys', title: 'API Keys', icon: Key },
      ]
    }
  ];

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* ====================
          SIDEBAR (Desktop) 
      ==================== */}
      <aside className="hidden lg:flex w-64 flex-col border-r flex-shrink-0" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-2 px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Shield className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-600/10 text-blue-400' 
                          : 'hover:bg-white/5'}
                      `}
                      style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} style={!isActive ? { color: 'var(--text-muted)' } : {}} />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--bg-primary)' }}>
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || 'User'}</p>
               <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
             </div>
             <Settings className="w-4 h-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </aside>

      {/* ====================
          MAIN CONTENT AREA 
      ==================== */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-primary)' }}>
        
        {/* Top Header (Breadcrumbs & Actions) */}
        <header className="h-16 flex items-center justify-between px-6 border-b backdrop-blur-xl z-20 sticky top-0" 
                style={{ 
                  background: theme === 'dark' ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'var(--border-color)' 
                }}>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>VeriBridge</span>
            <ChevronRight className="w-4 h-4 hidden sm:inline" style={{ color: 'var(--text-muted)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{getPageTitle(location.pathname)}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             {/* Privacy Badge */}
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>AES-256 Encrypted</span>
             </div>

             <div className="h-6 w-px hidden sm:block" style={{ background: 'var(--border-color)' }} />

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2 hover:bg-white/5 rounded-lg transition-colors"
               style={{ color: 'var(--text-secondary)' }}
               title="Toggle Theme"
             >
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             </button>

             {isAuthenticated ? (
               <button 
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="Sign Out"
               >
                 <LogOut className="w-5 h-5" />
               </button>
             ) : (
               <button onClick={() => navigate('/login')} className="text-sm font-medium text-blue-400 hover:text-blue-300">Sign In</button>
             )}
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
           {/* Background Mesh Gradient (Subtle) */}
           <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[100px] pointer-events-none" />
           
           <div className="relative z-10 max-w-6xl mx-auto">
             <Outlet />
           </div>
        </main>

      </div>

      {/* ====================
          MOBILE SIDEBAR OVERLAY 
      ==================== */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50 lg:hidden flex">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 h-full border-r flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
                 style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
             {/* Mobile Logo */}
             <div className="h-16 flex items-center gap-2 px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>VeriBridge</span>
             </div>
             
             {/* Mobile Nav */}
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navGroups.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="px-2 text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>{group.label}</h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                            ${location.pathname === item.path ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5'}
                          `}
                          style={location.pathname !== item.path ? { color: 'var(--text-secondary)' } : {}}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
             </div>

             {/* Mobile User Profile */}
             <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
               <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                     <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'var(--bg-primary)' }}>
                       {user?.email?.[0].toUpperCase() || 'U'}
                     </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
               </div>
             </div>
          </aside>
        </div>
      )}

    </div>
  );
}
