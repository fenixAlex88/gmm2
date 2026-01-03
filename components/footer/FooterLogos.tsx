import Image from 'next/image';

const FooterLogos: React.FC = () => {
	return (
		<div className="w-full bg-white py-0 flex justify-center items-center mt-auto">
			<div className="relative w-full max-w-[440px] px-4">
				<Image
					src="/images/bepaid.png"
					alt="Спосабы аплаты"
					width={440}
					height={43}
					className="w-full h-auto object-contain"
				/>
			</div>
		</div>
	);
};

export default FooterLogos;