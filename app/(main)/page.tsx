import { prisma } from "@/lib/prisma";
import HomeClient from './HomeClient';
import { IArticle } from "@/interfaces/IArticle";

// Функцыя для фарматавання кожнага артыкула на серверы
const formatArticleForClient = (art: any) => {
  const dateObj = new Date(art.createdAt);
  return {
    ...JSON.parse(JSON.stringify(art)),
    // Гатовы радок для адлюстравання (беларуская лакаль)
    displayDate: dateObj.toLocaleDateString('be-BY', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }),
    // Стандартны ISO фармат для атрабута dateTime
    isoDate: dateObj.toISOString(),
    // Падлік лайкаў
    likes: art.likesRel ? art.likesRel.length : 0
  };
};

export default async function HomePage() {
  const [initialArticlesData, sections, authors, places, subjects, tags] = await Promise.all([
    prisma.article.findMany({
      take: 16,
      orderBy: [
        { priority: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' }
      ],
      include: {
        section: true,
        author: true,
        tags: true,
        places: true,
        likesRel: true
      }
    }),
    prisma.section.findMany({ select: { id: true, name: true } }),
    prisma.author.findMany({ select: { name: true } }),
    prisma.place.findMany({ select: { name: true } }),
    prisma.subject.findMany({ select: { name: true } }),
    prisma.tag.findMany({ select: { name: true } }),
  ]);

  // Фарматуем артыкулы на серверы
  const initialArticles: IArticle[] = initialArticlesData.map(art => formatArticleForClient(art));

  // 2. Стварэнне JSON-LD для SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Артыкулы ГММ — Сэнсавы турызм",
    "description": "Спіс артыкулаў пра геніяў месца, гісторыю і культуру Беларусі",
    "itemListElement": initialArticles.map((art, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "url": `https://gmm.by/articles/${art.id}`,
        "headline": art.title,
        "image": art.imageUrl || "https://gmm.by/images/noImage.jpg",
        "datePublished": art.isoDate, // Выкарыстоўваем стабільны ISO фармат
        "author": {
          "@type": "Person",
          "name": art.author?.name || "ГММ"
        }
      }
    }))
  };

  const options = {
    authors: authors.map(a => ({ label: a.name, value: a.name })),
    places: places.map(p => ({ label: p.name, value: p.name })),
    subjects: subjects.map(s => ({ label: s.name, value: s.name })),
    tags: tags.map(t => ({ label: t.name, value: t.name })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeClient
        initialArticles={initialArticles}
        sections={sections}
        options={options}
      />
    </>
  );
}