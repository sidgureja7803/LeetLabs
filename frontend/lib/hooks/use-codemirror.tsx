"use client";

import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

interface UseCodeMirrorProps {
  container: HTMLElement | null;
  value: string;
  onChange?: (value: string) => void;
  extensions?: Extension[];
}

export function useCodeMirror({
  container,
  value,
  onChange = () => {},
  extensions = [],
}: UseCodeMirrorProps) {
  const [view, setView] = useState<EditorView>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!container || initialized.current) return;
    initialized.current = true;

    // Create the editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        ...extensions,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            const docContent = update.state.doc.toString();
            onChange(docContent);
          }
        }),
      ],
    });

    // Create the editor view
    const editorView = new EditorView({
      state,
      parent: container,
    });

    setView(editorView);

    return () => {
      editorView.destroy();
      initialized.current = false;
    };
  }, [container, initialized.current]);

  // Update editor content if value prop changes externally
  useEffect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value, view]);

  return {
    view,
    container: containerRef,
    setContainer: setContainerRef,
  };
}
