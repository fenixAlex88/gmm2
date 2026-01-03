'use client';

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { login } from '@/app/actions/auth';


function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<button
			disabled={pending}
			type="submit"
			aria-busy={pending}
			className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-amber-200 outline-none"
		>
			{pending ? (
				<span className="flex items-center justify-center gap-2">
					<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Уваход...
				</span>
			) : "Увайсці"}
		</button>
	);
}

export default function LoginPage() {
	const [state, action] = useActionState(login, null);
	const [showPassword, setShowPassword] = useState(false);

	return (
		<main className="flex items-center justify-center min-h-[70vh] px-4">
			<section className="w-full max-w-md" aria-labelledby="login-title">
				<div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transition-all">

					<header className="flex flex-col items-center mb-8">
						<div
							className="p-4 bg-amber-100 rounded-full text-amber-600 mb-4"
							aria-hidden="true"
						>
							<Lock size={32} />
						</div>
						<h1
							id="login-title"
							className="text-3xl font-extrabold text-center text-slate-900 tracking-tight"
						>
							Уваход для адміна
						</h1>
						<p className="mt-2 text-slate-500 text-sm text-center">
							Калі ласка, увядзіце пароль для доступу да панэлі кіравання
						</p>
					</header>

					<form action={action} className="space-y-6">
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-semibold text-slate-700 ml-1"
							>
								Пароль доступу
							</label>

							<div className="relative group">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									required
									autoComplete="current-password"
									aria-invalid={!!state?.error}
									aria-describedby={state?.error ? "password-error" : undefined}
									className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all pr-12 text-slate-800 placeholder:text-slate-300 shadow-sm group-hover:border-slate-300"
									placeholder="Ваш сакрэтны пароль"
								/>

								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Схаваць пароль" : "Паказаць пароль"}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-amber-100"
								>
									{showPassword ? (
										<EyeOff size={20} aria-hidden="true" />
									) : (
										<Eye size={20} aria-hidden="true" />
									)}
								</button>
							</div>
						</div>

						<div aria-live="polite" id="password-error">
							{state?.error && (
								<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg animate-in fade-in slide-in-from-top-1">
									<svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="12"></line>
										<line x1="12" y1="16" x2="12.01" y2="16"></line>
									</svg>
									{state.error}
								</div>
							)}
						</div>

						<SubmitButton />
					</form>
				</div>
			</section>
		</main>
	);
}