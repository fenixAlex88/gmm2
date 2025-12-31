// constants/editor-colors.ts

export const EDITOR_COLORS = {
	// Базавыя
	DEFAULT: { name: 'Стандартны', value: '#0f172a' },
	GRAY: { name: 'Шэры', value: '#64748b' },
	WHITE: { name: 'Белы', value: '#ffffff' },

	// Яркія акцэнты
	ROSE: { name: 'Ружовы (Rose)', value: '#e11d48' },
	RED: { name: 'Чырвоны', value: '#dc2626' },
	ORANGE: { name: 'Аранжавы', value: '#ea580c' },
	AMBER: { name: 'Бурштынавы', value: '#d97706' },
	YELLOW: { name: 'Жоўты', value: '#ca8a04' },
	LIME: { name: 'Салатавы', value: '#65a30d' },
	GREEN: { name: 'Зялёны', value: '#16a34a' },
	EMERALD: { name: 'Ізумрудны', value: '#059669' },
	TEAL: { name: 'Бірузовы', value: '#0d9488' },
	CYAN: { name: 'Блакітны', value: '#0891b2' },
	SKY: { name: 'Неба', value: '#0284c7' },
	BLUE: { name: 'Сіні', value: '#2563eb' },
	INDIGO: { name: 'Індыга', value: '#4f46e5' },
	VIOLET: { name: 'Фіялетавы', value: '#7c3aed' },
	PURPLE: { name: 'Пурпурны', value: '#9333ea' },
	FUCHSIA: { name: 'Фуксія', value: '#c026d3' },
	PINK: { name: 'Малінавы', value: '#db2777' },

	// Глыбокія колеры
	NAVY: { name: 'Цёмна-сіні', value: '#1e3a8a' },
	FOREST: { name: 'Лес', value: '#064e3b' },
	WINE: { name: 'Віно', value: '#4c0519' },
} as const;

export type EditorColorKey = keyof typeof EDITOR_COLORS;