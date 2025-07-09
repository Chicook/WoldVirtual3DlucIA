import React from 'react';

const BottomPanel: React.FC = () => {
  return (
    <footer className="bottom-panel">
      <div className="panel-header">
        <h3>Escena</h3>
      </div>
      <div className="panel-content">
        <div id="scene-outliner">
          <ul id="scene-tree">
            <li className="scene-item" data-id="scene">
              <span className="item-icon">🌍</span>
              <span className="item-name">Escena</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default BottomPanel; 