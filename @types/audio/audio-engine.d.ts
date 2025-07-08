/**
 * Tipos para el motor de audio
 */
export interface AudioEngine {
  play(sound: Sound | Music): void;
  stop(id: string): void;
  setVolume(id: string, volume: number): void;
} 