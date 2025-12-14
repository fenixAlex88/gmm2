import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { DOMNode } from 'html-react-parser'; // 1. Импорт парсера
import CarouselDisplay from '@/components/CarouselDisplay'; // 2. Импорт компонента Карусели

export default async function ArticlePage({ params }: { params: { id: string } }) {
	const article = await prisma.article.findUnique({
		where: { id: Number(params.id) },
	});

	if (!article) return <div>Статья не найдена</div>;

	// 3. Создаем функцию для замены HTML-узлов на React-компоненты
	const replace = (node: DOMNode) => {
		if (node.type === 'tag' && node.name === 'div' && node.attribs['data-type'] === 'carousel') {
			const dataImages = node.attribs['data-images'];
			const dataInterval = node.attribs['interval'];

			let images: string[] = [];
			try {
				// Пытаемся распарсить JSON-строку из data-images
				if (dataImages) {
					images = JSON.parse(dataImages);
				}
			} catch (e) {
				console.error("Ошибка парсинга JSON для карусели:", e);
				return null;
			}

			// Заменяем div на React-компонент CarouselDisplay
			return (
				<CarouselDisplay
					images={images}
					interval={dataInterval ? parseInt(dataInterval) : undefined}
				/>
			);
		}
	};

	// 4. Парсим HTML, используя функцию замены
	const parsedContent = parse(article.contentHtml, { replace });

	return (
		<article className="max-w-6xl mx-auto">
			<h1 className="text-6xl font-bold mb-20 text-center">{article.title}</h1>
			{/* Оставшийся код для главного изображения */}
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

			{/* 5. Используем распарсенный контент вместо dangerouslySetInnerHTML */}
			<div className="prose">
				{parsedContent}
			</div>
		</article>
	);
}