'use client';

import { useState } from 'react';
import { Database, Plus, Trash2, X, Heart, Search, Star } from 'lucide-react';

export default function Sidebar({ articles, metadata, onSelect, selectedId, onRefresh }: any) {
	const [activeTab, setActiveTab] = useState<'articles' | 'database'>('articles');
	const [searchQuery, setSearchQuery] = useState('');

	// Фільтрацыя і сартаванне: спачатку тыя, у каго ёсць priority (ад 1 да 16), потым астатнія па ID
	const filteredArticles = articles
		.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a: any, b: any) => {
			// Калі ў абодвух ёсць прыярытэт — сартуем па нумары (1, 2, 3...)
			if (a.priority !== null && b.priority !== null) return a.priority - b.priority;
			// Калі прыярытэт толькі ў аднаго — ён ідзе вышэй
			if (a.priority !== null) return -1;
			if (b.priority !== null) return 1;
			// Калі прыярытэтаў няма — сартуем па ID (новыя вышэй)
			return b.id - a.id;
		});

	// Функцыя ачысткі файлаў на серверы
	const handleFullCleanup = async () => {
		if (!confirm('Гэта выдаліць з сервера ЎСЕ файлы, якія не выкарыстоўваюцца ў артыкулах. Працягнуць?')) return;
		try {
			const res = await fetch('/api/admin/cleanup', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				alert(data.message);
			} else {
				alert('Памылка: ' + (data.error || 'невядомая памылка'));
			}
		} catch (err) {
			alert('Памылка пры злучэнні з серверам');
		}
	};

	// Выдаленне артыкула
	const handleDeleteArticle = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm('Выдаліць артыкул?')) return;
		const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
		if (res.ok) onRefresh();
	};

	// Выдаленне метададзеных
	const handleDeleteMetadata = async (type: string, id: number) => {
		if (!confirm('Выдаліць элемент?')) return;
		const res = await fetch('/api/admin/metadata', {
			method: 'DELETE',
			body: JSON.stringify({ type, id })
		});
		if (res.ok) onRefresh();
	};

	return (
		<aside className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-xl z-10 h-full">
			{/* ВЕРХНЯЯ ЧАСТКА */}
			<div className="p-4 border-b bg-slate-50/50 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
						<Database size={18} className="text-amber-600" /> Панэль
					</h2>
					<button
						onClick={() => { onSelect(null); setSearchQuery(''); }}
						className="p-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-700 transition-all"
						title="Стварыць новы"
					>
						<Plus size={20} />
					</button>
				</div>

				<div className="relative group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={16} />
					<input
						type="text"
						placeholder="Шукаць па назве..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm"
					/>
					{searchQuery && (
						<button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-md transition-colors">
							<X size={14} />
						</button>
					)}
				</div>

				<div className="flex p-1 bg-slate-200/50 rounded-xl">
					<button onClick={() => setActiveTab('articles')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeTab === 'articles' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>АРТЫКУЛЫ</button>
					<button onClick={() => setActiveTab('database')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>БАЗА</button>
				</div>
			</div>

			{/* СПІСЫ */}
			<div className="flex-grow overflow-y-auto custom-scrollbar">
				{activeTab === 'articles' ? (
					<div className="flex flex-col">
						{filteredArticles.length > 0 ? (
							filteredArticles.map((a: any) => (
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
											<h3 className={`text-sm font-bold line-clamp-2 leading-tight transition-colors ${a.priority ? 'text-amber-900' : 'text-slate-700'} group-hover:text-slate-900`}>
												{a.title}
											</h3>
										</div>
										<button
											onClick={(e) => handleDeleteArticle(a.id, e)}
											className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
										>
											<Trash2 size={14} />
										</button>
									</div>
									<div className="flex gap-2 mt-2">
										<span className="text-[9px] px-2 py-0.5 bg-white/50 border border-slate-200 text-slate-500 rounded-full font-bold uppercase tracking-wider">
											{a.section?.name || 'Без раздзела'}
										</span>
										<span className="text-[9px] px-2 py-0.5 bg-white/50 border border-amber-200 text-amber-600 rounded-full font-bold flex items-center gap-1">
											<Heart size={8} fill="currentColor" /> {a.likes || 0}
										</span>
									</div>
								</div>
							))
						) : (
							<div className="p-10 text-center space-y-2">
								<Search size={24} className="mx-auto text-slate-200" />
								<p className="text-xs font-bold text-slate-400 italic">Нічога не знойдзена</p>
							</div>
						)}
					</div>
				) : (
					/* БАЗА ДАДЗЕНЫХ */
					<div className="p-4 space-y-8">
						{Object.entries(metadata).map(([key, items]: [string, any]) => (
							<section key={key} className="space-y-3">
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block border-b pb-1">
									{key}
								</label>
								<div className="flex flex-wrap gap-2">
									{items.length > 0 ? (
										items.map((item: any) => (
											<div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-amber-300 transition-colors shadow-sm">
												{item.name}
												<button onClick={() => handleDeleteMetadata(key.slice(0, -1), item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
													<X size={12} />
												</button>
											</div>
										))
									) : (
										<p className="text-[10px] text-slate-300 italic">Спіс пусты</p>
									)}
								</div>
							</section>
						))}
						<div className="pt-6 border-t border-slate-100 space-y-3">
							<button onClick={handleFullCleanup} className="w-full py-3 px-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg">
								<Trash2 size={14} /> Ачысціць файлы на серверы
							</button>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}