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

	// Закрыццё меню пры кліку па-за ім
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isMenuOpen]);

	const handleLike = async () => {
		if (isLiked) return;
		setIsLiked(true);
		setLikes(prev => prev + 1);
		try {
			const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
			if (!res.ok) throw new Error();
			const data = await res.json();
			if (data.likes !== undefined) setLikes(data.likes);
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
		} catch (err) {
			console.error("Copy failed", err);
		}
	};

	return (
		<section
			aria-label="Дзеянні з артыкулам"
			className="flex flex-col gap-6 py-8 border-y border-slate-100 my-8"
		>
			<div className="flex items-center justify-between gap-4">

				{/* Кнопка Лайка */}
				<button
					onClick={handleLike}
					disabled={isLiked}
					aria-label={isLiked ? `Вам спадабалася. Усяго лайкаў: ${likes}` : `Паставіць лайк. Зараз: ${likes}`}
					aria-pressed={isLiked}
					className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl transition-all font-bold shadow-sm border focus:ring-2 focus:ring-rose-200 outline-none ${isLiked
							? 'bg-rose-500 border-rose-500 text-white'
							: 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500'
						}`}
				>
					<Heart
						size={18}
						className={`${isLiked ? 'fill-current animate-pulse' : ''}`}
						aria-hidden="true"
					/>
					<span className="text-base tabular-nums" aria-hidden="true">
						{likes.toLocaleString()}
					</span>
				</button>

				<div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>

					{/* Кнопка Капіявання */}
					<button
						onClick={copyToClipboard}
						className={`p-2.5 rounded-xl transition-all border focus:ring-2 outline-none ${copied
								? 'bg-green-500 border-green-500 text-white ring-green-200'
								: 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 ring-slate-100'
							}`}
						title="Скапіяваць спасылку"
						aria-label={copied ? "Спасылка скапіявана" : "Скапіяваць спасылку на артыкул"}
					>
						{copied ? <Check size={18} aria-hidden="true" /> : <LinkIcon size={18} aria-hidden="true" />}
					</button>

					{/* Выпадальнае меню "Падзяліцца" */}
					<div className="relative">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							// ГЭТА ВЫПРАЎЛЯЕ ПАМЫЛКУ LIGHTHOUSE:
							aria-label="Падзяліцца артыкулам"
							aria-expanded={isMenuOpen}
							aria-haspopup="true"
							aria-controls="share-menu"
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border focus:ring-2 outline-none ${isMenuOpen
									? 'bg-slate-900 border-slate-900 text-white'
									: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
								}`}
						>
							<Share2 size={18} aria-hidden="true" />
							<span className="hidden sm:inline">Падзяліцца</span>
							<ChevronDown
								size={16}
								className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
								aria-hidden="true"
							/>
						</button>

						{/* Спіс сацсетак */}
						{isMenuOpen && (
							<div
								id="share-menu"
								role="menu"
								className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
							>
								<div className="grid grid-cols-1 gap-1">
									{shareOptions.map((option) => (
										<button
											key={option.id}
											role="menuitem"
											onClick={() => handleShare(option.id)}
											className="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left focus:bg-slate-50 outline-none"
										>
											<div
												className={`w-8 h-8 flex items-center justify-center rounded-lg ${option.bg} ${option.color}`}
												aria-hidden="true"
											>
												{option.icon}
											</div>
											<span className="text-sm font-semibold text-slate-700">
												{option.name}
											</span>
										</button>
									))}
								</div>
								<div className="mt-2 pt-2 border-t border-slate-50 px-2 pb-1">
									<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
										Выберыце платформу
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}