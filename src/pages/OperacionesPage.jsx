import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OperacionModal from '../components/OperacionModal';
import { getOperaciones, deleteOperacion, searchOperaciones, getOperacionesByEstado, getOperacionesOrdenadas } from '../firebase/operacionesService';

export default function OperacionesPage() {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOperacionId, setSelectedOperacionId] = useState(null);

  // Cargar operaciones desde Firestore
  useEffect(() => {
    const cargarOperaciones = async () => {
      try {
        setLoading(true);
        const data = await getOperaciones();
        setOperaciones(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar operaciones:', err);
        setError('Error al cargar las operaciones. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarOperaciones();
  }, []);

  // Efecto para manejar filtros y ordenamiento
  useEffect(() => {
    const aplicarFiltrosYOrden = async () => {
      try {
        setLoading(true);
        let data;
        
        // Si hay un filtro de estado activo
        if (filtroEstado) {
          data = await getOperacionesByEstado(filtroEstado);
        } 
        // Si hay una búsqueda activa
        else if (busqueda) {
          data = await searchOperaciones(busqueda);
        } 
        // Si solo hay ordenamiento
        else {
          data = await getOperacionesOrdenadas(ordenarPor, ordenAscendente);
        }
        
        setOperaciones(data);
        setError(null);
      } catch (err) {
        console.error('Error al aplicar filtros:', err);
        setError('Error al filtrar operaciones. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicamos filtros si ya se cargaron las operaciones inicialmente
    if (!loading) {
      aplicarFiltrosYOrden();
    }
  }, [filtroEstado, busqueda, ordenarPor, ordenAscendente]);

  // Filtrar operaciones según los criterios (como respaldo si la búsqueda en Firestore falla)
  const operacionesFiltradas = operaciones
    .filter(op => filtroEstado ? op.estado === filtroEstado : true)
    .filter(op => {
      if (!busqueda) return true;
      const terminoBusqueda = busqueda.toLowerCase();
      return (
        op.id.toLowerCase().includes(terminoBusqueda) ||
        op.cliente.toLowerCase().includes(terminoBusqueda) ||
        op.ubicacion.toLowerCase().includes(terminoBusqueda) ||
        op.piloto.toLowerCase().includes(terminoBusqueda) ||
        (op.ayudante && op.ayudante.toLowerCase().includes(terminoBusqueda)) ||
        (op.material && op.material.toLowerCase().includes(terminoBusqueda)) ||
        (op.tipoMaterial && op.tipoMaterial.toLowerCase().includes(terminoBusqueda)) ||
        op.drone.toLowerCase().includes(terminoBusqueda)
      );
    })
    .sort((a, b) => {
      let valorA = a[ordenarPor];
      let valorB = b[ordenarPor];
      
      // Para fechas, convertir a objetos Date
      if (ordenarPor === 'fecha') {
        const [diaA, mesA, anioA] = a.fecha ? a.fecha.split('/') : [0, 0, 0];
        const [diaB, mesB, anioB] = b.fecha ? b.fecha.split('/') : [0, 0, 0];
        valorA = new Date(anioA, mesA - 1, diaA);
        valorB = new Date(anioB, mesB - 1, diaB);
      }
      
      if (valorA < valorB) return ordenAscendente ? -1 : 1;
      if (valorA > valorB) return ordenAscendente ? 1 : -1;
      return 0;
    });

  // Función para eliminar una operación
  const eliminarOperacion = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta operación?')) {
      try {
        await deleteOperacion(id);
        setOperaciones(operaciones.filter(op => op.id !== id));
      } catch (err) {
        console.error('Error al eliminar la operación:', err);
        alert('Error al eliminar la operación. Por favor, intenta de nuevo.');
      }
    }
  };

  // Función para cambiar el orden
  const cambiarOrden = (campo) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(true);
    }
  };

  // Función para obtener el color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completada': return 'estado-completada';
      case 'En progreso': return 'estado-en-progreso';
      case 'Planificada': return 'estado-planificada';
      case 'Cancelada': return 'estado-cancelada';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para abrir el modal con los detalles de la operación
  const abrirModal = (id) => {
    setSelectedOperacionId(id);
    setModalOpen(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedOperacionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Operaciones</h1>
        <Link to="/operaciones/nueva" className="btn btn-primary">
          Nueva Operación
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="busqueda"
              className="input w-full"
              placeholder="Buscar por ID, cliente, ubicación, piloto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
            <select
              id="filtroEstado"
              className="input w-full"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              disabled={loading}
            >
              <option value="">Todos</option>
              <option value="Completada">Completada</option>
              <option value="En progreso">En progreso</option>
              <option value="Planificada">Planificada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-4">
              <button 
                className={`flex items-center ${ordenarPor === 'fecha' ? 'font-semibold text-blue-600' : ''}`}
                onClick={() => cambiarOrden('fecha')}
                disabled={loading}
              >
                Fecha {ordenarPor === 'fecha' && <span className="ml-1">{ordenAscendente ? '↑' : '↓'}</span>}
              </button>
              <button 
                className={`flex items-center ${ordenarPor === 'cliente' ? 'font-semibold text-blue-600' : ''}`}
                onClick={() => cambiarOrden('cliente')}
                disabled={loading}
              >
                Cliente {ordenarPor === 'cliente' && <span className="ml-1">{ordenAscendente ? '↑' : '↓'}</span>}
              </button>
              {/* Se eliminó el botón de ordenar por ID */}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Cargando operaciones...</p>
              </div>
            </div>
          ) : operacionesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operacionesFiltradas.map((operacion) => (
                <div key={operacion.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{operacion.tipo}</h3>
                        <p className="text-gray-600 text-sm">{operacion.cliente}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(operacion.estado)}`}>
                        {operacion.estado}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {/* Se ocultó el ID de la operación */}
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Fecha:</span>
                        <span className="font-medium text-sm">{operacion.fechaInicio || operacion.fecha}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Pilotos:</span>
                        <span className="font-medium text-sm">
                          {operacion.pilotos && operacion.pilotos.length > 0 
                            ? operacion.pilotos.join(', ')
                            : operacion.piloto || 'No asignado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Ayudantes:</span>
                        <span className="font-medium text-sm">
                          {operacion.ayudantes && operacion.ayudantes.length > 0 
                            ? operacion.ayudantes.join(', ')
                            : operacion.ayudante || 'No asignado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Material:</span>
                        <span className="font-medium text-sm">
                          {operacion.tipoMaterial ? `${operacion.tipoMaterial} - ${operacion.material}` : operacion.material}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 border-t flex justify-between">
                    <button 
                      onClick={() => abrirModal(operacion.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalles
                    </button>
                    <div className="flex space-x-3">
                      <Link to={`/operaciones/editar/${operacion.id}`} className="text-yellow-600 hover:text-yellow-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => eliminarOperacion(operacion.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              No se encontraron operaciones con los criterios de búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver detalles de operación */}
      <OperacionModal 
        isOpen={modalOpen} 
        onClose={cerrarModal} 
        operacionId={selectedOperacionId} 
      />
    </div>
  );
}
