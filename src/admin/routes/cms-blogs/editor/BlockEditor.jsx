// src/admin/routes/cms-blogs/editor/BlockEditor.jsx

import React, { useEffect } from 'react';
import { initBlocks } from './registerBlocks';
import { EditorProvider } from './context/EditorContext';
import { EditorApp } from './EditorApp';  
import './editorStyles'
import './index.css'
import './editor-defaults.css'

let blocksReady = false;

export default function BlockEditor({ blogId, initialData, onSave }) {
  useEffect(() => {
    if (!blocksReady) {
      initBlocks();
      blocksReady = true;
    }
  }, []);

  return (
    <div className="cms-blog-builder">
    <EditorProvider blogId={blogId} initialData={initialData} onSave={onSave}>
      <EditorApp />
    </EditorProvider>
    </div>
  );
}