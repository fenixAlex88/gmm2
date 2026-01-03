// app/api/log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logVisit } from '@/lib/analytics';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { path } = body;

		// Бяром дадзеныя напрамую з запыту, які прыйшоў ад браўзера
		const sessionId = req.cookies.get('session_id')?.value;
		const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

		if (!path) return NextResponse.json({ error: 'No path' }, { status: 400 });

		await logVisit({
			ip: ip.replace('::ffff:', ''),
			sessionId: sessionId || 'unknown',
			path
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ success: false }, { status: 500 });
	}
}