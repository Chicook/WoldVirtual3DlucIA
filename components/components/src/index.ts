// ============================================================================
// 📦 EXPORTACIONES PRINCIPALES - Biblioteca de Componentes 3D
// ============================================================================

// 🎮 Componentes Core 3D
export * from './core/Scene';
export * from './core/Object';
export * from './core/Lighting';
export * from './core/Camera';

// 👤 Componentes de Avatar
export * from './avatar/Avatar';
export * from './avatar/Animation';
export * from './avatar/Clothing';
export * from './avatar/Expression';

// 🏗️ Componentes del Mundo
export * from './world/Building';
export * from './world/Landscape';
export * from './world/Interactive';
export * from './world/Portal';

// 💰 Componentes Crypto/Blockchain
export * from './crypto/Wallet';
export * from './crypto/NFT';
export * from './crypto/Token';
export * from './crypto/Transaction';

// 🎨 Componentes UI/UX
export * from './ui/HUD';
export * from './ui/Menu';
export * from './ui/Chat';
export * from './ui/Notification';

// 🎯 Componentes Interactivos
export * from './interactive/Button';
export * from './interactive/Panel';
export * from './interactive/Modal';
export * from './interactive/Form';

// 🛠️ Utilidades y Helpers
export * from './utilities/Loader';
export * from './utilities/Optimizer';
export * from './utilities/Validator';
export * from './utilities/Helper';

// 🎣 Hooks Personalizados
export * from './hooks/useThreeScene';
export * from './hooks/useAvatar';
export * from './hooks/useCrypto';
export * from './hooks/useMetaverso';

// 📝 Tipos y Interfaces
export * from './types/index';

// 🔧 Utilidades
export * from './utils/three';
export * from './utils/crypto';
export * from './utils/performance';

// ============================================================================
// 🚀 EXPORTACIONES POR CATEGORÍAS
// ============================================================================

// Exportar categorías completas
export { default as CoreComponents } from './core';
export { default as AvatarComponents } from './avatar';
export { default as WorldComponents } from './world';
export { default as CryptoComponents } from './crypto';
export { default as UIComponents } from './ui';
export { default as InteractiveComponents } from './interactive';
export { default as UtilityComponents } from './utilities';

// ============================================================================
// 📊 ESTADÍSTICAS DE COMPONENTES
// ============================================================================

export const COMPONENT_STATS = {
  total: 24,
  core: 4,
  avatar: 4,
  world: 4,
  crypto: 4,
  ui: 4,
  interactive: 4,
  utilities: 4
} as const;

// ============================================================================
// 🎯 VERSIÓN Y METADATOS
// ============================================================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const SUPPORTED_THREE_VERSION = '^0.158.0';
export const SUPPORTED_REACT_VERSION = '^18.2.0'; 