'use client';
import { Search, X } from 'lucide-react';

interface Props {
	value: string;
	onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
	return (
		<div className="flex flex-col space-y-1.5 flex-grow">

			<div className="relative">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					size={16}
				/>
				<input
					value={value}
					onChange={e => onChange(e.target.value)}
					placeholder="Найти статью или автора..."
					className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all shadow-sm h-[38px]"
				/>
				{value && (
					<button
						type="button"
						onClick={() => onChange('')}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
					>
						<X size={16} />
					</button>
				)}
			</div>
		</div>
	);
}