import { Node, mergeAttributes, RawCommands } from '@tiptap/core'; // Добавлен импорт RawCommands

export const Column = Node.create({
	name: 'column',
	content: 'block+',
	group: 'block',
	defining: true,

	parseHTML() {
		return [{ tag: 'div[data-type="column"]' }]
	},

	renderHTML({ HTMLAttributes }) {
		// Рендеринг колонки
		return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'p-2' }), 0]
	},
});


export const Columns = Node.create({
	name: 'columns',
	content: 'column{2}', // Контейнер для двух колонок
	group: 'block',
	selectable: true,
	isolating: true,

	addCommands() {
		return {
			// Команда для вставки колонок
			toggleColumns: () => ({ commands }) => {
				return commands.toggleNode('columns', 'paragraph', { class: 'flex gap-4' })
			},
		} as Partial<RawCommands>;
	},

	parseHTML() {
		return [{ tag: 'div[data-type="columns"]' }]
	},

	renderHTML({ HTMLAttributes }) {
		// Рендеринг Flexbox контейнера
		return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: 'flex gap-4' }), 0]
	},
})