import { useState, useEffect } from 'react';
import { getOperacionById, updateOperacion } from '../firebase/operacionesService';

// Función para formatear números con separador de miles
const formatearNumero = (numero) => {
  if (numero === '' || numero === null || numero === undefined) return '';
  // Convertir a número y luego a string con formato
  return parseFloat(numero).toLocaleString('es-CL');
};

// Función para quitar el formato y convertir a número
const desformatearNumero = (texto) => {
  if (texto === '' || texto === null || texto === undefined) return '';
  // Quitar todos los puntos y convertir a número
  return texto.replace(/\./g, '');
};

export default function OperacionModal({ isOpen, onClose, operacionId }) {
  const [operacion, setOperacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [gastoExacto, setGastoExacto] = useState(0);
  const [gastoExactoFormateado, setGastoExactoFormateado] = useState('');
  const [montoTotal, setMontoTotal] = useState(0);
  const [montoTotalFormateado, setMontoTotalFormateado] = useState('');
  const [porcentajeEmpresa, setPorcentajeEmpresa] = useState(36); // Mínimo 36%
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Porcentajes predeterminados
  const PORCENTAJE_PILOTO = 14;
  const PORCENTAJE_AYUDANTE = 8;
  const PORCENTAJE_EMPRESA_MINIMO = 36;

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
          
          // Establecer el gasto exacto si existe
          if (operacionData.gastoExacto) {
            setGastoExacto(operacionData.gastoExacto);
          }
          
          // Inicializar participantes con pilotos y ayudantes
          const nuevosParticipantes = [];
          
          // Agregar pilotos
          if (operacionData.pilotos && Array.isArray(operacionData.pilotos)) {
            operacionData.pilotos.forEach(piloto => {
              nuevosParticipantes.push({
                nombre: piloto,
                tipo: 'piloto',
                porcentaje: operacionData.distribucionPago?.pilotos?.[piloto] || PORCENTAJE_PILOTO
              });
            });
          } else if (operacionData.piloto) {
            // Compatibilidad con formato anterior
            nuevosParticipantes.push({
              nombre: operacionData.piloto,
              tipo: 'piloto',
              porcentaje: operacionData.distribucionPago?.piloto || PORCENTAJE_PILOTO
            });
          }
          
          // Agregar ayudantes
          if (operacionData.ayudantes && Array.isArray(operacionData.ayudantes)) {
            operacionData.ayudantes.forEach(ayudante => {
              nuevosParticipantes.push({
                nombre: ayudante,
                tipo: 'ayudante',
                porcentaje: operacionData.distribucionPago?.ayudantes?.[ayudante] || PORCENTAJE_AYUDANTE
              });
            });
          } else if (operacionData.ayudante) {
            // Compatibilidad con formato anterior
            nuevosParticipantes.push({
              nombre: operacionData.ayudante,
              tipo: 'ayudante',
              porcentaje: operacionData.distribucionPago?.ayudante || PORCENTAJE_AYUDANTE
            });
          }
          
          setParticipantes(nuevosParticipantes);
          
          // Establecer porcentaje de la empresa (mínimo 36%)
          if (operacionData.distribucionPago?.empresa) {
            setPorcentajeEmpresa(Math.max(PORCENTAJE_EMPRESA_MINIMO, operacionData.distribucionPago.empresa));
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

  // Función para actualizar el porcentaje de un participante
  const handleParticipanteChange = (index, nuevoPorcentaje) => {
    // Validar que el valor sea un número y esté entre 0 y 100
    const porcentaje = Math.max(0, Math.min(100, parseFloat(nuevoPorcentaje) || 0));
    
    // Actualizar el participante inmediatamente
    const nuevosParticipantes = [...participantes];
    nuevosParticipantes[index] = {
      ...nuevosParticipantes[index],
      porcentaje
    };
    setParticipantes(nuevosParticipantes);
    
    // Forzar la actualización del porcentaje de la empresa
    const totalParticipantes = nuevosParticipantes.reduce((sum, p) => sum + parseFloat(p.porcentaje || 0), 0);
    const porcentajeGastos = montoTotal > 0 ? (gastoExacto / montoTotal) * 100 : 0;
    const nuevoEmpresa = Math.max(PORCENTAJE_EMPRESA_MINIMO, 100 - totalParticipantes - porcentajeGastos);
    setPorcentajeEmpresa(nuevoEmpresa);
  };
  
  // Función para actualizar el gasto exacto
  const handleGastoExactoChange = (valor) => {
    // Si el valor comienza con 0 y tiene más de un dígito, quitar el 0 inicial
    if (valor.startsWith('0') && valor.length > 1 && !valor.startsWith('0.')) {
      valor = valor.substring(1);
    }
    
    // Quitar el formato para guardar el valor numérico
    const valorSinFormato = desformatearNumero(valor);
    const nuevoGasto = Math.max(0, parseFloat(valorSinFormato) || 0);
    
    setGastoExacto(nuevoGasto);
    setGastoExactoFormateado(valor);
    
    // Forzar la actualización del porcentaje de la empresa
    const totalParticipantes = participantes.reduce((sum, p) => sum + parseFloat(p.porcentaje || 0), 0);
    const porcentajeGastos = montoTotal > 0 ? (nuevoGasto / montoTotal) * 100 : 0;
    const nuevoEmpresa = Math.max(PORCENTAJE_EMPRESA_MINIMO, 100 - totalParticipantes - porcentajeGastos);
    setPorcentajeEmpresa(nuevoEmpresa);
  };
  
  // Función para actualizar el monto total
  const handleMontoTotalChange = (valor) => {
    // Si el valor comienza con 0 y tiene más de un dígito, quitar el 0 inicial
    if (valor.startsWith('0') && valor.length > 1 && !valor.startsWith('0.')) {
      valor = valor.substring(1);
    }
    
    // Quitar el formato para guardar el valor numérico
    const valorSinFormato = desformatearNumero(valor);
    const nuevoMonto = Math.max(0, parseFloat(valorSinFormato) || 0);
    
    setMontoTotal(nuevoMonto);
    setMontoTotalFormateado(valor);
    
    // Forzar la actualización del porcentaje de la empresa
    const totalParticipantes = participantes.reduce((sum, p) => sum + parseFloat(p.porcentaje || 0), 0);
    const porcentajeGastos = nuevoMonto > 0 ? (gastoExacto / nuevoMonto) * 100 : 0;
    const nuevoEmpresa = Math.max(PORCENTAJE_EMPRESA_MINIMO, 100 - totalParticipantes - porcentajeGastos);
    setPorcentajeEmpresa(nuevoEmpresa);
  };
  
  // Calcular el porcentaje de la empresa basado en los demás porcentajes
  const calcularPorcentajeEmpresa = () => {
    // Calcular la suma de los porcentajes de todos los participantes
    const totalParticipantes = participantes.reduce((sum, p) => sum + parseFloat(p.porcentaje || 0), 0);
    
    // Calcular el porcentaje que representan los gastos
    const porcentajeGastos = montoTotal > 0 ? (gastoExacto / montoTotal) * 100 : 0;
    
    // El porcentaje de la empresa es lo que queda, pero mínimo 36%
    const nuevoEmpresa = Math.max(PORCENTAJE_EMPRESA_MINIMO, 100 - totalParticipantes - porcentajeGastos);
    setPorcentajeEmpresa(nuevoEmpresa);
    
    // Actualizar el total calculado
    setTotalCalculado(totalParticipantes + nuevoEmpresa + porcentajeGastos);
    
    return nuevoEmpresa;
  };

  const guardarDistribucion = async () => {
    if (!operacion) return;
    
    try {
      setGuardando(true);
      setError(null);
      setMensajeExito('');
      
      // Crear objeto de distribución de pago
      const distribucionPago = {
        empresa: porcentajeEmpresa,
        pilotos: {},
        ayudantes: {}
      };
      
      // Agregar porcentajes por participante
      participantes.forEach(p => {
        if (p.tipo === 'piloto') {
          distribucionPago.pilotos[p.nombre] = p.porcentaje;
        } else if (p.tipo === 'ayudante') {
          distribucionPago.ayudantes[p.nombre] = p.porcentaje;
        }
      });
      
      // Actualizar la operación con la nueva distribución, monto y gasto
      await updateOperacion(operacion.id, {
        ...operacion,
        distribucionPago,
        montoTotal,
        gastoExacto
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
  const calcularTotalDistribucion = () => {
    const totalParticipantes = participantes.reduce((sum, p) => sum + parseFloat(p.porcentaje || 0), 0);
    const porcentajeGastos = montoTotal > 0 ? (gastoExacto / montoTotal) * 100 : 0;
    return totalParticipantes + porcentajeEmpresa + porcentajeGastos;
  };
  
  // Estado para almacenar el total calculado
  const [totalCalculado, setTotalCalculado] = useState(100);
  
  // Recalcular el total cada vez que cambie cualquier valor relevante
  useEffect(() => {
    setTotalCalculado(calcularTotalDistribucion());
  }, [participantes, porcentajeEmpresa, gastoExacto, montoTotal]);

  // Calcular montos según porcentajes
  const calcularMonto = (porcentaje) => {
    return ((porcentaje / 100) * montoTotal).toLocaleString('es-CL');
  };
  
  // Calcular el porcentaje que representa un monto exacto
  const calcularPorcentaje = (monto) => {
    if (montoTotal <= 0) return 0;
    return ((parseFloat(monto) / parseFloat(montoTotal)) * 100).toFixed(2);
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
                        <span className="text-gray-600">Fecha Inicio:</span>
                        <span className="font-medium">{operacion.fechaInicio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha Fin:</span>
                        <span className="font-medium">{operacion.fechaFin}</span>
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
                        <span className="text-gray-600">Material:</span>
                        <span className="font-medium">{operacion.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`font-medium ${getEstadoColor(operacion.estado)}`}>{operacion.estado}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {operacion.pilotos && operacion.pilotos.length > 0 ? (
                        <div>
                          <span className="text-gray-600 block mb-1">Pilotos:</span>
                          <ul className="list-disc pl-5">
                            {operacion.pilotos.map((piloto, index) => (
                              <li key={`piloto-${index}`} className="font-medium">{piloto}</li>
                            ))}
                          </ul>
                        </div>
                      ) : operacion.piloto ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Piloto:</span>
                          <span className="font-medium">{operacion.piloto}</span>
                        </div>
                      ) : null}
                      
                      {operacion.ayudantes && operacion.ayudantes.length > 0 ? (
                        <div className="mt-2">
                          <span className="text-gray-600 block mb-1">Ayudantes:</span>
                          <ul className="list-disc pl-5">
                            {operacion.ayudantes.map((ayudante, index) => (
                              <li key={`ayudante-${index}`} className="font-medium">{ayudante}</li>
                            ))}
                          </ul>
                        </div>
                      ) : operacion.ayudante ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ayudante:</span>
                          <span className="font-medium">{operacion.ayudante}</span>
                        </div>
                      ) : null}
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
                          type="text"
                          id="montoTotal"
                          className="input w-full"
                          value={montoTotalFormateado}
                          onChange={(e) => handleMontoTotalChange(e.target.value)}
                          disabled={guardando}
                          onBlur={() => setMontoTotalFormateado(formatearNumero(montoTotal))}
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <label htmlFor="gastoExacto" className="text-sm font-medium text-gray-700">Gasto Exacto (CLP)</label>
                          <span className="text-sm text-gray-500">{montoTotal > 0 ? `${calcularPorcentaje(gastoExacto)}%` : '0%'}</span>
                        </div>
                        <input
                          type="text"
                          id="gastoExacto"
                          className="input w-full"
                          value={gastoExactoFormateado}
                          onChange={(e) => handleGastoExactoChange(e.target.value)}
                          disabled={guardando}
                          onBlur={() => setGastoExactoFormateado(formatearNumero(gastoExacto))}
                        />
                      </div>

                      <div className="space-y-3">
                        {/* Empresa (no editable, mínimo 36%) */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">Empresa ({porcentajeEmpresa.toFixed(2)}%)</label>
                            <span className="text-sm text-gray-500">${calcularMonto(porcentajeEmpresa)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600" 
                              style={{ width: `${porcentajeEmpresa}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Mínimo 36% + lo que sobre después de gastos y personal</p>
                        </div>

                        {/* Participantes (pilotos y ayudantes) */}
                        {participantes.map((participante, index) => (
                          <div key={`participante-${index}`}>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm font-medium text-gray-700">
                                {participante.nombre} ({participante.tipo === 'piloto' ? 'Piloto' : 'Ayudante'}) (%)
                              </label>
                              <span className="text-sm text-gray-500">${calcularMonto(participante.porcentaje)}</span>
                            </div>
                            <input
                              type="number"
                              className="input w-full"
                              value={participante.porcentaje}
                              onChange={(e) => handleParticipanteChange(index, e.target.value)}
                              disabled={guardando}
                              step="0.01"
                            />
                          </div>
                        ))}

                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Total:</span>
                          <span className={`font-medium ${totalCalculado > 100 ? 'text-red-600' : 'text-green-600'}`}>
                            {totalCalculado.toFixed(2)}%
                            {totalCalculado > 100 ? ` (Excede en ${(totalCalculado - 100).toFixed(2)}% = $${calcularMonto(totalCalculado - 100)})` : ''}
                          </span>
                        </div>
                        
                        <button 
                          onClick={guardarDistribucion}
                          disabled={guardando}
                          className="mt-3 w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
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
