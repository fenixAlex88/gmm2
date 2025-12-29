// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// 1. Проверяем, пытается ли пользователь попасть в защищенную зону
	// Например, если вы создадите папку app/admin
	if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/articles/create')) {

		// 2. Ищем нашу секретную куку
		const authCookie = request.cookies.get('admin_session');

		// 3. Если куки нет или она неверная — редирект на логин
		if (!authCookie || authCookie.value !== process.env.ADMIN_SECRET) {
			return NextResponse.redirect(new URL('/login', request.url));
		}
	}

	return NextResponse.next();
}

// Указываем, какие пути отслеживать
export const config = {
	matcher: ['/admin/:path*', '/articles/create/:path*', '/articles/:path*/edit'],
}