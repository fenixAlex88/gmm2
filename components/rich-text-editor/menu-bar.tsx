'use client'

import React from 'react';
import {
	AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3,
	Highlighter, Images, Italic, List, ListOrdered, Strikethrough,
	Video, Music, FileText, MapIcon, Columns, ChevronUp, ChevronDown,
	Link as LinkIcon, Unlink, Palette, Image as ImageIcon
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { Toggle } from '../ui/toggle';
import { uploadFiles } from '@/helpers/uploadFiles';
import { EDITOR_COLORS } from '@/interfaces/editor-colors';
import { getAnchorsList } from '.';

export default function MenuBar({ editor }: { editor: Editor | null }) {
	if (!editor) return null;
	const colorOptions = Object.values(EDITOR_COLORS);

	const changeFontSize = (delta: number) => {
		const currentSize = editor.getAttributes('textStyle').fontSize;
		const currentNumber = currentSize ? parseInt(currentSize) : 16;
		editor.chain().focus().setFontSize(`${currentNumber + delta}px`).run();
	};

	const handleFileUpload = (accept: string, type: 'image' | 'carousel' | 'video' | 'audio' | 'pdf') => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = type === 'carousel';

		input.onchange = async () => {
			if (!input.files?.length) return;
			try {
				const urls = await uploadFiles(input.files);
				if (!urls.length) return;

				const chain = editor.chain().focus();
				if (type === 'image') chain.setImage({ src: urls[0] }).run();
				else if (type === 'carousel') chain.insertContent({ type: 'carousel', attrs: { images: urls } }).run();
				else chain.insertContent({ type, attrs: { src: urls[0] } }).run();
			} catch (e) { alert("Памылка загрузкі"); }
		};
		input.click();
	};

	const options = [
		{ icon: <Heading1 className="size-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), pressed: !!editor.isActive("heading", { level: 1 }) },
		{ icon: <Heading2 className="size-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), pressed: !!editor.isActive("heading", { level: 2 }) },
		{ icon: <Heading3 className="size-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), pressed: !!editor.isActive("heading", { level: 3 }) },
		{ icon: <Bold className="size-4" />, onClick: () => editor.chain().focus().toggleBold().run(), pressed: !!editor.isActive("bold") },
		{ icon: <Italic className="size-4" />, onClick: () => editor.chain().focus().toggleItalic().run(), pressed: !!editor.isActive("italic") },
		{ icon: <Strikethrough className="size-4" />, onClick: () => editor.chain().focus().toggleStrike().run(), pressed: !!editor.isActive("strike") },
		{
			icon: (
				<div className="relative flex flex-col items-center justify-center">
					<Palette className="size-4" />
					{/* Полоска под иконкой, показывающая текущий цвет */}
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
								// Устанавливаем цвет текста для каждой опции
								style={{ color: color.value, backgroundColor: 'white' }}
							>
								{/* Использование символа квадрата для наглядности, если название цвета длинное */}
								{color.name}
							</option>
						))}
					</select>
				</div>
			),
			onClick: () => { },
			pressed: false
		},
		{ icon: <ChevronUp className="size-4" />, onClick: () => changeFontSize(2), pressed: false },
		{ icon: <ChevronDown className="size-4" />, onClick: () => changeFontSize(-2), pressed: false },
		{ icon: <AlignLeft className="size-4" />, onClick: () => editor.chain().focus().setTextAlign("left").run(), pressed: !!editor.isActive({ textAlign: "left" }) },
		{ icon: <AlignCenter className="size-4" />, onClick: () => editor.chain().focus().setTextAlign("center").run(), pressed: !!editor.isActive({ textAlign: "center" }) },
		{ icon: <AlignRight className="size-4" />, onClick: () => editor.chain().focus().setTextAlign("right").run(), pressed: !!editor.isActive({ textAlign: "right" }) },
		{ icon: <List className="size-4" />, onClick: () => editor.chain().focus().toggleBulletList().run(), pressed: !!editor.isActive("bulletList") },
		{ icon: <ListOrdered className="size-4" />, onClick: () => editor.chain().focus().toggleOrderedList().run(), pressed: !!editor.isActive("orderedList") },
		{
			icon: <LinkIcon className="size-4" />,
			onClick: () => {
				const anchors = getAnchorsList(editor);
				const previousUrl = editor.getAttributes('link').href;

				// Формируем сообщение со списком существующих якорей
				const anchorMessage = anchors.length > 0
					? `\nСуществующие якоря: ${anchors.join(', ')}`
					: '\nЯкорей пока нет.';

				const url = prompt(`Введите URL или #имя_якоря:${anchorMessage}`, previousUrl);

				if (url) {
					editor.chain().focus().setLink({ href: url }).run();
				}
			},
			pressed: !!editor.isActive('link')
		},
		{
			icon: <Unlink className="size-4" />,
			onClick: () => editor.chain().focus().unsetLink().run(),
			preesed: false,
			label: "Удалить ссылку"
		},
		{ icon: <Highlighter className="size-4" />, onClick: () => editor.chain().focus().toggleHighlight().run(), pressed: !!editor.isActive("highlight") },
		{
			icon: <Columns className="size-4" />,
			onClick: () => editor.chain().focus().insertContent({
				type: 'columns',
				content: [
					{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Левая колонка' }] }] },
					{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Правая колонка' }] }] }
				]
			}).run(),
			pressed: !!editor.isActive("columns")
		},
		{ icon: <ImageIcon className="size-4" />, onClick: () => handleFileUpload('image/*', 'image'), pressed: !!editor.isActive("image") },
		{ icon: <Images className="size-4" />, onClick: () => handleFileUpload('image/*', 'carousel'), pressed: !!editor.isActive("carousel") },
		{ icon: <Video className="size-4" />, onClick: () => handleFileUpload('video/*', 'video'), pressed: !!editor.isActive("video") },
		{ icon: <Music className="size-4" />, onClick: () => handleFileUpload('audio/*', 'audio'), pressed: !!editor.isActive("audio") },
		{ icon: <FileText className="size-4" />, onClick: () => handleFileUpload('application/pdf', 'pdf'), pressed: !!editor.isActive("pdf") },
		{
			icon: <MapIcon className="size-4" />,
			onClick: () => {
				const json = prompt(
					"Вставьте массив маркеров в формате JSON.\nПример: [{\"lat\": 53.9, \"lng\": 27.5, \"label\": \"Минск\"}]"
				);
				if (!json) return;
				try {
					const markers = JSON.parse(json);
					editor.chain().focus().insertContent({ type: 'mapBlock', attrs: { markers } }).run();
				} catch (e) { alert("Памылка JSON"); }
			},
			pressed: !!editor.isActive("mapBlock")
		},
	];

	return (
		<div className="border rounded-md p-1 bg-slate-100 flex flex-wrap gap-1">
			{options.map((option, index) => (
				<Toggle key={index} pressed={!!option.pressed} onPressedChange={option.onClick}>
					{option.icon}
				</Toggle>
			))}
		</div>
	);
}