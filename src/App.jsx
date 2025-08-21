import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import OperacionesPage from './pages/OperacionesPage'
import OperacionFormPage from './pages/OperacionFormPage'
import OperacionDetallePage from './pages/OperacionDetallePage'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/operaciones" replace />} />
          <Route path="/operaciones" element={<OperacionesPage />} />
          <Route path="/operaciones/nueva" element={<OperacionFormPage />} />
          <Route path="/operaciones/editar/:id" element={<OperacionFormPage />} />
          <Route path="/operaciones/:id" element={<OperacionDetallePage />} />
          <Route path="*" element={<Navigate to="/operaciones" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
