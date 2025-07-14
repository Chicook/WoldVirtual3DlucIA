import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language = 'yaml', theme = 'light' }) => {
  const handleEditorChange = (value, event) => {
    onChange(value);
  };

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={handleEditorChange}
        theme={monacoTheme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: true,
          useTabStops: false,
          fontSize: 14,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          largeFileOptimizations: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
            showConstants: true,
            showEnums: true,
            showEnumsMembers: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showWords: true,
            showUsers: true,
            showIssues: true,
          }
        }}
      />
    </div>
  );
};

export default CodeEditor; 