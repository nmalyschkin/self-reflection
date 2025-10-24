import { memo, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEditorConfig } from './editorConfig';

type MDRenderProps = {
  markdown: string;
  minH?: string | number;
};

function MDRender({ markdown, minH }: MDRenderProps) {
  const editorConfig = useEditorConfig();

  const editor = useEditor({
    ...editorConfig,
    editable: false,
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

export default memo(MDRender);
