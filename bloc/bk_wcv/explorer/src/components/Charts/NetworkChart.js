import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const NetworkChart = () => {
  // Datos simulados para el gráfico
  const data = [
    { time: '00:00', txs: 45, blocks: 12, gas: 2.1 },
    { time: '04:00', txs: 52, blocks: 15, gas: 2.3 },
    { time: '08:00', txs: 78, blocks: 18, gas: 2.8 },
    { time: '12:00', txs: 95, blocks: 22, gas: 3.2 },
    { time: '16:00', txs: 87, blocks: 20, gas: 2.9 },
    { time: '20:00', txs: 73, blocks: 17, gas: 2.5 },
    { time: '24:00', txs: 61, blocks: 14, gas: 2.2 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{`Hora: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTxs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBlocks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="txs"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorTxs)"
            name="Transacciones"
          />
          <Area
            type="monotone"
            dataKey="blocks"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorBlocks)"
            name="Bloques"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-400">Transacciones</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-400">Bloques</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkChart; 