import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: December 17, 2024
          </p>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>1. Introduction</h2>
            <p>
              VeriBridge ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, and safeguard your personal information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, phone number</li>
              <li>Residential address (for company formation)</li>
              <li>Identity documents (for KYC verification)</li>
              <li>Payment information (processed by Paystack - we don't store card details)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address, browser type, device information</li>
              <li>Pages visited, time spent on site</li>
              <li>Referral source</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>Cookies</h3>
            <p>
              We use cookies to maintain your session and improve user experience. You can disable cookies in 
              your browser settings, but this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process company formation orders</li>
              <li>Manage digital mailbox services</li>
              <li>Send order updates and notifications</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations (KYC/AML)</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>4. Information Sharing</h2>
            <p>We share your information with:</p>
            
            <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Paystack:</strong> Payment processing</li>
              <li><strong>1st Formations:</strong> UK company formation</li>
              <li><strong>Northwest Registered Agent:</strong> US company formation</li>
              <li><strong>Email Service:</strong> Transactional emails</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or government regulation, 
              including KYC/AML compliance.
            </p>

            <p className="mt-4">
              <strong>We never sell your personal information to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AES-256 encryption for sensitive data</li>
              <li>HTTPS/TLS for data transmission</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee 
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide services and comply 
              with legal obligations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information: Until account deletion + 90 days</li>
              <li>Order history: 7 years (tax/legal requirements)</li>
              <li>KYC documents: 5 years (AML regulations)</li>
              <li>Email communications: 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>7. Your Rights (GDPR/Kenya DPA)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Restriction:</strong> Request limited processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@veribadge.co.ke" className="text-blue-400 hover:underline">privacy@veribadge.co.ke</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>8. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside Kenya (e.g., UK, US) for 
              company formation services. We ensure appropriate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>9. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 18. We do not knowingly collect information 
              from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              via email or prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>11. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:privacy@veribadge.co.ke" className="text-blue-400 hover:underline">privacy@veribadge.co.ke</a><br/>
              Address: Nairobi, Kenya
            </p>
          </section>

          <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-sm">
              <strong>Data Protection Officer:</strong> For GDPR-related inquiries, contact our DPO at 
              <a href="mailto:dpo@veribadge.co.ke" className="text-blue-400 hover:underline ml-1">dpo@veribadge.co.ke</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
