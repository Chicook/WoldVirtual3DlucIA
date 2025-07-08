import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  MagnifyingGlassIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, searchByHash, loading } = useBlockchain();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Ingresa un hash o dirección para buscar');
      return;
    }

    try {
      const result = await searchByHash(searchQuery.trim());
      
      switch (result.type) {
        case 'block':
          navigate(`/block/${result.data.number}`);
          break;
        case 'transaction':
          navigate(`/tx/${result.data.hash}`);
          break;
        case 'address':
          navigate(`/address/${result.data.address}`);
          break;
        default:
          toast.error('No se encontró ningún resultado');
      }
      
      setSearchQuery('');
    } catch (error) {
      toast.error('Error en la búsqueda: ' + error.message);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">W</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">WoldPBVirtual</h1>
              <p className="text-xs text-gray-400">Explorador WCV</p>
            </div>
          </Link>

          {/* Búsqueda */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por hash, dirección o número de bloque..."
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-sm transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </form>
          </div>

          {/* Estado de conexión y controles */}
          <div className="flex items-center space-x-4">
            {/* Estado de conexión */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-300">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            {/* Botón de tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-300" />
              )}
            </button>

            {/* Menú móvil */}
            <button
              onClick={toggleMobileMenu}
              className="sm:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-300" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-gray-700 py-4"
          >
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Inicio
              </Link>
              <Link
                to="/blocks"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Bloques
              </Link>
              <Link
                to="/transactions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Transacciones
              </Link>
              <Link
                to="/token"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Token WCV
              </Link>
              <Link
                to="/bridge"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Bridge
              </Link>
              <Link
                to="/stats"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Estadísticas
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 