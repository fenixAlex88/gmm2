// components/rich-text-editor/menu-bar.tsx
import {
	AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3,
	Highlighter, Images, Italic, List, ListOrdered, Strikethrough,
	Video, Music, FileText,
	MapIcon,
	Columns
} from 'lucide-react';
import React from 'react'
import { Editor } from '@tiptap/react';
import { Toggle } from '../ui/toggle';
import { uploadFiles } from '@/helpers/uploadFiles';

export default function MenuBar({ editor }: { editor: Editor }) {
	if (!editor) return null;


	const addMap = () => {
		const jsonStr = prompt(
			"Вставьте массив маркеров в формате JSON.\nПример: [{\"lat\": 53.9, \"lng\": 27.5, \"label\": \"Минск\"}]"
		);

		if (!jsonStr) return;

		try {
			const markers = JSON.parse(jsonStr);

			// Проверка: является ли введенное значение массивом
			if (!Array.isArray(markers)) {
				alert("Ошибка: Ожидался массив [ {lat, lng, label}, ... ]");
				return;
			}

			// Валидация данных внутри массива
			const validMarkers = markers
				.map(m => ({
					lat: Number(m.lat),
					lng: Number(m.lng),
					label: String(m.label || '')
				}))
				.filter(m => !isNaN(m.lat) && !isNaN(m.lng));

			if (validMarkers.length > 0) {
				editor.chain().focus().insertContent({
					type: 'mapBlock',
					attrs: { markers: validMarkers }
				}).run();
			} else {
				alert("Не найдено корректных координат в JSON.");
			}
		} catch (e) {
			console.error("JSON parse error:", e);
			alert("Ошибка в формате JSON. Проверьте кавычки и запятые.");
		}
	};

	const addColumns = () => {
		editor.chain().focus().insertContent({
			type: 'columns',
			content: [
				{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Левая колонка' }] }] },
				{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Правая колонка' }] }] },
			]
		}).run();
	};

	// --- Универсальная функция загрузки ---
	const handleFileUpload = (
		accept: string,
		type: 'carousel' | 'video' | 'audio' | 'pdf'
	) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = type === 'carousel'; // Только карусель поддерживает множественный выбор

	
		input.onchange = async () => {
			if (!input.files?.length) return;

			try {
				// Загружаем файлы и получаем URL
				const urls = await uploadFiles(input.files);

				if (urls.length === 0) {
					alert('Не удалось загрузить файл.');
					return;
				}

				// Логика вставки в зависимости от типа
				switch (type) {
					case 'carousel':
						editor.chain().focus().insertContent({
							type: 'carousel',
							attrs: { images: urls }
						}).run();
						break;

					case 'video':
						editor.chain().focus().insertContent({
							type: 'video',
							attrs: { src: urls[0] }
						}).run();
						break;

					case 'audio':
						editor.chain().focus().insertContent({
							type: 'audio',
							attrs: { src: urls[0] }
						}).run();
						break;

					case 'pdf':
						editor.chain().focus().insertContent({
							type: 'pdf',
							attrs: { src: urls[0] }
						}).run();
						break;
				}

			} catch (error) {
				console.error("Ошибка загрузки:", error);
				alert("Ошибка при загрузке файла.");
			}
		};

		input.click();
	}

	const Options = [
		{
			icon: <Heading1 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
			preesed: editor.isActive("heading", { level: 1 }),
		},
		{
			icon: <Heading2 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			preesed: editor.isActive("heading", { level: 2 }),
		},
		{
			icon: <Heading3 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			preesed: editor.isActive("heading", { level: 3 }),
		},
		{
			icon: <Bold className="size-4" />,
			onClick: () => editor.chain().focus().toggleBold().run(),
			preesed: editor.isActive("bold"),
		},
		{
			icon: <Italic className="size-4" />,
			onClick: () => editor.chain().focus().toggleItalic().run(),
			preesed: editor.isActive("italic"),
		},
		{
			icon: <Strikethrough className="size-4" />,
			onClick: () => editor.chain().focus().toggleStrike().run(),
			preesed: editor.isActive("strike"),
		},
		{
			icon: <AlignLeft className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("left").run(),
			preesed: editor.isActive({ textAlign: "left" }),
		},
		{
			icon: <AlignCenter className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("center").run(),
			preesed: editor.isActive({ textAlign: "center" }),
		},
		{
			icon: <AlignRight className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("right").run(),
			preesed: editor.isActive({ textAlign: "right" }),
		},
		{
			icon: <List className="size-4" />,
			onClick: () => editor.chain().focus().toggleBulletList().run(),
			preesed: editor.isActive("bulletList"),
		},
		{
			icon: <ListOrdered className="size-4" />,
			onClick: () => editor.chain().focus().toggleOrderedList().run(),
			preesed: editor.isActive("orderedList"),
		},
		{
			icon: <Highlighter className="size-4" />,
			onClick: () => editor.chain().focus().toggleHighlight().run(),
			preesed: editor.isActive("highlight"),
		},
		{
			icon: <Columns className="size-4" />,
			onClick: addColumns,
			preesed: editor.isActive("columns"),
			label: "Две колонки"
		},
		// --- МЕДИА БЛОК ---
		{
			icon: <Images className="size-4" />,
			onClick: () => handleFileUpload('image/*', 'carousel'),
			preesed: editor.isActive("carousel"),
			label: "Карусель (Фото)"
		},
		{
			icon: <Video className="size-4" />,
			onClick: () => handleFileUpload('video/*', 'video'),
			preesed: editor.isActive("video"),
			label: "Видео"
		},
		{
			icon: <Music className="size-4" />,
			onClick: () => handleFileUpload('audio/*', 'audio'),
			preesed: editor.isActive("audio"),
			label: "Аудио"
		},
		{
			icon: <FileText className="size-4" />,
			onClick: () => handleFileUpload('application/pdf', 'pdf'),
			preesed: editor.isActive("pdf"),
			label: "PDF Документ"
		},
		{
			icon: <MapIcon className="size-4" />,
			onClick: addMap,
			preesed: editor.isActive("mapBlock"),
			label: "Карта"
		},
	];

	return (
		<div className="border rounded-md p-1 mb-1 bg-slate-100 space-x-2 z-50 flex flex-wrap gap-y-1">
			{Options.map((option, index) => (
				<Toggle
					key={index}
					pressed={option.preesed}
					onPressedChange={option.onClick}
				>
					{option.icon}
				</Toggle>
			))}
		</div>
	)
}