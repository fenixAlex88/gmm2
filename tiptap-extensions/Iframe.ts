import { Node, mergeAttributes } from '@tiptap/core';

const Iframe = Node.create({
	name: 'iframe',
	group: 'block',
	selectable: true,
	isolating: true,

	addAttributes() {
		return {
			src: { default: null },
			frameborder: { default: 0 },
			allowfullscreen: { default: true },
			height: { default: 400 },
			class: { default: 'w-full aspect-video' } 
		};
	},

	parseHTML() {
		return [{ tag: 'iframe' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
	},
});

export default Iframe;