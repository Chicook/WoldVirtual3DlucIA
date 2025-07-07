import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/', icon: HomeIcon },
    { name: 'Bloques', href: '/blocks', icon: CubeIcon },
    { name: 'Transacciones', href: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Token WCV', href: '/token', icon: CurrencyDollarIcon },
    { name: 'Bridge', href: '/bridge', icon: ArrowPathIcon },
    { name: 'Estadísticas', href: '/stats', icon: ChartBarIcon },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:block w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                </motion.div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Información de la red */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Información de Red
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Red:</span>
              <span className="text-white">WCV Local</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain ID:</span>
              <span className="text-white">31337</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Símbolo:</span>
              <span className="text-white">WCV</span>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Enlaces Útiles
          </h3>
          <div className="space-y-2">
            <a
              href="https://github.com/woldvirtual3d/wcv-blockchain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <a
              href="https://docs.woldvirtual3d.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentación
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 