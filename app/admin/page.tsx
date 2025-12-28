'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import CreatableSelect from 'react-select/creatable';
import { MultiValue, SingleValue } from 'react-select';
import RichTextEditor from '@/components/rich-text-editor';
import { IArticle } from '@/interfaces/IArticle';
import {
	Trash2, Plus, Edit3, Database, Save, RotateCcw, User, Tag,
	MessageSquare, X, ImageIcon, MapPin, Users, Heart
} from 'lucide-react';

// --- Интерфейсы ---
interface BaseItem { id: number; name: string; }
type Section = BaseItem;
type TagItem = BaseItem;
type Author = BaseItem;
type Place = BaseItem;
type Subject = BaseItem;

interface Comment {
	id: number;
	authorName: string;
	content: string;
	createdAt: string;
	articleId: number;
}

interface SelectOption {
	label: string;
	value: string;
}

interface FormState {
	id: number | null;
	title: string;
	contentHtml: string;
	sectionId: number;
	authorName: string;
	tagNames: string[];
	placeNames: string[];   // Новое
	subjectNames: string[]; // Новое
	imageFile: File | null;
	currentImageUrl: string | null;
}

const initialFormState: FormState = {
	id: null, title: '', contentHtml: '', sectionId: 0,
	authorName: '', tagNames: [], placeNames: [], subjectNames: [],
	imageFile: null, currentImageUrl: null,
};

