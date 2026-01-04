'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style'

import MenuBar from './menu-bar'
import { Carousel } from './Carousel'
import { VideoExtension, AudioExtension, PdfExtension } from './MediaExtensions'
import { MapExtension } from './MapExtension'
import { ColumnExtension, ColumnsExtension } from './ColumnsExtension'

import {
	AlignLeft, AlignCenter, AlignRight, Maximize, Minimize, Trash2,
	Bold, Italic, Strikethrough, Link as LinkIcon,
	Palette,
	ChevronDown,
	ChevronUp,
	AnchorIcon
} from 'lucide-react'
import { Toggle } from '../ui/toggle'
import { EDITOR_COLORS } from '@/interfaces/editor-colors'
import { Anchor } from './AnchorExtension'
import CustomLink from './CustomLink'

export const getAnchorsList = (editor: Editor) => {
	const anchors: string[] = []
	editor.state.doc.descendants((node) => {
		if (node.type.name === 'anchor' && node.attrs.id) {
			const normalizedId = String(node.attrs.id).trim().replace(/\s+/g, '-')
			anchors.push(normalizedId)
		}
	})
	return anchors
}


interface RichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
	const [isMounted, setIsMounted] = useState(false);

	const colorOptions = Object.values(EDITOR_COLORS);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
				orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
				link: false
			}),
			BubbleMenuExtension,
			TextStyle,
			FontSize,
			Color,
			Anchor,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			CustomLink,
			Highlight,
			Image.extend({
				addAttributes() {
					return {
						...this.parent?.(),
						width: {
							default: '100%',
							renderHTML: attributes => ({
								style: `width: ${attributes.width}; height: auto; transition: all 0.2s ease;`,
							}),
						},
						align: {
							default: 'center',
							renderHTML: attributes => {
								const alignments: Record<string, string> = {
									left: 'margin-left: 0; margin-right: auto; display: block;',
									center: 'margin-left: auto; margin-right: auto; display: block;',
									right: 'margin-left: auto; margin-right: 0; display: block;',
								};
								return { style: alignments[attributes.align] || alignments.center };
							},
						},
					};
				},
			}),
			Carousel, VideoExtension, AudioExtension, PdfExtension, MapExtension, ColumnsExtension, ColumnExtension,
		],
		content: content,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: "min-h-[156px] border rounded-lg bg-slate-100 py-2 px-3 focus:outline-none prose max-w-none prose-img:cursor-pointer"
			}
		},
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		}
	});

	useEffect(() => {
		if (!editor || content === editor.getHTML()) return;
		queueMicrotask(() => {
			if (editor && content !== editor.getHTML()) {
				editor.commands.setContent(content, { emitUpdate: false });
			}
		});
	}, [content, editor]);

	if (!isMounted) return <div className="min-h-[200px] w-full bg-slate-50 animate-pulse rounded-lg" />;

	return (
		<div className="w-full relative">
			{editor && (
				<>
					{/* МЕНЮ ДЛЯ ТЕКСТА (при выделении) */}
					<BubbleMenu
						editor={editor}
						pluginKey="textSelectionMenu"
						options={{
							placement: 'bottom',
							offset: 10, // Отступ от текста
						}}
						shouldShow={({ state, editor: e }) => {
							// Показываем, если выделен текст и это не изображение
							return !state.selection.empty && !e.isActive('image');
						}}
						updateDelay={0}
						className="z-[1001]" // Передаем z-index через className, так как это теперь обычный div
					>
						<div className="flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1">
							{/* ШРИФТ: Увеличение */}
							<Toggle
								pressed={false}
								onPressedChange={() => {
									const currentSize = editor.getAttributes('textStyle').fontSize;
									const currentNumber = currentSize ? parseInt(currentSize) : 16;
									editor.chain().focus().setFontSize(`${currentNumber + 2}px`).run();
								}}
							>
								<ChevronUp className="size-4" />
							</Toggle>

							{/* ШРИФТ: Уменьшение */}
							<Toggle
								pressed={false}
								onPressedChange={() => {
									const currentSize = editor.getAttributes('textStyle').fontSize;
									const currentNumber = currentSize ? parseInt(currentSize) : 16;
									editor.chain().focus().setFontSize(`${Math.max(currentNumber - 2, 8)}px`).run();
								}}
							>
								<ChevronDown className="size-4" />
							</Toggle>

							<div className="w-px h-4 bg-slate-200 mx-1" />

							{/* БАЗОВОЕ ФОРМАТИРОВАНИЕ */}
							<Toggle pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
								<Bold className="size-4" />
							</Toggle>
							<Toggle pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
								<Italic className="size-4" />
							</Toggle>
							<Toggle pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
								<Strikethrough className="size-4" />
							</Toggle>

							<div className="w-px h-4 bg-slate-200 mx-1" />


							{/* ЦВЕТ ТЕКСТА */}
							<div className="relative flex items-center justify-center w-8 h-8 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
								<Palette className="size-4" />
								<div
									className="absolute -bottom-1 w-3.5 h-0.5 rounded-full"
									style={{ backgroundColor: editor.getAttributes('textStyle').color || EDITOR_COLORS.DEFAULT.value }}
								/>
								<select
									className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
									onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
									value={editor.getAttributes('textStyle').color || EDITOR_COLORS.DEFAULT.value}
								>
									{colorOptions.map((color) => (
										<option
											key={color.value}
											value={color.value}
											style={{ color: color.value, backgroundColor: 'white' }}
										>
											{color.name}
										</option>
									))}
								</select>
							</div>

							{/* ССЫЛКА */}
							<Toggle pressed={editor.isActive('link')} onPressedChange={() => {
								const anchors = getAnchorsList(editor);
								const previousUrl = editor.getAttributes('link').href;
								const anchorMessage = anchors.length > 0
									? `\nСуществующие якоря: ${anchors.join(', ')}`
									: '\nЯкорей пока нет.';

								const url = prompt(`Введите URL или #имя_якоря:${anchorMessage}`, previousUrl);
								if (url) editor.chain().focus().setLink({ href: url }).run();
							}}>
								<LinkIcon className="size-4" />
							</Toggle>
							<Toggle
								pressed={editor.isActive('anchor')}
								onPressedChange={() => {
									const name = prompt('Имя якоря (например: section-1):');
									if (name) {
										editor.chain().focus().setAnchor(name).run();
									}
								}}
							>
								<AnchorIcon className="size-4" />
							</Toggle>
						</div>
					</BubbleMenu>

					{/* МЕНЮ ДЛЯ ИЗОБРАЖЕНИЙ (при наведении или клике) */}
					<BubbleMenu
						editor={editor}
						pluginKey="imageHoverMenu"
						shouldShow={({ editor: e }) => e.isActive('image')}
					// Чтобы избежать ошибки в DOM, мы не используем tippyOptions как пропс,
					// если он вызывает конфликт. Параметры можно настроить через атрибуты 
					// самого Tippy, если используется внешняя библиотека, но для Tiptap 
					// обычно достаточно стандартного поведения или использования пропса 'updateDelay'
					>
						<div className="flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1 z-[1001]">
							<Toggle pressed={false} onPressedChange={() => {
								const w = parseInt(editor.getAttributes('image').width || '100%');
								editor.chain().focus().updateAttributes('image', { width: `${Math.min(w + 10, 100)}%` }).run();
							}}>
								<Maximize className="size-4" />
							</Toggle>
							<Toggle pressed={false} onPressedChange={() => {
								const w = parseInt(editor.getAttributes('image').width || '100%');
								editor.chain().focus().updateAttributes('image', { width: `${Math.max(w - 10, 10)}%` }).run();
							}}>
								<Minimize className="size-4" />
							</Toggle>
							<div className="w-px h-4 bg-slate-200 mx-1" />
							<Toggle pressed={editor.getAttributes('image').align === 'left'} onPressedChange={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()}>
								<AlignLeft className="size-4" />
							</Toggle>
							<Toggle pressed={editor.getAttributes('image').align === 'center'} onPressedChange={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()}>
								<AlignCenter className="size-4" />
							</Toggle>
							<Toggle pressed={editor.getAttributes('image').align === 'right'} onPressedChange={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()}>
								<AlignRight className="size-4" />
							</Toggle>
							<div className="w-px h-4 bg-slate-200 mx-1" />
							<Toggle pressed={false} onPressedChange={() => editor.chain().focus().deleteSelection().run()}>
								<Trash2 className="size-4 text-red-500" />
							</Toggle>
						</div>
					</BubbleMenu>

					<div className="sticky top-0 z-[101] bg-white border-b shadow-sm rounded-t-lg">
						<MenuBar editor={editor} />
					</div>
				</>
			)}
			<EditorContent editor={editor} />
		</div>
	)
}