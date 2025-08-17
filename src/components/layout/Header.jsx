import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">OperAI</Link>
        
        {/* Menú para móvil */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
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
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-200 transition-colors">Inicio</Link>
          <Link to="/drones" className="hover:text-gray-200 transition-colors">Drones</Link>
          <Link to="/operaciones" className="hover:text-gray-200 transition-colors">Operaciones</Link>
          <Link to="/reportes" className="hover:text-gray-200 transition-colors">Reportes</Link>
        </nav>
      </div>
      
      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-dark">
          <div className="container mx-auto px-4 py-2">
            <Link to="/" className="block py-2 hover:bg-primary-dark rounded px-2">Inicio</Link>
            <Link to="/drones" className="block py-2 hover:bg-primary-dark rounded px-2">Drones</Link>
            <Link to="/operaciones" className="block py-2 hover:bg-primary-dark rounded px-2">Operaciones</Link>
            <Link to="/reportes" className="block py-2 hover:bg-primary-dark rounded px-2">Reportes</Link>
          </div>
        </div>
      )}
    </header>
  );
}
