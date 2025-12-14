import { AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Highlighter, Images, Italic, List, ListOrdered, Strikethrough } from 'lucide-react';
import React from 'react'
import { Editor } from '@tiptap/react';
import { Toggle } from '../ui/toggle';
import { uploadFiles } from '@/helpers/uploadFiles';

export default function MenuBar({ editor }: {editor: Editor}) {
	if (!editor) return null;

	const addCarousel = async () => { // ⭐ Сделали асинхронной
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.multiple = true;

		input.onchange = async () => {
			if (!input.files?.length) return;

			// --- 1. Загрузка файлов на сервер ---
			try {
				// Массив файлов (FileList) передается в новую функцию
				const imageUrls = await uploadFiles(input.files);

				if (imageUrls.length === 0) {
					alert('Не удалось загрузить ни одно изображение.');
					return;
				}

				// --- 2. Вставляем узел карусели в редактор ---
				editor.chain().focus().insertContent({
					type: 'carousel',
					attrs: {
						images: imageUrls // Используем реальные URL с сервера
					}
				}).run();

			} catch (error) {
				console.error("Ошибка при загрузке или вставке карусели:", error);
				alert("Ошибка: Не удалось загрузить изображения для карусели.");
			}
		};

		input.click();
	};

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
			icon: <span className="text-xs font-bold">2⎜</span>,
			onClick: () => editor.chain().focus().toggleNode('twoColumns', 'paragraph').run(),
			preesed: editor.isActive('twoColumns'),
		},
		{
			icon: <Images className="size-4" />,
			onClick: addCarousel,
			preesed: editor.isActive("carousel"), // Подсветка, если курсор на карусели
			label: "Карусель"
		},


	];

  return (
	  <div className="border rounded-md p-1 mb-1 bg-slate-100 space-x-2 z-50">
		{Options.map((option, index) =>(
			<Toggle key={index} pressed={option.preesed} onPressedChange={option.onClick}>{option.icon}</Toggle>
		))
		}
	  </div>
  )
}
