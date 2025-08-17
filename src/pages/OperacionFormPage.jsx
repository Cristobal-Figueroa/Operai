import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOperacionById, createOperacion, updateOperacion } from '../firebase/operacionesService';

// Datos de ejemplo para los selectores
const pilotos = ['Juan Pérez', 'María González', 'Ana Martínez', 'Roberto Sánchez'];
const ayudantes = ['Carlos Rodríguez', 'Pedro Soto', 'Luis Morales', 'Sofía Vargas'];
const drones = ['Phantom 4 Pro', 'Mavic 3', 'Autel EVO II', 'DJI Air 2S'];
const tiposOperacion = ['Mapeo', 'Inspección', 'Fotografía', 'Filmación', 'Monitoreo'];

// Operación inicial vacía
const operacionVacia = {
  fecha: '',
  cliente: '',
  ubicacion: '',
  tipo: '',
  piloto: '',
  ayudante: '',
  drone: '',
  horaInicio: '',
  horaFin: '',
  estado: 'Planificada',
  descripcion: '',
  observaciones: ''
};

export default function OperacionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [operacion, setOperacion] = useState(operacionVacia);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const esEdicion = !!id;
  
  // Cargar datos desde Firestore para edición
  useEffect(() => {
    if (esEdicion) {
      const cargarOperacion = async () => {
        try {
          setCargando(true);
          const operacionData = await getOperacionById(id);
          
          // Formatear la fecha para el input date (YYYY-MM-DD)
          if (operacionData.fecha) {
            // Asumiendo que la fecha viene en formato DD/MM/YYYY
            const partesFecha = operacionData.fecha.split('/');
            if (partesFecha.length === 3) {
              operacionData.fecha = `${partesFecha[2]}-${partesFecha[1].padStart(2, '0')}-${partesFecha[0].padStart(2, '0')}`;
            }
          }
          
          setOperacion(operacionData);
        } catch (error) {
          console.error('Error al cargar la operación:', error);
          // Mostrar mensaje de error al usuario
          setErrores(prev => ({
            ...prev,
            general: 'No se pudo cargar la información de la operación.'
          }));
        } finally {
          setCargando(false);
        }
      };
      
      cargarOperacion();
    }
  }, [esEdicion, id]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOperacion(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo si existe
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!operacion.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    if (!operacion.cliente) nuevosErrores.cliente = 'El cliente es obligatorio';
    if (!operacion.ubicacion) nuevosErrores.ubicacion = 'La ubicación es obligatoria';
    if (!operacion.tipo) nuevosErrores.tipo = 'El tipo de operación es obligatorio';
    if (!operacion.piloto) nuevosErrores.piloto = 'El piloto es obligatorio';
    if (!operacion.drone) nuevosErrores.drone = 'El drone es obligatorio';
    if (!operacion.horaInicio) nuevosErrores.horaInicio = 'La hora de inicio es obligatoria';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setGuardando(true);
    setErrores({});
    
    try {
      // Formatear la fecha para guardarla en formato DD/MM/YYYY
      let operacionAGuardar = {...operacion};
      
      if (operacionAGuardar.fecha) {
        const fecha = new Date(operacionAGuardar.fecha);
        operacionAGuardar.fecha = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
      }
      
      if (esEdicion) {
        // Actualizar operación existente
        await updateOperacion(id, operacionAGuardar);
      } else {
        // Crear nueva operación
        const nuevaOperacion = await createOperacion(operacionAGuardar);
        // El ID de la operación ahora viene directamente de Firestore (nuevaOperacion.id)
        console.log('Nueva operación creada con ID:', nuevaOperacion.id);
      }
      
      // Redirigir a la lista de operaciones
      navigate('/operaciones');
    } catch (error) {
      console.error('Error al guardar la operación:', error);
      setErrores(prev => ({
        ...prev,
        general: 'Error al guardar la operación. Por favor, intenta de nuevo.'
      }));
    } finally {
      setGuardando(false);
    }
  };
  
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Cargando datos de la operación...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {esEdicion ? 'Editar Operación' : 'Nueva Operación'}
        </h1>
        <Link to="/operaciones" className="btn bg-gray-200 text-gray-800 hover:bg-gray-300">
          Volver a la lista
        </Link>
      </div>
      
      <div className="card">
        {errores.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {errores.general}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className={`input w-full ${errores.fecha ? 'border-red-500' : ''}`}
                value={operacion.fecha}
                onChange={handleChange}
              />
              {errores.fecha && <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>}
            </div>
            
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cliente"
                name="cliente"
                className={`input w-full ${errores.cliente ? 'border-red-500' : ''}`}
                value={operacion.cliente}
                onChange={handleChange}
              />
              {errores.cliente && <p className="text-red-500 text-xs mt-1">{errores.cliente}</p>}
            </div>
            
            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                className={`input w-full ${errores.ubicacion ? 'border-red-500' : ''}`}
                value={operacion.ubicacion}
                onChange={handleChange}
              />
              {errores.ubicacion && <p className="text-red-500 text-xs mt-1">{errores.ubicacion}</p>}
            </div>
            
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Operación <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                className={`input w-full ${errores.tipo ? 'border-red-500' : ''}`}
                value={operacion.tipo}
                onChange={handleChange}
              >
                <option value="">Seleccionar tipo</option>
                {tiposOperacion.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errores.tipo && <p className="text-red-500 text-xs mt-1">{errores.tipo}</p>}
            </div>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="input w-full"
                value={operacion.estado}
                onChange={handleChange}
              >
                <option value="Planificada">Planificada</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          
          {/* Personal y equipo */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Personal y Equipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="piloto" className="block text-sm font-medium text-gray-700 mb-1">
                  Piloto <span className="text-red-500">*</span>
                </label>
                <select
                  id="piloto"
                  name="piloto"
                  className={`input w-full ${errores.piloto ? 'border-red-500' : ''}`}
                  value={operacion.piloto}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar piloto</option>
                  {pilotos.map(piloto => (
                    <option key={piloto} value={piloto}>{piloto}</option>
                  ))}
                </select>
                {errores.piloto && <p className="text-red-500 text-xs mt-1">{errores.piloto}</p>}
              </div>
              
              <div>
                <label htmlFor="ayudante" className="block text-sm font-medium text-gray-700 mb-1">
                  Ayudante
                </label>
                <select
                  id="ayudante"
                  name="ayudante"
                  className="input w-full"
                  value={operacion.ayudante}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar ayudante</option>
                  {ayudantes.map(ayudante => (
                    <option key={ayudante} value={ayudante}>{ayudante}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="drone" className="block text-sm font-medium text-gray-700 mb-1">
                  Drone <span className="text-red-500">*</span>
                </label>
                <select
                  id="drone"
                  name="drone"
                  className={`input w-full ${errores.drone ? 'border-red-500' : ''}`}
                  value={operacion.drone}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar drone</option>
                  {drones.map(drone => (
                    <option key={drone} value={drone}>{drone}</option>
                  ))}
                </select>
                {errores.drone && <p className="text-red-500 text-xs mt-1">{errores.drone}</p>}
              </div>
            </div>
          </div>
          
          {/* Horarios */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Horarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="horaInicio"
                  name="horaInicio"
                  className={`input w-full ${errores.horaInicio ? 'border-red-500' : ''}`}
                  value={operacion.horaInicio}
                  onChange={handleChange}
                />
                {errores.horaInicio && <p className="text-red-500 text-xs mt-1">{errores.horaInicio}</p>}
              </div>
              
              <div>
                <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  id="horaFin"
                  name="horaFin"
                  className="input w-full"
                  value={operacion.horaFin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Detalles adicionales */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Detalles Adicionales</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la Operación
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="3"
                  className="input w-full"
                  value={operacion.descripcion}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows="3"
                  className="input w-full"
                  value={operacion.observaciones}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="border-t pt-6 flex justify-end space-x-4">
            <Link to="/operaciones" className="btn bg-gray-200 text-gray-800 hover:bg-gray-300">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Guardando...
                </>
              ) : (
                esEdicion ? 'Actualizar Operación' : 'Crear Operación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
