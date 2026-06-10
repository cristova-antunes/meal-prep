import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useEffect, useState } from "react";
import {
  $createHeadingNode,
  HeadingNode,
  HeadingTagType,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";

// ---------------------------------------------------------------------------
// Toolbar plugin
// ---------------------------------------------------------------------------

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          // Inline formats
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));

          // Link detection
          const node = selection.anchor.getNode();
          const parent = node.getParent();
          setIsLink($isLinkNode(parent) || $isLinkNode(node));

          // Block type detection
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();

          if ($isListNode(element)) {
            const parentList = $getNearestNodeOfType(anchorNode, ListNode);
            setBlockType(parentList ? parentList.getListType() : "bullet");
          } else {
            setBlockType(element.getType());
          }
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (p) => {
          setCanUndo(p);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (p) => {
          setCanRedo(p);
          return false;
        },
        1,
      ),
    );
  }, [editor]);

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === tag) {
          // Toggle back to paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      }
    });
  };

  const formatBulletList = () => {
    if (blockType === "bullet") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType === "number") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); // remove link
    } else {
      setShowLinkInput(true);
    }
  };

  const confirmLink = () => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url: linkUrl,
        target: "_blank",
      });
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  return (
    <div className="border-b bg-gray-50">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          disabled={!canUndo}
          title="Undo"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          disabled={!canRedo}
          title="Redo"
        >
          ↪
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => formatHeading("h1")}
          active={blockType === "h1"}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatHeading("h2")}
          active={blockType === "h2"}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatHeading("h3")}
          active={blockType === "h3"}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Inline formats */}
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          active={isBold}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          active={isItalic}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={formatBulletList}
          active={blockType === "bullet"}
          title="Bullet list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={formatNumberedList}
          active={blockType === "number"}
          title="Numbered list"
        >
          1. List
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={insertLink}
          active={isLink}
          title={isLink ? "Remove link" : "Insert link"}
        >
          🔗
        </ToolbarButton>
      </div>

      {/* Link input row */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-2 py-1 border-t bg-white">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmLink()}
            autoFocus
          />
          <button
            type="button"
            onClick={confirmLink}
            className="px-2 py-1 bg-slate-800 text-white text-sm rounded"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1 text-sm text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-300" />;
}

export function ToolbarButton({
  onClick,
  disabled = false,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors
        ${active ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100"}
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Editor theme
// ---------------------------------------------------------------------------

export const editorTheme = {
  text: {
    bold: "font-bold",
    italic: "italic",
  },
};

export function HtmlOnChangePlugin({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(
        () => {
          const html = $generateHtmlFromNodes(editor);
          onChange(html);
        },
        { editor },
      ); // 👈 pass editor as context
    });
  }, [editor, onChange]);
  return null;
}

export const EMPTY_EDITOR_STATE =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export function getInitialConfig(namespace: string) {
  return {
    namespace,
    theme: editorTheme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => console.error(error),
  };
}
