import Link from '@tiptap/extension-link'

const CustomLink = Link.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			target: {
				default: null,
				renderHTML: attributes => {
					const href = attributes.href || ''
					return {
						target: href.startsWith('#') ? null : '_blank',
					}
				},
			},
			rel: {
				default: 'noopener noreferrer',
			},
		}
	},
})

export default CustomLink
