import React from 'react';
import { FaCubes, FaUserFriends, FaTools, FaUpload, FaMousePointer, FaArrowsAlt, FaSyncAlt, FaExpandArrowsAlt } from 'react-icons/fa';
import './EditorUI.css';

const Toolbar: React.FC = () => (
  <nav className="editorui-toolbar">
    <div className="editorui-toolbar-group">
      <button className="editorui-toolbar-btn" title="Seleccionar"><FaMousePointer /></button>
      <button className="editorui-toolbar-btn" title="Mover"><FaArrowsAlt /></button>
      <button className="editorui-toolbar-btn" title="Rotar"><FaSyncAlt /></button>
      <button className="editorui-toolbar-btn" title="Escalar"><FaExpandArrowsAlt /></button>
    </div>
    <div className="editorui-toolbar-separator" />
    <div className="editorui-toolbar-group editorui-toolbar-group-right">
      <button className="editorui-toolbar-btn" title="Assets"><FaCubes /></button>
      <button className="editorui-toolbar-btn" title="Avatares"><FaUserFriends /></button>
      <button className="editorui-toolbar-btn" title="Herramientas"><FaTools /></button>
      <button className="editorui-toolbar-btn" title="Publicar"><FaUpload /></button>
    </div>
  </nav>
);

export default Toolbar; 