'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayPalReturnPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/checkout');
      return;
    }

    const capturePayment = async () => {
      try {
        const response = await fetch('/api/payment/paypal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypalOrderId: token }),
        });

        const data = await response.json();

        if (!response.ok) {
          router.push('/checkout?error=' + encodeURIComponent(data.error));
          return;
        }

        router.push(`/order-success?orderId=${data.orderId}`);
      } catch (error) {
        console.error('Error:', error);
        router.push('/checkout?error=Error+procesando+pago');
      }
    };

    capturePayment();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando tu pago con PayPal...</p>
      </div>
    </div>
  );
}
