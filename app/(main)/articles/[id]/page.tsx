import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { Element, HTMLReactParserOptions } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';
import { AudioDisplay, PdfDisplay, VideoDisplay } from '@/components/rich-text-editor/MediaDisplay';
import { Eye, Calendar, User as UserIcon, Tag as TagIcon } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import { notFound } from 'next/navigation';

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articleId = Number(id);

  // Используем findUnique и update отдельно или findUnique с инкрементом, если ваша БД поддерживает
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
    include: {
      section: true,
      author: true,
      tags: true,
      comments: { orderBy: { createdAt: 'desc' } }
    }
  }).catch(() => null);

  if (!article) notFound();

  const options: HTMLReactParserOptions = {
    replace: (node) => {
      if (!(node instanceof Element)) return;

      // Карусель
      if (node.name === 'div' && node.attribs['data-type'] === 'carousel') {
        try {
          const images = JSON.parse(node.attribs['data-images'] || '[]');
          const interval = node.attribs['interval'] ? parseInt(node.attribs['interval']) : 3000;
          return <CarouselDisplay images={images} interval={interval} />;
        } catch { return null; }
      }

      // Видео и Аудио
      if (node.name === 'video') return <VideoDisplay src={node.attribs.src} />;
      if (node.name === 'audio') return <AudioDisplay src={node.attribs.src} />;

      // PDF
      if (node.attribs['data-type'] === 'pdf' || node.attribs.class?.includes('media-wrapper')) {
        const iframe = node.children.find(child => child instanceof Element && child.name === 'iframe') as Element;
        const rawSrc = iframe?.attribs.src || node.attribs.src;
        if (rawSrc) return <PdfDisplay src={rawSrc.split('#')[0]} />;
      }
    }
  };

  return (
    <article className="min-h-screen bg-white">
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-end bg-slate-900">
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover opacity-80"
          />
        )}

        {/* Градиент для улучшения читаемости снизу */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 pb-12 w-full">
          <div className="flex flex-col items-start gap-4">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              {article.section?.name || 'Общее'}
            </span>

            {/* Заголовок с "обводкой" через фильтр drop-shadow */}
            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] 
                           filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-white/90 text-sm font-bold
                            filter drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              {article.author && (
                <div className="flex items-center gap-2">
                  <UserIcon size={18} className="text-blue-400" />
                  <span>{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg">
                <Eye size={18} />
                <span>{article.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
                        prose-headings:font-black prose-headings:text-slate-900
                        prose-a:text-blue-600 prose-img:rounded-3xl prose-img:shadow-xl">
          {parse(article.contentHtml, options)}
        </div>

        {/* Подвал статьи: Теги */}
        <footer className="mt-16 pt-8 border-t border-slate-100 mb-16">
          <div className="flex flex-wrap gap-3">
            {article.tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 
                                          text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold transition-colors border border-slate-100">
                <TagIcon size={14} className="text-blue-500" />
                {tag.name}
              </div>
            ))}
          </div>
        </footer>

        {/* Секция комментариев */}
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 shadow-inner">
          <CommentSection articleId={articleId} initialComments={article.comments} />
        </div>
      </div>
    </article>
  );
}