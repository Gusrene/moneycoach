import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error al obtener token PayPal:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId requerido' },
        { status: 400 }
      );
    }

    // Obtener carrito del usuario
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: (session.user as any).id },
      include: { course: true }
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrito vacío' },
        { status: 400 }
      );
    }

    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.course.price * item.quantity), 0);

    // Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Crear orden en PayPal
    const paypalOrder = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total.toFixed(2)
                }
              }
            },
            items: cartItems.map(item => ({
              name: item.course.title,
              quantity: item.quantity.toString(),
              unit_amount: {
                currency_code: 'USD',
                value: item.course.price.toFixed(2)
              }
            }))
          }
        ],
        payer: {
          email_address: session.user?.email
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }
    );

    return NextResponse.json({
      id: paypalOrder.data.id,
      status: paypalOrder.data.status
    });

  } catch (error: any) {
    console.error('Error en PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear orden PayPal' },
      { status: 500 }
    );
  }
}

// Capturar pago de PayPal
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { paypalOrderId } = await req.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'paypalOrderId requerido' },
        { status: 400 }
      );
    }

    // Obtener carrito
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: (session.user as any).id },
      include: { course: true }
    });

    const total = cartItems.reduce((sum, item) => sum + (item.course.price * item.quantity), 0);

    // Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Capturar pago
    const captureResponse = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }
    );

    if (captureResponse.data.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pago no completado' },
        { status: 400 }
      );
    }

    // Crear orden en BD
    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        total,
        status: 'PAID',
        paymentMethod: 'paypal',
        transactionId: paypalOrderId,
        orderItems: {
          createMany: {
            data: cartItems.map(item => ({
              courseId: item.courseId,
              price: item.course.price
            }))
          }
        }
      }
    });

    // Crear inscripciones
    await Promise.all(
      cartItems.map(item =>
        prisma.enrollment.create({
          data: {
            userId: (session.user as any).id,
            courseId: item.courseId,
            progress: 0
          }
        }).catch(() => {})
      )
    );

    // Vaciar carrito
    await prisma.cartItem.deleteMany({
      where: { userId: (session.user as any).id }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      transactionId: paypalOrderId
    });

  } catch (error: any) {
    console.error('Error capturando pago PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Error al capturar pago' },
      { status: 500 }
    );
  }
}
