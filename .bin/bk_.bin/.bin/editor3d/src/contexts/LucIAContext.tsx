import React, { createContext, useContext, ReactNode } from 'react';
import { AIService } from '../services/AIService';
import { AvatarService } from '../services/AvatarService';
import { AnimationService } from '../services/AnimationService';
import { BlockchainService } from '../services/BlockchainService';

export interface LucIAContextType {
  avatar: any | null;
  aiService: AIService | null;
  animationService: AnimationService | null;
  avatarService: AvatarService | null;
  blockchainService: BlockchainService | null;
  isReady: boolean;
  isLearning: boolean;
  isGenerating: boolean;
  currentAnimation: string;
}

const LucIAContext = createContext<LucIAContextType | undefined>(undefined);

export const useLucIAContext = () => {
  const context = useContext(LucIAContext);
  if (context === undefined) {
    throw new Error('useLucIAContext debe ser usado dentro de un LucIAProvider');
  }
  return context;
};

interface LucIAProviderProps {
  children: ReactNode;
  value: LucIAContextType;
}

export const LucIAProvider: React.FC<LucIAProviderProps> = ({ children, value }) => {
  return (
    <LucIAContext.Provider value={value}>
      {children}
    </LucIAContext.Provider>
  );
}; 