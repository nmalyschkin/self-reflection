import { memo, useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEditorConfig } from './editorConfig';

type MDTextProps = {
  value: string;
  onChange?: (markdown: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  minH?: string | number;
  onBlur?: (markdown: string) => void;
};

function MDText({ value, onChange, onSubmit, placeholder, minH, onBlur }: MDTextProps) {
  const isSettingContentRef = useRef(false);

  const editorConfig = useEditorConfig(placeholder);

  const editor = useEditor({
    ...editorConfig,
    onCreate: ({ editor }) => {
      isSettingContentRef.current = true;
      editor.commands.setContent(value || '', { contentType: 'markdown' });
      isSettingContentRef.current = false;
    },
    onUpdate: ({ editor }) => {
      if (isSettingContentRef.current) return;
      // getMarkdown is available via the Markdown extension
      const md = (editor as any).getMarkdown?.() as string;
      if (typeof md === 'string') {
        onChange?.(md);
      }
    },
    onBlur: ({ editor }) => {
      if (onBlur) {
        const md = (editor as any).getMarkdown?.() as string;
        if (typeof md === 'string' && md !== value) {
          onBlur(md);
        }
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentMd = (editor as any).getMarkdown?.() as string;
    if (currentMd !== value) {
      isSettingContentRef.current = true;
      editor.commands.setContent(value || '', { contentType: 'markdown' });
      isSettingContentRef.current = false;
    }
  }, [editor, value]);

  return (
    <Box
      className="mdtext"
      borderWidth="1px"
      rounded="md"
      p={2}
      minH={minH}
      _focusWithin={{
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        borderColor: 'blue.500',
      }}
      onMouseDown={(e) => {
        // Clicks on the padded container should focus the editor as well
        if (!editor) return;
        const target = e.target as HTMLElement;
        const isInsidePM = !!target.closest('.ProseMirror');
        if (!isInsidePM) {
          e.preventDefault();
          editor.commands.focus();
        }
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          onSubmit?.();
        }
      }}
    >
      <EditorContent
        editor={editor}
        className="mdtext-content"
        style={{
          outline: 'none',
          minHeight: typeof minH === 'number' ? `${minH}px` : (minH as any),
          fontSize: '16px',
          width: '100%',
        }}
      />
    </Box>
  );
}

export default memo(MDText);
