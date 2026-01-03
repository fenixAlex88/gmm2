// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


interface AuthState {
	error?: string;
}


export async function login(prevState: AuthState | null, formData: FormData) {
	const password = formData.get('password') as string;

	if (password === process.env.ADMIN_PASSWORD) {
		const cookieStore = await cookies();
		cookieStore.set('admin_session', process.env.ADMIN_SECRET!, {
			httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		});

		redirect('/admin');
	} else {
		return { error: 'Няправільны пароль' };
	}
}