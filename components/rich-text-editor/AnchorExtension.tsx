import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		anchor: {
			/**
			 * Установить якорь в текущей позиции
			 */
			setAnchor: (id: string) => ReturnType
		}
	}
}

export const Anchor = Node.create({
	name: 'anchor',
	group: 'inline',
	inline: true,
	selectable: true,
	atom: true,

	addAttributes() {
		return {
			id: {
				default: null,
				renderHTML: attributes => {
					if (!attributes.id) {
						return {}
					}
					return {
						id: String(attributes.id).replace(/\s+/g, '-'),
					}
				},
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-anchor]',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', mergeAttributes(HTMLAttributes, { 'data-anchor': '' })]
	},

	addCommands() {
		return {
			setAnchor:
				(id: string) =>
					({ chain }) => {
						return chain()
							.insertContent({
								type: this.name,
								attrs: { id },
							})
							.run()
					},
		}
	},
})
