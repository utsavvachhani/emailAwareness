"use client";
import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';

// Import tools
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Image from '@editorjs/image';
// @ts-ignore
import Embed from '@editorjs/embed';
// @ts-ignore
import Link from '@editorjs/link';
// @ts-ignore
import Checklist from '@editorjs/checklist';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Marker from '@editorjs/marker';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';
// @ts-ignore
import Underline from '@editorjs/underline';

export const EDITOR_JS_TOOLS = {
  header: Header ? {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: 'Enter a heading',
      levels: [1, 2, 3],
      defaultLevel: 2
    }
  } : undefined,
  list: List ? {
    class: List,
    inlineToolbar: true,
  } : undefined,
  checklist: Checklist ? {
    class: Checklist,
    inlineToolbar: true,
  } : undefined,
  image: Image ? {
    class: Image,
    config: {
    }
  } : undefined,
  embed: Embed ? {
    class: Embed,
    inlineToolbar: true,
  } : undefined,
  link: Link ? {
    class: Link,
    inlineToolbar: true,
  } : undefined,
  quote: Quote ? {
    class: Quote,
    inlineToolbar: true,
  } : undefined,
  marker: Marker || undefined,
  inlineCode: InlineCode || undefined,
  underline: Underline || undefined,
  paragraph: {
    inlineToolbar: true,
  }
};

// Clean up undefined tools to prevent EditorJS crash
const filteredTools: any = Object.fromEntries(
  Object.entries(EDITOR_JS_TOOLS).filter(([_, v]) => v !== undefined)
);

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  holder: string;
  readOnly?: boolean;
}

const EditorJSComponent = ({ data, onChange, holder, readOnly = false }: EditorProps) => {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    // Initialise editor
    if (!ref.current) {
        const editor = new EditorJS({
          holder: holder,
          tools: filteredTools,
          data: data,
          readOnly: readOnly,
          placeholder: 'Start building your amazing curriculum here...',
          async onChange(api) {
            const savedData = await api.saver.save();
            onChange(savedData);
          },
        });
        ref.current = editor;
    }

    return () => {
      if (ref.current && typeof ref.current.destroy === 'function') {
        ref.current.destroy();
        ref.current = null;
      }
    };
  }, [holder, readOnly]); // Only re-init if holder or readOnly changes

  return <div id={holder} className="editorjs-container prose prose-slate max-w-none" />;
};

export default EditorJSComponent;
