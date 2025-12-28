import { prisma } from '@/lib/prisma';
import parse from 'html-react-parser';
import { notFound } from 'next/navigation';
import { Tag as TagIcon } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import ArticleHero from '../components/ArticleHero';
import ArticleActions from '../components/ArticleActions';
import { getParserOptions } from '@/lib/parserOptions';


export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);

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

  return (
    <article className="min-h-screen bg-white">
      <ArticleHero article={article} />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
                        prose-headings:font-black prose-headings:text-slate-900
                        prose-a:text-amber-600 prose-img:rounded-3xl prose-img:shadow-xl">
          {parse(article.contentHtml, getParserOptions())}
        </div>

        {/* Секция действий и тегов */}
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

        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 shadow-inner">
          <CommentSection articleId={articleId} initialComments={article.comments} />
        </div>
      </div>
    </article>
  );
}