import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaHome, 
  FaSearch, 
  FaArrowLeft 
} from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-4xl text-red-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-white mb-4"
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-gray-300 mb-4"
        >
          Página no encontrada
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          Lo sentimos, la página que buscas no existe o ha sido movida. 
          Verifica la URL o navega usando los enlaces de abajo.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FaHome />
            Ir al Inicio
          </Link>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/blocks"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaSearch />
              Explorar Bloques
            </Link>
            
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaSearch />
              Ver Transacciones
            </Link>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            Volver atrás
          </button>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-3">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Si crees que esto es un error, puedes:
          </p>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• Verificar que la URL sea correcta</li>
            <li>• Usar la barra de búsqueda para encontrar lo que buscas</li>
            <li>• Navegar desde la página principal</li>
            <li>• Contactar al soporte si el problema persiste</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFoundPage; 