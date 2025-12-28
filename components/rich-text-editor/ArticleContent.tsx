'use client';

import React from 'react';
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';
import dynamic from 'next/dynamic';
import CarouselDisplay from '@/components/CarouselDisplay';
import { AudioDisplay, PdfDisplay, VideoDisplay } from '@/components/rich-text-editor/MediaDisplay';

// Динамически импортируем карту ТОЛЬКО на клиенте
const MapComponentInner = dynamic(() => import('@/components/rich-text-editor/MapComponentInner'), {
	ssr: false,
	loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
});

interface ArticleContentProps {
	html: string;
}

export default function ArticleContent({ html }: ArticleContentProps) {
	const options: HTMLReactParserOptions = {
		replace: (node) => {
			if (!(node instanceof Element)) return;

			// 1. КАРТА (map-block)
			if (node.name === 'map-block') {
				try {
					const markers = JSON.parse(node.attribs.markers || '[]');
					return (
						<div className="my-8 h-[400px] w-full border rounded-[2rem] overflow-hidden shadow-xl border-slate-100 isolate">
							<MapComponentInner markers={markers} />
						</div>
					);
				} catch (e) {
					console.error("Map parse error", e);
					return null;
				}
			}

			// 2. КАРУСЕЛЬ
			if (node.name === 'div' && node.attribs['data-type'] === 'carousel') {
				try {
					const images = JSON.parse(node.attribs['data-images'] || '[]');
					const interval = node.attribs['interval'] ? parseInt(node.attribs['interval']) : 3000;
					return <CarouselDisplay images={images} interval={interval} />;
				} catch { return null; }
			}

			// 3. ВИДЕО и АУДИО
			if (node.name === 'video') return <VideoDisplay src={node.attribs.src} />;
			if (node.name === 'audio') return <AudioDisplay src={node.attribs.src} />;

			// 4. PDF
			if (node.attribs['data-type'] === 'pdf' || node.attribs.class?.includes('media-wrapper')) {
				const iframe = node.children.find(child => child instanceof Element && child.name === 'iframe') as Element;
				const rawSrc = iframe?.attribs.src || node.attribs.src;
				if (rawSrc) return <PdfDisplay src={rawSrc.split('#')[0]} />;
			}
		}
	};

	return <>{parse(html, options)}</>;
}