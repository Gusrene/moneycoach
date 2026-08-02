'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  level: string;
  studentCount: number;
  avgRating: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Finanzas Personales',
    'Inversión',
    'Emprendimiento',
    'Criptomonedas',
    'Seguros',
    'Retiro'
  ];

  const levels = ['Principiante', 'Intermedio', 'Avanzado'];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(category && { category }),
        ...(level && { level }),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sort
      });

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();

      setCourses(data.courses);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, category, level, priceRange, sort]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setPriceRange([0, 200]);
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nuestros Cursos
          </h1>
          <p className="text-gray-600">
            Explora {total} cursos de educación financiera
          </p>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 md:hidden"
            >
              <FiFilter className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filtros - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                {(category || level || search || sort !== 'newest') && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Categoría */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Categoría</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                    {category && (
                      <button
                        onClick={() => {
                          setCategory('');
                          setPage(1);
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Nivel */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Nivel</h3>
                  <div className="space-y-2">
                    {levels.map(lv => (
                      <label key={lv} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          value={lv}
                          checked={level === lv}
                          onChange={(e) => {
                            setLevel(e.target.value);
                            setPage(1);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{lv}</span>
                      </label>
                    ))}
                    {level && (
                      <button
                        onClick={() => {
                          setLevel('');
                          setPage(1);
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Precio</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([priceRange[0], parseInt(e.target.value)]);
                        setPage(1);
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Ordenar */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Ordenar por</h3>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  >
                    <option value="newest">Más Recientes</option>
                    <option value="popular">Más Populares</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros - Mobile */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40 p-4">
              <div className="bg-white rounded-lg p-6 max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Categoría */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Categoría</h3>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                        setShowFilters(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Todas</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nivel */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Nivel</h3>
                    <select
                      value={level}
                      onChange={(e) => {
                        setLevel(e.target.value);
                        setPage(1);
                        setShowFilters(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Todos</option>
                      {levels.map(lv => (
                        <option key={lv} value={lv}>{lv}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cursos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  No se encontraron cursos
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn-primary"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {courses.map(course => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      price={course.price}
                      level={course.level}
                      students={course.studentCount}
                      rating={parseFloat(course.avgRating as any)}
                      image={course.image}
                    />
                  ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 rounded-lg ${
                          page === i + 1
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 hover:border-indigo-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / 12)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
