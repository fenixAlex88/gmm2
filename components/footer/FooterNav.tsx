import Link from 'next/link';

interface FooterNavProps {
	onOpenModal: () => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ onOpenModal }) => {
	// base: стылі для мабільных, md: стылі для планшэтаў/ПК
	const linkClasses = "hover:text-amber-300 transition duration-200 py-1 md:py-0 block w-full md:w-auto";

	return (
		<nav className="w-full">
			{/* Mobile: flex-col (вертыкальна), Desktop: flex-row (гарызантальна) */}
			<ul className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-8 text-base md:text-lg font-medium text-center">
				<li>
					<button
						onClick={onOpenModal}
						className={`${linkClasses} focus:outline-none`}
						aria-haspopup="dialog"
						aria-label="Аб праекце"
					>
						Аб праекце
					</button>
				</li>
				<li>
					<Link href="/partner" className={linkClasses}>
						Партнерам
					</Link>
				</li>
				<li>
					<Link href="/support" className={linkClasses}>
						Падтрымаць праект
					</Link>
				</li>
				<li>
					<Link href="/agreement" className={linkClasses}>
						Публічная аферта
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default FooterNav;