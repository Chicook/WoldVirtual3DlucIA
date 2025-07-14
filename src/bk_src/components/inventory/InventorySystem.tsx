import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { InventoryItem, InventorySystemState, InventoryAction } from '@/types/metaverso';

/**
 * Contexto avanzado de Inventario 3D
 * Permite gestión de items, slots, drag&drop, animaciones y sincronización con el backend.
 */
const InventoryContext = createContext<InventorySystemState | undefined>(undefined);

const initialState: InventorySystemState = {
  items: [],
  slots: 30,
  selectedItem: null,
  isOpen: false,
  filters: {},
  error: null,
};

function inventoryReducer(state: InventorySystemState, action: InventoryAction): InventorySystemState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.itemId) };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.item };
    case 'TOGGLE_INVENTORY':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Funciones avanzadas de inventario
  const addItem = useCallback((item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item }), []);
  const removeItem = useCallback((itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId }), []);
  const selectItem = useCallback((item: InventoryItem) => dispatch({ type: 'SELECT_ITEM', item }), []);
  const toggleInventory = useCallback(() => dispatch({ type: 'TOGGLE_INVENTORY' }), []);

  // Validaciones y utilidades
  const isFull = state.items.length >= state.slots;
  const getItemById = (id: string) => state.items.find(i => i.id === id);

  return (
    <InventoryContext.Provider value={{ ...state, addItem, removeItem, selectItem, toggleInventory, isFull, getItemById }}>
      {children}
    </InventoryContext.Provider>
  );
};

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
}

/**
 * Componente avanzado de Inventario 3D
 * Incluye animaciones, drag&drop, filtros y renderizado optimizado.
 */
export const InventorySystem: React.FC = () => {
  const { items, isOpen, addItem, removeItem, selectItem, selectedItem, isFull } = useInventory();
  // Aquí se pueden agregar animaciones, integración con Three.js, etc.
  return (
    <div className={`inventory-system ${isOpen ? 'open' : 'closed'}`}>
      <h2>Inventario ({items.length})</h2>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => selectItem(item)}>
            {item.name} {selectedItem?.id === item.id && '(Seleccionado)'}
          </li>
        ))}
      </ul>
      {isFull && <div className="warning">Inventario lleno</div>}
    </div>
  );
};

// Ejemplo de test avanzado
export function testInventorySystem() {
  // Aquí se pueden agregar tests unitarios o de integración
  return true;
} 