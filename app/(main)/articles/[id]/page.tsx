import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Tag as TagIcon, Sparkles } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import ArticleHero from '../components/ArticleHero';
import ArticleActions from '../components/ArticleActions';
import ArticleCard from '@/components/ArticleCard';
import { IArticle } from '@/interfaces/IArticle';
import ArticleContent from '@/app/(main)/articles/components/ArticleContent';
import { Prisma } from '@/generated/prisma/client';

// Определяем тип для статьи со всеми включенными связями
type FullArticle = Prisma.ArticleGetPayload<{
  include: {
    section: true;
    author: true;
    tags: true;
    comments: true;
  };
}>;

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);

  if (isNaN(articleId)) notFound();

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
    include: {
      section: true,
      author: true,
      tags: true,
      comments: { orderBy: { createdAt: 'desc' } }
    }
  }).catch(() => null) as FullArticle | null; // Приводим к типу FullArticle

  if (!article) notFound();

  const popularArticles = await prisma.article.findMany({
    where: {
      sectionId: article.sectionId,
      id: { not: articleId },
    },
    take: 3,
    orderBy: { views: 'desc' },
    include: { section: true }
  });

  return (
    <article className="min-h-screen bg-white">
      {/* Теперь передаем объект без any */}
      <ArticleHero article={article} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
                        prose-headings:font-black prose-headings:text-slate-900
                        prose-a:text-amber-600 prose-img:rounded-3xl prose-img:shadow-xl">
          <ArticleContent html={article.contentHtml} />
        </div>

        <ArticleActions
          articleId={article.id}
          initialLikes={article.likes || 0}
          title={article.title}
        />

        <footer className="mb-16">
          <div className="flex flex-wrap gap-3">
            {article.tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold border border-slate-100">
                <TagIcon size={14} className="text-amber-500" />
                {tag.name}
              </div>
            ))}
          </div>
        </footer>

        <hr className="border-slate-100 mb-16" />

        {popularArticles.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Sparkles size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Популярное в разделе &quot;{article.section?.name}&quot;
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularArticles.map((popArticle) => (
                <div key={popArticle.id} className="flex h-full">
                  <ArticleCard article={popArticle as unknown as IArticle} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 shadow-inner">
          {/* Передаем комментарии напрямую */}
          <CommentSection articleId={articleId} initialComments={article.comments} />
        </div>
      </div>
    </article>
  );
}