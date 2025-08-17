import { useState, useEffect } from 'react';

export default function OperacionModal({ isOpen, onClose, operacionId }) {
  const [operacion, setOperacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [distribucionPago, setDistribucionPago] = useState({
    empresa: 36,
    piloto: 40,
    ayudante: 14,
    gastos: 10
  });
  const [montoTotal, setMontoTotal] = useState(0);

  useEffect(() => {
    if (isOpen && operacionId) {
      // Simulación de carga de datos
      setCargando(true);
      setTimeout(() => {
        // Datos de ejemplo para la operación
        if (operacionId === 'OP-001') {
          setOperacion({
            id: 'OP-001',
            fecha: '15/08/2025',
            cliente: 'Constructora ABC',
            ubicacion: 'Santiago Centro',
            tipo: 'Mapeo',
            piloto: 'Juan Pérez',
            ayudante: 'Carlos Rodríguez',
            drone: 'Phantom 4 Pro',
            horaInicio: '09:00',
            horaFin: '11:30',
            estado: 'Completada',
            descripcion: 'Mapeo de terreno para proyecto de construcción',
            observaciones: 'Se completó con éxito, sin incidentes',
            montoTotal: 450000
          });
          setMontoTotal(450000);
        } else if (operacionId === 'OP-002') {
          setOperacion({
            id: 'OP-002',
            fecha: '16/08/2025',
            cliente: 'Minera XYZ',
            ubicacion: 'Antofagasta',
            tipo: 'Inspección',
            piloto: 'María González',
            ayudante: 'Pedro Soto',
            drone: 'Mavic 3',
            horaInicio: '14:00',
            horaFin: '16:00',
            estado: 'En progreso',
            descripcion: 'Inspección de instalaciones mineras',
            observaciones: 'En proceso, clima favorable',
            montoTotal: 380000
          });
          setMontoTotal(380000);
        } else if (operacionId === 'OP-003') {
          setOperacion({
            id: 'OP-003',
            fecha: '17/08/2025',
            cliente: 'Inmobiliaria DEF',
            ubicacion: 'Viña del Mar',
            tipo: 'Fotografía',
            piloto: 'Ana Martínez',
            ayudante: 'Luis Morales',
            drone: 'Autel EVO II',
            horaInicio: '10:00',
            horaFin: '12:30',
            estado: 'Planificada',
            descripcion: 'Fotografía aérea de proyecto inmobiliario',
            observaciones: 'Pendiente de confirmación por parte del cliente',
            montoTotal: 320000
          });
          setMontoTotal(320000);
        } else {
          setError('No se encontró la operación solicitada');
        }
        setCargando(false);
      }, 600);
    }
  }, [isOpen, operacionId]);

  // Función para obtener el color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completada': return 'estado-completada';
      case 'En progreso': return 'estado-en-progreso';
      case 'Planificada': return 'estado-planificada';
      case 'Cancelada': return 'estado-cancelada';
      default: return '';
    }
  };

  // Función para actualizar la distribución de pagos
  const actualizarDistribucion = (tipo, valor) => {
    const nuevoValor = parseInt(valor, 10);
    if (isNaN(nuevoValor) || nuevoValor < 0) return;

    // Calcular el total actual sin el tipo que estamos modificando
    const distribucionActual = { ...distribucionPago };
    const totalActual = Object.entries(distribucionActual)
      .filter(([key]) => key !== tipo)
      .reduce((sum, [_, value]) => sum + value, 0);

    // Verificar que no exceda el 100%
    if (totalActual + nuevoValor > 100) return;

    setDistribucionPago({
      ...distribucionPago,
      [tipo]: nuevoValor
    });
  };

  // Calcular el total de la distribución
  const totalDistribucion = Object.values(distribucionPago).reduce((sum, value) => sum + value, 0);

  // Calcular montos según porcentajes
  const calcularMonto = (porcentaje) => {
    return ((porcentaje / 100) * montoTotal).toLocaleString('es-CL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Detalles de Operación</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {cargando ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Cargando datos de la operación...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>{error}</p>
            </div>
          ) : operacion && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{operacion.tipo} - {operacion.cliente}</h2>
                    <p className="text-gray-600">{operacion.ubicacion}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(operacion.estado)}`}>
                    {operacion.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">ID de Operación</p>
                    <p className="font-medium">{operacion.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{operacion.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">{operacion.horaInicio} - {operacion.horaFin || 'No finalizado'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700">{operacion.descripcion || 'Sin descripción'}</p>
                </div>

                {operacion.observaciones && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Observaciones</h3>
                    <p className="text-gray-700">{operacion.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Personal y equipo */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Personal y Equipo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Piloto</p>
                    <p className="font-medium">{operacion.piloto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ayudante</p>
                    <p className="font-medium">{operacion.ayudante || 'No asignado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Drone</p>
                    <p className="font-medium">{operacion.drone}</p>
                  </div>
                </div>
              </div>

              {/* Distribución de pagos */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Distribución de Pagos</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Total de la Operación
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      className="input"
                      value={montoTotal}
                      onChange={(e) => setMontoTotal(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa (%)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={distribucionPago.empresa}
                      onChange={(e) => actualizarDistribucion('empresa', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Monto: ${calcularMonto(distribucionPago.empresa)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Piloto: {operacion.piloto} (%)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={distribucionPago.piloto}
                      onChange={(e) => actualizarDistribucion('piloto', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Monto: ${calcularMonto(distribucionPago.piloto)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ayudante: {operacion.ayudante} (%)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={distribucionPago.ayudante}
                      onChange={(e) => actualizarDistribucion('ayudante', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Monto: ${calcularMonto(distribucionPago.ayudante)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gastos (%)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={distribucionPago.gastos}
                      onChange={(e) => actualizarDistribucion('gastos', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Monto: ${calcularMonto(distribucionPago.gastos)}
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${totalDistribucion === 100 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  <div className="flex justify-between items-center">
                    <span>Total distribución:</span>
                    <span className="font-bold">{totalDistribucion}%</span>
                  </div>
                  {totalDistribucion !== 100 && (
                    <p className="text-sm mt-1">La distribución debe sumar exactamente 100%</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    className="btn btn-primary"
                    disabled={totalDistribucion !== 100}
                  >
                    Guardar distribución
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
