import { useNavigate } from 'react-router-dom';
import { Globe, FileText, Package, Building2, CheckCircle, X } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';

export default function TargetCustomersSection() {
  const navigate = useNavigate();
  const { isKenyan } = useLocale();

  return (
    <section className="py-20 px-4 bg-forest-900/30">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">BUILT FOR ENTREPRENEURS</span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Built for Digital<br />Entrepreneurs
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Stop letting geography limit your business. We help you access the same tools and credibility that Silicon Valley startups take for granted.
          </p>
        </div>

        {/* Problem → Solution Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Freelancers */}
          <div className="group relative p-8 bg-forest-900/50 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Freelancer</h3>
              <p className="text-slate-400 text-sm mb-4">
                Earning $2,000+/month from Upwork or Fiverr but can't get paid properly.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">PayPal freezes your account</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">Can't open Wise without UK company</span>
                </div>
                <div className="h-px bg-emerald-500/10 my-3" />
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-400 font-medium">UK company → Wise Business → Get paid in 30+ currencies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: E-commerce */}
          <div className="group relative p-8 bg-forest-900/50 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The E-commerce Seller</h3>
              <p className="text-slate-400 text-sm mb-4">
                Selling digital products or services globally but limited by payment options.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">Can't accept international cards</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">Stripe not available in your country</span>
                </div>
                <div className="h-px bg-emerald-500/10 my-3" />
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-400 font-medium">UK company → Stripe account → 80% approval rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Agency */}
          <div className="group relative p-8 bg-forest-900/50 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Agency Owner</h3>
              <p className="text-slate-400 text-sm mb-4">
                Running a digital agency but struggling to win international clients.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">Local address = less credibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-500">Can't compete on positioning</span>
                </div>
                <div className="h-px bg-emerald-500/10 my-3" />
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-400 font-medium">UK company + London address → Premium positioning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stats */}
        <div className="grid md:grid-cols-4 gap-6 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <div className="text-sm text-slate-400">Wise approval rate with UK company</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">80%</div>
            <div className="text-sm text-slate-400">Stripe success rate vs 0% direct</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">48hrs</div>
            <div className="text-sm text-slate-400">Average formation time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{isKenyan ? 'KES 25,000' : '$199'}</div>
            <div className="text-sm text-slate-400">Full service formation</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/company-formation')}
            className="px-10 py-4 bg-emerald-600 text-white hover:bg-emerald-500 font-semibold rounded-full shadow-lg transition-all hover:scale-105"
          >
            Start Your UK Company Formation
          </button>
          <p className="text-slate-500 text-sm mt-4">No hidden fees. Certificate delivered in 48 hours.</p>
        </div>
      </div>
    </section>
  );
}
