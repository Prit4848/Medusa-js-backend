// src/admin/routes/cms-blogs/editor/editorStyles.js
import blockEditorStyles from '@wordpress/block-editor/build-style/style.css?inline';
import componentsStyles from '@wordpress/components/build-style/style.css?inline';
import blockLibraryStyles from '@wordpress/block-library/build-style/style.css?inline';
import blockLibraryEditorStyles from '@wordpress/block-library/build-style/editor.css?inline';

export const wordpressStyles = 
  blockEditorStyles + 
  componentsStyles + 
  blockLibraryStyles + 
  blockLibraryEditorStyles;
