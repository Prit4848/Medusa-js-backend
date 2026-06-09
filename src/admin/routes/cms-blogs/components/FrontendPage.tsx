import React from 'react';
import { BlockRenderer } from 'gutenberg-block-kit/renderer';
import './FrontendPage.css';

interface FrontendPageProps {
  title: string;
  html: string;
  json: any;
  updatedAt?: string;
  onBackToEditor: () => void;
}

export default function FrontendPage({ 
  title, 
  html, 
  json, 
  updatedAt, 
  onBackToEditor 
}: FrontendPageProps) {
  return (
    <div className="builder-wrapper">
      <div className="fp-shell">
        <div className="fp-topbar">
          <div className="fp-topbar-left">
            <span className="fp-site-name">🌐 My Site</span>
            <span className="fp-breadcrumb">
              / <strong>{title || "Untitled"}</strong>
            </span>
          </div>
          <div className="fp-topbar-right">
            {updatedAt && (
              <span className="fp-updated">
                Saved {new Date(updatedAt).toLocaleString()}
              </span>
            )}
            <button className="fp-edit-btn" onClick={onBackToEditor}>
              ✏️ Back to Editor
            </button>
          </div>
        </div>

        <div className="fp-body">
          <main className="fp-main">
            <header className="fp-page-header">
              <h1 className="fp-page-title">{title}</h1>
            </header>

            <BlockRenderer
              html={html}
              className="fp-page-content entry-content"
            />

            <details className="fp-debug">
              <summary>🔍 Raw data (for debugging)</summary>
              <div className="fp-debug-body">
                <h4>HTML (what gets stored / fetched)</h4>
                <pre>{html}</pre>
                <h4>Block JSON (used to re-open in editor)</h4>
                <pre>{JSON.stringify(json, null, 2)}</pre>
              </div>
            </details>
          </main>
        </div>
      </div>
    </div>
  );
}
