import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'currency' | 'collectible' | 'tool';
  category: string;
  rarity: number; // 1-5 (Básico, Común, Raro, Épico, Legendario)
  value: number;
  icon: string;
  model?: string; // 3D model URL
  texture?: string; // Texture URL
  slot?: string; // Para items equipables
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    [key: string]: number | undefined;
  };
  effects?: {
    type: string;
    value: number;
    duration?: number;
  }[];
  stackable: boolean;
  maxStack: number;
  quantity: number;
  equippable: boolean;
  usable: boolean;
  consumable: boolean;
  tradeable: boolean;
  droppable: boolean;
  createdAt: Date;
  obtainedAt: Date;
  nftId?: string; // Si es un NFT
  blockchain?: string; // Ethereum, Polygon, etc.
}

export interface ItemCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  uniqueItems: number;
  equippedItems: number;
  rareItems: number;
  legendaryItems: number;
}

export const useInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categorías predefinidas
  const categories: ItemCategory[] = [
    {
      id: 'weapons',
      name: 'Armas',
      icon: '⚔️',
      description: 'Armas para combate',
      color: 'red'
    },
    {
      id: 'armor',
      name: 'Armaduras',
      icon: '🛡️',
      description: 'Protección y defensa',
      color: 'blue'
    },
    {
      id: 'consumables',
      name: 'Consumibles',
      icon: '🍯',
      description: 'Pociones y alimentos',
      color: 'green'
    },
    {
      id: 'materials',
      name: 'Materiales',
      icon: '🔧',
      description: 'Materiales de crafteo',
      color: 'gray'
    },
    {
      id: 'currency',
      name: 'Monedas',
      icon: '💰',
      description: 'Monedas y tokens',
      color: 'yellow'
    },
    {
      id: 'collectibles',
      name: 'Coleccionables',
      icon: '🏆',
      description: 'Items únicos',
      color: 'purple'
    },
    {
      id: 'tools',
      name: 'Herramientas',
      icon: '🔨',
      description: 'Herramientas y utilidades',
      color: 'orange'
    }
  ];

  // Cargar inventario del usuario
  const loadInventory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/inventory/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el inventario');
      }

      const data = await response.json();
      setItems(data.items || []);
      setEquippedItems(data.equippedItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Equipar item
  const equipItem = useCallback(async (item: InventoryItem) => {
    if (!user || !item.equippable) return;

    try {
      const response = await fetch(`/api/inventory/equip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });

      if (!response.ok) {
        throw new Error('Error al equipar el item');
      }

      const data = await response.json();
      setEquippedItems(data.equippedItems);
      
      // Actualizar el item en la lista
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      ));

      return data;
    } catch (err) {
      console.error('Error equipping item:', err);
      throw err;
    }
  }, [user]);

  // Desequipar item
  const unequipItem = useCallback(async (slot: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/inventory/unequip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ slot })
      });

      if (!response.ok) {
        throw new Error('Error al desequipar el item');
      }

      const data = await response.json();
      setEquippedItems(data.equippedItems);
      
      // Agregar el item de vuelta al inventario
      const unequippedItem = equippedItems.find(item => item.slot === slot);
      if (unequippedItem) {
        setItems(prev => {
          const existing = prev.find(i => i.id === unequippedItem.id);
          if (existing) {
            return prev.map(i => 
              i.id === unequippedItem.id 
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          } else {
            return [...prev, { ...unequippedItem, quantity: 1 }];
          }
        });
      }

      return data;
    } catch (err) {
      console.error('Error unequipping item:', err);
      throw err;
    }
  }, [user, equippedItems]);

  // Usar item
  const useItem = useCallback(async (item: InventoryItem) => {
    if (!user || !item.usable) return;

    try {
      const response = await fetch(`/api/inventory/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });

      if (!response.ok) {
        throw new Error('Error al usar el item');
      }

      const data = await response.json();
      
      // Actualizar cantidad del item
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, quantity: item.consumable ? i.quantity - 1 : i.quantity }
          : i
      ));

      // Remover item si se consumió completamente
      if (item.consumable && item.quantity <= 1) {
        setItems(prev => prev.filter(i => i.id !== item.id));
      }

      return data;
    } catch (err) {
      console.error('Error using item:', err);
      throw err;
    }
  }, [user]);

  // Soltar item
  const dropItem = useCallback(async (item: InventoryItem) => {
    if (!user || !item.droppable) return;

    try {
      const response = await fetch(`/api/inventory/drop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });

      if (!response.ok) {
        throw new Error('Error al soltar el item');
      }

      // Remover item del inventario
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      // Limpiar selección si era el item seleccionado
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }

      return response.json();
    } catch (err) {
      console.error('Error dropping item:', err);
      throw err;
    }
  }, [user, selectedItem]);

  // Trade item
  const tradeItem = useCallback(async (item: InventoryItem, targetUserId: string) => {
    if (!user || !item.tradeable) return;

    try {
      const response = await fetch(`/api/inventory/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          itemId: item.id, 
          targetUserId,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Error al intercambiar el item');
      }

      const data = await response.json();
      
      // Actualizar inventario
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));

      // Remover item si se intercambió completamente
      if (item.quantity <= 1) {
        setItems(prev => prev.filter(i => i.id !== item.id));
      }

      return data;
    } catch (err) {
      console.error('Error trading item:', err);
      throw err;
    }
  }, [user]);

  // Seleccionar item
  const selectItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
  }, []);

  // Obtener estadísticas del inventario
  const getInventoryStats = useCallback((): InventoryStats => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
    const uniqueItems = items.length;
    const equippedItemsCount = equippedItems.length;
    const rareItems = items.filter(item => item.rarity >= 4).reduce((sum, item) => sum + item.quantity, 0);
    const legendaryItems = items.filter(item => item.rarity === 5).reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalItems,
      totalValue,
      uniqueItems,
      equippedItems: equippedItemsCount,
      rareItems,
      legendaryItems
    };
  }, [items, equippedItems]);

  // Filtrar items por categoría
  const getItemsByCategory = useCallback((categoryId: string) => {
    return items.filter(item => item.category === categoryId);
  }, [items]);

  // Buscar items
  const searchItems = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
  }, [items]);

  // Agrupar items por rareza
  const getItemsByRarity = useCallback((rarity: number) => {
    return items.filter(item => item.rarity === rarity);
  }, [items]);

  // Cargar inventario al montar el componente
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    // Estado
    items,
    equippedItems,
    selectedItem,
    isLoading,
    error,
    categories,
    
    // Acciones
    loadInventory,
    equipItem,
    unequipItem,
    useItem,
    dropItem,
    tradeItem,
    selectItem,
    
    // Utilidades
    getInventoryStats,
    getItemsByCategory,
    searchItems,
    getItemsByRarity
  };
}; 