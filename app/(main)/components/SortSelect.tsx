'use client';
import { ArrowUpDown } from 'lucide-react';

interface Props {
	value: string;
	onChange: (val: string) => void;
}

export default function SortSelect({ value, onChange }: Props) {
	return (
		<div className="flex flex-col space-y-1.5 flex-shrink-0">

			<div className="relative">
				<select
					value={value}
					onChange={e => onChange(e.target.value)}
					className="w-full lg:w-[240px] pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none cursor-pointer h-[38px] appearance-none hover:border-slate-300 transition-colors shadow-sm"
				>
					<option value="newest">Сначала новые</option>
					<option value="views">По популярности</option>
					<option value="likes">По лайкам</option>
					<option value="oldest">Сначала старые</option>
				</select>

				{/* Кастомная стрелочка, так как стандартную мы скрыли через appearance-none */}
				<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
					<ArrowUpDown size={14} />
				</div>
			</div>
		</div>
	);
}