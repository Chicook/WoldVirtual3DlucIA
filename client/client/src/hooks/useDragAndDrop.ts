import { useState, useCallback } from 'react';
import { InventoryItem } from '@/types/metaverso';

interface DragState {
  isDragging: boolean;
  dragItem: InventoryItem | null;
  startDrag: (item: InventoryItem) => void;
  endDrag: () => void;
}

export const useDragAndDrop = (): DragState => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<InventoryItem | null>(null);

  const startDrag = useCallback((item: InventoryItem) => {
    setIsDragging(true);
    setDragItem(item);
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragItem(null);
  }, []);

  return {
    isDragging,
    dragItem,
    startDrag,
    endDrag
  };
}; 