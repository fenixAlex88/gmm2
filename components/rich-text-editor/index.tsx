'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import MenuBar from './menu-bar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Carousel } from './Carousel';
import { VideoExtension, AudioExtension, PdfExtension } from './MediaExtensions';
import { MapExtension } from './MapExtension';

interface RichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					HTMLAttributes: {
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
			Image,
			Carousel,
			VideoExtension,
			AudioExtension,
			PdfExtension,
			MapExtension,
		],
		content: content,

		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: "min-h-[156px] border rounded-lg bg-slate-100 py-2 px-3 focus:outline-none"
			}
		},
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		}
	});


	// Сінхранізацыя знешняга кантэнту з рэдактарам
	useEffect(() => {
		if (!editor || content === editor.getHTML()) return;

		queueMicrotask(() => {
			if (editor && content !== editor.getHTML()) {
				// Перадаем толькі 2 аргументы: кантэнт і аб'ект опцый
				editor.commands.setContent(content, {
					emitUpdate: false, // Гэта замяняе стары другі аргумент
					parseOptions: {
						preserveWhitespace: "full",
					}
				});
			}
		});
	}, [content, editor]);

	if (!isMounted) {
		return <div className="min-h-[200px] w-full bg-slate-50 border rounded-lg animate-pulse" />;
	}

	return (
		<div className="w-full">
			{editor && <MenuBar editor={editor} />}
			<EditorContent editor={editor} />
		</div>
	)
}