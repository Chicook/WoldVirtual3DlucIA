import { useState, useEffect, useCallback } from 'react';
import { AIService } from '../services/AIService';
import { AvatarService } from '../services/AvatarService';
import { AnimationService } from '../services/AnimationService';
import { BlockchainService } from '../services/BlockchainService';

export const useLucIA = () => {
  const [avatar, setAvatar] = useState<any>(null);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [animationService, setAnimationService] = useState<AnimationService | null>(null);
  const [avatarService, setAvatarService] = useState<AvatarService | null>(null);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Inicializando LucIA...');

      // Inicializar servicios
      const ai = new AIService();
      const avatar = new AvatarService();
      const animation = new AnimationService();
      const blockchain = new BlockchainService();

      await ai.initialize();
      await avatar.initialize();
      await animation.initialize();
      await blockchain.initialize();

      // Crear avatar
      const avatarInstance = await avatar.createAvatar({
        name: 'LucIA',
        gender: 'female',
        appearance: {
          hairColor: '#FF69B4',
          eyeColor: '#4169E1',
          skinTone: '#FFD700',
          height: 1.7,
          build: 'athletic'
        },
        personality: {
          traits: ['intelligent', 'friendly', 'creative', 'curious'],
          interests: ['AI', 'art', 'music', 'technology', 'blockchain'],
          communicationStyle: 'warm and engaging'
        }
      });

      setAiService(ai);
      setAvatarService(avatar);
      setAnimationService(animation);
      setBlockchainService(blockchain);
      setAvatar(avatarInstance);
      setIsReady(true);

      console.log('✅ LucIA inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar LucIA:', error);
      throw error;
    }
  }, []);

  const processUserInput = useCallback(async (input: string): Promise<string> => {
    if (!aiService) {
      throw new Error('AIService no está inicializado');
    }

    try {
      setIsLearning(true);
      const response = await aiService.processInput(input);
      
      // Aprender de la interacción
      await aiService.learnFromInteraction(input, response);
      
      return response;
    } catch (error) {
      console.error('Error procesando input:', error);
      return 'Lo siento, tuve un problema procesando tu mensaje.';
    } finally {
      setIsLearning(false);
    }
  }, [aiService]);

  const generateAnimation = useCallback(async (animationName: string): Promise<any> => {
    if (!animationService) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      setIsGenerating(true);
      const animation = await animationService.generateAnimation(animationName);
      return animation;
    } catch (error) {
      console.error('Error generando animación:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [animationService]);

  const learnFromInteraction = useCallback(async (input: string, response: string) => {
    if (!aiService) return;

    try {
      await aiService.learnFromInteraction(input, response);
    } catch (error) {
      console.error('Error aprendiendo de interacción:', error);
    }
  }, [aiService]);

  const updateAvatarAppearance = useCallback(async (appearance: any) => {
    if (!avatarService || !avatar) return;

    try {
      const updatedAvatar = await avatarService.updateAppearance(avatar.id, appearance);
      setAvatar(updatedAvatar);
    } catch (error) {
      console.error('Error actualizando apariencia:', error);
    }
  }, [avatarService, avatar]);

  const createCustomAnimation = useCallback(async (animationData: any) => {
    if (!animationService) return;

    try {
      setIsGenerating(true);
      const animation = await animationService.createCustomAnimation(animationData);
      return animation;
    } catch (error) {
      console.error('Error creando animación personalizada:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [animationService]);

  const getAvatarStats = useCallback(() => {
    if (!avatar) return null;

    return {
      interactions: avatar.interactions || 0,
      animationsLearned: avatar.animationsLearned || 0,
      knowledgeLevel: avatar.knowledgeLevel || 1,
      personalityTraits: avatar.personality?.traits || [],
      lastInteraction: avatar.lastInteraction || null
    };
  }, [avatar]);

  const resetAvatar = useCallback(async () => {
    if (!avatarService) return;

    try {
      const newAvatar = await avatarService.createAvatar({
        name: 'LucIA',
        gender: 'female',
        appearance: {
          hairColor: '#FF69B4',
          eyeColor: '#4169E1',
          skinTone: '#FFD700',
          height: 1.7,
          build: 'athletic'
        },
        personality: {
          traits: ['intelligent', 'friendly', 'creative', 'curious'],
          interests: ['AI', 'art', 'music', 'technology', 'blockchain'],
          communicationStyle: 'warm and engaging'
        }
      });

      setAvatar(newAvatar);
    } catch (error) {
      console.error('Error reseteando avatar:', error);
    }
  }, [avatarService]);

  const exportAvatarData = useCallback(() => {
    if (!avatar) return null;

    return {
      avatar: avatar,
      aiModel: aiService?.exportModel(),
      animations: animationService?.exportAnimations(),
      timestamp: new Date().toISOString()
    };
  }, [avatar, aiService, animationService]);

  const importAvatarData = useCallback(async (data: any) => {
    if (!aiService || !animationService || !avatarService) return;

    try {
      // Importar datos del avatar
      if (data.avatar) {
        setAvatar(data.avatar);
      }

      // Importar modelo de IA
      if (data.aiModel) {
        await aiService.importModel(data.aiModel);
      }

      // Importar animaciones
      if (data.animations) {
        await animationService.importAnimations(data.animations);
      }

      console.log('✅ Datos del avatar importados correctamente');
    } catch (error) {
      console.error('❌ Error importando datos del avatar:', error);
    }
  }, [aiService, animationService, avatarService]);

  const connectBlockchain = useCallback(async () => {
    if (!blockchainService) return;

    try {
      await blockchainService.connectWallet();
      console.log('✅ Conectado a blockchain');
    } catch (error) {
      console.error('❌ Error conectando a blockchain:', error);
    }
  }, [blockchainService]);

  const mintAvatarNFT = useCallback(async () => {
    if (!blockchainService || !avatar) return;

    try {
      const nft = await blockchainService.mintAvatarNFT(avatar);
      console.log('✅ NFT del avatar creado:', nft);
      return nft;
    } catch (error) {
      console.error('❌ Error creando NFT del avatar:', error);
      return null;
    }
  }, [blockchainService, avatar]);

  useEffect(() => {
    // Cleanup al desmontar
    return () => {
      if (aiService) {
        aiService.cleanup();
      }
      if (animationService) {
        animationService.cleanup();
      }
      if (blockchainService) {
        blockchainService.disconnect();
      }
    };
  }, [aiService, animationService, blockchainService]);

  return {
    avatar,
    aiService,
    animationService,
    avatarService,
    blockchainService,
    isReady,
    isLearning,
    isGenerating,
    initialize,
    processUserInput,
    generateAnimation,
    learnFromInteraction,
    updateAvatarAppearance,
    createCustomAnimation,
    getAvatarStats,
    resetAvatar,
    exportAvatarData,
    importAvatarData,
    connectBlockchain,
    mintAvatarNFT
  };
}; 