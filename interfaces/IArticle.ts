export interface IArticle {
	id: number;
	title: string;
	sectionId: number;
	section: {
		id: number;
		name: string;
	};
	imageUrl?: string;
	contentHtml: string;
}
