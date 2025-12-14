'use client';

import { IArticle } from '@/interfaces/IArticle';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import RichTextEditor from '@/components/rich-text-editor'; // Предполагается, что этот компонент существует

// Интерфейсы, чтобы сделать компонент чище
type Section = {
	id: number;
	name: string;
};

interface FormState {
	id: number | null;
	title: string;
	contentHtml: string;
	sectionId: number;
	imageFile: File | null;
	currentImageUrl: string | null;
}

// Начальное состояние формы
const initialFormState: FormState = {
	id: null,
	title: '',
	contentHtml: '',
	sectionId: 0,
	imageFile: null,
	currentImageUrl: null,
};

// Функция для чтения ответа API, даже если он содержит ошибку (status != 200)
async function parseResponse(res: Response) {
	try {
		const data = await res.json();
		return data;
	} catch {
		// Если не удалось распарсить JSON, возвращаем пустой объект
		return {};
	}
}

export default function AdminPage() {
	const [articles, setArticles] = useState<IArticle[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [form, setForm] = useState<FormState>(initialFormState);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isEditing = form.id !== null;

	// --- Функции API ---

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [articlesRes, sectionsRes] = await Promise.all([
				fetch('/api/admin/articles'),
				fetch('/api/admin/sections'),
			]);

			if (!articlesRes.ok || !sectionsRes.ok) throw new Error('Ошибка загрузки данных.');

			const articlesData = await articlesRes.json();
			const sectionsData = await sectionsRes.json();

			setArticles(articlesData);
			setSections(sectionsData);
		} catch (error) {
			console.error(error);
			alert(`Ошибка загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const uploadImage = useCallback(async (file: File): Promise<string> => {
		const data = new FormData();
		data.append('file', file);

		const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
		const json = await parseResponse(res);

		if (!res.ok) {
			const errorMsg = json.error || 'Ошибка загрузки изображения.';
			throw new Error(errorMsg);
		}

		return json.url;
	}, []);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (form.sectionId === 0) {
				alert('Пожалуйста, выберите раздел!');
				return;
			}

			let imageUrl: string | undefined = form.currentImageUrl ?? undefined;

			if (form.imageFile) {
				imageUrl = await uploadImage(form.imageFile);
			}

			const payload = {
				id: form.id,
				title: form.title,
				contentHtml: form.contentHtml,
				sectionId: form.sectionId,
				imageUrl
			};

			const method = isEditing ? 'PUT' : 'POST';

			const res = await fetch('/api/admin/articles', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const responseData = await parseResponse(res);

			if (!res.ok) {
				// Используем сообщение об ошибке, переданное сервером (например, из-за валидации)
				const errorMsg = responseData.error || `Ошибка ${res.status} при сохранении статьи.`;
				throw new Error(errorMsg);
			}

			// Обновляем список статей
			if (isEditing) {
				setArticles(prev => prev.map(a => a.id === responseData.id ? responseData : a));
			} else {
				setArticles(prev => [responseData, ...prev]);
			}

			// Очищаем форму
			setForm(initialFormState);

		} catch (error) {
			console.error("Ошибка при отправке формы:", error);
			alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		} finally {
			setIsSubmitting(false);
		}
	}, [form, isEditing, uploadImage]);

	const handleDelete = useCallback(async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить эту статью? Это действие необратимо.')) return;

		setIsDeleting(true);

		try {
			const res = await fetch('/api/admin/articles', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			});

			const responseData = await parseResponse(res);

			if (!res.ok) {
				const errorMsg = responseData.error || `Ошибка ${res.status} при удалении статьи.`;
				throw new Error(errorMsg);
			}

			setArticles((prev) => prev.filter((a) => a.id !== id));

			// Если удаляем статью, которую редактировали, сбрасываем форму
			if (form.id === id) {
				setForm(initialFormState);
			}
		} catch (error) {
			console.error("Ошибка при удалении:", error);
			alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		} finally {
			setIsDeleting(false);
		}
	}, [form.id]);

	const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, title: e.target.value }));
	};

	const onContentChange = (html: string) => {
		setForm((prev) => ({ ...prev, contentHtml: html }));
	};

	const onSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setForm((prev) => ({ ...prev, sectionId: Number(e.target.value) }));
	};

	const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({
			...prev,
			imageFile: e.target.files?.[0] ?? null,
		}));
	};

	const startEdit = useCallback((article: IArticle) => {
		setForm({
			id: article.id,
			title: article.title,
			contentHtml: article.contentHtml,
			sectionId: article.section.id,
			imageFile: null,
			currentImageUrl: article.imageUrl ?? null,
		});
		document.getElementById('article-form-title')?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	const currentSectionName = useMemo(() => {
		return sections.find(s => s.id === form.sectionId)?.name;
	}, [form.sectionId, sections]);

	// Проверка, активна ли кнопка
	const isFormValid = Boolean(form.title && form.contentHtml && form.sectionId !== 0);

	return (
		<div className="flex p-8 gap-8 h-screen">

			{/* 1. Список статей (Таблица) - W-1/3 */}
			<div className="w-1/3 flex flex-col bg-white p-4 rounded shadow-lg overflow-y-auto border">
				<h2 className="text-xl font-bold mb-4 text-gray-700">📚 Список статей</h2>

				{isLoading ? (
					<p className="text-gray-500">Загрузка данных...</p>
				) : articles.length === 0 ? (
					<p className="text-gray-500 italic">Нет статей для отображения.</p>
				) : (
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50 sticky top-0">
							<tr>
								<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заголовок</th>
								<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Раздел</th>
								<th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{articles.map((a) => (
								<tr key={a.id} className="hover:bg-yellow-50/50 transition-colors">
									<td className="px-3 py-2 text-sm font-medium text-gray-900">{a.title}</td>
									<td className="px-3 py-2 text-xs text-gray-500">{a.section?.name || '—'}</td>
									<td className="px-3 py-2 text-right text-sm font-medium flex gap-1 justify-end">
										<button
											onClick={() => startEdit(a)}
											disabled={isDeleting || isSubmitting}
											className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
											title="Редактировать"
										>
											✏️
										</button>
										<button
											onClick={() => handleDelete(a.id)}
											disabled={isDeleting || isSubmitting}
											className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
											title="Удалить"
										>
											🗑️
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* 2. Форма (Основное место) - W-2/3 */}
			<div className="w-2/3 flex flex-col bg-gray-50 p-6 rounded shadow-lg border overflow-y-auto">
				<h2 id="article-form-title" className="text-2xl font-bold mb-4 text-gray-800">
					{isEditing ? `📝 Редактировать статью: ${form.title}` : '✨ Создать новую статью'}
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">

					{/* Поле: Заголовок */}
					<label className="block">
						<span className="text-gray-700 font-medium mb-1 block">Заголовок статьи:</span>
						<input
							type="text"
							placeholder="Введите заголовок"
							value={form.title}
							onChange={onTitleChange}
							className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
							required
						/>
					</label>

					{/* Поле: Раздел */}
					<label className="block">
						<span className="text-gray-700 font-medium mb-1 block">Раздел:</span>
						<select
							value={form.sectionId}
							onChange={onSectionChange}
							className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
							required
						>
							<option value={0} disabled>Выберите раздел</option>
							{sections.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</label>

					{/* Поле: Изображение */}
					<div className="flex gap-4 items-center border p-4 rounded bg-white">
						<div className="flex-grow">
							<span className="text-gray-700 font-medium mb-1 block">Изображение обложки:</span>
							<input
								type="file"
								accept="image/*"
								onChange={onImageChange}
								className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							/>
							{form.imageFile && (
								<p className="text-xs mt-2 text-green-600">
									Новый файл: **{form.imageFile.name}** будет загружен.
								</p>
							)}
						</div>

						{/* Предпросмотр изображения */}
						{(form.currentImageUrl && !form.imageFile) && (
							<div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
								<Image
									src={form.currentImageUrl}
									alt="Текущее изображение"
									fill
									style={{ objectFit: "cover" }}
									className="border border-gray-300"
									unoptimized
								/>
							</div>
						)}
						{form.imageFile && (
							<div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
								<Image
									src={URL.createObjectURL(form.imageFile)}
									alt="Предпросмотр нового изображения"
									fill
									style={{ objectFit: "cover" }}
									className="border border-blue-500"
									unoptimized
								/>
							</div>
						)}
					</div>

					{/* Поле: Контент (RichTextEditor) */}
					<label className="block">
						<span className="text-gray-700 font-medium mb-1 block">Содержимое статьи:</span>
						<RichTextEditor content={form.contentHtml} onChange={onContentChange} />
					</label>

					{/* Кнопки действий */}
					<div className='flex gap-4 mt-2'>
						<button
							type="submit"
							disabled={isSubmitting || !isFormValid}
							className={`
                                flex-grow bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold transition-colors
                                hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
                                ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
						>
							{isSubmitting
								? (isEditing ? 'Обновление...' : 'Создание...')
								: (isEditing ? '💾 Обновить статью' : '➕ Создать статью')}
						</button>

						{/* Кнопка сброса/отмены */}
						<button
							type="button"
							onClick={() => setForm(initialFormState)}
							disabled={isSubmitting}
							className={`
                                px-6 py-3 rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-100 transition-colors
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
						>
							{isEditing ? 'Отмена (Новая статья)' : 'Сброс'}
						</button>
					</div>

					{isEditing && (
						<p className="text-sm text-gray-500 italic mt-3">
							Вы редактируете статью с ID **{form.id}** в разделе **{currentSectionName}**.
						</p>
					)}
				</form>
			</div>
		</div>
	);
}