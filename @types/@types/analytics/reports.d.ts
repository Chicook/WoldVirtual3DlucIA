/**
 * Tipos para reportes analíticos
 */
export interface AnalyticsReport {
  id: string;
  metrics: Metric[];
  generatedAt: number;
} 