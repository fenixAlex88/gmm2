// Базовые подобъекты
interface Section { id: number; name: string; }
interface TagItem { id: number; name: string; }
interface Author { id: number; name: string; }

// Расширенный интерфейс статьи, который приходит из API (Prisma include)
export interface IArticle {
	id: number;
	title: string;
	views: number;
	contentHtml: string;
	imageUrl?: string | null;
	section: Section;
	author?: Author | null;
	tags?: TagItem[];      
	updatedAt?: string;
}