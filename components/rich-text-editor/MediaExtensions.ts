// components/rich-text-editor/MediaExtensions.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { VideoView, AudioView, PdfView } from './MediaViews';

export const VideoExtension = Node.create({
	name: 'video',
	group: 'block',
	atom: true,
	addAttributes() { return { src: { default: null } }; },
	parseHTML() { return [{ tag: 'video' }]; },
	renderHTML({ HTMLAttributes }) {
		return ['div', { class: 'media-wrapper my-12' },
			['video', mergeAttributes(HTMLAttributes, { controls: true, class: 'rounded-xl shadow-2xl w-full aspect-video' })]
		];
	},

	// Добавляем рендерер для редактора
	addNodeView() {
		return ReactNodeViewRenderer(VideoView);
	},
});

export const AudioExtension = Node.create({
	name: 'audio',
	group: 'block',
	atom: true,
	addAttributes() { return { src: { default: null } }; },
	parseHTML() { return [{ tag: 'audio' }]; },
	renderHTML({ HTMLAttributes }) {
		return ['div', { class: 'media-wrapper my-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm' },
			['audio', mergeAttributes(HTMLAttributes, { controls: true, class: 'w-full' })]
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(AudioView);
	},
});

export const PdfExtension = Node.create({
	name: 'pdf',
	group: 'block',
	atom: true,

	addAttributes() {
		return {
			src: {
				default: null,
				// САМОЕ ВАЖНОЕ: как достать src из старого или нового HTML
				parseHTML: (element) => {
					// Ищем src в iframe внутри пришедшего элемента
					const iframe = element.querySelector('iframe');
					return iframe ? iframe.getAttribute('src') : element.getAttribute('src');
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				// TipTap будет искать этот селектор в тексте из базы
				tag: 'div[data-type="pdf"]',
			},
			{
				// Добавляем этот селектор, чтобы распознать старые записи с классом media-wrapper
				tag: 'div.media-wrapper',
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		const { src, ...rest } = HTMLAttributes;
		return [
			'div',
			{
				'data-type': 'pdf',
				class: 'media-wrapper my-12 overflow-hidden rounded-xl border border-slate-200 shadow-lg',
			},
			['iframe', { ...rest, src, class: 'w-full h-[600px] block', frameborder: '0' }],
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(PdfView);
	},
});