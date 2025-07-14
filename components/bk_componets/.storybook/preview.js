import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';
import { withViewport } from '@storybook/addon-viewport';
import { withBackgrounds } from '@storybook/addon-backgrounds';

// Decoradores globales
addDecorator(withA11y);
addDecorator(withKnobs);
addDecorator(withViewport);
addDecorator(withBackgrounds([
  { name: 'dark', value: '#1a1a1a' },
  { name: 'light', value: '#ffffff' },
  { name: 'metaverso', value: '#87CEEB' }
]));

// Decorador para componentes 3D
addDecorator((story) => (
  <div style={{ 
    width: '100vw', 
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    {story()}
  </div>
));

// Configuración global
addParameters({
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1920px',
          height: '1080px',
        },
      },
      vr: {
        name: 'VR',
        styles: {
          width: '2560px',
          height: '1440px',
        },
      },
    },
  },
  backgrounds: {
    default: 'metaverso',
    values: [
      {
        name: 'metaverso',
        value: '#87CEEB',
      },
      {
        name: 'night',
        value: '#1a1a2e',
      },
      {
        name: 'interior',
        value: '#2c2c2c',
      },
    ],
  },
  docs: {
    // Configuración de documentación
    source: {
      type: 'dynamic',
      excludeDecorators: true,
    },
  },
});

// Configuración de temas
export const globalTypes = {
  theme: {
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: ['light', 'dark', 'metaverso'],
      showName: true,
    },
  },
  locale: {
    description: 'Internationalization locale',
    defaultValue: 'es',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'es', title: 'Español' },
        { value: 'en', title: 'English' },
        { value: 'fr', title: 'Français' },
      ],
      showName: true,
    },
  },
};

// Configuración de parámetros por defecto
export const parameters = {
  // Configuración de rendimiento
  performance: {
    hints: 'warning',
    maxAssetSize: 500000,
    maxEntrypointSize: 500000,
  },
  
  // Configuración de accesibilidad
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
      ],
    },
  },
  
  // Configuración de viewport
  viewport: {
    defaultViewport: 'desktop',
  },
  
  // Configuración de backgrounds
  backgrounds: {
    default: 'metaverso',
  },
  
  // Configuración de controles
  controls: {
    expanded: true,
    sort: 'requiredFirst',
  },
  
  // Configuración de docs
  docs: {
    source: {
      type: 'dynamic',
      excludeDecorators: true,
    },
  },
}; 