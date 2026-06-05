// src/admin/routes/cms-blogs/editor/context/EditorContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { serialize, parse, createBlock } from '@wordpress/blocks';
import { blockTemplates } from '../data/blockTemplates';

const EditorContext = createContext(null);

export function EditorProvider({ children, blogId, initialData, onSave }) {
  const [blocks, setBlocks] = useState([]);
  const [output, setOutput] = useState(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState(initialData?.title || '');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templateReplaceMode, setTemplateReplaceMode] = useState(false);
  const [listViewOpen, setListViewOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('visual');
  const [fullscreen, setFullscreen] = useState(false);
  const [spotlightMode, setSpotlightMode] = useState(false);
  const [distractionFree, setDistractionFree] = useState(false);
  const [topToolbar, setTopToolbar] = useState(false);

  const historyRef = useRef({ past: [], future: [] });
  const blocksRef = useRef([]);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  // Load existing content when editing an existing blog
  useEffect(() => {
    if (initialData?.content_json) {
      setBlocks(initialData.content_json);
    } else if (initialData?.content) {
      try {
        // Try JSON first (our format), fall back to HTML parse
        const parsed = JSON.parse(initialData.content);
        setBlocks(parsed);
      } catch {
        setBlocks(parse(initialData.content));
      }
    }
  }, [initialData]);

  useEffect(() => {
    const handleBlockClick = (e) => {
      if (e.target.closest('.block-editor-block-types-list__list-item')) {
        document.body.classList.remove('inserter-active');
      }
    };
    document.addEventListener('click', handleBlockClick);
    return () => document.removeEventListener('click', handleBlockClick);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('list-view-active', listViewOpen);
    return () => document.body.classList.remove('list-view-active');
  }, [listViewOpen]);

  // Called by the parent page (new/edit) passing the full form data
  async function handleSave(extraFields = {}) {
    const html = serialize(blocks);
    const json = JSON.stringify(blocks);
    setOutput({ html, json });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Bubble up to the parent form so it can POST/PUT to Medusa
    onSave?.({ 
      content: json, 
      contentHtml: html, 
      contentJson: blocks,
      ...extraFields 
    });
  }

  async function handleClear() {
    pushHistory(blocksRef.current);
    setBlocks([]);
    setOutput(null);
  }

  function pushHistory(snapshot) {
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  function handleUndo() {
    if (!historyRef.current.past.length) return;
    historyRef.current.future.unshift(blocksRef.current);
    const prev = historyRef.current.past.pop();
    setBlocks(prev);
    setCanUndo(historyRef.current.past.length > 0);
    setCanRedo(true);
  }

  function handleRedo() {
    if (!historyRef.current.future.length) return;
    historyRef.current.past.push(blocksRef.current);
    const next = historyRef.current.future.shift();
    setBlocks(next);
    setCanUndo(true);
    setCanRedo(historyRef.current.future.length > 0);
  }

  function makeBlock({ name, attributes = {}, innerBlocks = [] }) {
    return createBlock(name, attributes, innerBlocks.map(makeBlock));
  }

  function applyTemplate(tpl) {
    const newBlocks = tpl.blocks.map(makeBlock);
    const result = templateReplaceMode ? newBlocks : [...blocksRef.current, ...newBlocks];
    pushHistory(blocksRef.current);
    setBlocks(result);
    setTemplatePickerOpen(false);
  }
function onViewSite() {
  const html = serialize(blocks)
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${pageTitle}</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `], { type: 'text/html' })
  
  window.open(URL.createObjectURL(blob), '_blank')
}
  const value = {
    blocks, setBlocks,
    output,
    preview, setPreview,
    saved,
    sidebarOpen, setSidebarOpen,
    pageTitle, setPageTitle,
    canUndo, canRedo,
    templatePickerOpen, setTemplatePickerOpen,
    templateReplaceMode, setTemplateReplaceMode,
    listViewOpen, setListViewOpen,
    editorMode, setEditorMode,
    fullscreen, setFullscreen,
    spotlightMode, setSpotlightMode,
    distractionFree, setDistractionFree,
    topToolbar, setTopToolbar,
    historyRef, blocksRef,
    blockTemplates,
    onViewSite: onViewSite,       // not needed in Medusa context
    handleSave,
    handleClear,
    handleUndo,
    handleRedo,
    pushHistory,
    applyTemplate,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside <EditorProvider>');
  return ctx;
}