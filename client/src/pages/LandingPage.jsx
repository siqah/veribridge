import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  MapPin, Building2, FileText, Mail, 
  Key, ArrowRight, CheckCircle, Lock, Globe, Menu, X
} from 'lucide-react';
import TargetCustomersSection from '../components/TargetCustomersSection';
import { useLocale } from '../hooks/useLocale';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isKenyan } = useLocale();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      title: 'Address Verification',
      description: 'Stop getting rejected. Convert "Near Mosque" into a format Google accepts.',
      icon: MapPin,
      href: '/address-verification',
      badge: 'FREE'
    },
    {
      title: 'UK Company Formation',
      description: 'Register a legitimate UK Ltd company in 24 hours. Unlock Stripe & Wise.',
      icon: Building2,
      href: '/company-formation',
      badge: 'Popular'
    },
    {
      title: 'Digital Mailbox',
      description: 'A real London street address for your business mail and returns.',
      icon: Mail,
      href: '/mailbox-info',
      badge: 'New'
    },
    {
      title: 'Global Invoicing',
      description: 'Generate professional invoices with tax compliance and embedded IBAN/Swift details.',
      icon: FileText,
      href: '/invoicing',
      protected: true
    },

  ];

  return (
    <div className="min-h-screen bg-forest-950 relative overflow-hidden">
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

      {/* Navbar - Fixed/Sticky with Scroll Animation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3' 
          : 'py-4'
      }`}>
        <div className={`mx-auto px-6 flex justify-between items-center transition-all duration-300 ${
          isScrolled
            ? 'max-w-4xl bg-slate-100/90 backdrop-blur-lg border border-slate-200 rounded-full shadow-2xl shadow-slate-200/50'
            : 'max-w-6xl bg-slate-100/80 backdrop-blur-lg border border-slate-200 rounded-full shadow-lg shadow-slate-200/30'
        }`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/veribridge-logo.png" alt="VeriBridge" className="w-14 h-14" />
          <span className="text-xl font-semibold text-slate-900 tracking-tight">VeriBridge</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={scrollToFeatures} className="text-slate-600 hover:text-slate-900 text-sm transition-colors">Product</button>
          <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-slate-900 text-sm transition-colors">Log In</button>
          <button onClick={() => navigate('/signup')} className="bg-emerald-600 text-white hover:bg-emerald-500 px-6 py-2.5 rounded-full font-medium text-sm transition-all">Get Started</button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-900 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-forest-950/95 backdrop-blur-lg" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-forest-900 border-b border-emerald-500/10 p-6 space-y-4">
            <button
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
              className="block w-full bg-emerald-600 text-white hover:bg-emerald-500 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32 text-center">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-8">
          <Globe className="w-4 h-4" />
          <span>GLOBAL BUSINESS INFRASTRUCTURE</span>
        </div>
        
        {/* Main Headline - Large Serif */}
        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
          The Platform That<br />
          Bridges Your Business<br />
          to the World
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          Access Wise, Stripe, and international clients with a UK company. Everything you need to go global—formed in 48 hours for {isKenyan ? (
            <><span className="text-emerald-400 font-semibold">KES 25,000</span><span className="text-slate-500"> / $199</span></>
          ) : (
            <><span className="text-emerald-400 font-semibold">$199</span><span className="text-slate-500"> / KES 25,000</span></>
          )}.
        </p>
        
        {/* Value Props */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-12">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>95% Wise approval rate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Unlock Stripe access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>48hr delivery</span>
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/company-formation')}
            className="px-10 py-4 bg-emerald-600 text-white hover:bg-emerald-500 font-semibold rounded-full shadow-lg transition-all hover:scale-105 text-base"
          >
            Start Your UK Company
          </button>
          <button
            onClick={() => navigate('/address-verification')}
            className="px-10 py-4 bg-transparent border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-full transition-all text-base"
          >
            Try Free Tools
          </button>
        </div>

        {/* Subtle text */}
        <p className="mt-8 text-sm text-slate-500">
          {isKenyan ? 'KES 25,000' : '$199'} • No hidden fees • Certificate in 48 hours
        </p>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">Everything You Need<br />to Go Global</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Access the same tools and credibility as Silicon Valley startups—from anywhere in the world.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.href)}
              className="group relative p-8 bg-forest-900/50 hover:bg-forest-900 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
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
              
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{feature.description}</p>
              
              <div className="flex items-center text-sm font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Target Customers Section */}
      <TargetCustomersSection />

      {/* Trust/Stats Section */}
      <div className="border-y border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.8%</div>
            <div className="text-slate-400">Verification Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">48h</div>
            <div className="text-slate-400">Average Turnaround</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">Secure</div>
            <div className="text-slate-400">Bank-Grade Encryption</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Ready to go global?
        </h2>
        <p className="text-xl text-slate-400 mb-10">
          Join thousands of entrepreneurs worldwide building legitimate international businesses.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-12 py-5 bg-emerald-600 text-white hover:bg-emerald-500 font-bold rounded-full shadow-2xl transition-all duration-200 text-lg"
        >
          Create Free Account
        </button>
        <p className="mt-6 text-sm text-slate-500">No credit card required for basic tools.</p>
      </div>
    </div>
  );
}