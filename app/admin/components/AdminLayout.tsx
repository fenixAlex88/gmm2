'use client';

import { useState } from 'react';
import ArticleForm from './ArticleForm';
import { IArticle } from '@/interfaces/IArticle';
import Sidebar from './Sidebar';

export default function AdminLayout({ initialArticles, sections, metadata }: any) {
	const [articles, setArticles] = useState(initialArticles);
	const [selectedArticle, setSelectedArticle] = useState<any>(null);

	const refreshData = async () => {
		const res = await fetch('/api/admin/articles');
		const data = await res.json();
		setArticles(data);
	};

	return (
		<div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 max-w-full">
			<Sidebar
				articles={articles}
				metadata={metadata}
				onSelect={setSelectedArticle}
				selectedId={selectedArticle?.id}
				onRefresh={refreshData}
			/>
			<main className="flex-grow flex flex-col bg-white overflow-hidden relative">
				<ArticleForm
					article={selectedArticle}
					sections={sections}
					metadata={metadata}
					onSuccess={() => {
						setSelectedArticle(null);
						refreshData();
					}}
					onReset={() => setSelectedArticle(null)}
				/>
			</main>
		</div>
	);
}