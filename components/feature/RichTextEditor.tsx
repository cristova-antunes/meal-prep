"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalEditor } from "lexical";

import {
  ToolbarPlugin,
  HtmlOnChangePlugin,
  getInitialConfig,
} from "./RichTextEditorConfigs";

interface RichTextEditorProps {
  /** Callback fired when editor content changes (receives HTML string) */
  onChange: (html: string) => void;
  /** Optional editor state for initialization */
  editorState?: (editor: LexicalEditor) => void;
  /** Unique namespace for this editor instance */
  namespace?: string;
  /** Optional key to force remount (useful for resetting) */
  editorKey?: number;
  /** CSS class for the contenteditable element */
  containerClassName?: string;
  /** Placeholder text */
  placeholder?: string;
  /** CSS class for the wrapper div */
  wrapperClassName?: string;
}

export function RichTextEditor({
  onChange,
  editorState,
  namespace = "RichTextEditor",
  editorKey = 0,
  containerClassName = "min-h-36 px-3 py-2 outline-none text-sm",
  placeholder = "Write your content...",
  wrapperClassName = "mb-4 border rounded overflow-hidden",
}: RichTextEditorProps) {
  const initialConfig = {
    ...getInitialConfig(namespace),
    ...(editorState && { editorState }),
  };

  return (
    <div className={wrapperClassName}>
      <LexicalComposer key={editorKey} initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={containerClassName}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-2 left-3 text-gray-400 text-sm pointer-events-none select-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <HtmlOnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
