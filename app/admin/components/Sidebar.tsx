'use client';

import { useState } from 'react';
import { Database, Plus, Trash2, X, Heart, Search, Star } from 'lucide-react';

interface SidebarProps {
	articles: any[];
	metadata: any;
	onSelect: (article: any) => void;
	selectedId?: number;
	onRefresh: () => void;
	refreshMetadata: () => void;
}

export default function Sidebar({
	articles,
	metadata,
	onSelect,
	selectedId,
	onRefresh,
	refreshMetadata
}: SidebarProps) {
	const [activeTab, setActiveTab] = useState<'articles' | 'database'>('articles');
	const [searchQuery, setSearchQuery] = useState('');

	const filteredArticles = articles
		.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a: any, b: any) => {
			if (a.priority !== null && b.priority !== null) return a.priority - b.priority;
			if (a.priority !== null) return -1;
			if (b.priority !== null) return 1;
			return b.id - a.id;
		});

	const handleFullCleanup = async () => {
		if (!confirm('Гэта выдаліць з сервера ЎСЕ файлы, якія не выкарыстоўваюцца. Працягнуць?')) return;
		try {
			const res = await fetch('/api/admin/cleanup', { method: 'POST' });
			const data = await res.json();
			alert(data.message || (data.success ? 'Ачыстка паспяховая' : 'Памылка'));
		} catch (err) {
			alert('Памылка пры злучэнні з серверам');
		}
	};

	const handleDeleteArticle = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm('Выдаліць артыкул?')) return;
		const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
		if (res.ok) onRefresh();
	};

	const handleDeleteMetadata = async (type: string, id: number) => {
		if (!confirm(`Выдаліць гэты элемент з ${type}?`)) return;
		try {
			const res = await fetch('/api/admin/metadata', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, id })
			});
			if (res.ok) refreshMetadata();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<aside className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-xl z-10 h-full">
			<div className="p-4 border-b bg-slate-50/50 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
						<Database size={18} className="text-amber-600" /> Панэль
					</h2>
					<button
						onClick={() => { onSelect(null); setSearchQuery(''); }}
						className="p-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-700 transition-all"
					>
						<Plus size={20} />
					</button>
				</div>

				<div className="relative group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600" size={16} />
					<input
						type="text"
						placeholder="Шукаць..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
					/>
				</div>

				<div className="flex p-1 bg-slate-200/50 rounded-xl">
					<button onClick={() => setActiveTab('articles')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeTab === 'articles' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}>АРТЫКУЛЫ</button>
					<button onClick={() => setActiveTab('database')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}>БАЗА</button>
				</div>
			</div>

			<div className="flex-grow overflow-y-auto">
				{activeTab === 'articles' ? (
					<div className="flex flex-col">
						{filteredArticles.map((a: any) => (
							<div
								key={a.id}
								onClick={() => onSelect(a)}
								className={`group p-4 border-b cursor-pointer transition-all 
                                    ${a.priority ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-slate-50'} 
                                    ${selectedId === a.id ? 'bg-amber-100/50 border-l-4 border-l-amber-600' : 'border-l-4 border-l-transparent'}`}
							>
								<div className="flex justify-between items-start gap-2">
									<div className="space-y-1">
										{a.priority && (
											<span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-widest">
												<Star size={10} fill="currentColor" /> ТОП-{a.priority}
											</span>
										)}
										<h3 className="text-sm font-bold line-clamp-2 leading-tight text-slate-700 group-hover:text-slate-900">
											{a.title}
										</h3>
									</div>
									<button
										onClick={(e) => handleDeleteArticle(a.id, e)}
										className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
									>
										<Trash2 size={14} />
									</button>
								</div>
								<div className="flex gap-2 mt-2">
									<span className="text-[9px] px-2 py-0.5 bg-white/50 border border-slate-200 text-slate-500 rounded-full font-bold uppercase">
										{a.section?.name || 'Без раздзела'}
									</span>
									<span className="text-[9px] px-2 py-0.5 bg-white/50 border border-amber-200 text-amber-600 rounded-full font-bold flex items-center gap-1">
										<Heart size={8} fill="currentColor" /> {a.likes || 0}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-4 space-y-8">
						{Object.entries(metadata).map(([key, items]: [string, any]) => (
							<section key={key} className="space-y-3">
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block border-b pb-1">
									{key}
								</label>
								<div className="flex flex-wrap gap-2">
									{items.map((item: any) => (
										<div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
											{item.name}
											<button
												onClick={() => handleDeleteMetadata(key, item.id)}
												className="text-slate-300 hover:text-red-500"
											>
												<X size={12} />
											</button>
										</div>
									))}
								</div>
							</section>
						))}
						<div className="pt-6 border-t border-slate-100">
							<button onClick={handleFullCleanup} className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2">
								<Trash2 size={14} /> Ачысціць файлы
							</button>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}