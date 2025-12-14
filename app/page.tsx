import { IArticle } from '@/interfaces/IArticle';
import Image from 'next/image';
import Link from 'next/link';

async function getArticles(): Promise<IArticle[]> {
  const res = await fetch(`http://localhost:3000/api/articles`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Ошибка загрузки статей');
  }

  return res.json();
}


export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Link key={article.id} href={`/articles/${article.id}`}>
          <div className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={800}
                height={600}
                className="w-full mb-6 rounded-lg"
              />
            ) : (
              <Image
                src="/images/noImage.jpg"
                alt="Нет изображения"
                width={800}
                height={600}
                className="w-full mb-6 rounded-lg"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-bold">{article.title}</h2>
              {/* если section объект */}
              <p className="text-sm text-gray-600">
                {typeof article.section === 'string'
                  ? article.section
                  : article.section?.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
