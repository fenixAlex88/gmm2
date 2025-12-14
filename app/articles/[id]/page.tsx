import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { DOMNode, Element } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';

// Тип для params (явное указание)
type PageParams = { id: string };

type PageProps = {
	params: Promise<PageParams>;
};

export default async function ArticlePage({ params }: PageProps) {
	// Раскрываем Promise
	const resolvedParams = await params;
	const article = await prisma.article.findUnique({
		where: { id: Number(resolvedParams.id) },
	});

	if (!article) return <div>Статья не найдена</div>;

	const replace = (node: DOMNode) => {
		if (node instanceof Element && node.name === 'div' && node.attribs['data-type'] === 'carousel') {
			const dataImages = node.attribs['data-images'];
			const dataInterval = node.attribs['interval'];

			let images: string[] = [];
			try {
				if (dataImages) {
					images = JSON.parse(dataImages);
				}
			} catch (e) {
				console.error("Ошибка парсинга JSON для карусели:", e);
				return null;
			}

			return (
				<CarouselDisplay
					images={images}
					interval={dataInterval ? parseInt(dataInterval) : undefined}
				/>
			);
		}
	};

	const parsedContent = parse(article.contentHtml, { replace });

	return (
		<article className="max-w-6xl mx-auto">
			<h1 className="text-6xl font-bold mb-20 text-center">{article.title}</h1>

			{article.imageUrl ? (
				<Image
					src={article.imageUrl}
					alt={article.title}
					width={800}
					height={600}
					className="w-full mb-6 rounded-lg"
				/>
			) : (
				<Image
					src="/images/noImage.jpg"
					alt="Нет изображения"
					width={800}
					height={600}
					className="w-full mb-6 rounded-lg"
				/>
			)}

			<div className="prose">{parsedContent}</div>
		</article>
	);
}
