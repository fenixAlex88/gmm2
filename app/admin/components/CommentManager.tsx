'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Trash2, RotateCcw } from 'lucide-react';

export default function CommentManager({ articleId }: { articleId: number }) {
	const [comments, setComments] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchComments = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/admin/comments?articleId=${articleId}`);
			if (res.ok) {
				const data = await res.json();
				setComments(data);
			}
		} finally {
			setIsLoading(false);
		}
	}, [articleId]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const deleteComment = async (id: number) => {
		if (!confirm('Выдаліць гэты каментарый?')) return;
		const res = await fetch('/api/admin/comments', {
			method: 'DELETE',
			body: JSON.stringify({ id })
		});
		if (res.ok) {
			setComments(prev => prev.filter(c => c.id !== id));
		}
	};

	return (
		<div className="pt-10 border-t border-slate-100 pb-20">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
					<MessageSquare size={22} className="text-amber-500" />
					Каментарыі ({comments.length})
				</h3>
				<button
					onClick={fetchComments}
					disabled={isLoading}
					className="p-2 text-slate-400 hover:text-amber-600 transition-colors disabled:animate-spin"
				>
					<RotateCcw size={18} />
				</button>
			</div>

			<div className="grid gap-4">
				{comments.length === 0 ? (
					<p className="text-sm text-slate-400 italic">Каментарыяў пакуль няма</p>
				) : (
					comments.map(comment => (
						<div key={comment.id} className="flex items-start justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-black text-sm text-slate-700">{comment.authorName}</span>
									<span className="text-[10px] text-slate-400 font-bold uppercase">
										{new Date(comment.createdAt).toLocaleDateString()}
									</span>
								</div>
								<p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
							</div>
							<button
								onClick={() => deleteComment(comment.id)}
								className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
							>
								<Trash2 size={18} />
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}