import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, FileText, Mail, Key, Package, ShoppingBag, 
  CheckCircle, ArrowRight, Sparkles, Home, LogOut, Shield,
  Bell, Settings, ExternalLink, AlertTriangle, Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // FIX: Static Color Mapping (Prevents Tailwind Purge bugs)
  const getStyle = (color) => {
    const styles = {
      blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20",
      purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20",
      orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:bg-orange-500/20",
      green: "bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20",
      indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/20",
      pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 group-hover:bg-pink-500/20",
    };
    return styles[color] || styles.blue;
  };

  const services = [
    {
      title: 'My Orders',
      description: 'Track your company formations and orders',
      icon: ShoppingBag,
      color: 'blue',
      href: '/my-orders',
      status: 'Active'
    },
    {
      title: 'Company Formation',
      description: 'Register UK Ltd or US LLC companies',
      icon: Building2,
      color: 'purple',
      href: '/company-formation',
      popular: true
    },
    {
      title: 'Professional Invoicing',
      description: 'Create KRA-compliant invoices',
      icon: FileText,
      color: 'orange',
      href: '/invoicing'
    },
    {
      title: 'Digital Mailbox',
      description: 'Virtual address for business mail',
      icon: Mail,
      color: 'green',
      href: '/mailbox'
    },
    {
      title: 'API Keys',
      description: 'Integrate our services via API',
      icon: Key,
      color: 'indigo',
      href: '/api-keys'
    },
    {
      title: 'Verification Tools',
      description: 'Access free verification tools',
      icon: Package,
      color: 'pink',
      href: '/address-builder',
      free: true
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-6 h-6 text-blue-500 fill-blue-500/20" />
            <span className="text-lg font-bold text-white tracking-tight">VeriBridge</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="h-6 w-px bg-slate-800" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Verification Alert (Logic: Show if email not confirmed) */}
        {!user?.email_confirmed_at && (
          <div className="mb-8 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-400">Verification Pending</h3>
              <p className="text-xs text-orange-300/80">Please check your email to verify your account and unlock all features.</p>
            </div>
            <button className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-medium rounded transition-colors">
              Resend Email
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Welcome & Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
               <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 text-xs font-medium uppercase mb-2">Account Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">Free Tier</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded uppercase">Basic</span>
                  </div>
               </div>
               <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 text-xs font-medium uppercase mb-2">Active Orders</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">0</span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
               </div>
               <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20">
                  <p className="text-blue-100 text-xs font-medium uppercase mb-2">Wallet Balance</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">KES 0.00</span>
                  </div>
                  <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors">Top Up</button>
               </div>
            </div>

            {/* Services Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Business Tools</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const style = getStyle(service.color);
                  return (
                    <div
                      key={index}
                      onClick={() => navigate(service.href)}
                      className="group relative p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
                    >
                      {service.popular && (
                         <span className="absolute top-4 right-4 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                           POPULAR
                         </span>
                      )}
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${style}`}>
                        <service.icon className="w-5 h-5" />
                      </div>
                      
                      <h3 className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3 width) - Profile & Activity */}
          <div className="space-y-6">
            
            {/* Profile Completion Widget */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
              <h3 className="font-bold text-white mb-1">Profile Setup</h3>
              <p className="text-xs text-slate-500 mb-4">Complete your profile to unlock Company Formation.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${user?.email_confirmed_at ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-600'}`}>
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${user?.email_confirmed_at ? 'text-slate-300 line-through' : 'text-white'}`}>Confirm Email</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  </div>
                  <span className="text-sm text-white">Add Phone (M-PESA)</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  </div>
                  <span className="text-sm text-white">Verify Address</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Completion</span>
                  <span className="text-blue-400 font-bold">33%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Recent Activity</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
              </div>
              
              {/* Empty State */}
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 mb-1">No activity yet</p>
                <p className="text-xs text-slate-600">Your orders and filings will appear here.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}