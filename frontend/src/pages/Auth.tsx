import { useState, useEffect } from "react";
import { IconoPlus } from "../components/Iconos";

interface AuthProps {
	modoInicial?: "login" | "register";
	onSuccess: (esRegistro: boolean) => void;
}

export function Auth({ modoInicial = "login", onSuccess }: AuthProps) {
	// Inicializa según lo que pidió el botón que lo abrió
	const [esLogin, setEsLogin] = useState(modoInicial === "login");
	const [cuit, setCuit] = useState("");
	const [password, setPassword] = useState("");
	const [razonSocial, setRazonSocial] = useState("");
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Si cambia el modo desde afuera mientras está abierto, actualiza la pestaña
	useEffect(() => {
		setEsLogin(modoInicial === "login");
		setError(null);
	}, [modoInicial]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setCargando(true);

		const endpoint = esLogin ? "/api/auth/login" : "/api/auth/register";
		const payload = esLogin
			? { cuit, password }
			: { cuit, password, razonSocial };

		try {
			const res = await fetch(`http://localhost:3000${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Error al procesar la solicitud");
			}

			onSuccess(!esLogin);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setCargando(false);
		}
	};

	return (
		<div className='w-full max-w-md space-y-6'>
			{/* Cabecera / Marca */}
			<div className='text-center space-y-2'>
				<span className='text-2xl font-black text-sky-400 tracking-wider'>
					FacturAR
				</span>
				<h1 className='text-xl font-bold text-white tracking-tight'>
					{esLogin ? "Ingresá a tu panel" : "Creá tu cuenta fiscal"}
				</h1>
				<p className='text-xs text-slate-400'>
					{esLogin
						? "Gestioná tus comprobantes y controlá tu categoría"
						: "Automatizá tu facturación electrónica en pocos pasos"}
				</p>
			</div>

			{/* Tarjeta del Formulario */}
			<div className='bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(56,189,248,0.06)]'>
				{/* Selector Login / Registro (Permite alternar libremente) */}
				<div className='flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6'>
					<button
						type='button'
						onClick={() => {
							setEsLogin(true);
							setError(null);
						}}
						className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
							esLogin
								? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
								: "text-slate-400 hover:text-white"
						}`}
					>
						Iniciar Sesión
					</button>
					<button
						type='button'
						onClick={() => {
							setEsLogin(false);
							setError(null);
						}}
						className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
							!esLogin
								? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
								: "text-slate-400 hover:text-white"
						}`}
					>
						Registrarse
					</button>
				</div>

				{error && (
					<div className='bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl mb-4'>
						⚠️ {error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-4'>
					{!esLogin && (
						<div>
							<label className='block text-xs font-medium text-slate-300 mb-1'>
								Nombre o Razón Social
							</label>
							<input
								type='text'
								required
								value={razonSocial}
								onChange={(e) => setRazonSocial(e.target.value)}
								placeholder='ej. María Luz Gómez'
								className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500'
							/>
						</div>
					)}

					<div>
						<label className='block text-xs font-medium text-slate-300 mb-1'>
							CUIT (sin guiones)
						</label>
						<input
							type='text'
							required
							maxLength={11}
							value={cuit}
							onChange={(e) => setCuit(e.target.value.replace(/\D/g, ""))}
							placeholder='20384920184'
							className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500'
						/>
					</div>

					<div>
						<label className='block text-xs font-medium text-slate-300 mb-1'>
							Contraseña
						</label>
						<input
							type='password'
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='••••••••'
							className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500'
						/>
					</div>

					<button
						type='submit'
						disabled={cargando}
						className='w-full mt-2 py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer'
					>
						{cargando
							? "Procesando..."
							: esLogin
							? "Entrar a mi panel"
							: "Crear cuenta"}
					</button>
				</form>
			</div>
		</div>
	);
}
