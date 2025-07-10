/**
 * 📦 ModuleGroups - Grupos de Módulos por Prioridad y Lenguaje
 * 
 * Sistema de agrupación inteligente para WoldVirtual3DlucIA
 * Organiza módulos por funcionalidad y distribuye carga entre lenguajes
 * 
 * Reglas de implementación:
 * - Máximo 200-300 líneas por archivo
 * - Distribución equilibrada entre lenguajes
 * - Carga bajo demanda por contexto
 * - Instanciación múltiple cuando sea necesario
 */

// ============================================================================
// GRUPOS PRINCIPALES POR PRIORIDAD
// ============================================================================

export const ModuleGroups = {
  // 🎯 GRUPO 1: INFRAESTRUCTURA CORE (Prioridad Máxima)
  CORE: {
    modules: ['config', 'data', 'models', 'services', 'middlewares'],
    languages: {
      typescript: ['config', 'models', 'services'],
      python: ['data'],
      javascript: ['middlewares']
    },
    priority: 1,
    maxFileSize: 250,
    instantiationLimit: 3
  },

  // 🌐 GRUPO 2: FRONTEND Y UI (Prioridad Alta)
  FRONTEND: {
    modules: ['web', 'pages', 'components', 'css', 'fonts', 'public'],
    languages: {
      typescript: ['web', 'pages', 'components'],
      javascript: ['public'],
      css: ['css', 'fonts']
    },
    priority: 2,
    maxFileSize: 300,
    instantiationLimit: 5
  },

  // ⛓️ GRUPO 3: BLOCKCHAIN Y WEB3 (Prioridad Alta)
  BLOCKCHAIN: {
    modules: ['bloc', 'assets', 'entities'],
    languages: {
      typescript: ['bloc', 'entities'],
      python: ['assets'],
      solidity: ['bloc/contracts']
    },
    priority: 2,
    maxFileSize: 280,
    instantiationLimit: 4
  },

  // 🤖 GRUPO 4: INTELIGENCIA ARTIFICIAL (Prioridad Media-Alta)
  AI: {
    modules: ['ini', 'js', 'test'],
    languages: {
      python: ['ini/lucIA'],
      javascript: ['js'],
      typescript: ['test']
    },
    priority: 3,
    maxFileSize: 300,
    instantiationLimit: 6
  },

  // 🛠️ GRUPO 5: UTILIDADES Y HERRAMIENTAS (Prioridad Media)
  UTILITIES: {
    modules: ['helpers', 'cli', 'scripts', 'lib', 'languages'],
    languages: {
      typescript: ['helpers', 'cli'],
      javascript: ['scripts', 'lib'],
      python: ['languages']
    },
    priority: 4,
    maxFileSize: 250,
    instantiationLimit: 4
  },

  // 🎨 GRUPO 6: MEDIOS Y RECURSOS (Prioridad Media)
  MEDIA: {
    modules: ['image', 'fonts', 'css', 'public'],
    languages: {
      javascript: ['image'],
      css: ['fonts', 'css'],
      typescript: ['public']
    },
    priority: 4,
    maxFileSize: 200,
    instantiationLimit: 3
  },

  // 🎮 GRUPO 7: EDITOR 3D (Prioridad Especial)
  EDITOR_3D: {
    modules: ['.bin', 'components', 'web', 'js'],
    languages: {
      typescript: ['.bin/editor3d', 'components'],
      javascript: ['js'],
      webgl: ['.bin/rendering']
    },
    priority: 1,
    maxFileSize: 300,
    instantiationLimit: 8
  },

  // 👤 GRUPO 8: CLIENTE PRINCIPAL (Prioridad Alta)
  CLIENT: {
    modules: ['client', 'components', 'web', 'services'],
    languages: {
      typescript: ['client', 'components'],
      javascript: ['web'],
      python: ['services']
    },
    priority: 2,
    maxFileSize: 280,
    instantiationLimit: 5
  },

  // 🧪 GRUPO 9: TESTING Y QA (Prioridad Baja)
  TESTING: {
    modules: ['test', 'coverage', 'scripts'],
    languages: {
      typescript: ['test'],
      javascript: ['scripts'],
      python: ['coverage']
    },
    priority: 5,
    maxFileSize: 200,
    instantiationLimit: 3
  },

  // 📚 GRUPO 10: DOCUMENTACIÓN (Prioridad Baja)
  DOCUMENTATION: {
    modules: ['docs', 'README', 'examples'],
    languages: {
      markdown: ['docs', 'README'],
      javascript: ['examples']
    },
    priority: 6,
    maxFileSize: 150,
    instantiationLimit: 2
  }
} as const;

// ============================================================================
// CONFIGURACIÓN DE LENGUAJES
// ============================================================================

