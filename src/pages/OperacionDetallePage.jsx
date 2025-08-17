import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OperacionDetallePage() {
  const { id } = useParams();
  const [operacion, setOperacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de carga de datos
    setCargando(true);
    setTimeout(() => {
      // Datos de ejemplo para la operación
      if (id === 'OP-001') {
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
          archivos: [
            { nombre: 'mapa_3d.obj', tipo: 'Modelo 3D', tamaño: '45MB' },
            { nombre: 'ortofoto.tif', tipo: 'Imagen', tamaño: '120MB' },
            { nombre: 'informe_final.pdf', tipo: 'Documento', tamaño: '2.5MB' }
          ],
          historial: [
            { fecha: '10/08/2025', accion: 'Creación de la operación', usuario: 'Admin' },
            { fecha: '12/08/2025', accion: 'Asignación de piloto y drone', usuario: 'Coordinador' },
            { fecha: '15/08/2025', accion: 'Inicio de operación', usuario: 'Juan Pérez' },
            { fecha: '15/08/2025', accion: 'Finalización de operación', usuario: 'Juan Pérez' },
            { fecha: '16/08/2025', accion: 'Carga de archivos', usuario: 'Juan Pérez' }
          ]
        });
      } else if (id === 'OP-002') {
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
          archivos: [],
          historial: [
            { fecha: '12/08/2025', accion: 'Creación de la operación', usuario: 'Admin' },
            { fecha: '14/08/2025', accion: 'Asignación de piloto y drone', usuario: 'Coordinador' },
            { fecha: '16/08/2025', accion: 'Inicio de operación', usuario: 'María González' }
          ]
        });
      } else if (id === 'OP-003') {
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
          archivos: [],
          historial: [
            { fecha: '14/08/2025', accion: 'Creación de la operación', usuario: 'Admin' },
            { fecha: '15/08/2025', accion: 'Asignación de piloto y drone', usuario: 'Coordinador' }
          ]
        });
      } else {
        setError('No se encontró la operación solicitada');
      }
      setCargando(false);
    }, 800);
  }, [id]);

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <div className="mt-4">
          <Link to="/operaciones" className="btn btn-primary">
            Volver a la lista de operaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalles de Operación</h1>
        <div className="flex space-x-3">
          <Link to="/operaciones" className="btn bg-gray-200 text-gray-800 hover:bg-gray-300">
            Volver
          </Link>
          <Link to={`/operaciones/editar/${id}`} className="btn btn-primary">
            Editar
          </Link>
        </div>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      {/* Archivos */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Archivos</h2>
        {operacion.archivos && operacion.archivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Tipo</th>
                  <th className="py-2 px-4 text-left">Tamaño</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {operacion.archivos.map((archivo, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{archivo.nombre}</td>
                    <td className="py-2 px-4">{archivo.tipo}</td>
                    <td className="py-2 px-4">{archivo.tamaño}</td>
                    <td className="py-2 px-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay archivos disponibles para esta operación.</p>
        )}
      </div>

      {/* Historial */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Historial de la Operación</h2>
        <div className="space-y-4">
          {operacion.historial && operacion.historial.map((evento, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{evento.accion}</p>
                  <p className="text-sm text-gray-500">{evento.fecha}</p>
                </div>
                <p className="text-sm text-gray-600">Por: {evento.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
