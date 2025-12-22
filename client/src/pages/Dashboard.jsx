import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, FileText, Mail, Key, Package, ShoppingBag, 
  CheckCircle, ArrowRight, Clock, Bell, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="space-y-8">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Email Verification Alert */}
      {!user?.email_confirmed_at && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-400">Email Verification Required</h3>
            <p className="text-xs text-orange-300/80">Please check your email to verify your account and unlock all features.</p>
          </div>
          <button className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-medium rounded-lg transition-colors">
            Resend Email
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Account Level</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Free Tier</span>
            <span className="px-2 py-0.5 text-[10px] rounded uppercase font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Basic</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Active Orders</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>0</span>
            <Clock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Business Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Quick Access</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const style = getStyle(service.color);
            return (
              <div
                key={index}
                onClick={() => navigate(service.href)}
                className="group relative p-6 rounded-2xl border hover:border-opacity-70 transition-all duration-200 cursor-pointer"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                {service.popular && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    POPULAR
                  </span>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${style}`}>
                  <service.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {service.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-medium group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <span>Launch</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>
        </div>
        
        {/* Empty State */}
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-secondary)' }}>
            <ShoppingBag className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your orders and filings will appear here</p>
        </div>
      </div>

    </div>
  );
}