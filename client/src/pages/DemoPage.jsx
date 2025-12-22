import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Download, ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  const navigate = useNavigate();

  const sampleDocs = [
    {
      title: 'Verified Kenyan Address',
      description: 'See how we transform informal addresses into globally-accepted formats',
      badge: 'Sample',
      preview: {
        before: 'P.O. Box 1234, Near Makina Mosque, Nairobi',
        after: 'Makina Building, Sheikh Mahmoud Rd\nKibra, Nairobi, 00504\nKenya'
      }
    },
    {
      title: 'KYC Verification Package',
      description: 'Complete document bundle ready for international platforms',
      badge: 'Bundle',
      items: [
        'Formatted Residential Address',
        'Utility Bill Verification',
        'Government ID Confirmation',
        'Digital Compliance Certificate'
      ]
    },
    {
      title: 'UK Company Certificate',
      description: 'Companies House registration certificate (sample)',
      badge: 'UK Ltd',
      items: [
        'Company Number: 12345678',
        'Registered Address: London, UK',
        'Certificate of Incorporation',
        'Digital Verification Seal'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Sample Documents</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See What You'll Get
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            These are real examples of the documents we create. Your actual documents will be personalized with your information.
          </p>
        </div>

        {/* Sample Documents */}
        <div className="space-y-8">
          {sampleDocs.map((doc, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{doc.title}</h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                      {doc.badge}
                    </span>
                  </div>
                  <p className="text-slate-400">{doc.description}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>

              {doc.preview && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6">
                    <div className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">
                      ❌ Gets Rejected
                    </div>
                    <p className="text-slate-300 font-mono text-sm">{doc.preview.before}</p>
                  </div>

                  {/* After */}
                  <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-6">
                    <div className="text-xs font-semibold text-green-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verified Format
                    </div>
                    <p className="text-white font-mono text-sm whitespace-pre-line">{doc.preview.after}</p>
                  </div>
                </div>
              )}

              {doc.items && (
                <div className="space-y-3">
                  {doc.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Your Documents?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Create your free account and start generating verified documents in minutes
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
          >
            Get Started Free
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
