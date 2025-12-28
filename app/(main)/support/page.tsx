import React from "react";
import SupportInstructions from './components/SupportInstructions';
import DonationForm from './components/DonationForm';
import PaymentSecurityInfo from './components/PaymentSecurityInfo';


export default function SupportPage() {
	return (
		<div className="bg-white py-4 md:py-5 min-h-screen">
			<div className="container mx-auto px-4 max-w-5xl">
				<header className="text-center mb-16">
					<span className="text-[#800000] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
						Дапамога праекту
					</span>
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
						Падтрымаць праект
					</h1>
					<div className="w-20 h-1.5 bg-[#800000] mx-auto mb-6"></div>
					<p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
						Ваш унёсак дапаможа нам ствараць новыя маршруты і захоўваць спадчыну беларускіх геніяў месца.
					</p>
				</header>


				<SupportInstructions />

				<hr className="my-8" />


				<DonationForm />


				<PaymentSecurityInfo />
			</div>
		</div>
	);
}
