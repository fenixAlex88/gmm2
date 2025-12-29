'use client'

import { useActionState } from "react"; // Используйте этот импорт в новых версиях
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { login } from '@/app/actions/auth';

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			disabled={pending}
			type="submit"
			className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
		>
			{pending ? "Уваход..." : "Увайсці"}
		</button>
	);
}

export default function LoginPage() {
	// Теперь типы будут совпадать:
	// (state, payload) => Promise
	const [state, action] = useActionState(login, null);

	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
				<div className="flex justify-center mb-6">
					<div className="p-3 bg-amber-100 rounded-full text-amber-600">
						<Lock size={24} />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
					Уваход для адміністратара
				</h1>

				<form action={action} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">
							Пароль
						</label>
						<input
							name="password"
							type="password"
							required
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
							placeholder="••••••••"
						/>
					</div>

					{state?.error && (
						<div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
							{state.error}
						</div>
					)}

					<SubmitButton />
				</form>
			</div>
		</div>
	);
}