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
        subjects: true
      }
    }),
    prisma.section.findMany({ select: { id: true, name: true } }),
    prisma.author.findMany({ select: { name: true } }),
    prisma.place.findMany({ select: { name: true } }),
    prisma.subject.findMany({ select: { name: true } }),
    prisma.tag.findMany({ select: { name: true } }),
  ]);

  const initialArticles = JSON.parse(JSON.stringify(initialArticlesData)) as IArticle[];

  const options = {
    authors: authors.map(a => ({ label: a.name, value: a.name })),
    places: places.map(p => ({ label: p.name, value: p.name })),
    subjects: subjects.map(s => ({ label: s.name, value: s.name })),
    tags: tags.map(t => ({ label: t.name, value: t.name })),
  };

  return (
    <HomeClient
      initialArticles={initialArticles}
      sections={sections}
      options={options}
    />
  );
}