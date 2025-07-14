/**
 * Tipos para eventos analíticos
 */
export interface AnalyticsEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: number;
} 