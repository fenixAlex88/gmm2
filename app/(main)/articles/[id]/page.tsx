import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import parse, { Element, HTMLReactParserOptions } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';
import { AudioDisplay, PdfDisplay, VideoDisplay } from '@/components/rich-text-editor/MediaDisplay';
import { Eye, Calendar, User as UserIcon, Tag as TagIcon } from 'lucide-react';
import CommentSection from '@/components/CommentSection';

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articleId = Number(id);

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
    include: {
      section: true,
      author: true, // Включаем автора
      tags: true,   // Включаем теги
      comments: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!article) return <div className="py-20 text-center">Статья не найдена</div>;

  const options: HTMLReactParserOptions = {
    replace: (node) => {
      if (!(node instanceof Element)) return;
      if (node.name === 'div' && node.attribs['data-type'] === 'carousel') {
        try {
          const images = JSON.parse(node.attribs['data-images'] || '[]');
          const interval = node.attribs['interval'] ? parseInt(node.attribs['interval']) : 3000;
          return <CarouselDisplay images={images} interval={interval} />;
        } catch { return null; }
      }
      if (node.name === 'video') return <VideoDisplay src={node.attribs.src} />;
      if (node.name === 'audio') return <AudioDisplay src={node.attribs.src} />;
      if (node.attribs['data-type'] === 'pdf' || node.attribs.class?.includes('media-wrapper')) {
        const iframe = node.children.find(child => child instanceof Element && child.name === 'iframe') as Element;
        const rawSrc = iframe?.attribs.src || node.attribs.src;
        if (rawSrc) return <PdfDisplay src={rawSrc.split('#')[0]} />;
      }
    }
  };

  return (
    <article className="pb-20 bg-white">
      {/* Шапка статьи */}
      <header className="max-w-4xl mx-auto px-4 pt-16 pb-8">
        <div className="flex justify-center mb-6">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {article.section?.name || 'Общее'}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-8 text-center leading-tight text-slate-900">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm font-medium">
          {article.author && (
            <div className="flex items-center gap-2">
              <UserIcon size={16} className="text-blue-500" />
              <span className="text-slate-900 font-bold">{article.author.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Обновлено: {new Date(article.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {article.imageUrl && (
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Image src={article.imageUrl} alt={article.title} fill priority className="object-cover" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4">
        {/* Контент */}
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none mb-16">
          {parse(article.contentHtml, options)}
        </div>

        {/* Теги и Просмотры (Низ статьи) */}
        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 border-t border-b border-slate-100 mb-16">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-sm font-bold">
                <TagIcon size={14} />
                {tag.name}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl">
            <Eye size={18} className="text-slate-400" />
            <span>{article.views.toLocaleString()}</span>
          </div>
        </footer>

        {/* Секция комментариев */}
        <CommentSection articleId={articleId} initialComments={article.comments} />
      </div>
    </article>
  );
}