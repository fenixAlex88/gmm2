// components/AnalyticsTracker.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function AnalyticsInner() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return;

		const fullPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

		fetch('/api/log', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_LOG_SECRET || ''
			},
			body: JSON.stringify({ path: fullPath }),
		}).catch(err => console.error('Logging error:', err));
	}, [pathname, searchParams]);

	return null;
}

export default function AnalyticsTracker() {
	return (
		<Suspense fallback={null}>
			<AnalyticsInner />
		</Suspense>
	);
}