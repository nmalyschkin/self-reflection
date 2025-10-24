import { TaskItem, TaskList } from '@tiptap/extension-list';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { useMemo } from 'react';

export const useEditorConfig = (placeholder?: string) =>
  useMemo(
    () => ({
      extensions: [
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
        Markdown.configure({}),
      ],
      editorProps: {
        attributes: {
          class: 'tiptap mdtext-content',
          spellcheck: 'true',
          'data-placeholder': placeholder || '',
        },
      },
    }),
    [placeholder],
  );
