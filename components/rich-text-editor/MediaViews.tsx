import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Music, Film } from 'lucide-react';

// Компонент для видео
export const VideoView = (props: NodeViewProps) => {
	const { src } = props.node.attrs;
	return (
		<NodeViewWrapper className="my-8 block">
				{src ? (
					<div className='m-8'>
						<video src={src} controls className="w-full h-full" />
					</div>
				) : (
					<div className="text-white flex flex-col items-center">
						<Film size={48} />
						<p>Видео не загружено</p>
					</div>
				)}
		</NodeViewWrapper>
	);
};

// Компонент для аудио
export const AudioView = (props: NodeViewProps) => {
	const { src } = props.node.attrs;
	return (
		<NodeViewWrapper className="my-4 p-4 bg-slate-200 rounded-lg border-2 border-blue-500 flex items-center gap-4">
			<Music className="text-slate-600" />
			<audio src={src} controls className="flex-1" />
		</NodeViewWrapper>
	);
};

// Компонент для PDF
export const PdfView = (props: NodeViewProps) => {
	const { src } = props.node.attrs;

	return (
		<NodeViewWrapper className="pdf-view-admin my-4">
			<div className="bg-slate-100 p-4 rounded-t-lg border border-b-0 flex items-center justify-between">
				<span className="text-xs font-bold text-slate-500 uppercase">Предпросмотр PDF (Админ)</span>
			</div>
			<div className="border rounded-b-lg overflow-hidden bg-white">
				{src ? (
					<iframe
						src={`${src}#toolbar=0`}
						className="w-full h-[400px] pointer-events-none"
					/>
				) : (
					<div className="p-10 text-center text-slate-400">Файл не выбран</div>
				)}
			</div>
		</NodeViewWrapper>
	);
};