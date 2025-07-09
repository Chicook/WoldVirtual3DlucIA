import React from 'react';

const EditorMain: React.FC = () => {
  return (
    <main className="editor-main">
      <div id="scene-container">
        <canvas id="scene-canvas"></canvas>
        <div id="scene-overlay">
          <div className="scene-info">
            <span id="fps-counter">FPS: 60</span>
            <span id="object-count">Objetos: 0</span>
            <span id="polygon-count">Polígonos: 0</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditorMain; 