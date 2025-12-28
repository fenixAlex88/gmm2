'use client';
import { useState, useEffect, useCallback } from 'react';
import { IArticle } from '@/interfaces/IArticle';
import ArticleCard from '@/components/ArticleCard';
import FilterSection, { FilterState, SelectOption } from './components/FilterSection';
import SortSelect from './components/SortSelect';
import SearchBar from './components/SearchBar';
import { SlidersHorizontal, Search as SearchIcon, X } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Асобныя станы для бачнасці розных блокаў
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [options, setOptions] = useState<{
    authors: SelectOption[];
    places: SelectOption[];
    subjects: SelectOption[];
    tags: SelectOption[];
  }>({ authors: [], places: [], subjects: [], tags: [] });

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<FilterState>({
    sectionId: null,
    authors: [],
    places: [],
    subjects: [],
    tags: [],
  });

  const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Загрузка метададзеных
  useEffect(() => {
    fetch('/api/sections').then(r => r.json()).then(setSections);
    fetch('/api/metadata').then(r => r.json()).then(data => {
      setOptions({
        authors: data.authors.map((n: string) => ({ label: n, value: n })),
        places: data.places.map((n: string) => ({ label: n, value: n })),
        subjects: data.subjects.map((n: string) => ({ label: n, value: n })),
        tags: data.tags.map((n: string) => ({ label: n, value: n })),
      });
    });
  }, []);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (filters.sectionId) p.append('sectionId', filters.sectionId.toString());
    if (filters.authors.length) p.append('authors', filters.authors.map(o => o.value).join(','));
    if (filters.places.length) p.append('places', filters.places.map(o => o.value).join(','));
    if (filters.subjects.length) p.append('subjects', filters.subjects.map(o => o.value).join(','));
    if (filters.tags.length) p.append('tags', filters.tags.map(o => o.value).join(','));
    p.append('sort', sortBy);

    const res = await fetch(`/api/articles?${p.toString()}`);
    setArticles(await res.json());
    setIsLoading(false);
  }, [search, sortBy, filters]);

  useEffect(() => {
    const t = setTimeout(fetchArticles, 600);
    return () => clearTimeout(t);
  }, [fetchArticles]);

  return (
    <main className="max-w-[1400px] mx-auto p-4 space-y-6">

      {/* Верхні радок: Пошук і Кнопка фільтраў */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Кнопка пошуку (іконка) */}
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={`p-3 rounded-full transition-colors ${isSearchVisible ? 'bg-slate-100 text-[#800000]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {isSearchVisible ? <X size={24} /> : <SearchIcon size={24} />}
          </button>

          {/* Сам радок пошуку (паказваецца побач) */}
          {isSearchVisible && (
            <div className="animate-in slide-in-from-left-2 duration-300 w-full md:w-80">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          {/* Сартаванне заўсёды пад рукой або схавана */}
          <SortSelect value={sortBy} onChange={setSortBy} />

          {/* Кнопка Фільтраў */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border transition-all ${isFiltersOpen
                ? 'bg-[#800000] text-white border-[#800000] shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#800000]'
              }`}
          >
            <SlidersHorizontal size={18} />
            <span className="font-bold text-sm uppercase tracking-tight">Фільтры</span>
            {filters.authors.length + filters.places.length + filters.subjects.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                {filters.authors.length + filters.places.length + filters.subjects.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Выпадаючая панэль дэталёвых фільтраў */}
      {isFiltersOpen && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-xs font-bold uppercase text-slate-400">Налады пошуку</span>
              <button onClick={() => setIsFiltersOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <FilterSection
              sections={sections}
              options={options}
              filters={filters}
              updateFilter={updateFilter}
            />
          </div>
        </div>
      )}

      {/* Сетка артыкулаў */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2rem]" />
          ))
        ) : (
          articles.map(a => <ArticleCard key={a.id} article={a} />)
        )}
      </div>
    </main>
  );
}