// Видео с кастомным оформлением
export const PublicVideo = ({ src }: { src: string }) => (
  <div className="my-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video">
    <video src={src} controls className="w-full h-full" />
  </div>
);

// PDF с красивой рамкой и кнопкой скачивания
export const PublicPdf = ({ src }: { src: string }) => (
  <div className="my-12 border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-white">
    <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
      <span className="font-bold text-slate-700">📄 Документ PDF</span>
      <a href={src} download className="text-amber-600 text-sm hover:underline">Скачать оригинал</a>
    </div>
    <iframe src={`${src}#toolbar=0`} className="w-full h-[600px]" />
  </div>
);

// Аудио в стиле карточки
export const PublicAudio = ({ src }: { src: string }) => (
  <div className="my-8 p-6 bg-gradient-to-r from-slate-50 to-white rounded-3xl border shadow-sm flex flex-col gap-3">
    <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Аудиозапись</span>
    <audio src={src} controls className="w-full" />
  </div>
);