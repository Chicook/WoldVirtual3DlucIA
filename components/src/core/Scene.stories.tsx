import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Scene, SimpleScene, PhysicsScene } from './Scene';
import { Cube, Sphere, Cylinder } from './Object';
import { AmbientLight, DirectionalLight, PointLight } from './Lighting';
import { SceneProps } from '../types';

export default {
  title: 'Core/Scene',
  component: Scene,
  parameters: {
    docs: {
      description: {
        component: 'Componente principal de escena 3D para el metaverso. Maneja la configuración básica de Three.js y el renderizado.',
      },
    },
  },
  argTypes: {
    background: {
      control: 'color',
      description: 'Color de fondo de la escena',
    },
    position: {
      control: 'object',
      description: 'Posición de la escena',
    },
    rotation: {
      control: 'object',
      description: 'Rotación de la escena',
    },
    scale: {
      control: 'object',
      description: 'Escala de la escena',
    },
    visible: {
      control: 'boolean',
      description: 'Visibilidad de la escena',
    },
  },
} as Meta;

// ============================================================================
// 📖 STORY BÁSICA - Escena Simple
// ============================================================================

const BasicSceneTemplate: Story<SceneProps> = (args) => (
  <Scene {...args}>
    <AmbientLight intensity={0.4} />
    <DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
    <Cube position={[0, 0, 0]} />
    <Sphere position={[2, 0, 0]} />
    <Cylinder position={[-2, 0, 0]} />
  </Scene>
);

export const BasicScene = BasicSceneTemplate.bind({});
BasicScene.args = {
  background: '#87CEEB',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
};
BasicScene.storyName = 'Escena Básica';

// ============================================================================
// 🌙 STORY NOCTURNA - Escena de Noche
// ============================================================================

const NightSceneTemplate: Story<SceneProps> = (args) => (
  <Scene {...args}>
    <AmbientLight intensity={0.1} color="#1a1a2e" />
    <PointLight position={[0, 10, 0]} intensity={0.8} color="#4a90e2" castShadow />
    <Cube position={[0, 0, 0]} />
    <Sphere position={[2, 0, 0]} />
    <Cylinder position={[-2, 0, 0]} />
  </Scene>
);

export const NightScene = NightSceneTemplate.bind({});
NightScene.args = {
  background: '#1a1a2e',
  fog: {
    color: '#1a1a2e',
    near: 1,
    far: 500
  },
};
NightScene.storyName = 'Escena Nocturna';

// ============================================================================
// 🏠 STORY INTERIOR - Escena de Interior
// ============================================================================

const InteriorSceneTemplate: Story<SceneProps> = (args) => (
  <Scene {...args}>
    <AmbientLight intensity={0.3} color="#ffffff" />
    <PointLight position={[0, 5, 0]} intensity={1} color="#ffd700" castShadow />
    <Cube position={[0, 0, 0]} />
    <Sphere position={[2, 0, 0]} />
    <Cylinder position={[-2, 0, 0]} />
  </Scene>
);

export const InteriorScene = InteriorSceneTemplate.bind({});
InteriorScene.args = {
  background: '#2c2c2c',
  fog: {
    color: '#2c2c2c',
    near: 0.1,
    far: 100
  },
};
InteriorScene.storyName = 'Escena de Interior';

// ============================================================================
// 🎭 STORY DRAMÁTICA - Escena con Efectos
// ============================================================================

const DramaticSceneTemplate: Story<SceneProps> = (args) => (
  <Scene {...args}>
    <AmbientLight intensity={0.1} color="#000000" />
    <DirectionalLight position={[10, 10, 10]} intensity={2} color="#ff6b6b" castShadow />
    <DirectionalLight position={[-10, 10, -10]} intensity={1.5} color="#4ecdc4" castShadow />
    <Cube position={[0, 0, 0]} />
    <Sphere position={[2, 0, 0]} />
    <Cylinder position={[-2, 0, 0]} />
  </Scene>
);

