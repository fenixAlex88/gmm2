'use client';

import { IArticle } from '@/interfaces/IArticle';
import { useState, useEffect, useMemo } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { ChevronLeft, ChevronRight, Filter, SortAsc, Hash } from 'lucide-react';

type Section = { id: number; name: string };
type SortOption = 'newest' | 'oldest' | 'popular';

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Состояния фильтрации и сортировки
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

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

  // 1. Вычисляем список тегов в зависимости от состояния "Развернуто/Свернуто"
  const displayedTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    articles.forEach(art => {
      art.tags?.forEach(t => {
        tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
      });
    });

    const allTagsArray = Object.keys(tagCounts);

    if (!isTagsExpanded) {
      // Возвращаем ТОП-8 по популярности (количеству упоминаний)
      return allTagsArray
        .sort((a, b) => tagCounts[b] - tagCounts[a])
        .slice(0, 8);
    } else {
      // Возвращаем все теги, отсортированные по алфавиту
      return allTagsArray.sort();
    }
  }, [articles, isTagsExpanded]);

  // Хелпер для получения общего кол-ва уникальных тегов
  const totalTagsCount = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach(art => art.tags?.forEach(t => tags.add(t.name)));
    return tags.size;
  }, [articles]);

  // Функция для переключения тега в массиве
  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  // КОМБИНИРОВАННАЯ ЛОГИКА: Фильтрация + Сортировка
  const processedArticles = useMemo(() => {
      let result = [...articles];

      // 1. Фильтрация по разделам
      if (selectedSectionId !== null) {
        result = result.filter(art => art.section.id === selectedSectionId);
      }

      // 2. Фильтрация по тегам
      if (selectedTags.length > 0) {
        result = result.filter(art =>
          art.tags?.some(t => selectedTags.includes(t.name))
        );
      }

      // 3. Сортировка (Исправленная версия)
      result.sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.views || 0) - (a.views || 0);
        }

        // Преобразуем в timestamp, гарантируя, что NaN превратится в 0
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

        // Если даты одинаковые, можно добавить вторичную сортировку по ID для стабильности
        if (timeA === timeB) {
          return b.id - a.id;
        }

        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });

      return result;
    }, [articles, selectedSectionId, selectedTags, sortBy]);

  // Сброс страницы при любом изменении фильтров
  useEffect(() => { setCurrentPage(1); }, [selectedSectionId, selectedTags, sortBy]);

  // Пагинация
  const totalPages = Math.ceil(processedArticles.length / itemsPerPage);
  const displayedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedArticles.slice(start, start + itemsPerPage);
  }, [processedArticles, currentPage]);

  if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold">Загрузка...</div>;

  return (
    <main className="max-w-[1400px] mx-auto p-4">
      <header className="mb-6 lg:mb-10 space-y-4 lg:space-y-6">

        {/* Верхняя панель: Категории и Сортировка */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

          {/* Категории */}
          <div className="space-y-2 flex-grow">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Filter size={12} /> Категории
            </div>
            {/* Горизонтальный скролл для мобилок, обычный флекс для десктопа */}
            <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 no-scrollbar">
              <button
                onClick={() => setSelectedSectionId(null)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedSectionId === null
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >Все</button>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSectionId(s.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedSectionId === s.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                >{s.name}</button>
              ))}
            </div>
          </div>

          {/* Сортировка */}
          <div className="space-y-2 sm:min-w-[180px]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <SortAsc size={12} /> Сортировка
            </div>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer w-full"
              >
                <option value="newest">Новые</option>
                <option value="popular">Популярные</option>
                <option value="oldest">Старые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Компактный блок тегов */}
        {totalTagsCount > 0 && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Hash size={12} /> {isTagsExpanded ? 'Все теги' : 'Популярные'}
                {selectedTags.length > 0 && <span className="text-blue-600 font-black">({selectedTags.length})</span>}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] font-black text-red-500 uppercase hover:text-red-600 transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 transition-all">
              {displayedTags.map(tag => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${isActive
                        ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-sm scale-105'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    #{tag}
                  </button>
                );
              })}

              {totalTagsCount > 8 && (
                <button
                  onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                  className="px-3 py-1 rounded-lg text-[11px] font-black text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {isTagsExpanded ? '− Меньше' : `+ Еще ${totalTagsCount - displayedTags.length}`}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* СЕТКА СТАТЕЙ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-stretch">
        {displayedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* ПАГИНАЦИЯ */}
      {totalPages > 1 && (
        <div className="mt-20 flex items-center justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          ><ChevronLeft size={20} /></button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-900'
                  }`}
              >{i + 1}</button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          ><ChevronRight size={20} /></button>
        </div>
      )}

      {/* ПУСТОЕ СОСТОЯНИЕ */}
      {processedArticles.length === 0 && (
        <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 mt-10">
          <p className="text-slate-400 font-bold text-lg">Ничего не найдено по вашим фильтрам</p>
          <button
            onClick={() => { setSelectedSectionId(null); setSelectedTags([]); }}
            className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
          >Сбросить всё</button>
        </div>
      )}
    </main>
  );
}