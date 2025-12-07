'use client';

import React, { useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	// Блокировка скролла при открытии
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		// Очистка при размонтировании
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-55"
			onClick={onClose}
		>
			<div
				className="bg-gray-50 p-8 rounded-lg shadow-2xl max-w-6xl w-11/12 max-h-[90vh] overflow-y-auto relative"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
						{title}
					</h2>
				)}

				{/* Кнопка закрытия */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-600 hover:text-red-900 transition"
					aria-label="Закрыть диалоговое окно"
				>
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{children}
			</div>
		</div>
	);
};

export default Modal;
