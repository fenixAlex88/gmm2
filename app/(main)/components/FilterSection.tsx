'use client';
import { useState, useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';
import { Filter, User, MapPin, BookOpen, Hash, LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectOption {
	readonly label: string;
	readonly value: string;
}

export interface FilterState {
	sectionId: number | null;
	authors: readonly SelectOption[];
	places: readonly SelectOption[];
	subjects: readonly SelectOption[];
	tags: readonly SelectOption[]; // Мультивыбор тегов сохраняется здесь
}

interface FilterOptions {
	authors: SelectOption[];
	places: SelectOption[];
	subjects: SelectOption[];
	tags: SelectOption[];
}

interface Props {
	sections: { id: number; name: string }[];
	options: FilterOptions;
	filters: FilterState;
	updateFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
}

export default function FilterSection({ sections, options, filters, updateFilter }: Props) {
	const [isTagsExpanded, setIsTagsExpanded] = useState(false);

	const selectStyles = {
		control: (base: object) => ({
			...base,
			borderRadius: '12px',
			borderColor: '#e2e8f0',
			fontSize: '13px',
			boxShadow: 'none',
			minHeight: '38px',
			'&:hover': { borderColor: '#cbd5e1' }
		})
	};

	// Логика переключения тега (мультивыбор)
	const toggleTag = (tagOption: SelectOption) => {
		const isSelected = filters.tags.some(t => t.value === tagOption.value);
		const newTags = isSelected
			? filters.tags.filter(t => t.value !== tagOption.value)
			: [...filters.tags, tagOption];
		updateFilter('tags', newTags);
	};

	// Подготовка списков тегов
	const displayedTags = useMemo(() => {
		if (isTagsExpanded) return options.tags;
		return options.tags.slice(0, 8);
	}, [options.tags, isTagsExpanded]);

	const handleChange = (key: keyof FilterState) => (
		newValue: MultiValue<SelectOption>
	) => {
		updateFilter(key, newValue);
	};

	return (
		<div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
			{/* Основные фильтры в одну строку */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="space-y-1.5">
					<label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
						<Filter size={12} /> Сэнс
					</label>
					<select
						value={filters.sectionId || ''}
						onChange={(e) => updateFilter('sectionId', e.target.value ? Number(e.target.value) : null)}
						className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[12px] outline-none h-[38px] cursor-pointer hover:border-slate-300 transition-colors"
					>
						<option value="">Усе</option>
						{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
					</select>
				</div>

				<FilterItem label="Аўтар" icon={User}>
					<CreatableSelect isMulti options={options.authors} value={filters.authors} instanceId="authors-select"
						onChange={handleChange('authors')} styles={selectStyles} placeholder="Поиск..." />
				</FilterItem>

				<FilterItem label="Месца" icon={MapPin}>
					<CreatableSelect isMulti options={options.places} value={filters.places} instanceId="filters-select"
						onChange={handleChange('places')} styles={selectStyles} placeholder="Поиск..." />
				</FilterItem>

				<FilterItem label="Генiй" icon={BookOpen}>
					<CreatableSelect isMulti options={options.subjects} value={filters.subjects} instanceId="subjects-select"
						onChange={handleChange('subjects')} styles={selectStyles} placeholder="Поиск..." />
				</FilterItem>
			</div>

			{/* Блок тегов как раньше */}
			<div className="pt-4 border-t border-slate-200/60">
				<div className="flex items-center justify-between mb-3">
					<label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
						<Hash size={12} /> Шукаць па тэгах {filters.tags.length > 0 && <span className="text-amber-500">({filters.tags.length})</span>}
					</label>
					{options.tags.length > 8 && (
						<button
							onClick={() => setIsTagsExpanded(!isTagsExpanded)}
							className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase"
						>
							{isTagsExpanded ? <><ChevronUp size={12} /> Згарнуць</> : <><ChevronDown size={12} /> Паказаць усё ({options.tags.length})</>}
						</button>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					{displayedTags.map(tag => {
						const isActive = filters.tags.some(t => t.value === tag.value);
						return (
							<button
								key={tag.value}
								onClick={() => toggleTag(tag)}
								className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isActive
										? 'bg-amber-600 text-white border-amber-600 shadow-sm'
										: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}`}
							>
								#{tag.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function FilterItem({ label, icon: Icon, children }: { label: string, icon: LucideIcon, children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
				<Icon size={12} /> {label}
			</label>
			{children}
		</div>
	);
}