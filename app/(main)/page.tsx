'use client';

import { IArticle } from '@/interfaces/IArticle';
import { useState, useEffect, useMemo } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Section = { id: number; name: string };

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояние пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, secRes] = await Promise.all([
          fetch('/api/admin/articles'),
          fetch('/api/admin/sections')
        ]);
        if (artRes.ok && secRes.ok) {
          setArticles(await artRes.json());
          setSections(await secRes.json());
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  // 1. Сначала фильтруем
  const filteredArticles = useMemo(() => {
    return selectedSectionId === null
      ? articles
      : articles.filter(art => art.section.id === selectedSectionId);
  }, [articles, selectedSectionId]);

  // Сбрасываем страницу при смене фильтра
  useEffect(() => { setCurrentPage(1); }, [selectedSectionId]);

  // 2. Затем пагинируем
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const displayedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage]);

  if (isLoading) return <div className="p-10 text-center text-slate-400">Загрузка...</div>;

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Журнал</h1>
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setSelectedSectionId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSectionId === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
              }`}
          >Все</button>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSectionId(s.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSectionId === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >{s.name}</button>
          ))}
        </div>
      </header>

      {/* СЕТКА: 4 колонки на больших экранах (lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
        {displayedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* ПАГИНАЦИЯ */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === i + 1
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-medium">В этом разделе пока пусто.</div>
      )}
    </main>
  );
}