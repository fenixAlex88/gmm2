'use client';

import { IArticle } from '@/interfaces/IArticle';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/admin/articles');

        if (!res.ok) {
          throw new Error(`Ошибка HTTP: ${res.status}`);
        }

        const data: IArticle[] = await res.json();
        setArticles(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки статей:', err);
        setError('Не удалось загрузить статьи. Проверьте подключение к серверу.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (isLoading) {
    return <div className="p-4">Загрузка статей...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Link key={article.id} href={`/articles/${article.id}`} passHref>
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
