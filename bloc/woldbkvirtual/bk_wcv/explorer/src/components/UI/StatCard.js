import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'blue', loading = false, change = null }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`card border ${colorClasses[color]} relative overflow-hidden`}
    >
      {/* Fondo con gradiente sutil */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 bg-gray-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
            {change && (
              <div className={`flex items-center mt-1 text-sm ${
                change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{change > 0 ? '+' : ''}{change}%</span>
                <span className="ml-1">vs último período</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-500/10 ${iconColorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 