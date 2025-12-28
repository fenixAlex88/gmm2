'use client';
import { useState, useEffect, useCallback } from 'react';
import { IArticle } from '@/interfaces/IArticle';
import ArticleCard from '@/components/ArticleCard';
import FilterSection, { FilterState, SelectOption } from './components/FilterSection';
import SortSelect from './components/SortSelect';
import SearchBar from './components/SearchBar';

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const t = setTimeout(fetchArticles, 1000);
    return () => clearTimeout(t);
  }, [fetchArticles]);

  return (
    <main className="max-w-[1400px] mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchBar value={search} onChange={setSearch} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <FilterSection
        sections={sections}
        options={options}
        filters={filters}
        updateFilter={updateFilter}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          [...Array(8)].map((_, i) => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2rem]" />)
        ) : (
          articles.map(a => <ArticleCard key={a.id} article={a} />)
        )}
      </div>
    </main>
  );
}