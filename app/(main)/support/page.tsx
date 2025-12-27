import React from "react";
import SupportInstructions from './components/SupportInstructions';
import DonationForm from './components/DonationForm';
import PaymentSecurityInfo from './components/PaymentSecurityInfo';


export default function SupportPage() {
	return (
		<div className="bg-white py-4 md:py-5 min-h-screen">
			<div className="container mx-auto px-4 max-w-5xl">
				<header className="text-center mb-12">
					<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 uppercase">
						Падтрымаць праект
					</h1>
					<p className="text-xl text-gray-600 font-light">
						Дапамажыце нам развіваць сэнсавы турызм
					</p>
				</header>

				{/* Тэкст як на сайце */}
				<SupportInstructions />

				<hr className="my-8" />

				{/* Форма */}
				<DonationForm />

				{/* Бяспека */}
				<PaymentSecurityInfo />
			</div>
		</div>
	);
}
