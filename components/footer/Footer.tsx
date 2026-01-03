'use client';

import { useState } from 'react';
import AboutProjectModal from '../modals/AboutProjectModal';
import FooterNav from './FooterNav';
import FooterSocials from './FooterSocials';
import FooterContact from './FooterContact';
import FooterLogos from './FooterLogos';

const Footer: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<footer className="w-full bg-[#800000] text-white flex flex-col">
				<div className="container mx-auto px-4 py-2 md:py-3 flex flex-col gap-5 md:gap-8">
					<FooterNav onOpenModal={openModal} />
					<FooterSocials />
					<FooterContact />
				</div>
				<FooterLogos />
			</footer>
			<AboutProjectModal isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
};

export default Footer;