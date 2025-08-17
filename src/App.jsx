import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import OperacionesPage from './pages/OperacionesPage'
import OperacionFormPage from './pages/OperacionFormPage'
import OperacionDetallePage from './pages/OperacionDetallePage'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/operaciones" element={<OperacionesPage />} />
          <Route path="/operaciones/nueva" element={<OperacionFormPage />} />
          <Route path="/operaciones/editar/:id" element={<OperacionFormPage />} />
          <Route path="/operaciones/:id" element={<OperacionDetallePage />} />
          <Route path="/drones" element={<div className="p-8 text-center">Página de Drones en construcción</div>} />
          <Route path="/reportes" element={<div className="p-8 text-center">Página de Reportes en construcción</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
