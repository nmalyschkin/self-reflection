import { useEffect, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';

type MDRenderProps = {
  markdown: string;
  minH?: string | number;
};

export default function MDRender({ markdown, minH }: MDRenderProps) {
  const extensions = useMemo(() => {
    return [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Markdown.configure({}),
    ];
  }, []);

  const editor = useEditor({
    extensions,
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap md-render-content',
      },
    },
    onCreate: ({ editor }) => {
      editor.commands.setContent(markdown || '', { contentType: 'markdown' });
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(markdown || '', { contentType: 'markdown' });
  }, [editor, markdown]);

  return (
    <Box className="mdview">
      <EditorContent
        editor={editor}
        style={{
          outline: 'none',
          minHeight: typeof minH === 'number' ? `${minH}px` : (minH as any),
        }}
      />
    </Box>
  );
}
