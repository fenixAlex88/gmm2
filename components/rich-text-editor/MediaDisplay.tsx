// MediaDisplay.tsx
import { Music } from 'lucide-react';

export const VideoDisplay = ({ src }: { src: string }) => (
	<div className="my-12 overflow-hidden rounded-xl shadow-2xl bg-black aspect-video ring-1 ring-slate-200">
		<video src={src} controls className="w-full h-full block" />
	</div>
);

export const AudioDisplay = ({ src }: { src: string }) => (
	<div className="my-10 p-6 bg-gradient-to-r from-slate-50 to-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
		<div className="bg-blue-600 p-3 rounded-full text-white shadow-md">
			<Music size={24} />
		</div>
		<audio src={src} controls className="flex-1" />
	</div>
);

export const PdfDisplay = ({ src }: { src: string }) => {
	const pdfUrl = `${src.split('#')[0]}#toolbar=0&navpanes=0&view=FitH`;

	return (
		<div className="my-12 w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white">
			<iframe
				src={pdfUrl}
				className="w-full h-[700px] block border-none"
				title="PDF Preview"
			/>
		</div>
	);
};