import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { enrollments: true, reviews: true } }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    const avgRating = course.reviews.length > 0
      ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
      : 0;

    return NextResponse.json({
      ...course,
      avgRating,
      studentCount: course._count.enrollments,
      reviewCount: course._count.reviews
    });
  } catch (error) {
    console.error('Error en GET course detail:', error);
    return NextResponse.json(
      { error: 'Error al obtener curso' },
      { status: 500 }
    );
  }
}