export default function AdminPage() {
	const [articles, setArticles] = useState<IArticle[]>([]);
	const [sections, setSections] = useState<Section[]>([]);

	// Исправлено: инициализация с типами вместо never[]
	const [metadata, setMetadata] = useState<{
		authors: Author[];
		tags: TagItem[];
		places: Place[];
		subjects: Subject[];
	}>({
		authors: [],
		tags: [],
		places: [],
		subjects: []
	});

	const [comments, setComments] = useState<Comment[]>([]);
	const [form, setForm] = useState<FormState>(initialFormState);
	const [activeTab, setActiveTab] = useState<'articles' | 'database'>('articles');
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// --- Загрузка данных ---
	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [artRes, secRes, metaRes] = await Promise.all([
				fetch('/api/admin/articles'),
				fetch('/api/sections'),
				fetch('/api/admin/metadata')
			]);
			if (artRes.ok && secRes.ok && metaRes.ok) {
				setArticles(await artRes.json());
				setSections(await secRes.json());
				setMetadata(await metaRes.json());
			}
		} catch (error) {
			console.error('Ошибка загрузки:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => { loadData(); }, [loadData]);

	useEffect(() => {
		if (form.id) {
			fetch(`/api/admin/comments?articleId=${form.id}`)
				.then(res => res.json())
				.then(setComments);
		} else {
			setComments([]);
		}
	}, [form.id]);

	// --- Обработчики ---
	const handleDeleteMetadata = async (type: 'author' | 'tag' | 'place' | 'subject', id: number) => {
		if (!confirm('Удалить элемент? Это может повлиять на статьи.')) return;
		const res = await fetch('/api/admin/metadata', {
			method: 'DELETE',
			body: JSON.stringify({ type, id })
		});
		if (res.ok) loadData();
		else alert('Ошибка при удалении. Возможно, данные используются в статьях.');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title || form.sectionId === 0) return alert('Заполните обязательные поля');
		setIsSubmitting(true);
		try {
			let imageUrl = form.currentImageUrl;
			if (form.imageFile) {
				const formData = new FormData();
				formData.append('file', form.imageFile);
				const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
				const uploadData = await uploadRes.json();
				imageUrl = uploadData.url;
			}
			const res = await fetch('/api/admin/articles', {
				method: form.id ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, imageUrl }),
			});
			if (res.ok) {
				setForm(initialFormState);
				loadData();
				alert('Успешно сохранено');
			}
		} catch {
			alert('Ошибка сохранения');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCleanup = async () => {
		if (!confirm('Запустить очистку неиспользуемых файлов?')) return;
		setIsLoading(true);
		try {
			const res = await fetch('/api/admin/cleanup', { method: 'POST' });
			const data = await res.json();
			alert(data.message || 'Очистка завершена');
		} catch {
			alert('Ошибка при очистке');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteArticle = async (id: number) => {
		if (!confirm('Удалить статью навсегда?')) return;
		setIsLoading(true);
		try {
			const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
			if (res.ok) {
				if (form.id === id) setForm(initialFormState);
				loadData();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900">
			{/* SIDEBAR */}
			<aside className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-xl z-10">
				<div className="p-4 border-b bg-slate-50/50 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-black text-slate-800 flex items-center gap-2">
							<Database size={18} /> ПАНЕЛЬ
						</h2>
						<button onClick={() => { setForm(initialFormState); setActiveTab('articles') }} className="p-1 hover:bg-amber-50 rounded text-amber-600">
							<Plus size={20} />
						</button>
					</div>
					<div className="flex p-1 bg-slate-200/50 rounded-xl">
						<button
							onClick={() => setActiveTab('articles')}
							className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'articles' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
						>СТАТЬИ</button>
						<button
							onClick={() => setActiveTab('database')}
							className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
						>БАЗА</button>
					</div>
				</div>

				<div className="flex-grow overflow-y-auto">
					{isLoading ? (
						<div className="p-4 text-center text-slate-400 text-sm">Загрузка...</div>
					) : activeTab === 'articles' ? (
						articles.map((a) => (
							<div
								key={a.id}
								onClick={() => setForm({
									id: a.id,
									title: a.title,
									contentHtml: a.contentHtml,
									sectionId: a.section?.id || 0,
									authorName: a.author?.name || '',
									tagNames: a.tags?.map(t => t.name) || [],
									placeNames: a.places?.map(p => p.name) || [],
									subjectNames: a.subjects?.map(s => s.name) || [],
									imageFile: null,
									currentImageUrl: a.imageUrl || null,
								})}
								className={`group p-4 border-b cursor-pointer transition-all hover:bg-amber-50/30 ${form.id === a.id ? 'bg-amber-50 border-l-4 border-l-amber-600' : ''}`}
							>
								<div className="flex justify-between items-start">
									<h3 className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight">{a.title}</h3>
									<button onClick={(e) => { e.stopPropagation(); handleDeleteArticle(a.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 rounded-lg">
										<Trash2 size={14} />
									</button>
								</div>
								<div className="flex gap-2 mt-2">
									<span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase">{a.section?.name}</span>
									<span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold flex items-center gap-1">
										<Heart size={8} fill="currentColor" /> {a.likes || 0}
									</span>
								</div>
							</div>
						))
					) : (
						<div className="p-4 space-y-6">
							<button onClick={handleCleanup} className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-tighter hover:bg-amber-600">
								<Trash2 size={14} /> Очистить файлы
							</button>

							{/* Секция метаданных */}
							{(['authors', 'tags', 'places', 'subjects'] as const).map((key) => (
								<section key={key}>
									<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{key}</label>
									<div className="flex flex-wrap gap-2">
										{metadata[key].map((item: BaseItem) => (
											<div key={item.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
												{item.name}
												<button
													onClick={() => handleDeleteMetadata(key.slice(0, -1) as 'author' | 'tag' | 'place' | 'subject', item.id)}
													className="hover:text-red-500"
												>
													<X size={12} />
												</button>
											</div>
										))}
									</div>
								</section>
							))}
						</div>
					)}
				</div>
			</aside>

			{/* MAIN CONTENT */}
			<main className="flex-grow flex flex-col bg-white overflow-hidden relative">
				<header className="h-16 border-b px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-xl ${form.id ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
							{form.id ? <Edit3 size={20} /> : <Plus size={20} />}
						</div>
						<h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
							{form.id ? 'Редактирование' : 'Новый черновик'}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						{form.id && (
							<button onClick={() => setForm(initialFormState)} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm">
								<RotateCcw size={18} /> СБРОС
							</button>
						)}
						<button
							onClick={handleSubmit}
							disabled={isSubmitting || !form.title}
							className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700 disabled:opacity-30 shadow-lg transition-all"
						>
							{isSubmitting ? '...' : <><Save size={18} /> СОХРАНИТЬ</>}
						</button>
					</div>
				</header>

				<div className="flex-grow overflow-y-auto px-8 py-10">
					<div className="max-w-4xl mx-auto space-y-10">
						{/* Title & Section */}
						<div className="grid grid-cols-3 gap-8">
							<div className="col-span-2 space-y-2">
								<label className="text-[10px] font-black uppercase text-slate-400">Заголовок</label>
								<input
									type="text" value={form.title}
									onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
									className="w-full text-4xl font-black focus:outline-none placeholder:text-slate-200"
									placeholder="Заголовок..."
								/>
							</div>
							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase text-slate-400">Раздел</label>
								<select
									value={form.sectionId}
									onChange={(e) => setForm(p => ({ ...p, sectionId: Number(e.target.value) }))}
									className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-slate-700 outline-none"
								>
									<option value={0}>Выбрать раздел</option>
									{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
								</select>
							</div>
						</div>

						{/* Metadata Grid */}
						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><User size={12} /> Автор</label>
								<CreatableSelect<SelectOption, false>
									instanceId="author-select"
									isClearable
									options={metadata.authors.map(a => ({ label: a.name, value: a.name }))}
									value={form.authorName ? { label: form.authorName, value: form.authorName } : null}
									onChange={(opt: SingleValue<SelectOption>) => setForm(p => ({ ...p, authorName: opt ? opt.value : '' }))}
								/>
							</div>
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Tag size={12} /> Теги</label>
								<CreatableSelect<SelectOption, true>
									instanceId="tag-select"
									isMulti
									options={metadata.tags.map(t => ({ label: t.name, value: t.name }))}
									value={form.tagNames.map(t => ({ label: t, value: t }))}
									onChange={(val: MultiValue<SelectOption>) => setForm(p => ({ ...p, tagNames: val ? val.map(v => v.value) : [] }))}
								/>
							</div>
						</div>

						{/* New Metadata Grid: Places & Subjects */}
						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin size={12} /> Место / Геолокация</label>
								<CreatableSelect<SelectOption, true>
									instanceId="place-select"
									isMulti
									options={metadata.places.map(p => ({ label: p.name, value: p.name }))}
									value={form.placeNames.map(p => ({ label: p, value: p }))}
									onChange={(val: MultiValue<SelectOption>) => setForm(p => ({ ...p, placeNames: val ? val.map(v => v.value) : [] }))}
								/>
							</div>
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Users size={12} /> О ком статья (Субъекты)</label>
								<CreatableSelect<SelectOption, true>
									instanceId="subject-select"
									isMulti
									options={metadata.subjects.map(s => ({ label: s.name, value: s.name }))}
									value={form.subjectNames.map(s => ({ label: s, value: s }))}
									onChange={(val: MultiValue<SelectOption>) => setForm(p => ({ ...p, subjectNames: val ? val.map(v => v.value) : [] }))}
								/>
							</div>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
								<ImageIcon size={12} /> Обложка
							</label>
							<div className="group relative w-full h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-amber-400 transition-all">
								{(form.imageFile || form.currentImageUrl) ? (
									<>
										<Image
											src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.currentImageUrl!}
											alt="Preview" fill className="object-cover group-hover:opacity-40 transition-opacity"
											unoptimized
										/>
										<div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-amber-600 bg-white/10 backdrop-blur-sm">
											<ImageIcon size={32} />
											<span className="font-bold text-[10px] uppercase">Заменить фото</span>
										</div>
									</>
								) : (
									<div className="text-slate-300 flex flex-col items-center">
										<ImageIcon size={40} className="mb-2 opacity-20" />
										<span className="text-[10px] font-black uppercase">Выберите файл</span>
									</div>
								)}
								<input type="file" accept="image/*" onChange={(e) => setForm(p => ({ ...p, imageFile: e.target.files?.[0] || null }))} className="absolute inset-0 opacity-0 cursor-pointer" />
							</div>
						</div>

						{/* Rich Editor */}
						<div className="space-y-4">
							<label className="text-[10px] font-black uppercase text-slate-400">Текст статьи</label>
							<RichTextEditor content={form.contentHtml} onChange={(html) => setForm(p => ({ ...p, contentHtml: html }))} />
						</div>

						{/* Comments Block */}
						{form.id && (
							<div className="pt-10 border-t border-slate-100 pb-20">
								<h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
									<MessageSquare size={22} className="text-amber-500" /> Комментарии ({comments.length})
								</h3>
								<div className="grid gap-4">
									{comments.map(comment => (
										<div key={comment.id} className="flex items-start justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-black text-sm text-slate-700">{comment.authorName}</span>
													<span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
												</div>
												<p className="text-slate-600 text-sm">{comment.content}</p>
											</div>
											<button onClick={() => {
												if (confirm('Удалить?')) fetch('/api/admin/comments', { method: 'DELETE', body: JSON.stringify({ id: comment.id }) }).then(() => setComments(prev => prev.filter(c => c.id !== comment.id)));
											}} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
												<Trash2 size={18} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}