export const DramaticScene = DramaticSceneTemplate.bind({});
DramaticScene.args = {
  background: '#000000',
};
DramaticScene.storyName = 'Escena Dramática';

// ============================================================================
// 🎮 STORY SIMPLE - Escena Simplificada
// ============================================================================

const SimpleSceneTemplate: Story = () => (
  <SimpleScene>
    <AmbientLight intensity={0.4} />
    <DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
    <Cube position={[0, 0, 0]} />
    <Sphere position={[2, 0, 0]} />
    <Cylinder position={[-2, 0, 0]} />
  </SimpleScene>
);

export const Simple = SimpleSceneTemplate.bind({});
Simple.storyName = 'Escena Simple';

// ============================================================================
// ⚡ STORY CON FÍSICA - Escena con Motor Físico
// ============================================================================

const PhysicsSceneTemplate: Story = () => (
  <PhysicsScene>
    <AmbientLight intensity={0.4} />
    <DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
    <Cube position={[0, 5, 0]} />
    <Sphere position={[2, 5, 0]} />
    <Cylinder position={[-2, 5, 0]} />
  </PhysicsScene>
);

export const Physics = PhysicsSceneTemplate.bind({});
Physics.storyName = 'Escena con Física';

// ============================================================================
// 🎨 STORY INTERACTIVA - Escena con Controles
// ============================================================================

const InteractiveSceneTemplate: Story<SceneProps> = (args) => {
  const [objects, setObjects] = React.useState([
    { id: 1, type: 'cube', position: [0, 0, 0] },
    { id: 2, type: 'sphere', position: [2, 0, 0] },
    { id: 3, type: 'cylinder', position: [-2, 0, 0] },
  ]);

  const addObject = () => {
    const newObject = {
      id: Date.now(),
      type: ['cube', 'sphere', 'cylinder'][Math.floor(Math.random() * 3)],
      position: [
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      ]
    };
    setObjects([...objects, newObject]);
  };

  const removeObject = (id: number) => {
    setObjects(objects.filter(obj => obj.id !== id));
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <button onClick={addObject} style={{ marginRight: 10 }}>
          Agregar Objeto
        </button>
        <button onClick={() => setObjects([])}>
          Limpiar Escena
        </button>
      </div>
      
      <Scene {...args}>
        <AmbientLight intensity={0.4} />
        <DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {objects.map(obj => (
          <group key={obj.id}>
            {obj.type === 'cube' && <Cube position={obj.position} />}
            {obj.type === 'sphere' && <Sphere position={obj.position} />}
            {obj.type === 'cylinder' && <Cylinder position={obj.position} />}
          </group>
        ))}
      </Scene>
    </div>
  );
};

export const Interactive = InteractiveSceneTemplate.bind({});
Interactive.args = {
  background: '#87CEEB',
};
Interactive.storyName = 'Escena Interactiva';

// ============================================================================
// 📊 STORY CON MÉTRICAS - Escena con Monitoreo
// ============================================================================

const MetricsSceneTemplate: Story<SceneProps> = (args) => {
  const [metrics, setMetrics] = React.useState({
    fps: 0,
    memory: 0,
    drawCalls: 0
  });

  return (
    <div>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>FPS: {metrics.fps}</div>
        <div>Memoria: {metrics.memory}</div>
        <div>Draw Calls: {metrics.drawCalls}</div>
      </div>
      
      <Scene 
        {...args}
        onPerformanceUpdate={setMetrics}
      >
        <AmbientLight intensity={0.4} />
        <DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Cube position={[0, 0, 0]} />
        <Sphere position={[2, 0, 0]} />
        <Cylinder position={[-2, 0, 0]} />
      </Scene>
    </div>
  );
};

export const WithMetrics = MetricsSceneTemplate.bind({});
WithMetrics.args = {
  background: '#87CEEB',
};
WithMetrics.storyName = 'Escena con Métricas'; 