import { useState, useEffect } from 'react';
import { getOperacionById, updateOperacion } from '../firebase/operacionesService';

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
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    if (isOpen && operacionId) {
      const cargarOperacion = async () => {
        try {
          setCargando(true);
          setError(null);
          
          const operacionData = await getOperacionById(operacionId);
          setOperacion(operacionData);
          
          // Establecer el monto total si existe
          if (operacionData.montoTotal) {
            setMontoTotal(operacionData.montoTotal);
          }
          
          // Establecer la distribución de pago si existe
          if (operacionData.distribucionPago) {
            setDistribucionPago(operacionData.distribucionPago);
          }
          
        } catch (err) {
          console.error('Error al cargar la operación:', err);
          setError('No se pudo cargar la información de la operación. Por favor, intenta de nuevo.');
        } finally {
          setCargando(false);
        }
      };
      
      cargarOperacion();
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
  const handleDistribucionChange = (tipo, valor) => {
    // Validar que el valor sea un número y esté entre 0 y 100
    const nuevoValor = Math.max(0, Math.min(100, parseInt(valor) || 0));
    
    // Calcular el total actual sin el valor que estamos cambiando
    const totalActual = Object.entries(distribucionPago)
      .reduce((sum, [key, val]) => key !== tipo ? sum + val : sum, 0);
    
    // Asegurarse de que el total no exceda 100%
    if (totalActual + nuevoValor > 100) {
      return; // No permitir el cambio si excede 100%
    }
    
    setDistribucionPago(prev => ({
      ...prev,
      [tipo]: nuevoValor
    }));
  };

  const guardarDistribucion = async () => {
    if (!operacion) return;
    
    try {
      setGuardando(true);
      setError(null);
      setMensajeExito('');
      
      // Verificar que la distribución suma 100%
      const totalDistribucion = Object.values(distribucionPago).reduce((sum, val) => sum + val, 0);
      if (totalDistribucion !== 100) {
        setError(`La distribución debe sumar 100%. Actualmente suma ${totalDistribucion}%`);
        return;
      }
      
      // Actualizar la operación con la nueva distribución y monto
      await updateOperacion(operacion.id, {
        ...operacion,
        distribucionPago,
        montoTotal
      });
      
      setMensajeExito('Distribución guardada correctamente');
      
      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setMensajeExito('');
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar la distribución:', err);
      setError('No se pudo guardar la distribución. Por favor, intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // Calcular el total de la distribución
  const totalDistribucion = Object.values(distribucionPago).reduce((sum, value) => sum + value, 0);

  // Calcular montos según porcentajes
  const calcularMonto = (porcentaje) => {
    return ((porcentaje / 100) * montoTotal).toLocaleString('es-CL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detalles de la Operación</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {cargando ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Cargando detalles de la operación...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : operacion ? (
            <div className="space-y-6">
              {mensajeExito && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {mensajeExito}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Información General</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium">{operacion.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{operacion.fecha}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium">{operacion.cliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium">{operacion.ubicacion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{operacion.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`font-medium ${getEstadoColor(operacion.estado)}`}>{operacion.estado}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal y Equipo</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Piloto:</span>
                        <span className="font-medium">{operacion.piloto}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ayudante:</span>
                        <span className="font-medium">{operacion.ayudante}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drone:</span>
                        <span className="font-medium">{operacion.drone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hora Inicio:</span>
                        <span className="font-medium">{operacion.horaInicio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hora Fin:</span>
                        <span className="font-medium">{operacion.horaFin || 'No finalizado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Detalles</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div>
                        <span className="text-gray-600 block mb-1">Descripción:</span>
                        <p className="font-medium">{operacion.descripcion}</p>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-600 block mb-1">Observaciones:</span>
                        <p className="font-medium">{operacion.observaciones}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Distribución de Pagos</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700 mb-1">Monto Total (CLP)</label>
                        <input
                          type="number"
                          id="montoTotal"
                          className="input w-full"
                          value={montoTotal}
                          onChange={(e) => setMontoTotal(Math.max(0, parseInt(e.target.value) || 0))}
                          disabled={guardando}
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="empresa" className="text-sm font-medium text-gray-700">Empresa (%)</label>
                            <span className="text-sm text-gray-500">${calcularMonto(distribucionPago.empresa)}</span>
                          </div>
                          <input
                            type="number"
                            id="empresa"
                            className="input w-full"
                            value={distribucionPago.empresa}
                            onChange={(e) => handleDistribucionChange('empresa', e.target.value)}
                            disabled={guardando}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="piloto" className="text-sm font-medium text-gray-700">Piloto (%)</label>
                            <span className="text-sm text-gray-500">${calcularMonto(distribucionPago.piloto)}</span>
                          </div>
                          <input
                            type="number"
                            id="piloto"
                            className="input w-full"
                            value={distribucionPago.piloto}
                            onChange={(e) => handleDistribucionChange('piloto', e.target.value)}
                            disabled={guardando}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="ayudante" className="text-sm font-medium text-gray-700">Ayudante (%)</label>
                            <span className="text-sm text-gray-500">${calcularMonto(distribucionPago.ayudante)}</span>
                          </div>
                          <input
                            type="number"
                            id="ayudante"
                            className="input w-full"
                            value={distribucionPago.ayudante}
                            onChange={(e) => handleDistribucionChange('ayudante', e.target.value)}
                            disabled={guardando}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <label htmlFor="gastos" className="text-sm font-medium text-gray-700">Gastos (%)</label>
                            <span className="text-sm text-gray-500">${calcularMonto(distribucionPago.gastos)}</span>
                          </div>
                          <input
                            type="number"
                            id="gastos"
                            className="input w-full"
                            value={distribucionPago.gastos}
                            onChange={(e) => handleDistribucionChange('gastos', e.target.value)}
                            disabled={guardando}
                          />
                        </div>

                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Total:</span>
                          <span className={`font-medium ${totalDistribucion === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalDistribucion}%
                          </span>
                        </div>
                        
                        <button 
                          onClick={guardarDistribucion}
                          disabled={guardando || totalDistribucion !== 100}
                          className={`mt-3 w-full py-2 px-4 rounded-md ${totalDistribucion === 100 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          {guardando ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Guardando...
                            </span>
                          ) : 'Guardar Distribución'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
              No se encontraron datos para esta operación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
