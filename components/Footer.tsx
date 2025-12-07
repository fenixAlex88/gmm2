'use client'; // Необходимо для управления состоянием модального окна

import Link from 'next/link';
import Image from 'next/image';
import AboutProjectModal from './AboutProjectModal';
import { useState } from 'react';

const Footer: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<footer className="w-full bg-[#800000] text-white">

				{/* 1. Секция ссылок*/}
				<div className="container mx-auto py-3">
					<ul className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 text-lg font-medium">
						<li>
							<button
								onClick={openModal}
								className="hover:text-amber-300 transition duration-200 focus:outline-none"
								aria-haspopup="dialog"
								aria-label="Аб праекце"
							>
								Аб праекце
							</button>
						</li>
						<li>
							<Link href="partner" className="hover:text-amber-300 transition duration-200">
								Партнерам
							</Link>
						</li>
						<li>
							<Link href="support" className="hover:text-amber-300 transition duration-200">
								Падтрымаць праект
							</Link>
						</li>
						<li>
							<Link href="agreement" className="hover:text-amber-300 transition duration-200">
								Публічная аферта
							</Link>
						</li>
					</ul>
				</div>

				{/* 2. Секция социальных сетей*/}
				<div className="container mx-auto px-4 py-3 flex justify-center">
					<ul className="flex space-x-6" aria-label="Соц. сети">
						{/* Instagram */}
						<li>
							<a href="https://www.instagram.com/gmmbelarus/?hl=ru" target="_blank" rel="nofollow noopener" aria-label="instagram" className="hover:opacity-75 transition">
								{/* SVG-иконка Instagram */}
								<svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM25 39.3918C25 31.4558 31.4566 25 39.3918 25H60.6082C68.5442 25 75 31.4566 75 39.3918V60.8028C75 68.738 68.5442 75.1946 60.6082 75.1946H39.3918C31.4558 75.1946 25 68.738 25 60.8028V39.3918ZM36.9883 50.0054C36.9883 42.8847 42.8438 37.0922 50.0397 37.0922C57.2356 37.0922 63.0911 42.8847 63.0911 50.0054C63.0911 57.1252 57.2356 62.9177 50.0397 62.9177C42.843 62.9177 36.9883 57.1252 36.9883 50.0054ZM41.7422 50.0054C41.7422 54.5033 45.4641 58.1638 50.0397 58.1638C54.6153 58.1638 58.3372 54.5041 58.3372 50.0054C58.3372 45.5066 54.6145 41.8469 50.0397 41.8469C45.4641 41.8469 41.7422 45.5066 41.7422 50.0054ZM63.3248 39.6355C65.0208 39.6355 66.3956 38.2606 66.3956 36.5646C66.3956 34.8687 65.0208 33.4938 63.3248 33.4938C61.6288 33.4938 60.2539 34.8687 60.2539 36.5646C60.2539 38.2606 61.6288 39.6355 63.3248 39.6355Z" />
								</svg>
							</a>
						</li>
						{/* Vimeo */}
						<li>
							<a href="https://vimeo.com/user1232595" target="_blank" rel="nofollow noopener" aria-label="vimeo" className="hover:opacity-75 transition">
								{/* SVG-иконка Vimeo */}
								<svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M50 100c27.6142 0 50-22.3858 50-50S77.6142 0 50 0 0 22.3858 0 50s22.3858 50 50 50ZM28.8685 43.3711 27 40.9207s7.8239-9.3426 13.7764-10.5114c4.9324-.9682 6.0055 5.4946 6.963 11.262.268 1.6138.5268 3.1731.8587 4.5 1.4689 5.8705 2.4548 9.2291 3.7371 9.2291 1.2844 0 3.737-3.2737 6.4216-8.2923 2.6889-5.0237-.1157-9.4612-5.3714-6.306C55.4889 28.1909 75.34 25.1587 72.771 39.634c-2.5711 14.4798-16.9323 26.7411-21.2512 29.5414-4.3211 2.8002-8.2616-1.1206-9.6902-4.0869-.7552-1.5611-2.206-6.3062-3.6758-11.1136-1.7153-5.61-3.4564-11.3047-4.1481-12.1225-1.2845-1.5187-5.1372 1.5187-5.1372 1.5187Z" />
								</svg>
							</a>
						</li>
						{/* Youtube */}
						<li>
							<a href="https://www.youtube.com/user/dimidmetall/videos" target="_blank" rel="nofollow noopener" aria-label="youtube" className="hover:opacity-75 transition">
								{/* SVG-иконка Youtube */}
								<svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50Zm17.9-67.374c3.838.346 6 2.695 6.474 6.438.332 2.612.626 6.352.626 10.375 0 7.064-.626 11.148-.626 11.148-.588 3.728-2.39 5.752-6.18 6.18-4.235.48-13.76.7-17.992.7-4.38 0-13.237-.184-17.66-.552-3.8-.317-6.394-2.44-6.916-6.218-.38-2.752-.626-6.022-.626-11.222 0-5.788.209-8.238.7-10.853.699-3.732 2.48-5.54 6.548-5.96C36.516 32.221 40.55 32 49.577 32c4.413 0 13.927.228 18.322.626Zm-23.216 9.761v14.374L58.37 49.5l-13.686-7.114Z" />
								</svg>
							</a>
						</li>
					</ul>
				</div>

				{/* 3. Секция контактов и копирайта */}
				<div className="pt-3 text-xs font-medium text-center">
					<div className="container mx-auto px-4">
						{/* Текстовый блок */}
						<div className="mb-2 space-y-1">
							<p className="leading-relaxed">
								Інфармацыйны турысцкі центр Унітарнага прадпрыемства &quot;БАЭС-сэрвіс&quot;, 222850, Мінская вобл., Пухавіцкі раён, г.п.Рудзенск, вул.Ленінская, 16-9
								<br />
								УНП 691943648, 15.06.19, Пухавіцкі райвыканкам
								<br />
								Распрацоўка сайта: Навукова-вытворчае унітарнае прадпрыемства &quot;БАЭС&quot;, Мінск, вул.Платонава, 22-1008
							</p>
							<p className="leading-relaxed">
								e-mail: <Link href="mailto:gmm@gmm.by" className="text-white hover:text-amber-300 underline">gmm@gmm.by</Link>
								<Link href="tel:+375172844220" className="text-white hover:text-amber-300 ml-4">тэл. 277</Link>. Рэжым працы: 8.00 - 20.00 штодзённа, © 2019-2021 gmm.by
							</p>
						</div>
					</div>
				</div>
				{/* Логотипы bepaid */}

				<div className="flex justify-center bg-white">
					<Image
						src="/images/bepaid.png"
						alt="Логотипы партнеров и разработчика"
						width={440}
						height={43}
						className="max-w-full h-auto"
					/>
				</div>
			</footer>

			<AboutProjectModal isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
};

export default Footer;