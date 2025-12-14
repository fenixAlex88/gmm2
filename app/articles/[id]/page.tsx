import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { DOMNode, Element } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';

// Тип для params
type PageParams = { id: string };

type PageProps = {
  params: PageParams;
};

export default async function ArticlePage({ params }: PageProps) {
  const article = await prisma.article.findUnique({
    where: { id: Number(params.id) },
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
        console.error('Ошибка парсинга JSON для карусели:', e);
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
    <article>
      <h1 className="text-6xl font-bold mb-20 text-center">{article.title}</h1>

		  {article.imageUrl ? (
			  <div className="relative w-full h-[500px]">
				  <Image
					  src={article.imageUrl}
					  alt={article.title}
					  fill
					  sizes="100vw"
					  className="object-cover"
				  />
			  </div>

		  ) : null}


		  <div className="mx-auto max-w-6xl prose">{parsedContent}</div>
    </article>
  );
}
