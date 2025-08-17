import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOperacionById, createOperacion, updateOperacion } from '../firebase/operacionesService';

// Datos de ejemplo para los selectores
const pilotosDisponibles = ['Juan Pérez', 'María González', 'Ana Martínez', 'Roberto Sánchez'];
const ayudantesDisponibles = ['Carlos Rodríguez', 'Pedro Soto', 'Luis Morales', 'Sofía Vargas'];
const tiposOperacion = ['Mapeo', 'Inspección', 'Fotografía', 'Filmación', 'Monitoreo'];
const tiposMaterial = ['Sólido', 'Líquido'];

// Operación inicial vacía
const operacionVacia = {
  fechaInicio: '',
  fechaFin: '',
  cliente: '',
  hectareas: '',
  material: '',
  tipo: '',
  pilotos: [],
  ayudantes: [],
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
          
          // Formatear las fechas para los inputs date (YYYY-MM-DD)
          if (operacionData.fechaInicio) {
            // Asumiendo que la fecha viene en formato DD/MM/YYYY
            const partesFechaInicio = operacionData.fechaInicio.split('/');
            if (partesFechaInicio.length === 3) {
              operacionData.fechaInicio = `${partesFechaInicio[2]}-${partesFechaInicio[1].padStart(2, '0')}-${partesFechaInicio[0].padStart(2, '0')}`;
            }
          }
          
          if (operacionData.fechaFin) {
            // Asumiendo que la fecha viene en formato DD/MM/YYYY
            const partesFechaFin = operacionData.fechaFin.split('/');
            if (partesFechaFin.length === 3) {
              operacionData.fechaFin = `${partesFechaFin[2]}-${partesFechaFin[1].padStart(2, '0')}-${partesFechaFin[0].padStart(2, '0')}`;
            }
          }
          
          // Asegurarse de que pilotos y ayudantes sean arrays
          if (!operacionData.pilotos) operacionData.pilotos = [];
          if (!operacionData.ayudantes) operacionData.ayudantes = [];
          
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
  
  // Manejar cambios en los arrays de pilotos y ayudantes
  const handlePilotoChange = (piloto, accion) => {
    if (accion === 'agregar') {
      setOperacion(prev => ({
        ...prev,
        pilotos: [...prev.pilotos, piloto]
      }));
    } else if (accion === 'quitar') {
      setOperacion(prev => ({
        ...prev,
        pilotos: prev.pilotos.filter(p => p !== piloto)
      }));
    }
    
    // Limpiar error si existe
    if (errores.pilotos) {
      setErrores(prev => ({
        ...prev,
        pilotos: null
      }));
    }
  };
  
  const handleAyudanteChange = (ayudante, accion) => {
    if (accion === 'agregar') {
      setOperacion(prev => ({
        ...prev,
        ayudantes: [...prev.ayudantes, ayudante]
      }));
    } else if (accion === 'quitar') {
      setOperacion(prev => ({
        ...prev,
        ayudantes: prev.ayudantes.filter(a => a !== ayudante)
      }));
    }
  };
  
  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!operacion.fechaInicio) nuevosErrores.fechaInicio = 'La fecha de inicio es obligatoria';
    if (!operacion.fechaFin) nuevosErrores.fechaFin = 'La fecha de fin es obligatoria';
    if (!operacion.cliente) nuevosErrores.cliente = 'El cliente es obligatorio';
    if (!operacion.hectareas) nuevosErrores.hectareas = 'Las hectáreas son obligatorias';
    if (!operacion.material) nuevosErrores.material = 'El material es obligatorio';
    if (!operacion.tipo) nuevosErrores.tipo = 'El tipo de operación es obligatorio';
    if (operacion.pilotos.length === 0) nuevosErrores.pilotos = 'Se requiere al menos un piloto';
    
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
      // Formatear las fechas para guardarlas en formato DD/MM/YYYY
      let operacionAGuardar = {...operacion};
      
      if (operacionAGuardar.fechaInicio) {
        const fechaInicio = new Date(operacionAGuardar.fechaInicio);
        operacionAGuardar.fechaInicio = `${fechaInicio.getDate().toString().padStart(2, '0')}/${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}/${fechaInicio.getFullYear()}`;
      }
      
      if (operacionAGuardar.fechaFin) {
        const fechaFin = new Date(operacionAGuardar.fechaFin);
        operacionAGuardar.fechaFin = `${fechaFin.getDate().toString().padStart(2, '0')}/${(fechaFin.getMonth() + 1).toString().padStart(2, '0')}/${fechaFin.getFullYear()}`;
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
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                className={`input w-full ${errores.fechaInicio ? 'border-red-500' : ''}`}
                value={operacion.fechaInicio}
                onChange={handleChange}
              />
              {errores.fechaInicio && <p className="text-red-500 text-xs mt-1">{errores.fechaInicio}</p>}
            </div>
            
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                className={`input w-full ${errores.fechaFin ? 'border-red-500' : ''}`}
                value={operacion.fechaFin}
                onChange={handleChange}
              />
              {errores.fechaFin && <p className="text-red-500 text-xs mt-1">{errores.fechaFin}</p>}
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
              <label htmlFor="hectareas" className="block text-sm font-medium text-gray-700 mb-1">
                Hectáreas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="hectareas"
                name="hectareas"
                className={`input w-full ${errores.hectareas ? 'border-red-500' : ''}`}
                value={operacion.hectareas}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              {errores.hectareas && <p className="text-red-500 text-xs mt-1">{errores.hectareas}</p>}
            </div>
            
            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                id="material"
                name="material"
                className={`input w-full ${errores.material ? 'border-red-500' : ''}`}
                value={operacion.material}
                onChange={handleChange}
              >
                <option value="">Seleccionar material</option>
                {tiposMaterial.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
              {errores.material && <p className="text-red-500 text-xs mt-1">{errores.material}</p>}
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
            <h2 className="text-lg font-semibold mb-4">Personal</h2>
            
            {/* Pilotos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilotos <span className="text-red-500">*</span>
              </label>
              {errores.pilotos && <p className="text-red-500 text-xs mb-2">{errores.pilotos}</p>}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {operacion.pilotos.map(piloto => (
                  <div key={piloto} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>{piloto}</span>
                    <button 
                      type="button" 
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => handlePilotoChange(piloto, 'quitar')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <select
                  className="input w-full"
                  onChange={(e) => {
                    if (e.target.value) {
                      handlePilotoChange(e.target.value, 'agregar');
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Agregar piloto</option>
                  {pilotosDisponibles
                    .filter(p => !operacion.pilotos.includes(p))
                    .map(piloto => (
                      <option key={piloto} value={piloto}>{piloto}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            {/* Ayudantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayudantes
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {operacion.ayudantes.map(ayudante => (
                  <div key={ayudante} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                    <span>{ayudante}</span>
                    <button 
                      type="button" 
                      className="ml-2 text-green-600 hover:text-green-800"
                      onClick={() => handleAyudanteChange(ayudante, 'quitar')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <select
                  className="input w-full"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAyudanteChange(e.target.value, 'agregar');
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Agregar ayudante</option>
                  {ayudantesDisponibles
                    .filter(a => !operacion.ayudantes.includes(a))
                    .map(ayudante => (
                      <option key={ayudante} value={ayudante}>{ayudante}</option>
                    ))
                  }
                </select>
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
