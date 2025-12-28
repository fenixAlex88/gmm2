'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { Send, User, MessageCircle, ChevronDown } from 'lucide-react';

interface IComment {
	id: number;
	content: string;
	authorName: string;
	authorImage: string | null;
	createdAt: string | Date;
}

interface CommentSectionProps {
	articleId: number;
	initialComments: IComment[];
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<IComment[]>(initialComments);
	const [text, setText] = useState('');
	const [isSending, setIsSending] = useState(false);

	// Состояние для ленивой загрузки
	const [limit, setLimit] = useState(5);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || isSending) return;

		setIsSending(true);
		try {
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text, articleId }),
			});

			if (res.ok) {
				const newComment = await res.json();
				setComments(prev => [newComment, ...prev]);
				setText('');
			}
		} catch {
			alert('Ошибка при отправке комментария');
		} finally {
			setIsSending(false);
		}
	};

	const hasMore = comments.length > limit;
	const visibleComments = comments.slice(0, limit);

	return (
		<div className="max-w-2xl mx-auto">
			{/* Живой счетчик */}
			<div className="flex items-center gap-3 mb-10">
				<div className="p-3 bg-slate-900 rounded-2xl text-white">
					<MessageCircle size={24} />
				</div>
				<h3 className="text-2xl font-black text-slate-900">
					Обсуждение ({comments.length})
				</h3>
			</div>

			{/* Форма */}
			<div className="mb-12">
				{session ? (
					<form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200">
								{session.user?.image ? (
									<Image src={session.user.image} alt="avatar" fill className="object-cover" />
								) : (
									<User size={16} className="m-auto mt-2 text-slate-400" />
								)}
							</div>
							<span className="text-sm font-bold text-slate-700">{session.user?.name}</span>
						</div>
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Напишите комментарий..."
							className="w-full bg-white border-none rounded-2xl p-4 text-slate-600 focus:ring-2 focus:ring-amber-500 min-h-[100px] resize-none"
						/>
						<button
							type="submit"
							disabled={isSending || !text.trim()}
							className="mt-3 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
						>
							{isSending ? 'Публикация...' : <><Send size={18} /> Отправить</>}
						</button>
					</form>
				) : (
					<div className="text-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
						<button onClick={() => signIn('google')} className="bg-white border px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all">
							Войти, чтобы комментировать
						</button>
					</div>
				)}
			</div>

			{/* Список с ленивой загрузкой */}
			<div className="space-y-8">
				{visibleComments.map((comment) => (
					<div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
						<div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
							{comment.authorImage ? (
								<Image src={comment.authorImage} alt="" fill className="object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-xs">
									{comment.authorName.charAt(0)}
								</div>
							)}
						</div>
						<div className="flex-grow">
							<div className="flex items-center gap-2 mb-1">
								<span className="font-bold text-slate-900 text-sm">{comment.authorName}</span>
								<span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
									{new Date(comment.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none inline-block">
								<p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
							</div>
						</div>
					</div>
				))}

				{hasMore && (
					<button
						onClick={() => setLimit(prev => prev + 5)}
						className="w-full py-4 flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-amber-600 transition-colors border-t border-slate-50 mt-4"
					>
						Показать еще <ChevronDown size={18} />
					</button>
				)}
			</div>
		</div>
	);
}