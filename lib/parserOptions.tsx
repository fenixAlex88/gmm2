// lib/parserOptions.tsx
import { Element, HTMLReactParserOptions } from 'html-react-parser';
import CarouselDisplay from '@/components/CarouselDisplay';
import { AudioDisplay, PdfDisplay, VideoDisplay } from '@/components/rich-text-editor/MediaDisplay';

export const getParserOptions = (): HTMLReactParserOptions => ({
  replace: (node) => {
    if (!(node instanceof Element)) return;

    // Карусель
    if (node.name === 'div' && node.attribs['data-type'] === 'carousel') {
      try {
        const images = JSON.parse(node.attribs['data-images'] || '[]');
        const interval = node.attribs['interval'] ? parseInt(node.attribs['interval']) : 3000;
        return <CarouselDisplay images={images} interval={interval} />;
      } catch { return null; }
    }

    // Видео и Аудио
    if (node.name === 'video') return <VideoDisplay src={node.attribs.src} />;
    if (node.name === 'audio') return <AudioDisplay src={node.attribs.src} />;

    // PDF
    if (node.attribs['data-type'] === 'pdf' || node.attribs.class?.includes('media-wrapper')) {
      const iframe = node.children.find(child => child instanceof Element && child.name === 'iframe') as Element;
      const rawSrc = iframe?.attribs.src || node.attribs.src;
      if (rawSrc) return <PdfDisplay src={rawSrc.split('#')[0]} />;
    }
  }
});