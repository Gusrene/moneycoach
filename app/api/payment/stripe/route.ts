import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();

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
    const amountInCents = Math.round(total * 100);

    // Crear pago en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        userId: (session.user as any).id,
        email: session.user?.email,
      }
    });

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Pago no procesado' },
        { status: 400 }
      );
    }

    // Crear orden en la BD
    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        total,
        status: 'PAID',
        paymentMethod: 'stripe',
        transactionId: paymentIntent.id,
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
        }).catch(() => {
          // Si ya existe la inscripción, ignorar
        })
      )
    );

    // Vaciar carrito
    await prisma.cartItem.deleteMany({
      where: { userId: (session.user as any).id }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      transactionId: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Error en pago Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar pago' },
      { status: 500 }
    );
  }
}
