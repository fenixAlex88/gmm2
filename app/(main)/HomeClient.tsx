'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { IArticle } from '@/interfaces/IArticle';
import ArticleCard from '@/components/ArticleCard';
import FilterSection, { FilterState, SelectOption } from './components/FilterSection';
import SortSelect from './components/SortSelect';
import SearchBar from './components/SearchBar';
import { SlidersHorizontal, Search as SearchIcon, X, Plus } from 'lucide-react';
import { getArticlesAction } from '@/app/actions/articles';
import { SortOption } from '@/interfaces/SortOptions';

interface HomeClientProps {
	initialArticles: IArticle[];
	sections: { id: number; name: string }[];
	options: {
		authors: SelectOption[];
		places: SelectOption[];
		subjects: SelectOption[];
		tags: SelectOption[];
	};
}

export default function HomeClient({ initialArticles, sections, options }: HomeClientProps) {
	const [articles, setArticles] = useState<IArticle[]>(initialArticles);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(initialArticles.length === 16);

	// Выкарыстоўваем для прадухілення дублявання запытаў пры аднолькавых фільтрах
	const lastRequestKey = useRef("");

	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState<SortOption>(SortOption.Default);
	const [filters, setFilters] = useState<FilterState>({
		sectionId: null, authors: [], places: [], subjects: [], tags: [],
	});

	const loadArticles = useCallback(async (isLoadMore = false) => {
		// Калі ўжо грузім — выходзім
		if (isLoading) return;

		setIsLoading(true);
		const skip = isLoadMore ? articles.length : 0;

		try {
			const newArticles = await getArticlesAction({
				skip,
				search,
				sortBy,
				filters
			});

			if (isLoadMore) {
				// Фільтруем дублікаты на ўсялякі выпадак
				setArticles(prev => {
					const existingIds = new Set(prev.map(a => a.id));
					const uniqueNew = newArticles.filter(a => !existingIds.has(a.id));
					return [...prev, ...uniqueNew];
				});
			} else {
				setArticles(newArticles);
			}

			setHasMore(newArticles.length === 16);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, [search, sortBy, filters, articles.length, isLoading]);

	// Адзіны эфект для сінхранізацыі фільтраў (з дэбаўнсам)
	useEffect(() => {
		const currentKey = JSON.stringify({ search, sortBy, filters });

		// Калі гэта пачатковы рэндэр (initialArticles ужо ёсць), не робім паўторны запыт
		if (currentKey === lastRequestKey.current) return;

		const t = setTimeout(() => {
			lastRequestKey.current = currentKey;
			loadArticles(false);
		}, 400);

		return () => clearTimeout(t);
	}, [search, sortBy, filters, loadArticles]);

	const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	return (
		<main className="max-w-[1400px] mx-auto p-4 space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
				<div className="flex items-center space-x-2 w-full md:w-auto">
					<button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-3 rounded-full text-slate-500 hover:bg-slate-50">
						{isSearchVisible ? <X size={24} /> : <SearchIcon size={24} />}
					</button>
					{isSearchVisible && <div className="w-full md:w-80"><SearchBar value={search} onChange={setSearch} /></div>}
				</div>

				<div className="flex items-center space-x-4">
					<SortSelect value={sortBy} onChange={setSortBy} />
					<button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border ${isFiltersOpen ? 'bg-black text-white' : 'bg-white'}`}>
						<SlidersHorizontal size={18} />
						<span className="font-bold text-sm uppercase">Фільтры</span>
					</button>
				</div>
			</div>

			{isFiltersOpen && <FilterSection sections={sections} options={options} filters={filters} updateFilter={updateFilter} />}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				{articles.map(a => <ArticleCard key={a.id} article={a} />)}
				{isLoading && [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />)}
			</div>

			{hasMore && !isLoading && (
				<div className="flex justify-center pt-8">
					<button onClick={() => loadArticles(true)} className="flex items-center space-x-2 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-[#800000] transition-all">
						<Plus size={20} />
						<span className="font-bold uppercase text-sm">Паказаць яшчэ</span>
					</button>
				</div>
			)}
		</main>
	);
}