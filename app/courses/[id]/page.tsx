'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { FiArrowLeft, FiShoppingCart, FiClock, FiUsers, FiStar, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  level: string;
  duration: number;
  instructor: string;
  studentCount: number;
  avgRating: number;
  reviewCount: number;
  lessons: Array<{ id: string; title: string; content: string }>;
  reviews: Array<{ user: { name: string; avatar?: string }; rating: number; comment: string }>;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const { addToCart, loading: cartLoading } = useCart();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        if (!response.ok) throw new Error('Curso no encontrado');
        const data = await response.json();
        setCourse(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    await addToCart(params.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <Link href="/courses" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8">
            <FiArrowLeft className="w-5 h-5" />
            Volver a Cursos
          </Link>
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link href="/courses" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
            <FiArrowLeft className="w-5 h-5" />
            Volver a Cursos
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                {course.category}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-indigo-100 text-lg mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 fill-current" />
                  <span>{course.avgRating} ({course.reviewCount} reseñas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  <span>{course.studentCount} estudiantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  <span>{course.duration} horas</span>
                </div>
              </div>

              <p className="text-indigo-100 mt-4">
                Por: <span className="font-semibold">{course.instructor}</span>
              </p>
            </div>

            {/* Tarjeta de Compra */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Precio</p>
                <p className="text-3xl font-bold text-indigo-600">${course.price}</p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition mb-3 ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                <FiShoppingCart className="w-5 h-5" />
                {added ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}
              </button>

              <Link href="/cart" className="w-full btn-outline text-center block">
                Ver Carrito
              </Link>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Acceso de por vida a todos los materiales</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acerca del Curso
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Lecciones */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contenido del Curso
              </h2>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {lesson.content.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseñas */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reseñas de Estudiantes
              </h2>
              <div className="space-y-4">
                {course.reviews.length === 0 ? (
                  <p className="text-gray-600">
                    No hay reseñas aún. Sé el primero en reseñar este curso.
                  </p>
                ) : (
                  course.reviews.map((review, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.user.avatar && (
                            <img
                              src={review.user.avatar}
                              alt={review.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.user.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Lo que Aprenderás
              </h3>
              <ul className="space-y-3">
                {[
                  'Conceptos fundamentales de finanzas',
                  'Estrategias de inversión comprobadas',
                  'Gestión de presupuesto personal',
                  'Planificación de jubilación',
                  'Reducción de deudas'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Requisitos
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Sin requisitos previos necesarios</li>
                <li>• Solo se requiere curiosidad y ganas de aprender</li>
                <li>• Conexión a internet estable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
