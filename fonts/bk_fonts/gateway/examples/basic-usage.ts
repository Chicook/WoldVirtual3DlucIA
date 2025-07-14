/**
 * @fileoverview Ejemplo básico de uso del gateway del metaverso
 * @module @metaverso/gateway/examples/basic-usage
 */

import { GatewayServer } from '../src';

/**
 * Ejemplo básico de uso del gateway
 */
async function basicUsageExample() {
  console.log('🚀 Iniciando ejemplo básico del gateway...');

  try {
    // Crear instancia del gateway
    const gateway = new GatewayServer({
      server: {
        port: 3000,
        host: 'localhost',
        cors: {
          origin: ['http://localhost:3000'],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization']
        },
        compression: true,
        trustProxy: false
      },
      redis: {
        url: 'redis://localhost:6379',
        db: 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keyPrefix: 'metaverso:gateway:'
      },
      federation: {
        enabled: false, // Deshabilitar para el ejemplo
        services: [],
        mesh: {
          cache: false,
          introspection: false,
          playground: false,
          tracing: false,
          cacheControl: false
        },
        cache: false,
        timeout: 5000
      },
      did: {
        enabled: false, // Deshabilitar para el ejemplo
        resolvers: [],
        cache: false,
        timeout: 5000,
        ethereum: {
          rpcUrl: '',
          networkId: 1,
          registryAddress: '',
          gasLimit: 500000
        }
      },
      indexing: {
        enabled: false, // Deshabilitar para el ejemplo
        batchSize: 100,
        interval: 5000,
        cache: false
      },
      security: {
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: 'Demasiadas solicitudes',
          standardHeaders: true,
          legacyHeaders: false
        },
        jwt: {
          secret: 'example-secret-key',
          expiresIn: '24h',
          issuer: 'metaverso-gateway',
          audience: 'metaverso-users'
        },
        cors: {
          origin: ['http://localhost:3000'],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization']
        },
        helmet: true,
        compression: true
      },
      monitoring: {
        enabled: true,
        prometheus: true,
        logging: {
          level: 'info',
          format: 'json',
          transports: ['console']
        }
      }
    });

    // Inicializar gateway
    await gateway.initialize();
    console.log('✅ Gateway inicializado');

    // Iniciar servidor
    await gateway.start();
    console.log('✅ Gateway iniciado en http://localhost:3000');

    // Verificar estado de salud
    const health = await gateway.getHealthStatus();
    console.log('📊 Estado de salud:', health);

    // Simular algunas solicitudes
    console.log('\n🌐 Probando endpoints...');
    
    // Health check
    const healthResponse = await fetch('http://localhost:3000/health');
    console.log('Health check:', healthResponse.status);

    // Info endpoint
    const infoResponse = await fetch('http://localhost:3000/info');
    const info = await infoResponse.json();
    console.log('Info:', info);

    // API endpoint
    const apiResponse = await fetch('http://localhost:3000/api/v1/worlds');
    const worlds = await apiResponse.json();
    console.log('Worlds API:', worlds.success ? '✅' : '❌');

    // Esperar un poco para ver las métricas
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Obtener métricas
    const metricsResponse = await fetch('http://localhost:3000/metrics');
    const metrics = await metricsResponse.text();
    console.log('📊 Métricas Prometheus:', metrics.substring(0, 200) + '...');

    // Detener gateway
    await gateway.stop();
    console.log('✅ Gateway detenido');

    // Destruir gateway
    await gateway.destroy();
    console.log('✅ Gateway destruido');

  } catch (error) {
    console.error('❌ Error en el ejemplo:', error);
  }
}

/**
 * Ejemplo con federación habilitada
 */
async function federationExample() {
  console.log('🌐 Iniciando ejemplo con federación...');

  try {
    const gateway = new GatewayServer({
      federation: {
        enabled: true,
        services: [
          {
            name: 'worlds',
            url: 'http://localhost:3001',
            timeout: 5000,
            retries: 3,
            healthCheck: true
          },
          {
            name: 'users',
            url: 'http://localhost:3002',
            timeout: 5000,
            retries: 3,
            healthCheck: true
          }
        ],
        mesh: {
          cache: true,
          introspection: true,
          playground: true,
          tracing: true,
          cacheControl: true
        },
        cache: true,
        timeout: 10000
      }
    });

    await gateway.initialize();
    console.log('✅ Gateway con federación inicializado');

    await gateway.destroy();

  } catch (error) {
    console.error('❌ Error en ejemplo de federación:', error);
  }
}

/**
 * Ejemplo con DID habilitado
 */
async function didExample() {
  console.log('🔐 Iniciando ejemplo con DID...');

  try {
    const gateway = new GatewayServer({
      did: {
        enabled: true,
        resolvers: ['ethr', 'web'],
        cache: true,
        timeout: 10000,
        ethereum: {
          rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
          networkId: 1,
          registryAddress: '0xdca7ef03e98e0dc2b855be647c39abe984fc2445',
          gasLimit: 500000
        }
      }
    });

    await gateway.initialize();
    console.log('✅ Gateway con DID inicializado');

    await gateway.destroy();

  } catch (error) {
    console.error('❌ Error en ejemplo de DID:', error);
  }
}

// Ejecutar ejemplos
if (require.main === module) {
  (async () => {
    console.log('🌐 Ejemplos del Gateway del Metaverso\n');
    
    await basicUsageExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await federationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await didExample();
    
    console.log('\n🎉 Todos los ejemplos completados exitosamente!');
  })();
}

export {
  basicUsageExample,
  federationExample,
  didExample
}; 