import { Shield, CheckCircle, Globe, FileText, Zap, Users, ArrowRight } from 'lucide-react';

export default function HomePage({ onGetStarted }) {
  const stats = [
    { label: 'Countries Supported', value: '35+', icon: Globe },
    { label: 'Platforms Compatible', value: '50+', icon: CheckCircle },
    { label: 'Documents Generated', value: '∞', icon: FileText },
  ];
  
  const problems = [
    {
      title: 'P.O. Box Rejection',
      description: "Your address has a P.O. Box? Instant rejection from Google, Amazon, PayPal.",
    },
    {
      title: 'No Street Address',
      description: "Your national ID shows 'Nairobi County' but platforms want '123 Main Street'.",
    },
    {
      title: 'Document Mismatch',
      description: "Your bank statement address doesn't match the format platforms expect.",
    },
  ];
  
  const solutions = [
    {
      step: '1',
      title: 'Format Your Address',
      description: 'Convert your local address to international KYC-compliant format',
    },
    {
      step: '2',
      title: 'Generate Documents',
      description: 'Get Certificate, Affidavit & Cover Letter with unique verification ID',
    },
    {
      step: '3',
      title: 'Submit & Get Verified',
      description: 'Submit to Google Play, Amazon, PayPal and get approved',
    },
  ];
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm mb-6">
          <Globe className="w-4 h-4" />
          <span>Works in 35+ countries worldwide</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Stop Getting <span className="text-red-400">Rejected</span>.
          <br />
          Start Getting <span className="text-green-400">Verified</span>.
        </h1>
        
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          VeriBridge helps developers from the Global South format their addresses 
          and generate verification documents that pass Google Play Console, 
          Amazon, PayPal, and 50+ platform checks.
        </p>
        
        <button
          onClick={onGetStarted}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          100% free • No signup required • Works offline
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>
      
      {/* The Problem */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">✗</span> The Problem
        </h2>
        <div className="grid gap-3">
          {problems.map((problem) => (
            <div 
              key={problem.title}
              className="p-4 rounded-lg border border-red-500/30 bg-red-500/5"
            >
              <h3 className="font-semibold text-white mb-1">{problem.title}</h3>
              <p className="text-sm text-gray-400">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* The Solution */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">✓</span> The Solution
        </h2>
        <div className="space-y-4">
          {solutions.map((solution) => (
            <div 
              key={solution.step}
              className="flex gap-4 p-4 rounded-lg"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{solution.step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{solution.title}</h3>
                <p className="text-sm text-gray-400">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Trust Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-center">
        <Shield className="w-10 h-10 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">100% Private & Secure</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          All processing happens locally in your browser. We never store, 
          transmit, or access your personal information. Your documents 
          stay on your device.
        </p>
      </div>
      
      {/* CTA */}
      <div className="text-center pb-8">
        <button
          onClick={onGetStarted}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Start Verification Now
        </button>
      </div>
    </div>
  );
}
