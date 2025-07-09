import React from 'react';

const RightPanel: React.FC = () => {
  return (
    <aside className="right-panel">
      <div className="panel-header">
        <h3>Propiedades</h3>
      </div>
      <div className="panel-content">
        <div id="object-properties">
          <div className="property-group">
            <h4>Transformación</h4>
            <div className="property-row">
              <label>Posición X:</label>
              <input type="number" id="pos-x" step="0.1" />
            </div>
            <div className="property-row">
              <label>Posición Y:</label>
              <input type="number" id="pos-y" step="0.1" />
            </div>
            <div className="property-row">
              <label>Posición Z:</label>
              <input type="number" id="pos-z" step="0.1" />
            </div>
            <div className="property-row">
              <label>Rotación X:</label>
              <input type="number" id="rot-x" step="0.1" />
            </div>
            <div className="property-row">
              <label>Rotación Y:</label>
              <input type="number" id="rot-y" step="0.1" />
            </div>
            <div className="property-row">
              <label>Rotación Z:</label>
              <input type="number" id="rot-z" step="0.1" />
            </div>
            <div className="property-row">
              <label>Escala X:</label>
              <input type="number" id="scale-x" step="0.1" defaultValue={1} />
            </div>
            <div className="property-row">
              <label>Escala Y:</label>
              <input type="number" id="scale-y" step="0.1" defaultValue={1} />
            </div>
            <div className="property-row">
              <label>Escala Z:</label>
              <input type="number" id="scale-z" step="0.1" defaultValue={1} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel; 