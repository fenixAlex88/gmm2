import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
	// Атрымліваем доступ да кукаў
	const cookieStore = await cookies();

	// Выдаляем куку сесіі адмінкі
	cookieStore.delete('admin_session');

	// Перанакіроўваем на старонку ўваходу
	const loginUrl = new URL('/login', request.url);

	return NextResponse.redirect(loginUrl);
}