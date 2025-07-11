import { useContext } from 'react'
import { MetaversoContext } from '@/contexts/MetaversoContext'

export const useMetaverso = () => {
  const context = useContext(MetaversoContext);
  
  if (!context) {
    throw new Error('useMetaverso debe ser usado dentro de un MetaversoProvider');
  }
  
  return context
} 
