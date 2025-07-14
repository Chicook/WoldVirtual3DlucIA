/**
 * 📚 ManualsModule - Gestión de Manuales y Documentación
 * 
 * Responsabilidades:
 * - Gestión de manuales
 * - Documentación técnica
 * - Guías de usuario
 * - Tutoriales interactivos
 * - Búsqueda de contenido
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInternalAPI } from '../../../@types/core/module.d';
import { centralCoordinator } from '../../../src/core/CentralModuleCoordinator';
import { interModuleBus } from '../../../src/core/InterModuleMessageBus';
import { EventEmitter } from 'events';

// ============================================================================
// INTERFACES ESPECÍFICAS DE MANUALES
// ============================================================================

interface ManualsConfig {
  enabled: boolean;
  languages: string[];
  defaultLanguage: string;
  categories: ManualCategory[];
  search: SearchConfig;
  versioning: VersioningConfig;
}

interface ManualCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  children: string[];
  order: number;
}

interface SearchConfig {
  enabled: boolean;
  engine: 'elasticsearch' | 'lucene' | 'simple';
  indexInterval: number;
  fuzzySearch: boolean;
  highlightResults: boolean;
  maxResults: number;
}

interface VersioningConfig {
  enabled: boolean;
  autoVersion: boolean;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  changelog: boolean;
}

interface Manual {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  tags: string[];
  content: ManualContent;
  metadata: Record<string, any>;
}

interface ManualContent {
  sections: ManualSection[];
  attachments: ManualAttachment[];
  links: ManualLink[];
  codeExamples: CodeExample[];
  images: ManualImage[];
}

interface ManualSection {
  id: string;
  title: string;
  content: string;
  order: number;
  level: number;
  parentId?: string;
  children: string[];
  metadata: Record<string, any>;
}

interface ManualAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'md';
  size: number;
  path: string;
  description: string;
  uploadedAt: Date;
  downloads: number;
}

interface ManualLink {
  id: string;
  title: string;
  url: string;
  type: 'internal' | 'external' | 'api';
  description: string;
  active: boolean;
  lastChecked: Date;
}

interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  output?: string;
  tags: string[];
}

interface ManualImage {
  id: string;
  name: string;
  path: string;
  alt: string;
  caption: string;
  size: number;
  dimensions: { width: number; height: number };
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  manualId: string;
  steps: TutorialStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  order: number;
  type: 'text' | 'image' | 'video' | 'interactive' | 'code';
  content: string;
  expectedResult?: string;
  hints: string[];
  completed: boolean;
}

interface SearchResult {
  id: string;
  type: 'manual' | 'tutorial' | 'section';
  title: string;
  description: string;
  relevance: number;
  highlights: string[];
  metadata: Record<string, any>;
}

interface UserProgress {
  userId: string;
  manualId: string;
  sectionsRead: string[];
  tutorialsCompleted: string[];
  bookmarks: string[];
  notes: UserNote[];
  lastAccessed: Date;
  timeSpent: number;
}

interface UserNote {
  id: string;
  sectionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// ============================================================================
// CLASE PRINCIPAL DE MANUALES
// ============================================================================

class ManualsManager extends EventEmitter {
  private config: ManualsConfig;
  private manuals: Map<string, Manual> = new Map();
  private tutorials: Map<string, Tutorial> = new Map();
  private categories: Map<string, ManualCategory> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private searchIndex: Map<string, SearchResult> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): ManualsConfig {
    return {
      enabled: true,
      languages: ['en', 'es', 'fr', 'de'],
      defaultLanguage: 'en',
      categories: [],
      search: {
        enabled: true,
        engine: 'simple',
        indexInterval: 300000, // 5 minutos
        fuzzySearch: true,
        highlightResults: true,
        maxResults: 50
      },
      versioning: {
        enabled: true,
        autoVersion: true,
        majorVersion: 1,
        minorVersion: 0,
        patchVersion: 0,
        changelog: true
      }
    };
  }

  async initialize(): Promise<void> {
    console.log('[📚] Initializing ManualsManager...');
    
    try {
      await this.loadConfiguration();
      await this.setupCategories();
      await this.setupDefaultManuals();
      await this.setupTutorials();
      await this.buildSearchIndex();
      
      this.isInitialized = true;
      console.log('[✅] ManualsManager initialized successfully');
    } catch (error) {
      console.error('[❌] Error initializing ManualsManager:', error);
      throw error;
    }
  }

  private async loadConfiguration(): Promise<void> {
    console.log('[📚] Loading manuals configuration...');
    
    // En un entorno real, cargaría desde archivo o base de datos
    this.config = this.getDefaultConfig();
  }

  private async setupCategories(): Promise<void> {
    console.log('[📚] Setting up manual categories...');
    
    const defaultCategories: ManualCategory[] = [
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Basic setup and introduction guides',
        icon: '🚀',
        color: '#4CAF50',
        children: [],
        order: 1
      },
      {
        id: 'user_guide',
        name: 'User Guide',
        description: 'Complete user documentation',
        icon: '👤',
        color: '#2196F3',
        children: [],
        order: 2
      },
      {
        id: 'developer_guide',
        name: 'Developer Guide',
        description: 'Technical documentation for developers',
        icon: '💻',
        color: '#FF9800',
        children: [],
        order: 3
      },
      {
        id: 'api_reference',
        name: 'API Reference',
        description: 'Complete API documentation',
        icon: '🔗',
        color: '#9C27B0',
        children: [],
        order: 4
      },
      {
        id: 'troubleshooting',
        name: 'Troubleshooting',
        description: 'Common issues and solutions',
        icon: '🔧',
        color: '#F44336',
        children: [],
        order: 5
      },
      {
        id: 'advanced_topics',
        name: 'Advanced Topics',
        description: 'Advanced features and concepts',
        icon: '🎯',
        color: '#607D8B',
        children: [],
        order: 6
      }
    ];

    for (const category of defaultCategories) {
      this.categories.set(category.id, category);
    }
  }

  private async setupDefaultManuals(): Promise<void> {
    console.log('[📚] Setting up default manuals...');
    
    const defaultManuals: Manual[] = [
      {
        id: 'quick_start',
        title: 'Quick Start Guide',
        description: 'Get up and running with WoldVirtual3DlucIA in minutes',
        category: 'getting_started',
        language: 'en',
        version: '1.0.0',
        author: 'WoldVirtual Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        tags: ['beginner', 'setup', 'installation'],
        content: {
          sections: [
            {
              id: 'intro',
              title: 'Introduction',
              content: 'Welcome to WoldVirtual3DlucIA, the next-generation metaverse platform...',
              order: 1,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'installation',
              title: 'Installation',
              content: 'Follow these steps to install WoldVirtual3DlucIA on your system...',
              order: 2,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'first_steps',
              title: 'First Steps',
              content: 'Learn the basics of navigating and using the platform...',
              order: 3,
              level: 1,
              children: [],
              metadata: {}
            }
          ],
          attachments: [],
          links: [],
          codeExamples: [],
          images: []
        },
        metadata: { featured: true }
      },
      {
        id: 'user_manual',
        title: 'Complete User Manual',
        description: 'Comprehensive guide to all features and functionality',
        category: 'user_guide',
        language: 'en',
        version: '1.0.0',
        author: 'WoldVirtual Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        tags: ['comprehensive', 'features', 'guide'],
        content: {
          sections: [
            {
              id: 'overview',
              title: 'Platform Overview',
              content: 'WoldVirtual3DlucIA is a decentralized metaverse platform...',
              order: 1,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'navigation',
              title: 'Navigation and Interface',
              content: 'Learn how to navigate the 3D environment and use the interface...',
              order: 2,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'avatars',
              title: 'Avatar Customization',
              content: 'Create and customize your virtual avatar...',
              order: 3,
              level: 1,
              children: [],
              metadata: {}
            }
          ],
          attachments: [],
          links: [],
          codeExamples: [],
          images: []
        },
        metadata: { comprehensive: true }
      },
      {
        id: 'developer_manual',
        title: 'Developer Documentation',
        description: 'Technical documentation for developers and integrators',
        category: 'developer_guide',
        language: 'en',
        version: '1.0.0',
        author: 'WoldVirtual Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        tags: ['technical', 'api', 'development'],
        content: {
          sections: [
            {
              id: 'architecture',
              title: 'System Architecture',
              content: 'Understanding the modular architecture of WoldVirtual3DlucIA...',
              order: 1,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'api_overview',
              title: 'API Overview',
              content: 'Overview of available APIs and integration points...',
              order: 2,
              level: 1,
              children: [],
              metadata: {}
            },
            {
              id: 'modules',
              title: 'Module System',
              content: 'Working with the modular system and creating custom modules...',
              order: 3,
              level: 1,
              children: [],
              metadata: {}
            }
          ],
          attachments: [],
          links: [],
          codeExamples: [
            {
              id: 'api_example',
              title: 'Basic API Usage',
              language: 'javascript',
              code: 'const api = new WoldVirtualAPI();\nconst result = await api.connect();',
              description: 'Example of basic API connection',
              tags: ['api', 'javascript']
            }
          ],
          images: []
        },
        metadata: { technical: true }
      }
    ];

    for (const manual of defaultManuals) {
      this.manuals.set(manual.id, manual);
    }
  }

  private async setupTutorials(): Promise<void> {
    console.log('[📚] Setting up tutorials...');
    
    const defaultTutorials: Tutorial[] = [
      {
        id: 'create_avatar',
        title: 'Creating Your First Avatar',
        description: 'Step-by-step guide to creating and customizing your avatar',
        manualId: 'user_manual',
        steps: [
          {
            id: 'step_1',
            title: 'Access Avatar Creator',
            description: 'Navigate to the avatar creation section',
            order: 1,
            type: 'text',
            content: 'Click on the "Avatar" button in the main menu',
            hints: ['Look for the avatar icon', 'Check the top navigation bar'],
            completed: false
          },
          {
            id: 'step_2',
            title: 'Choose Base Model',
            description: 'Select a base model for your avatar',
            order: 2,
            type: 'interactive',
            content: 'Browse through available base models and select one',
            hints: ['Try different models', 'Consider your preferences'],
            completed: false
          },
          {
            id: 'step_3',
            title: 'Customize Appearance',
            description: 'Customize your avatar\'s appearance',
            order: 3,
            type: 'interactive',
            content: 'Adjust features like hair, eyes, skin tone, and clothing',
            hints: ['Take your time', 'Experiment with different options'],
            completed: false
          }
        ],
        difficulty: 'beginner',
        estimatedTime: 15,
        prerequisites: [],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'build_world',
        title: 'Building Your First World',
        description: 'Learn how to create and customize your own virtual world',
        manualId: 'developer_manual',
        steps: [
          {
            id: 'step_1',
            title: 'Access World Builder',
            description: 'Open the world building interface',
            order: 1,
            type: 'text',
            content: 'Navigate to the "World Builder" section',
            hints: ['Check the developer tools', 'Look for the builder icon'],
            completed: false
          },
          {
            id: 'step_2',
            title: 'Choose Template',
            description: 'Select a world template to start with',
            order: 2,
            type: 'interactive',
            content: 'Browse available templates and select one that fits your needs',
            hints: ['Consider your world\'s purpose', 'Look at preview images'],
            completed: false
          },
          {
            id: 'step_3',
            title: 'Add Objects',
            description: 'Add objects and structures to your world',
            order: 3,
            type: 'interactive',
            content: 'Drag and drop objects from the library into your world',
            hints: ['Start with basic objects', 'Use the search function'],
            completed: false
          }
        ],
        difficulty: 'intermediate',
        estimatedTime: 30,
        prerequisites: ['create_avatar'],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const tutorial of defaultTutorials) {
      this.tutorials.set(tutorial.id, tutorial);
    }
  }

  private async buildSearchIndex(): Promise<void> {
    console.log('[📚] Building search index...');
    
    if (!this.config.search.enabled) {
      return;
    }

    // Indexar manuales
    for (const manual of this.manuals.values()) {
      const searchResult: SearchResult = {
        id: manual.id,
        type: 'manual',
        title: manual.title,
        description: manual.description,
        relevance: 1.0,
        highlights: [manual.title, manual.description],
        metadata: { category: manual.category, language: manual.language }
      };
      
      this.searchIndex.set(`manual_${manual.id}`, searchResult);
    }

    // Indexar tutoriales
    for (const tutorial of this.tutorials.values()) {
      const searchResult: SearchResult = {
        id: tutorial.id,
        type: 'tutorial',
        title: tutorial.title,
        description: tutorial.description,
        relevance: 0.9,
        highlights: [tutorial.title, tutorial.description],
        metadata: { difficulty: tutorial.difficulty, estimatedTime: tutorial.estimatedTime }
      };
      
      this.searchIndex.set(`tutorial_${tutorial.id}`, searchResult);
    }

    console.log(`[📚] Search index built with ${this.searchIndex.size} items`);
  }

  async searchContent(query: string, filters?: {
    type?: string;
    category?: string;
    language?: string;
    difficulty?: string;
  }): Promise<SearchResult[]> {
    if (!this.config.search.enabled) {
      return [];
    }

    console.log(`[📚] Searching for: ${query}`);

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const result of this.searchIndex.values()) {
      let relevance = 0;
      const highlights: string[] = [];

      // Buscar en título
      if (result.title.toLowerCase().includes(queryLower)) {
        relevance += 2;
        highlights.push(result.title);
      }

      // Buscar en descripción
      if (result.description.toLowerCase().includes(queryLower)) {
        relevance += 1;
        highlights.push(result.description);
      }

      // Aplicar filtros
      if (filters) {
        if (filters.type && result.type !== filters.type) continue;
        if (filters.category && result.metadata.category !== filters.category) continue;
        if (filters.language && result.metadata.language !== filters.language) continue;
        if (filters.difficulty && result.metadata.difficulty !== filters.difficulty) continue;
      }

      if (relevance > 0) {
        result.relevance = relevance;
        result.highlights = highlights;
        results.push(result);
      }
    }

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);

    // Limitar resultados
    return results.slice(0, this.config.search.maxResults);
  }

  async getManual(manualId: string): Promise<Manual | null> {
    return this.manuals.get(manualId) || null;
  }

  async getManuals(category?: string, language?: string): Promise<Manual[]> {
    let manuals = Array.from(this.manuals.values());
    
    if (category) {
      manuals = manuals.filter(m => m.category === category);
    }
    
    if (language) {
      manuals = manuals.filter(m => m.language === language);
    }
    
    return manuals.sort((a, b) => a.title.localeCompare(b.title));
  }

  async getTutorials(manualId?: string, difficulty?: string): Promise<Tutorial[]> {
    let tutorials = Array.from(this.tutorials.values());
    
    if (manualId) {
      tutorials = tutorials.filter(t => t.manualId === manualId);
    }
    
    if (difficulty) {
      tutorials = tutorials.filter(t => t.difficulty === difficulty);
    }
    
    return tutorials.sort((a, b) => a.title.localeCompare(b.title));
  }

  async getCategories(): Promise<ManualCategory[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  async getUserProgress(userId: string, manualId?: string): Promise<UserProgress | null> {
    const key = manualId ? `${userId}_${manualId}` : userId;
    return this.userProgress.get(key) || null;
  }

  async updateUserProgress(
    userId: string,
    manualId: string,
    updates: {
      sectionsRead?: string[];
      tutorialsCompleted?: string[];
      bookmarks?: string[];
      notes?: UserNote[];
    }
  ): Promise<void> {
    const key = `${userId}_${manualId}`;
    let progress = this.userProgress.get(key);

    if (!progress) {
      progress = {
        userId,
        manualId,
        sectionsRead: [],
        tutorialsCompleted: [],
        bookmarks: [],
        notes: [],
        lastAccessed: new Date(),
        timeSpent: 0
      };
    }

    if (updates.sectionsRead) {
      progress.sectionsRead = [...new Set([...progress.sectionsRead, ...updates.sectionsRead])];
    }

    if (updates.tutorialsCompleted) {
      progress.tutorialsCompleted = [...new Set([...progress.tutorialsCompleted, ...updates.tutorialsCompleted])];
    }

    if (updates.bookmarks) {
      progress.bookmarks = updates.bookmarks;
    }

    if (updates.notes) {
      progress.notes = updates.notes;
    }

    progress.lastAccessed = new Date();
    this.userProgress.set(key, progress);

    this.emit('userProgressUpdated', progress);
  }

  async createManual(manual: Omit<Manual, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const manualId = `manual_${Date.now()}`;
    const newManual: Manual = {
      ...manual,
      id: manualId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.manuals.set(manualId, newManual);

    // Actualizar índice de búsqueda
    if (this.config.search.enabled) {
      const searchResult: SearchResult = {
        id: manualId,
        type: 'manual',
        title: newManual.title,
        description: newManual.description,
        relevance: 1.0,
        highlights: [newManual.title, newManual.description],
        metadata: { category: newManual.category, language: newManual.language }
      };
      
      this.searchIndex.set(`manual_${manualId}`, searchResult);
    }

    this.emit('manualCreated', newManual);
    console.log(`[📚] Manual created: ${newManual.title}`);

    return manualId;
  }

  async updateManual(manualId: string, updates: Partial<Manual>): Promise<void> {
    const manual = this.manuals.get(manualId);
    if (!manual) {
      throw new Error(`Manual ${manualId} not found`);
    }

    const updatedManual = {
      ...manual,
      ...updates,
      updatedAt: new Date()
    };

    this.manuals.set(manualId, updatedManual);

    // Actualizar índice de búsqueda
    if (this.config.search.enabled) {
      const searchResult: SearchResult = {
        id: manualId,
        type: 'manual',
        title: updatedManual.title,
        description: updatedManual.description,
        relevance: 1.0,
        highlights: [updatedManual.title, updatedManual.description],
        metadata: { category: updatedManual.category, language: updatedManual.language }
      };
      
      this.searchIndex.set(`manual_${manualId}`, searchResult);
    }

    this.emit('manualUpdated', updatedManual);
    console.log(`[📚] Manual updated: ${updatedManual.title}`);
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  async getFeaturedManuals(): Promise<Manual[]> {
    return Array.from(this.manuals.values())
      .filter(m => m.metadata.featured)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getRecentManuals(limit: number = 10): Promise<Manual[]> {
    return Array.from(this.manuals.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async getPopularTutorials(limit: number = 10): Promise<Tutorial[]> {
    return Array.from(this.tutorials.values())
      .filter(t => t.status === 'published')
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit);
  }

  async exportManual(manualId: string, format: 'pdf' | 'html' | 'markdown'): Promise<string> {
    const manual = this.manuals.get(manualId);
    if (!manual) {
      throw new Error(`Manual ${manualId} not found`);
    }

    console.log(`[📚] Exporting manual: ${manual.title} as ${format}`);

    // Simular exportación
    const exportPath = `/exports/${manual.title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
    
    // Simular tiempo de exportación
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    this.emit('manualExported', { manualId, format, path: exportPath });
    console.log(`[✅] Manual exported: ${exportPath}`);

    return exportPath;
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  async cleanup(): Promise<void> {
    console.log('[🧹] Cleaning up ManualsManager...');
    
    this.searchIndex.clear();
    this.userProgress.clear();
    
    console.log('[✅] ManualsManager cleaned up');
  }
}

// ============================================================================
// INSTANCIA Y EXPORTACIÓN
// ============================================================================

const manualsManager = new ManualsManager();

export const ManualsModule: ModuleWrapper = {
  name: 'manuals',
  dependencies: ['toolkit', 'languages'],
  publicAPI: {
    searchContent: (query, filters) => manualsManager.searchContent(query, filters),
    getManual: (manualId) => manualsManager.getManual(manualId),
    getManuals: (category, language) => manualsManager.getManuals(category, language),
    getTutorials: (manualId, difficulty) => manualsManager.getTutorials(manualId, difficulty),
    getCategories: () => manualsManager.getCategories(),
    getUserProgress: (userId, manualId) => manualsManager.getUserProgress(userId, manualId),
    updateUserProgress: (userId, manualId, updates) => manualsManager.updateUserProgress(userId, manualId, updates),
    createManual: (manual) => manualsManager.createManual(manual),
    updateManual: (manualId, updates) => manualsManager.updateManual(manualId, updates),
    getFeaturedManuals: () => manualsManager.getFeaturedManuals(),
    getRecentManuals: (limit) => manualsManager.getRecentManuals(limit),
    getPopularTutorials: (limit) => manualsManager.getPopularTutorials(limit),
    exportManual: (manualId, format) => manualsManager.exportManual(manualId, format)
  },
  internalAPI: {
    manager: manualsManager
  },
  
  async initialize(userId: string): Promise<void> {
    console.log(`[📚] Initializing ManualsModule for user ${userId}...`);
    await manualsManager.initialize();
    
    // Suscribirse a eventos del message bus
    const messageBus = interModuleBus.getInstance();
    messageBus.subscribe('manual-search', async (request: { query: string; filters?: any }) => {
      await manualsManager.searchContent(request.query, request.filters);
    });
    
    console.log(`[✅] ManualsModule initialized for user ${userId}`);
  },
  
  async cleanup(userId: string): Promise<void> {
    console.log(`[🧹] Cleaning up ManualsModule for user ${userId}...`);
    await manualsManager.cleanup();
    console.log(`[✅] ManualsModule cleaned up for user ${userId}`);
  }
};

export default ManualsModule; 