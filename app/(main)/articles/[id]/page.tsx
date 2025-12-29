// app/(main)/articles/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { Sparkles, TagIcon } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import ArticleHero from '../components/ArticleHero';
import ArticleActions from '../components/ArticleActions';
import ArticleCard from '@/components/ArticleCard';
import ArticleContent from '@/app/(main)/articles/components/ArticleContent';
import { IArticle } from '@/interfaces/IArticle';
import { Metadata } from 'next';
import ViewCounter from '../components/ViewCounter';

// Кэшируем "тяжелые" данные статьи на 1 час
const getCachedArticle = (id: number) => unstable_cache(
  async () => {
    return await prisma.article.findUnique({
      where: { id },
      include: {
        section: true,
        author: true,
        tags: true,
        places: true,
        subjects: true,
      }
    });
  },
  [`article-${id}`],
  {
    revalidate: 3600,
    tags: ['articles', `article-${id}`]
  }
)();

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getCachedArticle(Number(id));
  if (!article) return { title: 'Статья не найдена' };

  return {
    title: `${article.title} | ГММ`,
    description: article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 160),
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) notFound();

  // 1. Получаем данные статьи (из кэша)
  const article = await getCachedArticle(articleId);
  if (!article) notFound();

  // 2. Получаем динамические данные (всегда свежие)
  // Мы запрашиваем только счетчики и комментарии
  const [dynamicData, popularArticles] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      select: { views: true, likes: true, comments: { orderBy: { createdAt: 'desc' } } }
    }),
    prisma.article.findMany({
      where: { sectionId: article.sectionId, id: { not: articleId } },
      take: 3,
      orderBy: { views: 'desc' },
      include: { section: true, author: true }
    })
  ]);

  return (
    <article className="min-h-screen bg-white">
      {/* Компонент, который вызовет incrementViewsAction на клиенте */}
      <ViewCounter articleId={articleId} />

      <ArticleHero article={{ ...article, views: dynamicData?.views || 0 } as unknown as IArticle} />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-img:rounded-[2.5rem] prose-img:shadow-2xl">
          <ArticleContent html={article.contentHtml} />
        </div>

        <div className="mt-16">
          <ArticleActions
            articleId={article.id}
            initialLikes={dynamicData?.likes || 0}
            title={article.title}
          />
        </div>

        {article?.tags?.length > 0 && (
          <>
            <div className="mb-16">
              <div className="flex flex-wrap gap-3">
                {article.tags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold border border-slate-100"
                  >
                    <TagIcon size={14} className="text-amber-500" />
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 mb-16" />
          </>
        )}

        {/* Секция похожих статей */}
        {popularArticles.length > 0 && (
          <section className="mt-24 mb-24">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600">
                <Sparkles size={24} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Вам можа спадабацца</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {popularArticles.map((pop) => (
                <ArticleCard key={pop.id} article={pop as unknown as IArticle} />
              ))}
            </div>
          </section>
        )}

        <div className="bg-slate-50 rounded-[4rem] p-8 md:p-16 border border-slate-100">
          <CommentSection
            articleId={articleId}
            initialComments={JSON.parse(JSON.stringify(dynamicData?.comments || []))}
          />
        </div>
      </div>
    </article>
  );
}