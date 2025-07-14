// ===========================================
// UTILIDADES DE FORMATEO
// ===========================================

/**
 * Formatea un número con separadores de miles
 * @param {number|string} num - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Formatea una dirección de wallet (acorta)
 * @param {string} address - Dirección completa
 * @param {number} start - Caracteres al inicio (default: 6)
 * @param {number} end - Caracteres al final (default: 4)
 * @returns {string} Dirección acortada
 */
export const formatAddress = (address, start = 6, end = 4) => {
  if (!address || typeof address !== 'string') return 'N/A';
  
  if (address.length <= start + end) return address;
  
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Formatea un timestamp a fecha legible
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string} Fecha formateada
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

/**
 * Formatea un valor de gas
 * @param {string|number} gas - Valor de gas
 * @returns {string} Gas formateado
 */
export const formatGas = (gas) => {
  if (!gas) return '0';
  
  const gasNumber = typeof gas === 'string' ? parseFloat(gas) : gas;
  
  if (isNaN(gasNumber)) return '0';
  
  if (gasNumber >= 1e9) {
    return `${(gasNumber / 1e9).toFixed(2)} Gwei`;
  } else if (gasNumber >= 1e6) {
    return `${(gasNumber / 1e6).toFixed(2)} Mwei`;
  } else if (gasNumber >= 1e3) {
    return `${(gasNumber / 1e3).toFixed(2)} Kwei`;
  } else {
    return `${gasNumber} Wei`;
  }
};

/**
 * Formatea un valor de WCV
 * @param {string|number} value - Valor en wei
 * @param {number} decimals - Decimales (default: 3)
 * @returns {string} Valor formateado en WCV
 */
export const formatWCV = (value, decimals = 3) => {
  if (!value) return '0.000 WCV';
  const wcvValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(wcvValue)) return '0.000 WCV';
  return `${wcvValue.toFixed(3)} WCV`;
};

/**
 * Formatea un hash de transacción
 * @param {string} hash - Hash completo
 * @param {number} length - Longitud de caracteres (default: 10)
 * @returns {string} Hash acortado
 */
export const formatHash = (hash, length = 10) => {
  if (!hash || typeof hash !== 'string') return 'N/A';
  
  if (hash.length <= length * 2) return hash;
  
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

/**
 * Formatea un tamaño de archivo
 * @param {number} bytes - Bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatea una duración en segundos
 * @param {number} seconds - Segundos
 * @returns {string} Duración formateada
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor
 * @param {number} total - Total
 * @param {number} decimals - Decimales (default: 2)
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, total, decimals = 2) => {
  if (!total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formatea una velocidad (transacciones por segundo)
 * @param {number} tps - Transacciones por segundo
 * @returns {string} Velocidad formateada
 */
export const formatTPS = (tps) => {
  if (!tps || tps === 0) return '0 TPS';
  
  if (tps >= 1000) {
    return `${(tps / 1000).toFixed(2)} K TPS`;
  } else if (tps >= 1000000) {
    return `${(tps / 1000000).toFixed(2)} M TPS`;
  } else {
    return `${tps.toFixed(2)} TPS`;
  }
};

/**
 * Formatea un hashrate
 * @param {number} hashrate - Hashrate en H/s
 * @returns {string} Hashrate formateado
 */
export const formatHashrate = (hashrate) => {
  if (!hashrate || hashrate === 0) return '0 H/s';
  
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];
  const k = 1000;
  const i = Math.floor(Math.log(hashrate) / Math.log(k));
  
  return `${(hashrate / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

/**
 * Formatea una diferencia de tiempo relativa
 * @param {number} timestamp - Timestamp
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else {
    return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
};

/**
 * Formatea un estado de transacción
 * @param {number} status - Estado (0 = fallida, 1 = exitosa)
 * @returns {object} Objeto con estado y color
 */
export const formatTransactionStatus = (status) => {
  if (status === 1) {
    return {
      text: 'Exitosa',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: '✓'
    };
  } else {
    return {
      text: 'Fallida',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: '✗'
    };
  }
};

/**
 * Formatea un tipo de transacción
 * @param {string} to - Dirección destino
 * @param {string} data - Datos de la transacción
 * @returns {string} Tipo de transacción
 */
export const formatTransactionType = (to, data) => {
  if (!to) return 'Contract Creation';
  if (data && data !== '0x') return 'Contract Interaction';
  return 'Transfer';
};

/**
 * Formatea un valor de ether
 * @param {string|number} value - Valor en wei
 * @returns {string} Valor formateado en ETH
 */
export const formatEther = (value) => {
  if (!value) return '0 ETH';
  
  const weiValue = typeof value === 'string' ? value : value.toString();
  const ethValue = parseFloat(weiValue) / 1e18;
  
  if (isNaN(ethValue)) return '0 ETH';
  
  return `${ethValue.toFixed(6)} ETH`;
}; 