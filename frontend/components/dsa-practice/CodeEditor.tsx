"use client";

import { useState, useEffect } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from 'next-themes';

// Component imports
import { useCodeMirror } from '@/lib/hooks/use-codemirror';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false
}: CodeEditorProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [editorContainer, setEditorContainer] = useState<HTMLDivElement | null>(null);

  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'python':
        return python();
      case 'java':
        return java();
      default:
        return javascript();
    }
  };

  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    indentOnInput(),
    bracketMatching(),
    foldGutter(),
    syntaxHighlighting(defaultHighlightStyle),
    getLanguageExtension(),
    EditorView.lineWrapping,
    keymap.of([...defaultKeymap, indentWithTab]),
    EditorState.readOnly.of(readOnly),
    isDarkMode ? oneDark : [],
  ];

  const { setContainer, view } = useCodeMirror({
    container: editorContainer,
    value,
    onChange,
    extensions,
  });

  // Set the container ref
  useEffect(() => {
    if (editorContainer) {
      setContainer(editorContainer);
    }
  }, [editorContainer, setContainer]);

  // Update language when it changes
  useEffect(() => {
    if (view) {
      const state = view.state;
      const newState = EditorState.create({
        doc: state.doc,
        extensions: [
          ...extensions,
        ],
      });
      view.setState(newState);
    }
  }, [language, isDarkMode]);

  return (
    <div className="border rounded h-full overflow-hidden">
      <div
        ref={setEditorContainer}
        className="h-full w-full font-mono text-sm"
      />
    </div>
  );
}
