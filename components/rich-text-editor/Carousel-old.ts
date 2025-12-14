import { Node, mergeAttributes } from '@tiptap/core';

export const Carousel = Node.create({
	name: 'carousel',
	group: 'block',
	content: 'image+',
	defining: true,

	parseHTML() {
		return [{ tag: 'div[data-type="carousel"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(HTMLAttributes, {
				'data-type': 'carousel',
				class: 'carousel flex overflow-x-auto gap-2 p-2 border rounded',
			}),
			0,
		];
	},
});

