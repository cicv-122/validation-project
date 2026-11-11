// frontend/src/pages/staff/StaffLogin.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { staffApi } from '../../api/staff';
import logoEmblem from '../../assets/logo/logo-blue-white-ru.svg';

export default function StaffLogin() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (!username.trim() || !password.trim()) {
			setError('Пожалуйста, введите логин и пароль');
			return;
		}

		setLoading(true);
		try {
			await staffApi.login(username.trim(), password);
			navigate('/staff/dashboard');
		} catch (err: any) {
			const detail = err?.response?.data?.detail || 'Ошибка авторизации. Проверьте правильность введенных данных.';
			setError(detail);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
				<Link
					to="/"
					title="Вернуться на главный сайт"
					className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-slate-200/90 p-2 shadow-lg shadow-slate-200/50 mb-4 hover:scale-105 hover:border-[#283375]/40 transition-all cursor-pointer"
				>
					<img src={logoEmblem} alt="Логотип ЦНСВ" className="w-full h-full object-contain" />
				</Link>
				<h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
					Министерство просвещения Кыргызской Республики (МП КР)
				</h2>
				<h1 className="text-2xl font-black text-slate-900 tracking-tight">
					Центр независимой сертификации и валидации
				</h1>
				<p className="mt-2 text-sm font-medium text-slate-600">
					Служебный вход в рабочий кабинет сотрудника
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						{error && (
							<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
								<svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span>{error}</span>
							</div>
						)}

						<div>
							<label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
								Логин сотрудника
							</label>
							<input
								type="text"
								autoComplete="username"
								required
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Введите логин"
								className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#283375] focus:ring-2 focus:ring-[#283375]/20 outline-none text-slate-900 text-sm font-medium transition-all"
							/>
						</div>

						<div>
							<label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
								Пароль
							</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-[#283375] focus:ring-2 focus:ring-[#283375]/20 outline-none text-slate-900 text-sm font-medium transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
									title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#283375] hover:bg-[#1e265c] transition-all shadow-md shadow-[#283375]/20 flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{loading ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>Проверка доступа...</span>
								</>
							) : (
								<>
									<span>Войти в рабочий кабинет</span>
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</>
							)}
						</button>
					</form>

					<div className="mt-6 pt-6 border-t border-slate-100 text-center">
						<Link
							to="/"
							className="text-xs font-semibold text-slate-500 hover:text-[#283375] transition-colors inline-flex items-center gap-1.5"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							<span>Вернуться на главную страницу портала</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
