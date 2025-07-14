// Tipos para las islas
export interface IslandData {
  id: string;
  name: string;
  description?: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  size: {
    width: number;
    height: number;
    depth: number;
  };
  type: 'starting' | 'trading' | 'adventure' | 'social' | 'custom';
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    theme?: string;
    maxPlayers?: number;
    features?: string[];
    [key: string]: any;
  };
}

// Eventos del sistema de islas
export interface IslandEvent {
  type: 'island_created' | 'island_updated' | 'island_deleted' | 'island_selected';
  data: IslandData;
  timestamp: Date;
}

// Estado global de las islas
export interface IslandState {
  islands: Map<string, IslandData>;
  selectedIslandId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Clase principal para gestionar islas
export class IslandManager {
  private state: IslandState;
  private listeners: Set<(state: IslandState) => void>;
  private eventListeners: Set<(event: IslandEvent) => void>;

  constructor() {
    this.state = {
      islands: new Map(),
      selectedIslandId: null,
      isLoading: false,
      error: null,
    };
    this.listeners = new Set();
    this.eventListeners = new Set();
    
    // Inicializar con islas por defecto
    this.initializeDefaultIslands();
  }

  // Inicializar islas por defecto
  private initializeDefaultIslands(): void {
    const defaultIslands: IslandData[] = [
      {
        id: 'island-starting',
        name: 'Isla de Inicio',
        description: 'La isla donde comienza tu aventura',
        position: { x: 0, y: 0, z: 0 },
        size: { width: 8, height: 1, depth: 8 },
        type: 'starting',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          theme: 'tropical',
          maxPlayers: 10,
          features: ['spawn', 'tutorial', 'basic_shop']
        }
      },
      {
        id: 'island-trading',
        name: 'Isla del Comercio',
        description: 'Centro de comercio y transacciones',
        position: { x: 15, y: 0, z: 10 },
        size: { width: 12, height: 2, depth: 12 },
        type: 'trading',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          theme: 'urban',
          maxPlayers: 50,
          features: ['marketplace', 'auction_house', 'bank']
        }
      },
      {
        id: 'island-adventure',
        name: 'Isla de la Aventura',
        description: 'Explora dungeons y encuentra tesoros',
        position: { x: -10, y: 0, z: 20 },
        size: { width: 15, height: 3, depth: 15 },
        type: 'adventure',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          theme: 'fantasy',
          maxPlayers: 20,
          features: ['dungeons', 'boss_fights', 'treasure_hunts']
        }
      }
    ];

    defaultIslands.forEach(island => {
      this.state.islands.set(island.id, island);
    });
  }

  // Suscribirse a cambios de estado
  subscribe(listener: (state: IslandState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Suscribirse a eventos
  subscribeToEvents(listener: (event: IslandEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  // Notificar cambios de estado
  private notifyStateChange(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Notificar eventos
  private notifyEvent(event: IslandEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  // Obtener estado actual
  getState(): IslandState {
    return { ...this.state };
  }

  // Obtener todas las islas
  getAllIslands(): IslandData[] {
    return Array.from(this.state.islands.values());
  }

  // Obtener isla por ID
  getIslandById(id: string): IslandData | null {
    return this.state.islands.get(id) || null;
  }

  // Obtener isla seleccionada
  getSelectedIsland(): IslandData | null {
    if (!this.state.selectedIslandId) return null;
    return this.state.islands.get(this.state.selectedIslandId) || null;
  }

  // Seleccionar isla
  selectIsland(id: string): void {
    if (this.state.islands.has(id)) {
      this.state.selectedIslandId = id;
      const island = this.state.islands.get(id)!;
      
      this.notifyEvent({
        type: 'island_selected',
        data: island,
        timestamp: new Date()
      });
      
      this.notifyStateChange();
    }
  }

  // Simular recepción de datos del editor web
  receiveIslandFromEditor(islandData: Omit<IslandData, 'id' | 'createdAt' | 'updatedAt'>): void {
    const id = `island-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newIsland: IslandData = {
      ...islandData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.state.islands.set(id, newIsland);
    
    this.notifyEvent({
      type: 'island_created',
      data: newIsland,
      timestamp: now
    });
    
    this.notifyStateChange();
  }

  // Actualizar isla existente
  updateIsland(id: string, updates: Partial<IslandData>): boolean {
    const existingIsland = this.state.islands.get(id);
    if (!existingIsland) return false;

    const updatedIsland: IslandData = {
      ...existingIsland,
      ...updates,
      id, // No permitir cambiar el ID
      updatedAt: new Date()
    };

    this.state.islands.set(id, updatedIsland);
    
    this.notifyEvent({
      type: 'island_updated',
      data: updatedIsland,
      timestamp: new Date()
    });
    
    this.notifyStateChange();
    return true;
  }

  // Eliminar isla
  deleteIsland(id: string): boolean {
    const island = this.state.islands.get(id);
    if (!island) return false;

    this.state.islands.delete(id);
    
    // Si la isla eliminada era la seleccionada, limpiar selección
    if (this.state.selectedIslandId === id) {
      this.state.selectedIslandId = null;
    }
    
    this.notifyEvent({
      type: 'island_deleted',
      data: island,
      timestamp: new Date()
    });
    
    this.notifyStateChange();
    return true;
  }

  // Buscar islas por tipo
  getIslandsByType(type: IslandData['type']): IslandData[] {
    return Array.from(this.state.islands.values()).filter(island => island.type === type);
  }

  // Buscar islas por propietario
  getIslandsByOwner(owner: string): IslandData[] {
    return Array.from(this.state.islands.values()).filter(island => island.owner === owner);
  }

  // Obtener islas en un área específica
  getIslandsInArea(
    center: { x: number; y: number; z: number },
    radius: number
  ): IslandData[] {
    return Array.from(this.state.islands.values()).filter(island => {
      const distance = Math.sqrt(
        Math.pow(island.position.x - center.x, 2) +
        Math.pow(island.position.y - center.y, 2) +
        Math.pow(island.position.z - center.z, 2)
      );
      return distance <= radius;
    });
  }

  // Simular carga de islas desde el servidor
  async loadIslandsFromServer(): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyStateChange();

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí normalmente cargarías desde el servidor
      // Por ahora solo notificamos que se completó
      
      this.state.isLoading = false;
      this.notifyStateChange();
    } catch (error) {
      this.state.isLoading = false;
      this.state.error = error instanceof Error ? error.message : 'Error desconocido';
      this.notifyStateChange();
    }
  }

  // Exportar datos para el editor web
  exportIslandData(id: string): IslandData | null {
    return this.state.islands.get(id) || null;
  }

  // Importar datos desde el editor web
  importIslandData(islandData: IslandData): void {
    this.state.islands.set(islandData.id, {
      ...islandData,
      updatedAt: new Date()
    });
    
    this.notifyEvent({
      type: 'island_updated',
      data: islandData,
      timestamp: new Date()
    });
    
    this.notifyStateChange();
  }
}

// Instancia singleton del gestor de islas
export const islandManager = new IslandManager();

// Funciones de utilidad para trabajar con islas
export const IslandUtils = {
  // Calcular distancia entre dos islas
  calculateDistance(island1: IslandData, island2: IslandData): number {
    return Math.sqrt(
      Math.pow(island1.position.x - island2.position.x, 2) +
      Math.pow(island1.position.y - island2.position.y, 2) +
      Math.pow(island1.position.z - island2.position.z, 2)
    );
  },

  // Verificar si una posición está ocupada
  isPositionOccupied(
    position: { x: number; y: number; z: number },
    excludeIslandId?: string
  ): boolean {
    const islands = islandManager.getAllIslands();
    return islands.some(island => {
      if (excludeIslandId && island.id === excludeIslandId) return false;
      
      const distance = Math.sqrt(
        Math.pow(island.position.x - position.x, 2) +
        Math.pow(island.position.y - position.y, 2) +
        Math.pow(island.position.z - position.z, 2)
      );
      
      // Considerar ocupado si está muy cerca (menos de 10 unidades)
      return distance < 10;
    });
  },

  // Generar posición aleatoria válida
  generateRandomPosition(): { x: number; y: number; z: number } {
    let position;
    do {
      position = {
        x: (Math.random() - 0.5) * 100,
        y: 0,
        z: (Math.random() - 0.5) * 100
      };
    } while (this.isPositionOccupied(position));
    
    return position;
  },

  // Validar datos de isla
  validateIslandData(data: Partial<IslandData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre de la isla es requerido');
    }

    if (!data.position) {
      errors.push('La posición de la isla es requerida');
    }

    if (!data.size) {
      errors.push('El tamaño de la isla es requerido');
    }

    if (!data.type) {
      errors.push('El tipo de isla es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}; 