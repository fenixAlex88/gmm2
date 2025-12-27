'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import CreatableSelect from 'react-select/creatable';
import { MultiValue, SingleValue } from 'react-select'; // Добавлено для типизации Select
import RichTextEditor from '@/components/rich-text-editor';
import { IArticle } from '@/interfaces/IArticle';
import {
	Trash2, Plus, Edit3, Database, Save, RotateCcw, User, Tag, MessageSquare, X,
	ImageIcon
} from 'lucide-react';

// --- Интерфейсы ---
interface Section { id: number; name: string; }
interface TagItem { id: number; name: string; }
interface Author { id: number; name: string; }
interface Metadata { authors: Author[]; tags: TagItem[]; }

interface Comment { // Заменили any на интерфейс
	id: number;
	authorName: string;
	content: string;
	createdAt: string;
	articleId: number;
}

interface SelectOption { // Для CreatableSelect
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
	imageFile: File | null;
	currentImageUrl: string | null;
}

const initialFormState: FormState = {
	id: null, title: '', contentHtml: '', sectionId: 0,
	authorName: '', tagNames: [], imageFile: null, currentImageUrl: null,
};

export default function AdminPage() {
	const [articles, setArticles] = useState<IArticle[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [metadata, setMetadata] = useState<Metadata>({ authors: [], tags: [] });
	const [comments, setComments] = useState<Comment[]>([]); // Типизировано
	const [form, setForm] = useState<FormState>(initialFormState);

	const [activeTab, setActiveTab] = useState<'articles' | 'database'>('articles');
	const [isLoading, setIsLoading] = useState(false); // Теперь используется в UI
	const [isSubmitting, setIsSubmitting] = useState(false);

	// --- Загрузка данных ---
	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [artRes, secRes, metaRes] = await Promise.all([
				fetch('/api/admin/articles'),
				fetch('/api/admin/sections'),
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
	const handleDeleteMetadata = async (type: 'author' | 'tag', id: number) => {
		if (!confirm('Удалить элемент? Это может повлиять на статьи.')) return;
		const res = await fetch('/api/admin/metadata', {
			method: 'DELETE',
			body: JSON.stringify({ type, id })
		});
		if (res.ok) loadData();
		else alert('Ошибка при удалении');
	};

	const handleDeleteComment = async (id: number) => {
		if (!confirm('Удалить этот комментарий?')) return;
		const res = await fetch('/api/admin/comments', {
			method: 'DELETE',
			body: JSON.stringify({ id })
		});
		if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
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
		if (!confirm('Начать глубокую очистку? Система удалит все файлы из /uploads, которые не упоминаются в текстах статей или обложках.')) return;

		setIsLoading(true); // Используем ваш существующий стейт загрузки
		try {
			const res = await fetch('/api/admin/cleanup', {
				method: 'POST' // В роуте указан POST
			});
			const data = await res.json();

			if (data.success) {
				alert(data.message);
			} else {
				alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
			}
		} catch (error) {
			console.error('Cleanup error:', error);
			alert('Не удалось связаться с сервером очистки');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteArticle = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту статью? Это действие необратимо.')) return;

		setIsLoading(true);
		try {
			const res = await fetch(`/api/admin/articles?id=${id}`, {
				method: 'DELETE',
			});

			if (res.ok) {
	
				if (form.id === id) {
					setForm(initialFormState);
				}
				loadData();
				alert('Статья успешно удалена');
			} else {
				alert('Ошибка при удалении статьи');
			}
		} catch (error) {
			console.error('Delete error:', error);
			alert('Не удалось связаться с сервером');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-screen bg-slate-100 overflow-hidden">
			{/* SIDEBAR */}
			<aside className="w-80 flex flex-col bg-white border-r border-slate-200 shadow-xl z-10">
				<div className="p-4 border-b bg-slate-50/50 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-black text-slate-800 flex items-center gap-2">
							<Database size={18} /> ПАНЕЛЬ
						</h2>
						<button onClick={() => { setForm(initialFormState); setActiveTab('articles') }} className="p-1 hover:bg-blue-50 rounded text-blue-600">
							<Plus size={20} />
						</button>
					</div>
					<div className="flex p-1 bg-slate-200/50 rounded-xl">
						<button
							onClick={() => setActiveTab('articles')}
							className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'articles' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
						>СТАТЬИ</button>
						<button
							onClick={() => setActiveTab('database')}
							className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
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
									id: a.id, title: a.title, contentHtml: a.contentHtml,
									sectionId: a.section?.id || 0, authorName: a.author?.name || '',
									tagNames: a.tags?.map(t => t.name) || [], imageFile: null, currentImageUrl: a.imageUrl || null,
								})}
								className={`group p-4 border-b cursor-pointer transition-all hover:bg-blue-50/30 ${form.id === a.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
							>
								<div className="flex justify-between items-start">
									<h3 className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight">{a.title}</h3>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteArticle(a.id);
										}}
										className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
									>
										<Trash2 size={14} />
									</button>
								</div>
								<span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase mt-2 inline-block">{a.section?.name}</span>
							</div>
						))
					) : (
						<div className="p-4 space-y-6">
							<section className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
								<label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-3">
									Система хранения
								</label>
								<p className="text-[11px] text-amber-700/70 mb-4 leading-relaxed">
									Поиск и удаление файлов, которые больше не используются ни в одной статье.
								</p>
								<button
									onClick={handleCleanup}
									disabled={isLoading}
									className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-tighter hover:bg-amber-600 disabled:opacity-50 transition-all shadow-sm"
								>
									<Trash2 size={14} />
									{isLoading ? 'Очистка...' : 'Запустить очистку'}
								</button>
							</section>
							<section>
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Авторы</label>
								{metadata.authors.map(auth => (
									<div key={auth.id} className="flex items-center justify-between py-2 group border-b border-slate-50">
										<span className="text-sm font-medium text-slate-600">{auth.name}</span>
										<button onClick={() => handleDeleteMetadata('author', auth.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
									</div>
								))}
							</section>
							<section>
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Теги</label>
								<div className="flex flex-wrap gap-2">
									{metadata.tags.map(tag => (
										<div key={tag.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
											#{tag.name}
											<button onClick={() => handleDeleteMetadata('tag', tag.id)} className="hover:text-red-500"><X size={12} /></button>
										</div>
									))}
								</div>
							</section>
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
							<button onClick={() => setForm(initialFormState)} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all">
								<RotateCcw size={18} /> СБРОС
							</button>
						)}
						<button
							onClick={handleSubmit}
							disabled={isSubmitting || !form.title}
							className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg"
						>
							{isSubmitting ? '...' : <><Save size={18} /> СОХРАНИТЬ</>}
						</button>
					</div>
				</header>

				<div className="flex-grow overflow-y-auto px-8 py-10">
					<div className="max-w-4xl mx-auto space-y-10">
						<div className="grid grid-cols-3 gap-8">
							<div className="col-span-2 space-y-2">
								<label className="text-[10px] font-black uppercase text-slate-400">Заголовок статьи</label>
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

						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><User size={12} /> Автор</label>
								<CreatableSelect<SelectOption, false> // Указан тип
									isClearable
									options={metadata.authors.map(a => ({ label: a.name, value: a.name }))}
									value={form.authorName ? { label: form.authorName, value: form.authorName } : null}
									onChange={(opt: SingleValue<SelectOption>) => setForm(p => ({ ...p, authorName: opt ? opt.value : '' }))}
								/>
							</div>
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Tag size={12} /> Теги</label>
								<CreatableSelect<SelectOption, true> // Указан тип для мульти-выбора
									isMulti
									options={metadata.tags.map(t => ({ label: t.name, value: t.name }))}
									value={form.tagNames.map(t => ({ label: t, value: t }))}
									onChange={(val: MultiValue<SelectOption>) => setForm(p => ({ ...p, tagNames: val ? val.map(v => v.value) : [] }))}
								/>
							</div>
						</div>

						{/* Поле загрузки изображения */}
						<div className="space-y-2">
							<label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
								<ImageIcon size={12} /> Обложка статьи
							</label>
							<div className="group relative w-full h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-400">
								{(form.imageFile || form.currentImageUrl) ? (
									<>
										<Image
											src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.currentImageUrl!}
											alt="Preview"
											fill
											className="object-cover group-hover:opacity-40 transition-opacity"
											unoptimized
										/>
										<div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-blue-600 bg-white/10 backdrop-blur-sm">
											<ImageIcon size={32} className="mb-2" />
											<span className="font-bold text-xs uppercase tracking-widest">Заменить фото</span>
										</div>
									</>
								) : (
									<div className="text-slate-400 flex flex-col items-center pointer-events-none">
										<ImageIcon size={40} className="mb-2 opacity-20" />
										<span className="text-xs font-bold uppercase tracking-tighter">Перетащите или выберите файл</span>
									</div>
								)}
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0] || null;
										setForm(p => ({ ...p, imageFile: file }));
									}}
									className="absolute inset-0 opacity-0 cursor-pointer"
								/>
							</div>
						</div>

						{/* Content & Comments */}
						<div className="space-y-4">
							<label className="text-[10px] font-black uppercase text-slate-400">Основной текст</label>
							<RichTextEditor
								content={form.contentHtml}
								onChange={(html) => setForm(p => ({ ...p, contentHtml: html }))}
							/>
						</div>

						{form.id && (
							<div className="pt-10 border-t border-slate-100">
								<h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
									<MessageSquare size={22} className="text-blue-500" /> Комментарии ({comments.length})
								</h3>
								<div className="grid gap-4">
									{comments.map(comment => (
										<div key={comment.id} className="flex items-start justify-between p-5 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-black text-sm text-slate-700">{comment.authorName}</span>
													<span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
												</div>
												<p className="text-slate-600 text-sm">{comment.content}</p>
											</div>
											<button
												onClick={() => handleDeleteComment(comment.id)}
												className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
											>
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