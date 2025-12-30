'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, RotateCcw, ImageIcon, MapPin, Users, User, Tag } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import RichTextEditor from '@/components/rich-text-editor';
import CommentManager from './CommentManager';

export default function ArticleForm({ article, sections, metadata, onSuccess, onReset }: any) {
	const [form, setForm] = useState<any>({
		id: null,
		title: '',
		contentHtml: '',
		sectionId: 0,
		authorName: '',
		tagNames: [],
		placeNames: [], // Вярнулі
		subjectNames: [], // Вярнулі
		imageFile: null,
		currentImageUrl: null
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Сінхранізацыя формы з выбраным артыкулам
	useEffect(() => {
		if (article) {
			setForm({
				id: article.id,
				title: article.title,
				contentHtml: article.contentHtml,
				sectionId: article.section?.id || 0,
				authorName: article.author?.name || '',
				tagNames: article.tags?.map((t: any) => t.name) || [],
				placeNames: article.places?.map((p: any) => p.name) || [], // Вярнулі
				subjectNames: article.subjects?.map((s: any) => s.name) || [], // Вярнулі
				currentImageUrl: article.imageUrl,
				imageFile: null
			});
		} else {
			setForm({
				id: null, title: '', contentHtml: '', sectionId: 0, authorName: '',
				tagNames: [], placeNames: [], subjectNames: [], imageFile: null, currentImageUrl: null
			});
		}
	}, [article]);

	const handleSubmit = async () => {
		if (!form.title || form.sectionId === 0) return alert('Запоўніце загаловак і раздзел');
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
				alert('Захавана паспяхова');
				onSuccess();
			}
		} catch (err) {
			alert('Памылка пры захаванні');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<header className="h-16 border-b px-8 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
				<div className="flex items-center gap-3">
					<h1 className="text-xl font-black uppercase tracking-tight text-slate-800">
						{form.id ? 'Рэдагаванне' : 'Новае падарожжа'}
					</h1>
				</div>
				<div className="flex gap-3">
					<button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all">
						<RotateCcw size={18} /> СБРОС
					</button>
					<button
						onClick={handleSubmit}
						disabled={isSubmitting || !form.title}
						className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-xl font-black shadow-lg hover:bg-amber-700 transition-all disabled:opacity-50"
					>
						{isSubmitting ? '...' : <><Save size={18} /> ЗАХАВАЦЬ</>}
					</button>
				</div>
			</header>

			<div className="flex-grow overflow-y-auto px-8 py-10">
				<div className="max-w-6xl mx-auto space-y-10">

					{/* Загаловак і Раздзел */}
					<div className="grid grid-cols-3 gap-8">
						<div className="col-span-2 space-y-2">
							<label className="text-[10px] font-black uppercase text-slate-400">Загаловак</label>
							<input
								type="text" value={form.title}
								onChange={e => setForm({ ...form, title: e.target.value })}
								placeholder="Увядзіце назву..."
								className="w-full text-4xl font-black focus:outline-none placeholder:text-slate-200"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-[10px] font-black uppercase text-slate-400">Сэнс</label>
							<select
								value={form.sectionId}
								onChange={e => setForm({ ...form, sectionId: +e.target.value })}
								className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-700 outline-none border-none"
							>
								<option value={0}>Выбраць раздзел</option>
								{sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
							</select>
						</div>
					</div>

					{/* Метаданыя: Аўтар і Тэгі */}
					<div className="grid grid-cols-2 gap-8">
						<div className="space-y-2">
							<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><User size={12} /> Аўтар</label>
							<CreatableSelect
								instanceId="author-select"
								isClearable
								options={metadata.authors.map((a: any) => ({ label: a.name, value: a.name }))}
								value={form.authorName ? { label: form.authorName, value: form.authorName } : null}
								onChange={(opt: any) => setForm({ ...form, authorName: opt?.value || '' })}
							/>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Tag size={12} /> Тэгі</label>
							<CreatableSelect
								instanceId="tags-select"
								isMulti
								options={metadata.tags.map((t: any) => ({ label: t.name, value: t.name }))}
								value={form.tagNames.map((t: string) => ({ label: t, value: t }))}
								onChange={(val: any) => setForm({ ...form, tagNames: val ? val.map((v: any) => v.value) : [] })}
							/>
						</div>
					</div>

					{/* Метаданыя: Месцы і Геніі (Вярнулі гэты блок) */}
					<div className="grid grid-cols-2 gap-8">
						<div className="space-y-2">
							<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin size={12} /> Месца</label>
							<CreatableSelect
								instanceId="places-select"
								isMulti
								options={metadata.places.map((p: any) => ({ label: p.name, value: p.name }))}
								value={form.placeNames.map((p: string) => ({ label: p, value: p }))}
								onChange={(val: any) => setForm({ ...form, placeNames: val ? val.map((v: any) => v.value) : [] })}
							/>
						</div>
						<div className="space-y-2">
							<label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Users size={12} /> Геній</label>
							<CreatableSelect
								instanceId="subjects-select"
								isMulti
								options={metadata.subjects.map((s: any) => ({ label: s.name, value: s.name }))}
								value={form.subjectNames.map((s: string) => ({ label: s, value: s }))}
								onChange={(val: any) => setForm({ ...form, subjectNames: val ? val.map((v: any) => v.value) : [] })}
							/>
						</div>
					</div>

					{/* Загрузка фота */}
					<div className="space-y-2">
						<label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
							<ImageIcon size={12} /> Вокладка
						</label>
						<div className="group relative w-full h-80 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center hover:border-amber-400 transition-all">
							{(form.imageFile || form.currentImageUrl) ? (
								<>
									<Image
										src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.currentImageUrl}
										alt="Preview" fill className="object-cover group-hover:opacity-40 transition-opacity" unoptimized
									/>
									<div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-amber-600 bg-white/10 backdrop-blur-sm">
										<ImageIcon size={32} />
										<span className="font-bold text-[10px] uppercase">Замяніць фота</span>
									</div>
								</>
							) : (
								<div className="text-slate-300 flex flex-col items-center">
									<ImageIcon size={40} className="mb-2 opacity-20" />
									<span className="text-[10px] font-black uppercase">Выберыце файл</span>
								</div>
							)}
							<input
								type="file"
								accept="image/*"
								className="absolute inset-0 opacity-0 cursor-pointer"
								onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
							/>
						</div>
					</div>

					{/* Рэдактар тэксту */}
					<div className="space-y-4">
						<label className="text-[10px] font-black uppercase text-slate-400">Тэкст артыкула</label>
						<RichTextEditor
							content={form.contentHtml}
							onChange={html => setForm({ ...form, contentHtml: html })}
						/>
					</div>

					{/* Каментарыі */}
					{form.id && <CommentManager articleId={form.id} />}
				</div>
			</div>
		</>
	);
}