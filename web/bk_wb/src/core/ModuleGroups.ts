export const ModuleGroups = {
  CORE: ['config', 'data', 'models', 'services', 'middlewares'],
  FRONTEND: ['web', 'pages', 'components', 'css', 'fonts', 'public'],
  BLOCKCHAIN: ['bloc', 'assets', 'entities'],
  AI: ['ini', 'js', 'test'],
  UTILITIES: ['helpers', 'cli', 'scripts', 'lib', 'languages'],
  MEDIA: ['image', 'fonts', 'css', 'public'],
  EDITOR: ['.bin', 'assets', 'helpers', 'entities'],
  INFRASTRUCTURE: ['config', 'data', 'services', 'middlewares', 'models']
};

export interface ModuleGroup {
  name: string;
  modules: string[];
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export const ModuleGroupDetails: Record<keyof typeof ModuleGroups, ModuleGroup> = {
  CORE: {
    name: 'Core',
    modules: ModuleGroups.CORE,
    description: 'Módulos fundamentales del sistema',
    priority: 'high'
  },
  FRONTEND: {
    name: 'Frontend',
    modules: ModuleGroups.FRONTEND,
    description: 'Interfaz de usuario y componentes React',
    priority: 'high'
  },
  BLOCKCHAIN: {
    name: 'Blockchain',
    modules: ModuleGroups.BLOCKCHAIN,
    description: 'Funcionalidad blockchain y NFTs',
    priority: 'high'
  },
  AI: {
    name: 'AI',
    modules: ModuleGroups.AI,
    description: 'Inteligencia artificial y LucIA',
    priority: 'medium'
  },
  UTILITIES: {
    name: 'Utilities',
    modules: ModuleGroups.UTILITIES,
    description: 'Herramientas y utilidades del sistema',
    priority: 'medium'
  },
  MEDIA: {
    name: 'Media',
    modules: ModuleGroups.MEDIA,
    description: 'Gestión de medios y recursos',
    priority: 'medium'
  },
  EDITOR: {
    name: 'Editor',
    modules: ModuleGroups.EDITOR,
    description: 'Herramientas de edición 3D',
    priority: 'low'
  },
  INFRASTRUCTURE: {
    name: 'Infrastructure',
    modules: ModuleGroups.INFRASTRUCTURE,
    description: 'Infraestructura del sistema',
    priority: 'high'
  }
};

export const getModuleGroup = (groupName: keyof typeof ModuleGroups): ModuleGroup => {
  return ModuleGroupDetails[groupName];
};

export const getModuleGroupsByPriority = (priority: 'high' | 'medium' | 'low'): ModuleGroup[] => {
  return Object.values(ModuleGroupDetails).filter(group => group.priority === priority);
};

export const getModuleDependencies = (moduleName: string): string[] => {
  const dependencies: Record<string, string[]> = {
    'web': ['components', 'pages'],
    'assets': ['web', 'components'],
    'blockchain': ['web', 'components'],
    'ini': ['web', 'components'],
    'components': [],
    'pages': ['components'],
    'services': ['data', 'models'],
    'middlewares': ['services'],
    'models': ['data'],
    'data': [],
    'config': [],
    'helpers': [],
    'cli': ['helpers'],
    'scripts': ['helpers'],
    'lib': [],
    'languages': [],
    'image': ['assets'],
    'fonts': [],
    'css': [],
    'public': [],
    'js': [],
    'test': [],
    '.bin': ['assets', 'helpers']
  };
  
  return dependencies[moduleName] || [];
}; 