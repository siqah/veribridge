import { useNavigate } from 'react-router-dom';
import { Mail, Package, Globe, Shield, Clock, CreditCard, CheckCircle, ArrowRight, ChevronDown, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function MailboxInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubscribe = () => {
    if (user) {
      navigate('/mailbox/subscribe');
    } else {
      navigate('/signup?redirect=/mailbox/subscribe');
    }
  };

  const features = [
    {
      icon: Mail,
      title: 'Government Mail Scanning',
      description: 'HMRC tax codes, Companies House authentication codes, official notices scanned and uploaded within 24-48 hours',
      color: 'blue'
    },
    {
      icon: Package,
      title: 'Secure Storage',
      description: 'Mail stored for 30 days, digital copies available forever, option to request physical forwarding',
      color: 'purple'
    },
    {
      icon: Building2,
      title: 'Business Credibility',
      description: 'Listed on company registration, use for bank accounts, professional correspondence, UK presence',
      color: 'emerald'
    },
    {
      icon: Globe,
      title: 'Dashboard Access',
      description: 'View all mail online, request scans or forwards, download PDF copies, manage notifications',
      color: 'orange'
    },
  ];

  const steps = [
    { number: '1', title: 'Subscribe', description: 'Choose your plan, pay KES 500/month' },
    { number: '2', title: 'Activate', description: 'Receive your London address instantly' },
    { number: '3', title: 'Use It', description: 'Add to company docs, bank forms, invoices' },
    { number: '4', title: 'Manage', description: 'View scans and request forwards from dashboard' },
  ];

  const faqs = [
    {
      question: 'Can I use this for company registration?',
      answer: 'Yes! Our address is approved for Companies House registration and can be used as your official business address.'
    },
    {
      question: 'How quickly will I receive mail scans?',
      answer: 'Usually within 24 hours of arrival. You\'ll get an email notification as soon as new mail arrives.'
    },
    {
      question: 'What happens to physical mail?',
      answer: 'Mail is stored securely for 30 days, then securely shredded (unless you request forwarding). You can request forwarding anytime.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, monthly subscription with no lock-in contract. Cancel anytime from your dashboard.'
    },
    {
      question: 'Do you handle packages?',
      answer: 'Yes! We accept packages and parcels. Forwarding fees apply based on weight and destination.'
    },
    {
      question: 'Is this a real physical address?',
      answer: 'Yes! 71-75 Shelton Street is a real building in Covent Garden, Central London. Your mail goes to an actual location.'
    },
  ];

  return (
    <div className="min-h-screen bg-forest-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-8">
              <Mail className="w-4 h-4" />
              <span>PROFESSIONAL UK ADDRESS</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Your Business Address<br />in Central London
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Get official UK government mail (HMRC & Companies House) scanned and uploaded to your dashboard. Perfect for company directors who need a UK address.
            </p>

            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-4 bg-forest-900/50 border border-emerald-500/10 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">📍</div>
                <div className="text-sm text-slate-400">Covent Garden</div>
              </div>
              <div className="p-4 bg-forest-900/50 border border-emerald-500/10 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">🏛️</div>
                <div className="text-sm text-slate-400">Gov't Mail Only</div>
              </div>
              <div className="p-4 bg-forest-900/50 border border-emerald-500/10 rounded-xl">
                <div className="text-2xl font-bold text-emerald-400 mb-1">KES 500</div>
                <div className="text-sm text-slate-400">/month</div>
              </div>
              <div className="p-4 bg-forest-900/50 border border-emerald-500/10 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">⚡</div>
                <div className="text-sm text-slate-400">5 min setup</div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              className="px-10 py-4 bg-emerald-600 text-white hover:bg-emerald-500 font-semibold rounded-full shadow-lg transition-all hover:scale-105 text-base inline-flex items-center gap-2"
            >
              Get Your London Address
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Trust indicator */}
            <p className="mt-6 text-sm text-slate-500">
              Trusted by 200+ digital businesses worldwide • No contracts • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="py-20 px-6 bg-forest-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold text-white mb-6">
                Why You Need a<br />UK Business Address
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-slate-300">Can't register for UK services with foreign address</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-slate-300">Physical office in London costs £500-2000/month</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-slate-300">No professional UK presence for clients</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <p className="text-slate-300">Can't receive business mail securely</p>
                </div>
              </div>
            </div>
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <h3 className="text-2xl font-bold text-emerald-300 mb-4">Our Solution</h3>
              <p className="text-lg text-slate-300 mb-6">
                Real London address + professional mail handling service for just <span className="text-emerald-400 font-bold">KES 500/month</span>
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>71-75 Shelton Street, Covent Garden</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>Mail scanning & worldwide forwarding</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>Use for company registration & banking</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>Online dashboard 24/7 access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg">Professional mail handling for modern businesses</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-forest-900/50 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6 bg-forest-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get started in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-400 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-emerald-500/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Standard Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-emerald-400">KES 500</span>
                  <span className="text-slate-400">/month</span>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className="mt-6 md:mt-0 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-500 font-semibold rounded-full transition-all"
              >
                Subscribe Now
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">London business address (71-75 Shelton Street)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Mail scan notifications</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Up to 5 scans/month</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Worldwide forwarding available</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">30-day mail storage</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Online dashboard access</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-500/20">
              <p className="text-sm text-slate-400 mb-3">Add-ons (pay-as-you-go):</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-slate-300">
                  <span className="text-emerald-400 font-semibold">KES 50</span> per extra scan
                </div>
                <div className="text-slate-300">
                  <span className="text-emerald-400 font-semibold">From KES 1,000</span> package forwarding
                </div>
                <div className="text-slate-300">
                  <span className="text-emerald-400 font-semibold">KES 300/mo</span> UK phone number
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            Compare: Physical London office £500-2000/month • Virtual office £30-50/month • VeriBridge ~£3/month
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-6 bg-forest-900/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-forest-900/50 border border-emerald-500/10 rounded-xl"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-4 text-slate-400 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-5xl font-bold text-white mb-6">
            Join 200+ Businesses with a London Presence
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            No contracts. Cancel anytime. First month guaranteed.
          </p>
          <button
            onClick={handleSubscribe}
            className="px-12 py-5 bg-emerald-600 text-white hover:bg-emerald-500 font-bold rounded-full shadow-2xl transition-all hover:scale-105 text-lg inline-flex items-center gap-2"
          >
            Start Your Subscription — KES 500/mo
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="mt-6 text-sm text-slate-500">
            Setup in 5 minutes • Use immediately • Full refund if not satisfied
          </p>
        </div>
      </div>
    </div>
  );
}
