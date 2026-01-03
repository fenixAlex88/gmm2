'use client';

import { useState } from 'react';
import ArticleForm from './ArticleForm';
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';

interface Props {
	initialArticles: any[];
	sections: any[];
	metadata: any;
}

export default function AdminLayout({ initialArticles, sections, metadata }: Props) {
	const router = useRouter();
	const [articles, setArticles] = useState(initialArticles);
	const [selectedArticle, setSelectedArticle] = useState<any>(null);

	// Функцыя абнаўлення спіса артыкулаў
	const refreshData = async () => {
		try {
			const res = await fetch('/api/admin/articles');
			const data = await res.json();
			// Пераканайцеся, што API таксама вяртае 'likes' як лічбу
			setArticles(data);
		} catch (err) {
			console.error("Памылка абнаўлення:", err);
		}
	};

	const refreshMetadata = () => {
		router.refresh();
	};

	return (
		<div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 max-w-full">
			<Sidebar
				articles={articles}
				metadata={metadata}
				onSelect={setSelectedArticle}
				selectedId={selectedArticle?.id}
				onRefresh={refreshData}
				refreshMetadata={refreshMetadata}
			/>
			<main className="flex-grow flex flex-col bg-white overflow-hidden relative">
				<ArticleForm
					article={selectedArticle}
					sections={sections}
					metadata={metadata}
					onSuccess={() => {
						setSelectedArticle(null);
						refreshData();
						router.refresh(); // Абнаўляем і метададзеныя
					}}
					onReset={() => setSelectedArticle(null)}
				/>
			</main>
		</div>
	);
}