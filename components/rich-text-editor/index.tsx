'use client'


import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import MenuBar from './menu-bar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Carousel } from './Carousel';
// import { TwoColumns } from './TwoColumns';

interface RichTextEditorProps {
	content: string;
	onChange: (content: string)=>void;
}

export default function RichTextEditor({content, onChange}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					HTMLAttributes:{
						class: "list-disc ml-3",
					}
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-3",
					}
				}
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Highlight,
			// TwoColumns,
			Image,
			Carousel
		],
		content: content,
		immediatelyRender: false,
		editorProps:{
			attributes:{
				class: "min-h-[156px] border rounded-lg bg-slate-100 py-2 px-3"
			} 
		},
		onUpdate: ({editor}) => {
			console.log(editor.getHTML());
			onChange(editor.getHTML());
		}
	})

	return (
		<div>
			<MenuBar editor={editor!} />
			<EditorContent editor={editor} />
		</div>
	)
}
