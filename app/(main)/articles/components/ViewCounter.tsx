'use client';
import { useEffect } from 'react';
import { incrementViewsAction } from '@/app/actions/articles';

export default function ViewCounter({ articleId }: { articleId: number }) {
	useEffect(() => {
		incrementViewsAction(articleId);
	}, [articleId]);

	return null;
}