// src/admin/routes/cms-blogs/editor/BlockEditor.jsx

import React, { useEffect } from 'react';
import { initBlocks } from './registerBlocks';
import { EditorProvider } from './context/EditorContext';
import { EditorApp } from './EditorApp';  
import { wordpressStyles } from './editorStyles'
import './index.css'
import './editor-defaults.css'

let blocksReady = false;

// Helper to scope CSS strings to a selector
const scopeCSS = (css, selector) => {
  return css.replace(/([^}{]+)(?=\{)/g, (match) => {
    return match
      .split(",")
      .map((s) => {
        const trimmed = s.trim()
        if (
          !trimmed || 
          trimmed.startsWith("@") || 
          trimmed.startsWith(":root") || 
          trimmed.startsWith("from") || 
          trimmed.startsWith("to") || 
          /\d+%/.test(trimmed)
        ) {
          return s
        }

        // List of classes that should NOT be scoped because they are rendered in portals (like Modals)
        const globalClasses = [
          ".components-modal",
          ".components-popover",
          ".components-tooltip",
          ".components-autocomplete",
          ".components-dropdown",
          ".components-menu-group",
          ".components-menu-item",
          ".components-notice",
          ".components-snackbar",
          ".rbb-media-modal",
          ".components-drop-zone"
        ]

        if (globalClasses.some(cls => trimmed.includes(cls))) {
          return s
        }

        if (trimmed.startsWith(selector)) {
          return s
        }
        return `${selector} ${trimmed}`
      })
      .join(", ")
  })
}

export default function BlockEditor({ blogId, initialData, onSave }) {
  useEffect(() => {
    if (!blocksReady) {
      initBlocks();
      blocksReady = true;
    }

    // Inject WordPress styles scoped to the editor container
    const styleId = "wp-styles-injection"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      // Scope to .cms-blog-builder to prevent leakage
      style.innerHTML = scopeCSS(wordpressStyles, ".cms-blog-builder")
      document.head.appendChild(style)
    }

    return () => {
      // We don't necessarily want to remove it if other editors are open, 
      // but in Medusa usually only one is active at a time.
      const style = document.getElementById(styleId)
      if (style) style.remove()
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