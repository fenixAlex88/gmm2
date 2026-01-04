// lib/routes-config.ts

export const STATIC_ROUTES = {
	HOME: { path: '', label: 'Галоўная', priority: 1.0 },
	ARTICLES: { path: '/', label: 'Галоўная', priority: 0.0 },
	ABOUT: { path: '/about_project', label: 'Пра праект', priority: 0.8 },
	PARTNER: { path: '/partner', label: 'Партнёрам', priority: 0.7 },
	SUPPORT: { path: '/support', label: 'Падтрымка', priority: 0.7 },
} as const;

export const getPageLabel = (path: string): string => {
	const route = Object.values(STATIC_ROUTES).find(r => r.path === path);
	return route ? route.label : path;
};