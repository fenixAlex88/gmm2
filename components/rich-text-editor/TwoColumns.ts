import { Node, mergeAttributes } from '@tiptap/core';

export const TwoColumns = Node.create({
	name: 'twoColumns',
	group: 'block',
	content: 'block+',
	defining: true,

	parseHTML() {
		return [{ tag: 'div[data-type="two-columns"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(HTMLAttributes, {
				'data-type': 'two-columns',
				class: 'columns-2 gap-4', // Tailwind: делим на 2 колонки
			}),
			0,
		];
	},
});
