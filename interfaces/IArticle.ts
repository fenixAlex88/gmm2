// interfaces\IArticle.ts
// --- Базовые подобъекты ---
interface Section {
	id: number;
	name: string;
}

interface TagItem {
	id: number;
	name: string;
}

interface Author {
	id: number;
	name: string;
}

interface Place {
	id: number;
	name: string;
}

interface Subject {
	id: number;
	name: string;
}

interface Like {
	id: number;
	articleId: number;
	createdAt: string | Date;
}

// --- Интерфейс статьи ---
export interface IArticle {
	id: number;
	priority?: number;
	title: string;
	description?: string | null;
	views: number;
	contentHtml: string;
	imageUrl?: string | null;

	displayDate?: string;
	isoDate?: string;

	// Отношения
	section: Section;
	author?: Author | null;
	tags?: TagItem[];
	places?: Place[];
	subjects?: Subject[];
	likesRel?: Like[];

	createdAt: string | Date;
}