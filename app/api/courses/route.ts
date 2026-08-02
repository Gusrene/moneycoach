import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
      ...(level && { level }),
      price: { gte: minPrice, lte: maxPrice }
    };

    // Ordenamiento
    const orderBy: any = {};
    switch (sort) {
      case 'price-low':
        orderBy.price = 'asc';
        break;
      case 'price-high':
        orderBy.price = 'desc';
        break;
      case 'popular':
        orderBy.enrollments = { _count: 'desc' };
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
    }

    // Obtener cursos
    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } }
      },
      orderBy,
      skip,
      take: limit
    });

    // Calcular rating promedio
    const coursesWithRating = courses.map(course => ({
      ...course,
      avgRating: course.reviews.length > 0
        ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
        : 0,
      studentCount: course._count.enrollments
    }));

    // Total de cursos
    const total = await prisma.course.count({ where });

    return NextResponse.json({
      courses: coursesWithRating,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error en GET courses:', error);
    return NextResponse.json(
      { error: 'Error al obtener cursos' },
      { status: 500 }
    );
  }
}
