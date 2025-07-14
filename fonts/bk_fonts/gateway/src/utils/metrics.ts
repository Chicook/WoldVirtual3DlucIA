/**
 * @fileoverview Métricas para el gateway del metaverso
 * @module @metaverso/gateway/utils/metrics
 */

import { MetricsConfig } from '../types';

/**
 * Sistema de métricas
 */
export class Metrics {
  private config: MetricsConfig;
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();

  constructor(config: MetricsConfig) {
    this.config = config;
  }

  /**
   * Registra una solicitud
   */
  recordRequest(method: string, url: string): void {
    const key = `http_requests_total{method="${method}",url="${url}"}`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  /**
   * Registra una respuesta
   */
  recordResponse(statusCode: number, responseTime: number): void {
    const statusKey = `http_responses_total{status="${statusCode}"}`;
    this.counters.set(statusKey, (this.counters.get(statusKey) || 0) + 1);
    
    const timeKey = `http_response_time_seconds`;
    this.gauges.set(timeKey, responseTime / 1000);
  }

  /**
   * Obtiene métricas en formato Prometheus
   */
  getPrometheusMetrics(): string {
    let metrics = '';

    // Contadores
    for (const [key, value] of this.counters) {
      metrics += `${key} ${value}\n`;
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      metrics += `${key} ${value}\n`;
    }

    return metrics;
  }
} 