export const LanguageConfig = {
  typescript: {
    extensions: ['.ts', '.tsx'],
    maxFileSize: 300,
    preferredFor: ['frontend', 'api', 'types', 'components'],
    strengths: ['type-safety', 'tooling', 'ecosystem'],
    instantiationPattern: 'module-per-feature'
  },

  javascript: {
    extensions: ['.js', '.jsx'],
    maxFileSize: 250,
    preferredFor: ['utilities', 'scripts', 'legacy'],
    strengths: ['flexibility', 'compatibility', 'speed'],
    instantiationPattern: 'functional-modules'
  },

  python: {
    extensions: ['.py'],
    maxFileSize: 280,
    preferredFor: ['ai', 'data-processing', 'automation'],
    strengths: ['ai-ml', 'data-science', 'automation'],
    instantiationPattern: 'class-based'
  },

  go: {
    extensions: ['.go'],
    maxFileSize: 300,
    preferredFor: ['backend', 'microservices', 'performance'],
    strengths: ['performance', 'concurrency', 'simplicity'],
    instantiationPattern: 'package-based'
  },

  rust: {
    extensions: ['.rs'],
    maxFileSize: 350,
    preferredFor: ['systems', 'performance-critical', 'security'],
    strengths: ['performance', 'memory-safety', 'zero-cost'],
    instantiationPattern: 'crate-based'
  },

  solidity: {
    extensions: ['.sol'],
    maxFileSize: 200,
    preferredFor: ['smart-contracts', 'blockchain'],
    strengths: ['blockchain', 'immutability', 'decentralization'],
    instantiationPattern: 'contract-based'
  }
};

// ============================================================================
// ESTRATEGIAS DE INSTANCIACIÓN
// ============================================================================

export const InstantiationStrategies = {
  // Estrategia para archivos que alcanzan el límite de líneas
  SPLIT_ON_LIMIT: {
    name: 'split-on-limit',
    trigger: 'file-size-exceeded',
    action: 'create-new-instance',
    naming: 'original-name-v2',
    maxLines: 300
  },

  // Estrategia para funcionalidades complejas
  FEATURE_BASED: {
    name: 'feature-based',
    trigger: 'complex-feature',
    action: 'separate-features',
    naming: 'feature-name',
    maxLines: 250
  },

  // Estrategia para optimización de rendimiento
  PERFORMANCE_BASED: {
    name: 'performance-based',
    trigger: 'performance-issue',
    action: 'optimize-and-split',
    naming: 'optimized-name',
    maxLines: 200
  },

  // Estrategia para mantenimiento
  MAINTENANCE_BASED: {
    name: 'maintenance-based',
    trigger: 'maintenance-needed',
    action: 'refactor-and-split',
    naming: 'maintained-name',
    maxLines: 250
  }
};

// ============================================================================
// REGLAS DE DISTRIBUCIÓN
// ============================================================================

export const DistributionRules = {
  // Regla 1: No más de 100 archivos del mismo lenguaje en una carpeta
  MAX_FILES_PER_LANGUAGE: 100,

  // Regla 2: Distribuir responsabilidades entre lenguajes
  LANGUAGE_DISTRIBUTION: {
    typescript: ['frontend', 'api', 'types', 'components'],
    javascript: ['utilities', 'scripts', 'legacy', 'prototypes'],
    python: ['ai', 'data', 'automation', 'analysis'],
    go: ['backend', 'microservices', 'performance'],
    rust: ['systems', 'performance-critical', 'security'],
    solidity: ['blockchain', 'smart-contracts']
  },

  // Regla 3: Instanciar cuando se alcance el límite
  INSTANTIATION_TRIGGERS: {
    fileSizeExceeded: true,
    featureComplexity: true,
    performanceIssue: true,
    maintenanceNeeded: true
  },

  // Regla 4: Nomenclatura para nuevas instancias
  NAMING_CONVENTION: {
    pattern: '{originalName}-{version}-{language}',
    versioning: 'v1, v2, v3...',
    languageSuffix: true
  }
};

// ============================================================================
// TIPOS Y UTILIDADES
// ============================================================================

export type ModuleGroupName = keyof typeof ModuleGroups;
export type LanguageName = keyof typeof LanguageConfig;

export interface ModuleGroupConfig {
  modules: string[];
  languages: Record<string, string[]>;
  priority: number;
  maxFileSize: number;
  instantiationLimit: number;
}

export interface LanguageConfigType {
  extensions: string[];
  maxFileSize: number;
  preferredFor: string[];
  strengths: string[];
  instantiationPattern: string;
}

export interface InstantiationStrategy {
  name: string;
  trigger: string;
  action: string;
  naming: string;
  maxLines: number;
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

export function getModuleGroup(name: ModuleGroupName): ModuleGroupConfig {
  return ModuleGroups[name];
}

export function getLanguageConfig(language: LanguageName): LanguageConfigType {
  return LanguageConfig[language];
}

export function shouldInstantiate(filePath: string, currentLines: number): boolean {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const language = Object.entries(LanguageConfig).find(([_, config]) => 
    config.extensions.includes(`.${extension}`)
  )?.[0] as LanguageName;

  if (!language) return false;

  const config = LanguageConfig[language];
  return currentLines >= config.maxFileSize;
}

export function getNextInstanceName(originalName: string, language: LanguageName): string {
  const config = LanguageConfig[language];
  const version = Date.now().toString().slice(-2);
  return `${originalName}-v${version}-${language}`;
}

export function getPreferredLanguageForFeature(feature: string): LanguageName {
  for (const [language, config] of Object.entries(LanguageConfig)) {
    if (config.preferredFor.includes(feature)) {
      return language as LanguageName;
    }
  }
  return 'typescript'; // Default fallback
} 