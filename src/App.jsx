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
          loading ? (
            <div className="flex justify-center items-center h-screen">Cargando...</div>
          ) : user ? (
            <Navigate to="/operaciones" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/operaciones" element={
          <ProtectedRoute>
            <Layout>
              <OperacionesPage />
            </Layout>
          </ProtectedRoute>
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
          <ProtectedRoute>
            <Layout>
              <OperacionDetallePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={
          loading ? (
            <div className="flex justify-center items-center h-screen">Cargando...</div>
          ) : user ? (
            <Navigate to="/operaciones" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
