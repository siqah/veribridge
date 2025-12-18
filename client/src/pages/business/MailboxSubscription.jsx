import { useState } from 'react';
import { MapPin, CreditCard, Check } from 'lucide-react';
import PaystackCheckout from '../../components/PaystackCheckout';

const LOCATIONS = [
  {
    code: 'LONDON',
    name: 'London, United Kingdom',
    address: '123 Regent Street, London, W1B 4HZ',
    flag: '🇬🇧',
    description: 'Perfect for UK companies and EU clients'
  },
  {
    code: 'NAIROBI',
    name: 'Nairobi, Kenya',
    address: 'Westlands Office Park, Waiyaki Way, Nairobi',
    flag: '🇰🇪',
    description: 'Ideal for East African businesses'
  },
  {
    code: 'DELAWARE',
    name: 'Wilmington, Delaware, USA',
    address: '123 Corporation Boulevard, Wilmington, DE 19801',
    flag: '🇺🇸',
    description: 'For US LLCs and C-Corps'
  }
];

const TIERS = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 2000,
    currency: 'KES',
    features: [
      '10 mail scans per month',
      '30 days mail holding',
      'Email notifications',
      'Standard forwarding (extra cost)'
    ]
  },
  {
    id: 'PRO',
    name: 'Professional',
    price: 5000,
    currency: 'KES',
    recommended: true,
    features: [
      'Unlimited mail scans',
      '60 days mail holding',
      'Email + SMS notifications',
      'Free local forwarding',
      'Priority support'
    ]
  }
];

export default function MailboxSubscription({ onSubscribe, onCancel }) {
  const [selectedLocation, setSelectedLocation] = useState('NAIROBI');
  const [selectedTier, setSelectedTier] = useState('PRO');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async (reference) => {
    setIsProcessing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const userId = 'user_123'; // In production, get from auth context

      // Verify payment
      await fetch(`${API_URL}/api/payments/paystack/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.reference,
          orderType: 'MAILBOX_SUBSCRIPTION'
        })
      });

      // Create subscription
      const response = await fetch(`${API_URL}/api/mailbox/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          location: selectedLocation,
          tier: selectedTier,
          paymentRef: reference.reference
        })
      });

      const data = await response.json();

      if (data.success) {
        onSubscribe?.(data.subscription);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLocationData = LOCATIONS.find(l => l.code === selectedLocation);
  const selectedTierData = TIERS.find(t => t.id === selectedTier);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscribe to Digital Mailbox</h1>
        <p className="text-gray-400">Get a professional business address anywhere in the world</p>
      </div>

      {/* Location Selection */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Choose Your Location</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOCATIONS.map(location => (
            <button
              key={location.code}
              onClick={() => setSelectedLocation(location.code)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedLocation === location.code
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{location.flag}</div>
              <h3 className="font-semibold text-white mb-1">{location.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{location.address}</p>
              <p className="text-xs text-gray-500">{location.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tier Selection */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Choose Your Plan</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIERS.map(tier => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`p-6 rounded-lg border-2 transition-all text-left relative ${
                selectedTier === tier.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  Recommended
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold text-blue-400 mb-4">
                {tier.currency} {tier.price.toLocaleString()}
                <span className="text-sm text-gray-400 font-normal">/month</span>
              </div>
              <ul className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
           </button>
          ))}
        </div>
      </div>

      {/* Summary & Subscribe */}
      <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Location:</span>
            <span className="text-white font-medium">{selectedLocationData?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Virtual Address:</span>
            <span className="text-white font-medium text-right">{selectedLocationData?.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Plan:</span>
            <span className="text-white font-medium">{selectedTierData?.name}</span>
          </div>
          <div className="h-px bg-gray-700 my-4" />
          <div className="flex justify-between">
            <span className="text-white font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-400">
              KES {selectedTierData?.price.toLocaleString()}/mo
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <PaystackCheckout
            amount={selectedTierData?.price || 2000}
            email="user@example.com"
            metadata={{
              orderType: 'MAILBOX_SUBSCRIPTION',
              location: selectedLocation,
              tier: selectedTier,
              address: selectedLocationData?.address
            }}
            onSuccess={handlePaymentSuccess}
            onClose={() => console.log('Payment cancelled')}
            buttonText={`Pay KES ${selectedTierData?.price.toLocaleString()}`}
          />
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          7-day free trial • Cancel anytime • Secure payment
        </p>
      </div>
    </div>
  );
}
