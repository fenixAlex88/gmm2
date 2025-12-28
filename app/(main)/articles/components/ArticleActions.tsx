'use client';
import { useState, useRef, useEffect } from 'react';
import {
	Heart, Send, X, Link as LinkIcon, Check,
	MessageCircle, Share2, ChevronDown
} from 'lucide-react';

interface Props {
	articleId: number;
	initialLikes: number;
	title: string;
}

export default function ArticleActions({ articleId, initialLikes, title }: Props) {
	const [likes, setLikes] = useState(initialLikes);
	const [isLiked, setIsLiked] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Закрытие меню при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLike = async () => {
		if (isLiked) return;
		setIsLiked(true);
		setLikes(prev => prev + 1);
		try {
			const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
			const data = await res.json();
			if (data.likes) setLikes(data.likes);
		} catch {
			setIsLiked(false);
			setLikes(prev => prev - 1);
		}
	};

	const shareOptions = [
		{ id: 'tg', name: 'Telegram', icon: <Send size={16} />, color: 'text-[#0088cc]', bg: 'bg-sky-50' },
		{ id: 'vk', name: 'ВКонтакте', icon: <span className="font-bold text-[10px]">VK</span>, color: 'text-[#4C75A3]', bg: 'bg-blue-50' },
		{ id: 'wa', name: 'WhatsApp', icon: <MessageCircle size={16} />, color: 'text-[#25D366]', bg: 'bg-emerald-50' },
		{ id: 'vb', name: 'Viber', icon: <MessageCircle size={16} className="rotate-12" />, color: 'text-[#7360F2]', bg: 'bg-purple-50' },
		{ id: 'ok', name: 'Одноклассники', icon: <span className="font-bold text-[10px]">OK</span>, color: 'text-[#EE8208]', bg: 'bg-orange-50' },
		{ id: 'tw', name: 'Twitter (X)', icon: <X size={14} />, color: 'text-slate-900', bg: 'bg-slate-50' },
		{ id: 'pt', name: 'Pinterest', icon: <Share2 size={16} />, color: 'text-[#E60023]', bg: 'bg-rose-50' },
	];

	const handleShare = (id: string) => {
		const url = encodeURIComponent(window.location.href);
		const text = encodeURIComponent(title);
		const links: Record<string, string> = {
			vk: `https://vk.com/share.php?url=${url}&title=${text}`,
			ok: `https://connect.ok.ru/offer?url=${url}&title=${text}`,
			tg: `https://t.me/share/url?url=${url}&text=${text}`,
			tw: `https://x.com/intent/tweet?url=${url}&text=${text}`,
			vb: `viber://forward?text=${text}%20${url}`,
			wa: `https://api.whatsapp.com/send?text=${text}%20${url}`,
			pt: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
		};
		window.open(links[id], '_blank', 'noopener,noreferrer');
		setIsMenuOpen(false);
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) { console.error(err); }
	};

	return (
		<div className="flex flex-col gap-6 py-8 border-y border-slate-100 my-8">
			<div className="flex items-center justify-between gap-4">
				{/* Кнопка Лайка */}
				<button
					onClick={handleLike}
					disabled={isLiked}
					className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl transition-all font-bold shadow-sm border ${isLiked
							? 'bg-rose-500 border-rose-500 text-white'
							: 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500'
						}`}
				>
					<Heart size={18} className={isLiked ? 'fill-current' : ''} />
					<span className="text-base">{likes.toLocaleString()}</span>
				</button>

				<div className="flex items-center gap-3" ref={menuRef}>
					{/* Кнопка Копирования */}
					<button
						onClick={copyToClipboard}
						className={`p-2.5 rounded-xl transition-all border ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
							}`}
						title="Скапіяваць спасылку"
					>
						{copied ? <Check size={18} /> : <LinkIcon size={18} />}
					</button>

					{/* Выпадающее меню "Поделиться" */}
					<div className="relative">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${isMenuOpen
									? 'bg-slate-900 border-slate-900 text-white'
									: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
								}`}
						>
							<Share2 size={18} />
							<span className="hidden sm:inline">Падзяліцца</span>
							<ChevronDown size={16} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
						</button>

						{/* Список соцсетей */}
						{isMenuOpen && (
							<div className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
								<div className="grid grid-cols-1 gap-0">
									{shareOptions.map((option) => (
										<button
											key={option.id}
											onClick={() => handleShare(option.id)}
											className="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
										>
											<div className={`w-8 h-8 flex items-center justify-center rounded-lg ${option.bg} ${option.color}`}>
												{option.icon}
											</div>
											<span className="text-sm font-semibold text-slate-700">{option.name}</span>
										</button>
									))}
								</div>
								<div className="mt-2 pt-2 border-t border-slate-50 px-2 pb-1">
									<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Выберыце платформу</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}