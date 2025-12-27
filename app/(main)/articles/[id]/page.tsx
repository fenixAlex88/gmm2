// app/articles/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { Element, HTMLReactParserOptions } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';
import { AudioDisplay, PdfDisplay, VideoDisplay } from '@/components/rich-text-editor/MediaDisplay';

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(resolvedParams.id) },
    include: { section: true }
  });

  if (!article) return <div className="py-20 text-center">Статья не найдена</div>;

  const options: HTMLReactParserOptions = {
    replace: (node) => {
      if (!(node instanceof Element)) return;

      // 1. Оживляем КАРУСЕЛЬ
      if (node.name === 'div' && node.attribs['data-type'] === 'carousel') {
        try {
          const images = JSON.parse(node.attribs['data-images'] || '[]');
          const interval = node.attribs['interval'] ? parseInt(node.attribs['interval']) : 3000;
          return <CarouselDisplay images={images} interval={interval} />;
        } catch {
          return null;
        }
      }

      // 2. Оживляем ВИДЕО
      if (node.name === 'video') {
        return <VideoDisplay src={node.attribs.src} />;
      }

      // 3. Оживляем АУДИО
      if (node.name === 'audio') {
        return <AudioDisplay src={node.attribs.src} />;
      }

      // 4. Оживляем PDF (ищем контейнер или iframe с типом)
      if (node.attribs['data-type'] === 'pdf' || node.attribs.class?.includes('media-wrapper')) {
        // Ищем iframe внутри
        const iframe = node.children.find(
          (child) => child instanceof Element && child.name === 'iframe'
        ) as Element;

        const rawSrc = iframe?.attribs.src || node.attribs.src;

        if (rawSrc) {
          const cleanSrc = rawSrc.split('#')[0];
          return <PdfDisplay src={cleanSrc} />;
        }
      }
    }
  };

  const parsedContent = parse(article.contentHtml, options);

  return (
    <article className="pb-20">
      {/* Заголовок */}
      <header className="max-w-4xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
            {article.section?.name || 'Общее'}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 text-center leading-tight tracking-tight text-slate-900">
          {article.title}
        </h1>
      </header>

      {/* Главное изображение */}
      {article.imageUrl && (
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="relative w-full h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
          prose-headings:font-black prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-slate-600
          prose-img:rounded-3xl prose-img:shadow-lg">
          {parsedContent}
        </div>
      </div>
    </article>
  );
}