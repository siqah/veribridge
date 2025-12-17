import { usePaystackPayment } from 'react-paystack';
import { Loader2 } from 'lucide-react';

export default function PaystackCheckout({ amount, email, metadata, onSuccess, onClose, buttonText = 'Pay Now' }) {
  const config = {
    reference: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    amount: amount * 100, // Paystack uses kobo/cents (KES 500 = 50000)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    currency: 'KES',
    channels: ['card', 'mobile_money'], // M-PESA + Cards
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: 'Order Type',
          variable_name: 'order_type',
          value: metadata.orderType || 'GENERAL'
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    initializePayment({
      onSuccess: (reference) => {
        console.log('Payment successful:', reference);
        onSuccess?.(reference);
      },
      onClose: () => {
        console.log('Payment popup closed');
        onClose?.();
      }
    });
  };

  return (
    <button
      onClick={handlePayment}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      {buttonText}
      <span className="text-xs opacity-75">(M-PESA or Card)</span>
    </button>
  );
}
