import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1. Пропуск статыкі і API
	if (
		pathname.includes('.') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api/') ||
		pathname.startsWith('/uploads')
	) {
		return NextResponse.next();
	}

	// 2. Вызначэнне тыпу запыту (для рэдырэктаў)
	const isDocument = request.headers.get('sec-fetch-dest') === 'document';

	// 3. АБАРОНА АДМІНКІ
	const isAdminRoute = pathname.startsWith('/admin');
	if (isAdminRoute) {
		const authCookie = request.cookies.get('admin_session');

		if (authCookie?.value !== process.env.ADMIN_SECRET) {
			if (!isDocument) return new NextResponse(null, { status: 401 });
			return NextResponse.redirect(new URL('/login', request.url));
		}
		return NextResponse.next();
	}

	// 4. КІРАВАННЕ СЕСІЯЙ (session_id)
	const response = NextResponse.next();
	let sessionId = request.cookies.get('session_id')?.value;

	if (!sessionId) {
		sessionId = uuidv4();
		response.cookies.set('session_id', sessionId, {
			maxAge: 60 * 60 * 24 * 30,
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		});
	}

	return response;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};