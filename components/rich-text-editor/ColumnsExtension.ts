import { Node, mergeAttributes } from '@tiptap/core'

export const ColumnsExtension = Node.create({
	name: 'columns',
	group: 'block',
	content: 'column{2}',
	parseHTML() {
		return [{ tag: 'div[data-type="columns"]' }]
	},
	renderHTML({ HTMLAttributes }) {
		// Убираем рамки, оставляем только сетку
		return ['div', mergeAttributes(HTMLAttributes, {
			'data-type': 'columns',
			class: 'grid grid-cols-1 md:grid-cols-2 gap-6 my-6'
		}), 0]
	},
})

export const ColumnExtension = Node.create({
	name: 'column',
	content: 'block+',
	selectable: false,
	parseHTML() {
		return [{ tag: 'div[data-type="column"]' }]
	},
	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, {
			'data-type': 'column',
			class: 'min-w-0'
		}), 0]
	},
})