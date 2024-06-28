import { Dispatch, SetStateAction, useCallback } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import OrderedList from '@tiptap/extension-ordered-list';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import History from '@tiptap/extension-history';
import Gapcursor from '@tiptap/extension-gapcursor';
import Image from '@tiptap/extension-image';

import { EmailTemplate } from '@constants';
import { TipTapToolbar } from './TipTapToolbar';

interface TipTapEditorProps {
  template: EmailTemplate;
  setTemplate?: Dispatch<SetStateAction<EmailTemplate>>;
  showToolbar: boolean;
  className?: string;
  editorFullRoundBorder: boolean;
  isEditable: boolean;
}

export const TipTapEditor = ({
  template,
  setTemplate,
  showToolbar,
  className,
  editorFullRoundBorder,
  isEditable,
}: TipTapEditorProps) => {
  // setup tiptap editor with extensions
  const editor = useEditor({
    extensions: [
      Document,
      Text,
      Bold,
      Italic,
      ListItem,
      Underline,
      Heading,
      Gapcursor,
      // pargraphs have a large height, reduce it
      Paragraph.configure({
        HTMLAttributes: {
          style: 'height: 0.625rem',
        },
      }),
      // tailwinds prose class hides the bullets with a large padding,
      // need to change padding to ol and ul
      BulletList.configure({
        HTMLAttributes: {
          style: 'padding-left: 1.25rem',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          style: 'padding-left: 1.25rem',
        },
      }),
      Link.extend({ inclusive: false }).configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          style: 'color: blue; text-decoration: underline',
        },
      }),
      // for undo and redo
      History.configure({
        depth: 10,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: template?.body ?? '',
    autofocus: true,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editable: isEditable,
    injectCSS: false,
  });

  const onChange = useCallback((value: string) => {
    if (setTemplate) {
      setTemplate((prev: EmailTemplate) => ({ ...prev, body: value }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set default editor options and styling
  // need tailwinds prose plugin for text display
  editor?.setOptions({
    editorProps: {
      attributes: {
        class: `txt-editor prose max-w-none border border-black focus:outline-none  ${
          editorFullRoundBorder ? 'rounded' : 'rounded-b-lg'
        }`,
      },
      // for copy pasting from outside like Outlook
      transformPastedText(text) {
        return text.replace(/\xA0/g, ' ');
      },
      transformPastedHTML(html) {
        return html.replace(/\xA0/g, ' ');
      },
    },
    parseOptions: { preserveWhitespace: 'full' },
  });

  return (
    <>
      {showToolbar && <TipTapToolbar editor={editor} />}
      <EditorContent className={className} editor={editor} />
    </>
  );
};
