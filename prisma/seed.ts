import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Crear usuarios de prueba
  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@moneycoach.com',
      name: 'Admin MoneyCoach',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@moneycoach.com',
      name: 'Juan Instructor',
      password: await hashPassword('Instructor123!'),
      role: 'INSTRUCTOR'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'usuario1@example.com',
      name: 'Carlos Gómez',
      password: userPassword,
      role: 'USER'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'usuario2@example.com',
      name: 'María García',
      password: userPassword,
      role: 'USER'
    }
  });

  console.log('✅ Usuarios creados');

  // Crear cursos
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Finanzas Personales 101',
        description: 'Aprende los fundamentos de la gestión financiera personal. Domina presupuestos, ahorro e inversión básica.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1554224311-beee415c201f?ixlib=rb-4.0.3&w=500',
        category: 'Finanzas Personales',
        level: 'Principiante',
        duration: 20,
        instructor: 'Juan Instructor'
      }
    }),

    prisma.course.create({
      data: {
        title: 'Inversión en Bolsa para Principiantes',
        description: 'Guía completa para invertir en la bolsa de valores. Entiende acciones, ETFs y diversificación.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1611432824582-6b68efb1d0bb?ixlib=rb-4.0.3&w=500',
        category: 'Inversión',
        level: 'Intermedio',
        duration: 35,
        instructor: 'Juan Instructor'
      }
    }),

    prisma.course.create({
      data: {
        title: 'Criptomonedas Explicado',
        description: 'Entiende Bitcoin, Ethereum y el futuro de las finanzas descentralizadas.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1605792657692-d3a93e776d85?ixlib=rb-4.0.3&w=500',
        category: 'Criptomonedas',
        level: 'Intermedio',
        duration: 25,
        instructor: 'Juan Instructor'
      }
    }),

    prisma.course.create({
      data: {
        title: 'Emprendimiento: De Idea a Negocio',
        description: 'Convierte tu idea en un negocio rentable. Aprende sobre modelos de negocio y financiamiento.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&w=500',
        category: 'Emprendimiento',
        level: 'Intermedio',
        duration: 40,
        instructor: 'Juan Instructor'
      }
    }),

    prisma.course.create({
      data: {
        title: 'Planificación de Retiro',
        description: 'Planifica un retiro seguro y cómodo. Estrategias de ahorro e inversión a largo plazo.',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&w=500',
        category: 'Retiro',
        level: 'Avanzado',
        duration: 30,
        instructor: 'Juan Instructor'
      }
    }),

    prisma.course.create({
      data: {
        title: 'Seguros: Protege tu Patrimonio',
        description: 'Entiende los tipos de seguros y cómo elegir los adecuados para tu situación.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&w=500',
        category: 'Seguros',
        level: 'Principiante',
        duration: 15,
        instructor: 'Juan Instructor'
      }
    })
  ]);

  console.log('✅ Cursos creados');

  // Crear lecciones para cada curso
  for (const course of courses) {
    const lessonTitles: Record<string, string[]> = {
      'Finanzas Personales 101': [
        'Introducción a las finanzas personales',
        'Presupuesto básico',
        'Ahorro efectivo',
        'Gestión de deudas'
      ],
      'Inversión en Bolsa para Principiantes': [
        'Conceptos básicos de la bolsa',
        'Tipos de acciones',
        'ETFs y fondos mutuos',
        'Diversificación',
        'Análisis fundamental'
      ],
      'Criptomonedas Explicado': [
        '¿Qué es Bitcoin?',
        'Ethereum y contratos inteligentes',
        'Wallets y seguridad',
        'Trading de criptomonedas',
        'Regulación y futuro'
      ],
      'Emprendimiento: De Idea a Negocio': [
        'Validación de ideas',
        'Modelos de negocio',
        'Plan de negocio',
        'Financiamiento',
        'Escalamiento'
      ],
      'Planificación de Retiro': [
        'Cálculo de necesidades',
        'Planes de retiro 401k',
        'Inversiones de largo plazo',
        'Tributación',
        'Estrategia integral'
      ],
      'Seguros: Protege tu Patrimonio': [
        'Tipos de seguros',
        'Seguro de vida',
        'Seguros de propiedad',
        'Cómo elegir el correcto'
      ]
    };

    const titles = lessonTitles[course.title] || [];
    for (let i = 0; i < titles.length; i++) {
      await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: titles[i],
          content: `Contenido de la lección: ${titles[i]}. Este es el material educativo que aprenderás en esta sección.`,
          videoUrl: `https://example.com/videos/${course.id}-lesson-${i + 1}`,
          order: i + 1
        }
      });
    }
  }

  console.log('✅ Lecciones creadas');

  // Crear inscripciones
  for (let i = 0; i < courses.length; i++) {
    if (i % 2 === 0) {
      await prisma.enrollment.create({
        data: {
          userId: user1.id,
          courseId: courses[i].id,
          progress: Math.floor(Math.random() * 100)
        }
      });
    } else {
      await prisma.enrollment.create({
        data: {
          userId: user2.id,
          courseId: courses[i].id,
          progress: Math.floor(Math.random() * 100)
        }
      });
    }
  }

  console.log('✅ Inscripciones creadas');

  // Crear reseñas
  for (const course of courses) {
    for (let i = 0; i < 3; i++) {
      const user = i % 2 === 0 ? user1 : user2;
      await prisma.review.create({
        data: {
          userId: user.id,
          courseId: course.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 o 5 estrellas
          comment: 'Excelente curso, muy bien explicado y práctico. Recomendado.'
        }
      });
    }
  }

  console.log('✅ Reseñas creadas');

  // Crear órdenes de prueba
  const order = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 129.98,
      status: 'PAID',
      paymentMethod: 'stripe',
      transactionId: 'pi_test_12345',
      orderItems: {
        createMany: {
          data: [
            { courseId: courses[0].id, price: courses[0].price },
            { courseId: courses[1].id, price: courses[1].price }
          ]
        }
      }
    }
  });

  console.log('✅ Órdenes creadas');

  console.log('🎉 ¡Seed completado exitosamente!');
  console.log('\n📋 Cuentas de prueba:');
  console.log('├─ Admin: admin@moneycoach.com / Admin123!');
  console.log('├─ Instructor: instructor@moneycoach.com / Instructor123!');
  console.log('├─ Usuario 1: usuario1@example.com / User123!');
  console.log('└─ Usuario 2: usuario2@example.com / User123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
