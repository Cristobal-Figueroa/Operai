import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold flex items-center">
          OperAI
        </Link>
        
        {/* Menú para móvil */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none p-2 rounded-md hover:bg-primary-dark"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div> 
        
        {/* Menú para escritorio */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/operaciones" className="text-lg font-medium hover:text-gray-200 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Operaciones
          </Link>
          <div className="h-8 border-r border-white/30"></div>
          
          {!loading && (
            user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="bg-white text-primary rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="ml-2 font-medium">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-gray-200 transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="bg-white text-primary hover:bg-gray-200 px-3 py-1 rounded-md transition-colors">
                  Registrarse
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
      
      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-dark">
          <div className="container mx-auto px-4 py-3">
            <Link to="/operaciones" className="block py-3 hover:bg-primary-dark rounded px-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Operaciones
            </Link>
            <div className="border-t border-primary-dark my-2"></div>
            {!loading && (
              user ? (
                <>
                  <div className="py-3 px-3 flex items-center">
                    <span className="bg-white text-primary rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-2">{user.displayName || user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-3 px-3 hover:bg-primary-dark rounded"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-3 hover:bg-primary-dark rounded px-3">
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="block py-3 hover:bg-primary-dark rounded px-3">
                    Registrarse
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
