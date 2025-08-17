import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Bienvenido a OperAI</h1>
        <p className="text-xl mb-6">Sistema de gestión de operaciones con drones</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/drones" className="btn bg-white text-primary hover:bg-gray-100">
            Ver Drones
          </Link>
          <Link to="/operaciones" className="btn bg-transparent border border-white hover:bg-white/10">
            Gestionar Operaciones
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-primary text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Monitoreo en Tiempo Real</h2>
          <p className="text-gray-600">Visualiza el estado y ubicación de tus drones en tiempo real.</p>
        </div>

        <div className="card">
          <div className="text-primary text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Gestión de Operaciones</h2>
          <p className="text-gray-600">Planifica y gestiona todas tus operaciones con drones de manera eficiente.</p>
        </div>

        <div className="card">
          <div className="text-primary text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Informes Detallados</h2>
          <p className="text-gray-600">Genera informes detallados sobre el rendimiento y actividad de tus drones.</p>
        </div>
      </div>

      <section className="card bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Operaciones Recientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Drone</th>
                <th className="py-2 px-4 text-left">Tipo</th>
                <th className="py-2 px-4 text-left">Fecha</th>
                <th className="py-2 px-4 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4">OP-001</td>
                <td className="py-2 px-4">Phantom 4 Pro</td>
                <td className="py-2 px-4">Mapeo</td>
                <td className="py-2 px-4">15/08/2025</td>
                <td className="py-2 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completada</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4">OP-002</td>
                <td className="py-2 px-4">Mavic 3</td>
                <td className="py-2 px-4">Inspección</td>
                <td className="py-2 px-4">16/08/2025</td>
                <td className="py-2 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">En progreso</span></td>
              </tr>
              <tr>
                <td className="py-2 px-4">OP-003</td>
                <td className="py-2 px-4">Autel EVO II</td>
                <td className="py-2 px-4">Fotografía</td>
                <td className="py-2 px-4">17/08/2025</td>
                <td className="py-2 px-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Planificada</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link to="/operaciones" className="text-primary hover:underline">Ver todas las operaciones →</Link>
        </div>
      </section>
    </div>
  );
}
