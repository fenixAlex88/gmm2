'use client';
import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import dynamic from 'next/dynamic';

// Дынамічны імпарт з адключаным SSR
const MapComponentInner = dynamic(() => import('./MapComponentInner'), {
	ssr: false,
	loading: () => (
		<div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
			Загрузка карты...
		</div>
	)
});


export default function MapComponent({ node }: NodeViewProps) {
	const markers = (node.attrs.markers as Array<{ lat: number; lng: number; label?: string }>) || [];

	return (
		<NodeViewWrapper className="my-4">
			<div
				className="h-[300px] w-full border rounded-xl overflow-hidden shadow-inner"
				contentEditable={false}
			>
				<MapComponentInner markers={markers} />
			</div>
		</NodeViewWrapper>
	);
}