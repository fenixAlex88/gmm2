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

// --- Интерфейс статьи ---
export interface IArticle {
	id: number;
	title: string;
	views: number;
	likes: number;
	contentHtml: string;
	imageUrl?: string | null;

	// Отношения
	section: Section;
	author?: Author | null;
	tags?: TagItem[];
	places?: Place[];
	subjects?: Subject[];

	createdAt: string | Date;
}