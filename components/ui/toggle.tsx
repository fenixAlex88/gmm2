"use client";

import React from "react";

interface ToggleProps {
	pressed: boolean;
	onPressedChange: (pressed: boolean) => void;
	children: React.ReactNode;
}

export function Toggle({ pressed, onPressedChange, children }: ToggleProps) {
	return (
		<button
			type="button"
			onClick={() => onPressedChange(!pressed)}
			className={
				"inline-flex items-center justify-center rounded-md p-2 transition-colors " +
				(pressed
					? "bg-blue-600 text-white"
					: "bg-gray-200 text-gray-700 hover:bg-gray-300")
			}
		>
			{children}
		</button>
	);
}
