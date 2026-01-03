'use client';

import React, { useState } from 'react';
import { FileText, HelpCircle, Info, Compass, Users, Heart } from 'lucide-react';
import GenericNavbar from './GenericNavbar';
import HowUseModal from './modals/HowUseModal';
import HowChooseModal from './modals/HowChooseModal';
import DiffRoutesModal from './modals/DiffRoutesModal';


const MAIN_LINKS = [
	{ title: 'Галоўная', href: '/', icon: <FileText size={16} /> },
	{ title: 'Як карыстацца?', modalId: 'how-use', icon: <HelpCircle size={16} /> },
	{ title: 'Аб праекце', href: '/about_project', icon: <Info size={16} /> },
	{
		title: 'Падарожніку',
		icon: <Compass size={16} />,
		subLinks: [
			{ title: 'Як выбіраць падарожжа', modalId: 'how-choose' },
			{ title: 'Чым адрозніваюцца маршруты', modalId: 'diff-routes' },
		],
	},
	{ title: 'Партнерам', href: '/partner', icon: <Users size={16} /> },
	{ title: 'Падтрымаць', href: '/support', icon: <Heart size={16} />, highlight: true },
];

export default function NavigationBar() {
	const [activeModal, setActiveModal] = useState<string | null>(null);

	return (
		<>
			<GenericNavbar links={MAIN_LINKS} onModalClick={setActiveModal} />

			{/* Секция модальных окон */}
			<HowUseModal
				isOpen={activeModal === 'how-use'}
				onClose={() => setActiveModal(null)}
			/>
			<HowChooseModal
				isOpen={activeModal === 'how-choose'}
				onClose={() => setActiveModal(null)}
			/>
			<DiffRoutesModal
				isOpen={activeModal === 'diff-routes'}
				onClose={() => setActiveModal(null)}
			/>
		</>
	);
}