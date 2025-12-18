import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Shield, MapPin, Package, Building2, FileText, Mail, 
  Key, ArrowRight, CheckCircle, Sparkles, Lock, Globe, Menu, X
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. FIX: Static Color Definitions (Tailwind can't scan dynamic strings like `bg-${color}-500`)
  const colorStyles = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20",
  };

  const features = [
    {
      title: 'Address Verification',
      description: 'Stop getting rejected. Convert "Near Mosque" into a format Google accepts.',
      icon: MapPin,
      style: colorStyles.blue,
      href: '/address-builder'
    },
    {
      title: 'UK Company Formation',
      description: 'Register a legitimate UK Ltd company in 24 hours. Unlock Stripe & Wise.',
      icon: Building2,
      style: colorStyles.purple,
      href: '/company-formation',
      badge: 'Popular'
    },
    {
      title: 'Digital Mailbox',
      description: 'A real London street address for your business mail and returns.',
      icon: Mail,
      style: colorStyles.green,
      href: '/mailbox',
      badge: 'New'
    },
    {
      title: 'Global Invoicing',
      description: 'Generate KRA-compliant invoices with embedded IBAN/Swift details.',
      icon: FileText,
      style: colorStyles.orange,
      href: '/invoicing',
      protected: true
    },
    {
      title: 'Verification Packages',
      description: 'Get the "Green Checkmark" with our pre-verified document bundles.',
      icon: Package,
      style: colorStyles.pink,
      href: '/verification-package'
    },
    {
      title: 'Business API',
      description: 'Clean and format Kenyan customer addresses via our REST API.',
      icon: Key,
      style: colorStyles.indigo,
      href: '/api-keys',
      protected: true
    },
  ];

  const logoPartners = [
    { name: 'Google', src: '/logos/google.svg' },
    { name: 'Stripe', src: '/logos/stripe.svg' },
    { name: 'Amazon', src: '/logos/amazon.svg' },
    { name: 'PayPal', src: '/logos/paypal.svg' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Background Gradients (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Shield className="w-8 h-8 text-blue-500 fill-blue-500/20" />
          <span className="text-2xl font-bold text-white tracking-tight">VeriBridge</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium transition-colors">Log In</button>
          <button onClick={() => navigate('/signup')} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-full font-medium transition-all">Get Started</button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-slate-900 border-b border-white/10 p-6 space-y-4">
            <button
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Hero Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            <span>Trusted by 500+ Kenyan Developers</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Global Business, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Kenyan Identity.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Stop getting rejected by Google and Stripe. We format your identity, register your UK company, and handle your compliance—so you can get paid globally.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              Start Verification
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
            >
              View Sample Docs
            </button>
          </div>

          {/* Social Proof Bar */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-slate-500 text-sm font-medium mb-4">WORKS PERFECTLY WITH</p>
            <div className="flex flex-wrap gap-8 items-center">
              {logoPartners.map((partner) => (
                <div key={partner.name} className="group opacity-40 hover:opacity-100 transition-opacity duration-300">
                  <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Visual (The "Before vs After" Hook) */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-3xl rounded-full" />
          
          {/* Card Stack Effect */}
          <div className="relative space-y-4">
            {/* The "Bad" Card */}
            <div className="bg-red-950/40 border border-red-500/20 p-4 rounded-xl backdrop-blur-md transform scale-95 opacity-60 translate-y-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-red-400 text-xs font-mono uppercase">Rejected ❌</span>
              </div>
              <p className="text-slate-400 text-sm font-mono">P.O. Box 1234, Near Makina Mosque, Nairobi</p>
            </div>

            {/* The "Good" Card */}
            <div className="bg-slate-900/80 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 transform transition-transform hover:-translate-y-2 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Verified Resident</span>
                </div>
                <img src="/api/placeholder/40/40" alt="Flag" className="w-8 h-8 rounded-full opacity-80" />
              </div>
              
              <div className="space-y-3">
                <div className="h-2 w-24 bg-slate-700 rounded-full" />
                <div className="space-y-1">
                  <p className="text-white font-mono text-lg">Makina Building, Sheikh Mahmoud Rd</p>
                  <p className="text-slate-400 font-mono">Kibra, Nairobi, 00504</p>
                  <p className="text-slate-400 font-mono">Kenya</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500">Google Compliance Check: PASS</span>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need to go global</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Don't let geography limit your ambition. We provide the digital infrastructure to operate like a local in London or New York.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.href)}
              className={`group relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${feature.style} backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-white/5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                {feature.badge && (
                  <span className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full border border-white/10">
                    {feature.badge}
                  </span>
                )}
                {feature.protected && (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{feature.description}</p>
              
              <div className="flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust/Stats Section */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.8%</div>
            <div className="text-slate-400">Verification Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">24h</div>
            <div className="text-slate-400">Average Turnaround</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">Bank-Grade</div>
            <div className="text-slate-400">AES-256 Encryption</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to verify your identity?
        </h2>
        <p className="text-xl text-slate-400 mb-10">
          Join thousands of African developers who are working globally.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-12 py-5 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-full shadow-2xl transition-all duration-200 text-lg"
        >
          Create Free Account
        </button>
        <p className="mt-6 text-sm text-slate-500">No credit card required for basic tools.</p>
      </div>
    </div>
  );
}