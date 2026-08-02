'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import Link from 'next/link';
import { FiArrowLeft, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { loadStripe } from '@stripe/js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8">
            <FiArrowLeft className="w-5 h-5" />
            Volver atrás
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">No hay artículos en el carrito</p>
            <Link href="/courses" className="btn-primary">
              Ver Cursos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <Link href="/cart" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8">
          <FiArrowLeft className="w-5 h-5" />
          Volver al carrito
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario de Pago */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Completa tu Pago
            </h1>

            <Elements stripe={stripePromise}>
              <PaymentForm total={total} session={session} clearCart={clearCart} />
            </Elements>
          </div>

          {/* Resumen */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.course.title}</span>
                    <span className="font-semibold">${(item.course.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Impuestos:</span>
                  <span>${(total * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${(total * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <FiLock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Tus datos están protegidos con encriptación SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaymentFormProps {
  total: number;
  session: any;
  clearCart: () => void;
}

function PaymentForm({ total, session, clearCart }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { paymentMethod: pm } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (!pm) throw new Error('Failed to create payment method');

      const response = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pm.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al procesar pago');
        return;
      }

      setSuccess('¡Pago realizado exitosamente!');
      clearCart();
      setTimeout(() => {
        router.push(`/order-success?orderId=${data.orderId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Crear orden en PayPal
      const createResponse = await fetch('/api/payment/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: 'temp' }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        setError(createData.error || 'Error al crear orden');
        return;
      }

      // Redirigir a PayPal para confirmar
      const approveLink = createData.links?.find((link: any) => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      }
    } catch (err: any) {
      setError(err.message || 'Error con PayPal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (paymentMethod === 'stripe') {
      handleStripePayment(e);
    } else {
      handlePayPalPayment(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Datos de Facturación */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Datos de Facturación
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={session.user?.name || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={session.user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Método de Pago
        </h2>

        <div className="space-y-4">
          {/* Stripe */}
          <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            paymentMethod === 'stripe'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-gray-900">Tarjeta de Crédito</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
              </div>
            </div>
          </label>

          {/* PayPal */}
          <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            paymentMethod === 'paypal'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-gray-900">PayPal</p>
                <p className="text-sm text-gray-600">Paga de forma segura con tu cuenta PayPal</p>
              </div>
            </div>
          </label>
        </div>

        {/* Stripe Card Input */}
        {paymentMethod === 'stripe' && (
          <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Procesando...
          </>
        ) : (
          <>
            <FiLock className="w-5 h-5" />
            Pagar ${(total * 1.1).toFixed(2)}
          </>
        )}
      </button>

      {/* Security Info */}
      <p className="text-center text-xs text-gray-600">
        Al hacer clic en "Pagar", aceptas nuestros{' '}
        <Link href="/terms" className="text-indigo-600 hover:underline">
          Términos de Servicio
        </Link>
      </p>
    </form>
  );
}
