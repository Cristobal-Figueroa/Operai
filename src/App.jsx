import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import Layout from './components/layout/Layout'
import OperacionesPage from './pages/OperacionesPage'
import OperacionFormPage from './pages/OperacionFormPage'
import OperacionDetallePage from './pages/OperacionDetallePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={
          <Layout>
            <Navigate to="/operaciones" replace />
          </Layout>
        } />
        
        <Route path="/operaciones" element={
          <Layout>
            {loading ? (
              <div className="flex justify-center items-center h-screen">Cargando...</div>
            ) : (
              <OperacionesPage />
            )}
          </Layout>
        } />
        
        <Route path="/operaciones/nueva" element={
          <ProtectedRoute>
            <Layout>
              <OperacionFormPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operaciones/editar/:id" element={
          <ProtectedRoute>
            <Layout>
              <OperacionFormPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/operaciones/:id" element={
          <Layout>
            <OperacionDetallePage />
          </Layout>
        } />
        
        <Route path="*" element={<Navigate to="/operaciones" replace />} />
      </Routes>
    </Router>
  )
}

export default App
