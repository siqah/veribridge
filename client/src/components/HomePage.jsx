import { Shield, Building2, FileText, Mail, Key, MapPin, Package, Smartphone, Printer, Search, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const tools = [
    {
      id: 1,
      title: 'Address Architect',
      description: 'Format addresses for international KYC compliance',
      icon: MapPin,
      category: 'verification'
    },
    {
      id: 2,
      title: 'Verification Package',
      description: 'Generate Certificate, Affidavit & Cover Letter',
      icon: Package,
      category: 'verification',
      featured: true
    },
    {
      id: 3,
      title: 'Quick Update',
      description: 'Update bank profile via mobile app',
      icon: Smartphone,
      category: 'verification'
    },
    {
      id: 4,
      title: 'Bank Instructions',
      description: 'Generate PDF for the bank teller',
      icon: Printer,
      category: 'verification'
    },
    {
      id: 5,
      title: 'Affidavit Only',
      description: 'Generate sworn declaration of residence',
      icon: FileText,
      category: 'verification'
    },
    {
      id: 6,
      title: 'Validate Document',
      description: 'OCR scan before submitting',
      icon: Search,
      category: 'verification'
    },
  ];

  const businessServices = [
    {
      id: 'company-formation',
      title: 'Company Formation',
      description: 'Register UK Ltd or US LLC companies',
      icon: Building2,
      category: 'business'
    },
    {
      id: 'invoicing',
      title: 'Invoicing Tool',
      description: 'Professional invoices with KRA compliance',
      icon: FileText,
      category: 'business'
    },
    {
      id: 'mailbox',
      title: 'Digital Mailbox',
      description: 'Virtual address for correspondence',
      icon: Mail,
      category: 'business'
    },
    {
      id: 'api',
      title: 'API Access',
      description: 'Developer API for integrations',
      icon: Key,
      category: 'business'
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
             style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
          <Shield className="w-4 h-4" />
          <span>Digital Notary & Verification Platform</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          VeriBridge for Kenyan
          <br />
          <span style={{ color: 'var(--accent-blue)' }}>Freelancers & Developers</span>
        </h1>
        
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Format addresses for international KYC compliance. Generate verification documents 
          that pass Google Play Console, Amazon, PayPal, and 50+ platforms. Register companies, 
          manage invoices, and access business services—all in one platform.
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => onNavigate(1)}
            className="btn-primary inline-flex items-center gap-2"
          >
            Start Verification
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('company-formation')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            Explore Business Suite
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'var(--accent-blue-glow)' }}>
            <Shield className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            100% Private
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All processing happens locally. We never store or transmit your personal data.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle className="w-6 h-6" style={{ color: 'var(--success)' }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            KYC Compliant
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Documents formatted for international platforms and regulatory requirements.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Building2 className="w-6 h-6" style={{ color: 'var(--warning)' }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Business Suite
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Company formation, invoicing, virtual mailbox, and API access for developers.
          </p>
        </div>
      </div>

      {/* Verification Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6" 
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Verification Tools
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="card text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: tool.featured ? 'var(--accent-blue)' : 'var(--bg-secondary)' }}>
                    <Icon className="w-5 h-5" style={{ color: tool.featured ? '#ffffff' : 'var(--text-secondary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {tool.title}
                      {tool.featured && (
                        <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          MAIN
                        </span>
                      )}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tool.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Services */}
      <div>
        <h2 className="text-2xl font-bold mb-6" 
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Business Services
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {businessServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className="card text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--bg-secondary)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {service.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {service.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
