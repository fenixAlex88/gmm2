import { prisma } from '@/lib/prisma';
import parse from 'html-react-parser';
import { notFound } from 'next/navigation';
import { Tag as TagIcon, Sparkles } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import ArticleHero from '../components/ArticleHero';
import ArticleActions from '../components/ArticleActions';
import ArticleCard from '@/components/ArticleCard';
import { getParserOptions } from '@/lib/parserOptions';
import { IArticle } from '@/interfaces/IArticle';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);

  // 1. Атрымліваем бягучы артыкул
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
    include: {
      section: true,
      author: true,
      tags: true,
      places: true,
      subjects: true,
      comments: { orderBy: { createdAt: 'desc' } }
    }
  }).catch(() => null);

  if (!article) notFound();

  const popularArticles = await prisma.article.findMany({
    where: {
      sectionId: article.sectionId,
      id: { not: articleId },
    },
    take: 3,
    orderBy: {
      views: 'desc',
    },
    include: {
      section: true,
    }
  });

  return (
    <article className="min-h-screen bg-white">
      <ArticleHero article={article} />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Змест артыкула */}
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
                        prose-headings:font-black prose-headings:text-slate-900
                        prose-a:text-amber-600 prose-img:rounded-3xl prose-img:shadow-xl">
          {parse(article.contentHtml, getParserOptions())}
        </div>

        {/* Дзеянні (лайкі, шэрынг) */}
        <ArticleActions
          articleId={article.id}
          initialLikes={article.likes || 0}
          title={article.title}
        />

        {/* Тэгі */}
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

        {/* БЛОК: Папулярнае ў раздзеле */}
        {popularArticles.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Sparkles size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Папулярнае ў раздзеле &quot;{article.section?.name}&quot;
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

        {/* Каментары */}
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 shadow-inner">
          <CommentSection articleId={articleId} initialComments={article.comments} />
        </div>
      </div>
    </article>
  );
}