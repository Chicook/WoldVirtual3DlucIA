import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'paypal' | 'crypto';
  createdAt: Date;
  completedAt?: Date;
  metadata?: any;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'crypto';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export const usePayments = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear payment intent para Stripe
  const createPaymentIntent = useCallback(async (data: {
    amount: number;
    currency: string;
    description: string;
    metadata?: any;
  }): Promise<PaymentIntent> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error creando payment intent');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Procesar pago
  const processPayment = useCallback(async (paymentId: string, method: string, metadata?: any) => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentId,
          method,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Error procesando el pago');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener historial de pagos
  const getPaymentHistory = useCallback(async (): Promise<Payment[]> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo historial de pagos');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener métodos de pago guardados
  const getPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo métodos de pago');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Agregar método de pago
  const addPaymentMethod = useCallback(async (methodData: {
    type: 'card' | 'paypal' | 'crypto';
    token?: string;
    walletAddress?: string;
    isDefault?: boolean;
  }): Promise<PaymentMethod> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(methodData)
      });

      if (!response.ok) {
        throw new Error('Error agregando método de pago');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Remover método de pago
  const removePaymentMethod = useCallback(async (methodId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error removiendo método de pago');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Crear suscripción
  const createSubscription = useCallback(async (data: {
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
  }): Promise<Subscription> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error creando suscripción');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cancelar suscripción
  const cancelSubscription = useCallback(async (subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ cancelAtPeriodEnd })
      });

      if (!response.ok) {
        throw new Error('Error cancelando suscripción');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener suscripciones
  const getSubscriptions = useCallback(async (): Promise<Subscription[]> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscriptions', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo suscripciones');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Solicitar reembolso
  const requestRefund = useCallback(async (paymentId: string, reason: string): Promise<Payment> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Error solicitando reembolso');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener planes disponibles
  const getPlans = useCallback(async (): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/plans');

      if (!response.ok) {
        throw new Error('Error obteniendo planes');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estadísticas de pagos
  const getPaymentStats = useCallback(async (): Promise<any> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stats', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estadísticas');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Verificar estado de pago
  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<Payment> => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error verificando estado del pago');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    // Estado
    isLoading,
    error,
    
    // Payment Intents
    createPaymentIntent,
    
    // Payments
    processPayment,
    getPaymentHistory,
    requestRefund,
    checkPaymentStatus,
    
    // Payment Methods
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    
    // Subscriptions
    createSubscription,
    cancelSubscription,
    getSubscriptions,
    
    // Plans
    getPlans,
    
    // Stats
    getPaymentStats
  };
}; 