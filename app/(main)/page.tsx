import { prisma } from "@/lib/prisma";
import HomeClient from './HomeClient';
import { IArticle } from "@/interfaces/IArticle";

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

  const initialArticles: IArticle[] = initialArticlesData.map(art => ({
    ...JSON.parse(JSON.stringify(art)),
    likes: art.likesRel.length
  }));

  // 2. Ствараем JSON-LD для SEO
  // Гэта кажа Google, што на старонцы ёсць спіс артыкулаў
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
        "datePublished": art.createdAt,
        "author": {
          "@type": "Person",
          "name": typeof art.author === 'string' ? art.author : art.author?.name || "ГММ"
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