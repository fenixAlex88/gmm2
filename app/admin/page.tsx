'use client';

import { IArticle } from '@/interfaces/IArticle';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import RichTextEditor from '@/components/rich-text-editor';
import { Trash2, Plus, Edit3, Database, Save, RotateCcw, Image as ImageIcon } from 'lucide-react';

type Section = { id: number; name: string; };

interface FormState {
	id: number | null;
	title: string;
	contentHtml: string;
	sectionId: number;
	imageFile: File | null;
	currentImageUrl: string | null;
}

const initialFormState: FormState = {
	id: null,
	title: '',
	contentHtml: '',
	sectionId: 0,
	imageFile: null,
	currentImageUrl: null,
};

export default function AdminPage() {
	const [articles, setArticles] = useState<IArticle[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [form, setForm] = useState<FormState>(initialFormState);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isEditing = form.id !== null;

	// --- API Logic ---

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [articlesRes, sectionsRes] = await Promise.all([
				fetch('/api/admin/articles'),
				fetch('/api/admin/sections'),
			]);
			if (!articlesRes.ok || !sectionsRes.ok) throw new Error('Ошибка загрузки');
			setArticles(await articlesRes.json());
			setSections(await sectionsRes.json());
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => { loadData(); }, [loadData]);

	const handleCleanup = async () => {
		if (!confirm('Удалить неиспользуемые файлы с сервера?')) return;
		try {
			const res = await fetch('/api/admin/cleanup', { method: 'POST' });
			const data = await res.json();
			alert(data.message);
		} catch { alert('Ошибка связи с сервером'); }
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title || form.sectionId === 0) return alert('Заполните заголовок и раздел');
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
				method: isEditing ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, imageUrl }),
			});

			const savedArticle = await res.json();
			if (isEditing) {
				setArticles(prev => prev.map(a => a.id === savedArticle.id ? savedArticle : a));
			} else {
				setArticles(prev => [savedArticle, ...prev]);
			}
			setForm(initialFormState);
			alert('Статья сохранена успешно!');
		} catch {
			alert('Ошибка при сохранении');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Удалить статью навсегда?')) return;
		setIsDeleting(true);
		try {
			await fetch('/api/admin/articles', {
				method: 'DELETE',
				body: JSON.stringify({ id }),
			});
			setArticles(prev => prev.filter(a => a.id !== id));
			if (form.id === id) setForm(initialFormState);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex h-screen bg-slate-100 overflow-hidden">

			{/* ЛЕВАЯ ПАНЕЛЬ: Список статей */}
			<aside className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-xl z-10">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
					<h2 className="font-bold text-slate-800 flex items-center gap-2">
						<Database size={18} /> Статьи ({articles.length})
					</h2>
					<button
						onClick={handleCleanup}
						className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
						title="Очистить мусор на сервере"
					>
						<Trash2 size={16} />
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					{isLoading ? (
						<div className="p-4 space-y-3">
							{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded" />)}
						</div>
					) : (
						articles.map((a) => (
							<div
								key={a.id}
								onClick={() => {
									setForm({
										id: a.id,
										title: a.title,
										contentHtml: a.contentHtml,
										sectionId: a.section.id,
										imageFile: null,
										currentImageUrl: a.imageUrl ?? null,
									});
								}}
								className={`group p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-blue-50/50 ${form.id === a.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
							>
								<div className="flex justify-between items-start gap-2">
									<h3 className="text-sm font-semibold text-slate-700 line-clamp-2 leading-snug">
										{a.title}
									</h3>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(a.id);
										}}
										// Добавляем использование переменной:
										disabled={isDeleting}
										className={`opacity-0 group-hover:opacity-100 p-1 transition-all ${isDeleting
												? 'text-slate-200 cursor-not-allowed'
												: 'text-slate-400 hover:text-red-500'
											}`}
									>
										<Trash2 size={14} />
									</button>
								</div>
								<span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2 block">
									{a.section?.name}
								</span>
							</div>
						))
					)}
				</div>

				<div className="p-4 bg-slate-50 border-t">
					<button
						onClick={() => setForm(initialFormState)}
						className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
					>
						<Plus size={18} /> Новая статья
					</button>
				</div>
			</aside>

			{/* ОСНОВНАЯ ПАНЕЛЬ: Редактор */}
			<main className="flex-grow flex flex-col bg-white overflow-hidden relative">

				{/* Header формы */}
				<header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
					<div className="flex items-center gap-4">
						<div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
							{isEditing ? <Edit3 size={20} /> : <Plus size={20} />}
						</div>
						<h1 className="text-xl font-black text-slate-800 tracking-tight">
							{isEditing ? 'Редактирование' : 'Новая публикация'}
						</h1>
					</div>

					<div className="flex items-center gap-3">
						{isEditing && (
							<button
								onClick={() => setForm(initialFormState)}
								className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
							>
								<RotateCcw size={18} /> Отмена
							</button>
						)}
						<button
							onClick={handleSubmit}
							disabled={isSubmitting || !form.title || !form.contentHtml}
							className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-95"
						>
							{isSubmitting ? '...' : <><Save size={18} /> Сохранить</>}
						</button>
					</div>
				</header>

				{/* Тело формы */}
				<div className="flex-grow overflow-y-auto px-8 py-8 scroll-smooth">
					<div className="max-w-5xl mx-auto space-y-8">

						{/* Поля Title и Section */}
						<div className="grid grid-cols-3 gap-6">
							<div className="col-span-2 space-y-2">
								<label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Заголовок статьи</label>
								<input
									type="text"
									value={form.title}
									onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
									placeholder="Введите броский заголовок..."
									className="w-full text-3xl font-black placeholder:text-slate-200 focus:outline-none border-b-2 border-transparent focus:border-blue-500 pb-2 transition-all"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Раздел</label>
								<select
									value={form.sectionId}
									onChange={(e) => setForm(p => ({ ...p, sectionId: Number(e.target.value) }))}
									className="w-full h-12 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:border-blue-500 focus:outline-none bg-slate-50/50 cursor-pointer"
								>
									<option value={0}>Выбрать категорию</option>
									{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
								</select>
							</div>
						</div>

						{/* Загрузка обложки */}
						<div className="group relative w-full h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-400">
							{(form.imageFile || form.currentImageUrl) ? (
								<>
									<Image
										src={form.imageFile ? URL.createObjectURL(form.imageFile) : (form.currentImageUrl || '')}
										alt="Cover"
										fill
										className="object-cover opacity-60 blur-[2px]"
										unoptimized
									/>
									<div className="absolute inset-0 bg-slate-900/20 flex flex-col items-center justify-center text-white">
										<ImageIcon size={32} className="mb-2 shadow-sm" />
										<span className="font-bold text-sm drop-shadow-md">Нажмите, чтобы заменить обложку</span>
									</div>
								</>
							) : (
								<div className="text-slate-400 flex flex-col items-center">
									<ImageIcon size={40} strokeWidth={1} className="mb-2" />
									<span className="text-sm font-medium">Главное изображение статьи</span>
								</div>
							)}
							<input
								type="file"
								accept="image/*"
								onChange={(e) => setForm(p => ({ ...p, imageFile: e.target.files?.[0] ?? null }))}
								className="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>

						{/* Редактор */}
						<div className="space-y-4 pb-20">
							<label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Контент</label>
							<div className="min-h-[500px]">
								<RichTextEditor
									content={form.contentHtml}
									onChange={(html) => setForm(p => ({ ...p, contentHtml: html }))}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}