import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { revalidateTag } from 'next/cache';

interface ArticleInput {
    id?: number;
    priority?: number | null;
    title: string;
    description?: string | null;
    contentHtml: string;
    sectionId: number;
    imageUrl?: string | null;
    authorName?: string | null;
    tagNames?: string[];
    placeNames?: string[];
    subjectNames?: string[];
}

// Выманне файлаў з HTML
function extractFilesFromHtml(html: string): string[] {
    const $ = cheerio.load(html);
    const files: string[] = [];

    $('img, video, audio, source, iframe').each((_, el) => {
        const src = $(el).attr('src');
        if (src) files.push(src);
    });

    $('[data-type="carousel"]').each((_, el) => {
        try {
            const data = $(el).attr('data-images');
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) files.push(...parsed);
            }
        } catch {
            // Ігнаруем памылкі парсінгу
        }
    });
    return [...new Set(files)];
}

// Выдаленне файла з дыска
async function deleteFile(fileUrl: string | null | undefined) {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    const cleanPath = fileUrl.split(/[?#]/)[0].substring(1);
    const filePath = path.join(process.cwd(), 'public', cleanPath);
    try {
        await unlink(filePath);
    } catch (error: any) {
        if (error.code !== 'ENOENT') console.error(`Памылка выдалення файла: ${filePath}`, error);
    }
}

// Логіка кіравання прыярытэтамі (ТОП-16)
async function handlePriority(newPriority: number | null | undefined, currentArticleId?: number) {
    if (!newPriority) return;

    await prisma.$transaction(async (tx) => {
        // 1. Ссоўваем артыкулы, каб вызваліць месца
        await tx.article.updateMany({
            where: {
                priority: { gte: newPriority },
                NOT: currentArticleId ? { id: currentArticleId } : undefined
            },
            data: { priority: { increment: 1 } }
        });

        // 2. Пераразмяркоўваем прыярытэты, каб не было "дзірак"
        const activeArticles = await tx.article.findMany({
            where: {
                priority: { not: null },
                NOT: currentArticleId ? { id: currentArticleId } : undefined
            },
            orderBy: { priority: 'asc' },
            select: { id: true, priority: true }
        });

        let nextPos = 1;
        for (const art of activeArticles) {
            if (nextPos === newPriority) nextPos++;
            
            if (art.priority !== nextPos) {
                const finalPriority = nextPos > 16 ? null : nextPos;
                await tx.article.update({
                    where: { id: art.id },
                    data: { priority: finalPriority }
                });
            }
            nextPos++;
        }
    });
}

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            include: { 
                section: true, 
                author: true, 
                tags: true, 
                places: true, 
                subjects: true,
                _count: { select: { likesRel: true } } // Падлік лайкаў
            },
            orderBy: { id: 'desc' },
        });

        // Трансфармуем для фронтэнда (пераўтвараем _count у likes)
        const mappedArticles = articles.map(a => ({
            ...a,
            likes: a._count.likesRel
        }));

        return NextResponse.json(mappedArticles);
    } catch (error) {
        return NextResponse.json({ error: 'Памылка атрымання дадзеных' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data: ArticleInput = await req.json();
        const {
            priority, title, description, contentHtml, sectionId, imageUrl,
            authorName, tagNames = [], placeNames = [], subjectNames = []
        } = data;

        if (priority) await handlePriority(priority);

        const article = await prisma.article.create({
            data: {
                priority,
                title,
                description,
                contentHtml,
                imageUrl,
                section: { connect: { id: Number(sectionId) } },
                author: authorName ? {
                    connectOrCreate: {
                        where: { name: authorName },
                        create: { name: authorName }
                    }
                } : undefined,
                tags: {
                    connectOrCreate: tagNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                },
                places: {
                    connectOrCreate: placeNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                },
                subjects: {
                    connectOrCreate: subjectNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                }
            },
            include: { section: true, author: true, tags: true, places: true, subjects: true }
        });

        revalidateTag('articles', 'max');
        return NextResponse.json(article);
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Памылка стварэння' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data: ArticleInput = await req.json();
        const {
            id, priority, title, description, contentHtml, sectionId, imageUrl,
            authorName, tagNames = [], placeNames = [], subjectNames = []
        } = data;

        const oldArticle = await prisma.article.findUnique({
            where: { id },
            include: { tags: true, places: true, subjects: true }
        });

        if (!oldArticle) return NextResponse.json({ error: 'Не знойдзена' }, { status: 404 });

        // Выдаленне старых файлаў, якіх больш няма ў тэксце
        const oldFiles = [oldArticle.imageUrl, ...extractFilesFromHtml(oldArticle.contentHtml)];
        const newFiles = [imageUrl, ...extractFilesFromHtml(contentHtml)];
        const deletedFiles = oldFiles.filter(f => f && !newFiles.includes(f));
        await Promise.allSettled(deletedFiles.map(deleteFile));

        if (priority !== oldArticle.priority) {
            await handlePriority(priority, id);
        }

        const updated = await prisma.article.update({
            where: { id },
            data: {
                priority,
                title,
                description,
                contentHtml,
                imageUrl,
                section: { connect: { id: Number(sectionId) } },
                author: authorName ? {
                    connectOrCreate: {
                        where: { name: authorName },
                        create: { name: authorName }
                    }
                } : { disconnect: true },
                tags: {
                    set: [], // Скідаем старыя сувязі
                    connectOrCreate: tagNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                },
                places: {
                    set: [], 
                    connectOrCreate: placeNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                },
                subjects: {
                    set: [],
                    connectOrCreate: subjectNames.map(name => ({
                        where: { name }, create: { name }
                    }))
                }
            },
            include: { section: true, author: true, tags: true, places: true, subjects: true }
        });

		revalidateTag(`article-${id}`, 'max');
		revalidateTag('articles', 'max');
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json({ error: 'Памылка абнаўлення' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get('id'));

        if (!id) return NextResponse.json({ error: 'ID не паказаны' }, { status: 400 });

        const article = await prisma.article.findUnique({
            where: { id }
        });

        if (article) {
            // Выдаляем файлы
            const files = [article.imageUrl, ...extractFilesFromHtml(article.contentHtml)]
                .filter(Boolean) as string[];
            await Promise.allSettled(files.map(deleteFile));

            // Выдаляем артыкул (лайкі і каментары выдаляцца аўтаматычна праз Cascade ў схеме)
            await prisma.article.delete({ where: { id } });
        }

		revalidateTag(`article-${id}`, 'max');
		revalidateTag('articles', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_ERROR:", error);
        return NextResponse.json({ error: 'Памылка выдалення' }, { status: 500 });
    }
}