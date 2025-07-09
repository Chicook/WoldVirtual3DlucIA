import React from 'react';
import './styles/main.css';
import EditorHeader from './components/EditorHeader';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import EditorMain from './components/EditorMain';
import BottomPanel from './components/BottomPanel';

const App: React.FC = () => {
  return (
    <div id="app">
      <EditorHeader />
      <LeftPanel />
      <EditorMain />
      <RightPanel />
      <BottomPanel />
    </div>
  );
};

export default App; 