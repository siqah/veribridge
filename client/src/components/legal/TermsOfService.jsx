import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: December 17, 2024
          </p>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>1. Agreement to Terms</h2>
            <p>
              By accessing and using VeriBridge ("Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>2. Service Description</h2>
            <p>VeriBridge provides the following services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Address Architect:</strong> Kenya address verification and formatting</li>
              <li><strong>Company Formation:</strong> UK Ltd and US LLC registration services</li>
              <li><strong>Digital Mailbox:</strong> Virtual business address and mail management</li>
              <li><strong>Business Tools:</strong> Invoicing and KRA-compliant documentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>3. User Obligations</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the Service for lawful purposes only</li>
              <li>Not engage in fraudulent activities</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>4. Payment Terms</h2>
            <p>
              All payments are processed through Paystack, our secure payment provider. Pricing is as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>UK Company Formation: KES 20,000 (one-time)</li>
              <li>US Company Formation: KES 25,000 (one-time)</li>
              <li>Address Verification: KES 500 (one-time)</li>
              <li>Digital Mailbox Basic: KES 2,000/month</li>
              <li>Digital Mailbox Pro: KES 5,000/month</li>
            </ul>
            <p className="mt-4">
              <strong>Refund Policy:</strong> Refunds are available only if your company formation is rejected 
              by the registry. Once processing has begun, payments are non-refundable. Subscription services 
              can be cancelled at any time without penalty.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>5. Company Formation Services</h2>
            <p>
              VeriBridge acts as a filing assistant and partners with authorized formation agents (1st Formations 
              for UK, Northwest Registered Agent for US). We are not a law firm and do not provide legal advice.
            </p>
            <p className="mt-4">
              Processing times: UK formations typically take 1-3 business days; US formations take 3-5 business days. 
              These are estimates and may vary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>6. Digital Mailbox Services</h2>
            <p>
              Mail scanning and forwarding services are subject to availability. We will make reasonable efforts 
              to scan and forward mail promptly but are not liable for delays caused by postal services or 
              circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>7. Limitation of Liability</h2>
            <p>
              VeriBridge is not liable for any indirect, incidental, special, or consequential damages arising 
              from your use of the Service. Our total liability shall not exceed the amount paid for the specific 
              service in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>8. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on VeriBridge are owned by VeriBridge or its 
              licensors. You may not copy, reproduce, or distribute our content without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time for violation 
              of these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>12. Contact Us</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:support@veribadge.co.ke" className="text-blue-400 hover:underline">support@veribadge.co.ke</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
