import React from 'react';
import { centralCoordinator } from '../core/CentralModuleCoordinator';
import { messageBus } from '../core/InterModuleMessageBus';

// Componente principal de la aplicación
const MainAppComponent = React.lazy(() => import('../components/MainAppComponent'));

// Componente de navegación
const NavigationComponent = React.lazy(() => import('../components/NavigationComponent'));

// Componente de dashboard
const DashboardComponent = React.lazy(() => import('../components/DashboardComponent'));

export default {
  name: 'web',
  dependencies: ['components', 'pages', 'css'],
  publicAPI: {
    getComponent: (name: string) => {
      const components: Record<string, any> = {
        'MainApp': MainAppComponent,
        'Navigation': NavigationComponent,
        'Dashboard': DashboardComponent
      };
      return components[name] || null;
    },
    getStatus: () => ({
      status: 'active',
      details: {
        components: 'loaded',
        routing: 'active',
        styling: 'applied'
      }
    }),
    getMetrics: () => ({
      performance: 98,
      errors: 0,
      uptime: Date.now()
    })
  },
  
  async initialize(userId: string): Promise<void> {
    console.log(`[WebModule] Inicializando para usuario: ${userId}`);
    
    try {
      // Cargar módulos frontend esenciales
      await centralCoordinator.loadModuleGroup('FRONTEND', userId);
      
      // Suscribirse a eventos de carga de componentes
      messageBus.subscribe('load-component', async (request: any) => {
        const { componentName, props, targetId } = request;
        await this.loadComponent(componentName, props, targetId);
      });
      
      // Suscribirse a eventos de navegación
      messageBus.subscribe('navigate', (navigation: any) => {
        this.handleNavigation(navigation);
      });
      
      // Inicializar la aplicación React
      this.initializeReactApp(userId);
      
      console.log(`[WebModule] Módulo inicializado para usuario: ${userId}`);
      
    } catch (error) {
      console.error(`[WebModule] Error inicializando:`, error);
    }
  },

  async loadComponent(componentName: string, props: any, targetId: string): Promise<void> {
    try {
      console.log(`[WebModule] Cargando componente: ${componentName}`);
      
      // Buscar componente en el registro central
      let Component = centralCoordinator.getComponent(componentName);
      
      if (!Component) {
        // Intentar cargar desde módulos
        const modules = ['components', 'pages', 'web'];
        for (const moduleName of modules) {
          const moduleAPI = centralCoordinator.getModulePublicAPI(moduleName);
          if (moduleAPI?.getComponent) {
            Component = moduleAPI.getComponent(componentName);
            if (Component) {
              centralCoordinator.registerComponent(componentName, Component);
              break;
            }
          }
        }
      }
      
      if (Component) {
        // Renderizar componente
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const ReactDOM = await import('react-dom');
          ReactDOM.render(
            React.createElement(Component, props),
            targetElement
          );
          console.log(`[WebModule] Componente ${componentName} renderizado en ${targetId}`);
        } else {
          console.warn(`[WebModule] Elemento ${targetId} no encontrado`);
        }
      } else {
        console.warn(`[WebModule] Componente ${componentName} no encontrado`);
      }
      
    } catch (error) {
      console.error(`[WebModule] Error cargando componente ${componentName}:`, error);
    }
  },

  handleNavigation(navigation: any): void {
    console.log(`[WebModule] Navegación:`, navigation);
    // Implementar lógica de navegación
  },

  initializeReactApp(userId: string): void {
    try {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const ReactDOM = require('react-dom');
        ReactDOM.render(
          React.createElement(MainAppComponent, { userId }),
          rootElement
        );
        console.log('[WebModule] Aplicación React inicializada');
      } else {
        console.warn('[WebModule] Elemento root no encontrado');
      }
    } catch (error) {
      console.error('[WebModule] Error inicializando React app:', error);
    }
  },

  async cleanup(userId: string): Promise<void> {
    console.log(`[WebModule] Limpiando para usuario: ${userId}`);
    
    // Desmontar aplicación React
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const ReactDOM = require('react-dom');
      ReactDOM.unmountComponentAtNode(rootElement);
    }
  }
}; 