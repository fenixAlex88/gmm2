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
  { revalidate: 3600, tags: ['articles', `article-${id}`] }
)();

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getCachedArticle(Number(id));
  if (!article) return { title: 'Старонка не знойдзена' };

  const baseUrl = 'https://gmm.by';
  return {
    title: `${article.title}`,
    description: article.description || article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.description || '',
      images: [article.imageUrl || '/og-image.png'],
      type: 'article',
      authors: [article.author?.name || 'ГММ'],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) notFound();

  const cachedArticle = await getCachedArticle(articleId);
  if (!cachedArticle) notFound();

  const [dynamicData, popularArticlesData] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      select: {
        views: true,
        _count: { select: { likesRel: true } },
        comments: { orderBy: { createdAt: 'desc' } }
      }
    }),
    prisma.article.findMany({
      where: { sectionId: cachedArticle.sectionId, id: { not: articleId } },
      take: 3,
      orderBy: { views: 'desc' },
      include: { section: true, author: true, likesRel: true }
    })
  ]);

  if (!dynamicData) notFound();

  const article = {
    ...JSON.parse(JSON.stringify(cachedArticle)),
    views: dynamicData.views,
    likes: dynamicData._count.likesRel
  };

  const popularArticles: IArticle[] = popularArticlesData.map(art => ({
    ...JSON.parse(JSON.stringify(art)),
    likes: art.likesRel.length
  }));

  // JSON-LD для Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.imageUrl,
    "datePublished": article.createdAt,
    "author": { "@type": "Person", "name": article.author?.name || "ГММ" },
    "description": article.description
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen bg-white" itemScope itemType="https://schema.org/Article">
        <ViewCounter articleId={articleId} />

        <ArticleHero article={article} />

        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Асноўны кантэнт */}
          <section className="prose prose-slate prose-lg md:prose-xl max-w-none prose-img:rounded-[2.5rem] prose-img:shadow-2xl" itemProp="articleBody">
            <ArticleContent html={article.contentHtml} />
          </section>

          {/* Сацыяльныя дзеянні */}
          <section aria-label="Узаемадзеянне з артыкулам" className="mt-16">
            <ArticleActions
              articleId={articleId}
              initialLikes={article.likes || 0}
              title={article.title}
            />
          </section>

          {/* Тэгі */}
          {cachedArticle.tags && cachedArticle.tags.length > 0 && (
            <nav aria-label="Тэгі артыкула" className="mb-16">
              <div className="flex flex-wrap gap-3">
                {cachedArticle.tags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold border border-slate-100">
                    <TagIcon size={14} className="text-amber-500" aria-hidden="true" />
                    {tag.name}
                  </div>
                ))}
              </div>
              <hr className="border-slate-100 mt-16" aria-hidden="true" />
            </nav>
          )}

          {/* Падобныя матэрыялы */}
          {popularArticles.length > 0 && (
            <section className="mt-24 mb-24" aria-labelledby="similar-articles-title">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600" aria-hidden="true">
                  <Sparkles size={24} />
                </div>
                <h3 id="similar-articles-title" className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                  Вам можа спадабацца
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {popularArticles.map((pop) => (
                  <ArticleCard key={pop.id} article={pop} />
                ))}
              </div>
            </section>
          )}

          {/* Каментарыі */}
          <section id="comments" aria-label="Каментарыі" className="bg-slate-50 rounded-[4rem] p-8 md:p-16 border border-slate-100">
            <CommentSection
              articleId={articleId}
              initialComments={JSON.parse(JSON.stringify(dynamicData.comments))}
            />
          </section>
        </div>
      </article>
    </>
  );
}