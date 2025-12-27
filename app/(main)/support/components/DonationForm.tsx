'use client';

import React, { useState } from "react";

const DonationForm: React.FC = () => {
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [amount, setAmount] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Здесь должна быть интеграция с bePaid
		alert(`E-mail: ${email}, Тэлефон: ${phone}, Сума: ${amount} BYN`);
		// window.location.href = "https://secure.bepaid.by/..."; 
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-amber-50 p-6 sm:p-8 rounded-xl shadow-lg border border-amber-100 space-y-6 max-w-3xl mx-auto"
		>
			<h3 className="text-2xl font-bold text-gray-800 text-center">
				Падтымаць праект
			</h3>

			<div className="space-y-4">
				<input
					type="email"
					placeholder="Ваш e-mail"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500"
				/>
				<input
					type="tel"
					placeholder="Ваш тэлефон (+375...)"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					required
					className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500"
				/>
				<input
					type="number"
					placeholder="Сума (BYN)"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					required
					className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500"
				/>
			</div>

			<div className="flex justify-center">
				<button
					type="submit"
					className="w-full sm:w-auto px-10 py-3 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 transition uppercase tracking-wider"
				>
					Падтрымаць
				</button>
			</div>
		</form>
	);
};

export default DonationForm;
