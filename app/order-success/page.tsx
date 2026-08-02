'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiDownload, FiBook } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container-custom max-w-2xl">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Completado!
          </h1>
          <p className="text-gray-600 mb-8">
            Tu compra ha sido procesada exitosamente. Ahora tienes acceso a todos tus cursos.
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <p className="text-sm text-gray-600 mb-1">Número de Orden:</p>
              <p className="text-lg font-mono font-bold text-gray-900 break-all">
                {orderId}
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 justify-center mb-2">
                <FiBook className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Tus Cursos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Accede inmediatamente a todos tus cursos comprados
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3 justify-center mb-2">
                <FiDownload className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Materiales</h3>
              </div>
              <p className="text-sm text-gray-600">
                Descarga todos los materiales y recursos disponibles
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard/courses" className="btn-primary w-full block">
              Ver Mis Cursos
            </Link>
            <Link href="/courses" className="btn-outline w-full block">
              Explorar Más Cursos
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Se ha enviado un email de confirmación a tu dirección de correo.
            </p>
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda?{' '}
              <Link href="/contact" className="text-indigo-600 hover:underline">
                Contacta a nuestro equipo
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-2xl font-bold text-indigo-600 mb-2">👥</p>
              <h3 className="font-semibold text-gray-900 mb-2">
                Comunidad Activa
              </h3>
              <p className="text-sm text-gray-600">
                Únete a miles de estudiantes compartiendo experiencias
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-2xl font-bold text-indigo-600 mb-2">🎓</p>
              <h3 className="font-semibold text-gray-900 mb-2">
                Certificados
              </h3>
              <p className="text-sm text-gray-600">
                Obtén certificados reconocidos al completar cursos
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-2xl font-bold text-indigo-600 mb-2">♾️</p>
              <h3 className="font-semibold text-gray-900 mb-2">
                Acceso de Por Vida
              </h3>
              <p className="text-sm text-gray-600">
                Mantén acceso permanente a los materiales
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
