'use client';

import { useState } from 'react';
import ArticleForm from './ArticleForm';
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ initialArticles, sections, metadata }: any) {
	const router = useRouter();

	const [articles, setArticles] = useState(initialArticles);
	const [selectedArticle, setSelectedArticle] = useState<any>(null);

	const refreshData = async () => {
		const res = await fetch('/api/admin/articles');
		const data = await res.json();
		setArticles(data);
	};

	const refreshMetadata = async () => {
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
					}}
					onReset={() => setSelectedArticle(null)}
				/>
			</main>
		</div>
	);
}