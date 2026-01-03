'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	RadialLinearScale,
	Title,
	Tooltip,
	Legend,
	Filler,
	ChartOptions,
	ChartData,
	ScriptableContext
} from 'chart.js';
import { MapPin, MessageSquareText, TrendingUp, Users, Flame, MessageCircle } from 'lucide-react';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	RadialLinearScale,
	Title,
	Tooltip,
	Legend,
	Filler
);

const MapWithNoSSR = dynamic(() => import('./AnalyticsMap'), {
	ssr: false,
	loading: () => (
		<div className="h-[450px] bg-gray-50 animate-pulse rounded-3xl flex items-center justify-center border border-gray-100">
			<span className="text-gray-400 font-medium flex items-center gap-2">
				<MapPin className="animate-bounce" /> Загрузка карты...
			</span>
		</div>
	)
});

// --- ТЫПЫ ---
interface AnalyticsData {
	total: number;
	uniqueSessions: number;
	byCity: [string, number][];
	popularPages: { path: string; title: string; count: number }[];
	newComments: number;
	topLiked: { id: number; title: string; likes: number }[];
	topCommented: { id: number; title: string; count: number }[];
	points: { lat: number; lng: number; city: string; path: string }[];
	timeline: Record<string, number>;
}

interface AnalyticsProps {
	initialData: AnalyticsData;
	currentRange: string;
}

// --- ЛОГІКА АПРАЦОЎКІ ДАДЗЕНЫХ ---

// 1. Падрыхтоўка дадзеных для галоўнага графіка (Line)
const prepareTrendData = (timeline: Record<string, number>, range: string) => {
	// Сартуем даты храналагічна
	const sortedKeys = Object.keys(timeline).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

	if (range === 'today') {
		// Калі "Сёння" - паказваем як ёсць (па гадзінах)
		return {
			labels: sortedKeys.map(k => k.split(' ')[1]), // Толькі час "14:00"
			data: sortedKeys.map(k => timeline[k])
		};
	} else {
		// Калі "Тыдзень/Месяц" - групуем па днях
		const dailyGroups: Record<string, number> = {};
		sortedKeys.forEach(key => {
			const day = key.split(' ')[0]; // "2023-10-25"
			dailyGroups[day] = (dailyGroups[day] || 0) + timeline[key];
		});

		const days = Object.keys(dailyGroups);
		return {
			labels: days.map(d => new Date(d).toLocaleDateString('be-BY', { day: 'numeric', month: 'short' })),
			data: days.map(d => dailyGroups[d])
		};
	}
};

// 2. Падрыхтоўка дадзеных па днях тыдня (Radar)
const prepareWeeklyData = (timeline: Record<string, number>) => {
	const counts = new Array(7).fill(0);
	Object.keys(timeline).forEach((dateStr) => {
		const date = new Date(dateStr); // "2023-10-25 14:00" выдатна парсіцца
		if (!isNaN(date.getTime())) {
			// 0 - Нд, 1 - Пн... ператвараем у 0 (Пн) - 6 (Нд)
			const dayIndex = (date.getDay() + 6) % 7;
			counts[dayIndex] += timeline[dateStr];
		}
	});
	return counts;
};

// 3. Падрыхтоўка дадзеных па гадзінах (Bar) - СУМА па ўсіх днях
const prepareHourlyAggregate = (timeline: Record<string, number>) => {
	const hours = new Array(24).fill(0);
	Object.keys(timeline).forEach(dateStr => {
		// Чакаем фармат "yyyy-MM-dd HH:00"
		const timePart = dateStr.split(' ')[1]; // "14:00"
		if (timePart) {
			const hour = parseInt(timePart.split(':')[0], 10);
			if (hour >= 0 && hour < 24) {
				hours[hour] += timeline[dateStr];
			}
		}
	});
	return hours;
};

// --- UI КАМПАНЕНТЫ ---

const StatCard = ({ title, value, icon, color, iconBg }: { title: string, value: number, icon: React.ReactNode, color: string, iconBg: string }) => (
	<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
		<div>
			<p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
			<p className={`text-3xl font-black ${color}`}>{value.toLocaleString()}</p>
		</div>
		<div className={`${iconBg} ${color} w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
			{icon}
		</div>
	</div>
);

const SectionHeader = ({ title, color }: { title: string; color: string }) => (
	<h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
		<span className={`w-3 h-8 ${color} rounded-r-full block`}></span>
		{title}
	</h2>
);

const EngagementList = ({ title, items, type, icon }: { title: string; items: any[]; type: 'likes' | 'count'; icon: React.ReactNode }) => (
	<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
		<div className="flex items-center gap-2 mb-6 text-gray-800">
			{icon}
			<h3 className="text-lg font-bold">{title}</h3>
		</div>
		<div className="space-y-4 flex-1">
			{items.length === 0 ? (
				<p className="text-gray-400 text-sm italic">Няма дадзеных</p>
			) : items.map((item, idx) => (
				<div key={item.id} className="flex justify-between items-center group cursor-default">
					<div className="flex items-center gap-3 overflow-hidden">
						<span className="text-gray-300 font-bold text-sm min-w-[12px]">#{idx + 1}</span>
						<span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">
							{item.title}
						</span>
					</div>
					<span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2">
						{type === 'likes' ? item.likes : item.count}
					</span>
				</div>
			))}
		</div>
	</div>
);

// --- MAIN COMPONENT ---

export default function AnalyticsDashboard({ initialData, currentRange }: AnalyticsProps) {
	const router = useRouter();
	const { total, uniqueSessions, newComments, points, timeline, byCity, popularPages, topLiked, topCommented } = initialData;

	// UseMemo для аптымізацыі пералікаў пры рэ-рэндэрах
	const trendData = useMemo(() => prepareTrendData(timeline, currentRange), [timeline, currentRange]);
	const weeklyData = useMemo(() => prepareWeeklyData(timeline), [timeline]);
	const hourlyData = useMemo(() => prepareHourlyAggregate(timeline), [timeline]);

	// 1. Line Chart Config (Градыент)
	const lineChartData: ChartData<'line'> = {
		labels: trendData.labels,
		datasets: [{
			label: 'Візіты',
			data: trendData.data,
			borderColor: '#3b82f6',
			backgroundColor: (context: ScriptableContext<'line'>) => {
				const ctx = context.chart.ctx;
				const gradient = ctx.createLinearGradient(0, 0, 0, 300);
				gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
				gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
				return gradient;
			},
			fill: true,
			tension: 0.4,
			pointRadius: currentRange === 'month' ? 3 : 5,
			pointBackgroundColor: '#fff',
			pointBorderColor: '#3b82f6',
			pointBorderWidth: 2,
			pointHoverRadius: 6
		}]
	};

	// 2. Radar Chart Config
	const radarChartData: ChartData<'radar'> = {
		labels: ['Пн', 'Аўт', 'Ср', 'Чц', 'Пт', 'Сб', 'Нд'],
		datasets: [{
			label: 'Візіты',
			data: weeklyData,
			backgroundColor: 'rgba(139, 92, 246, 0.2)',
			borderColor: '#8b5cf6',
			borderWidth: 2,
			pointBackgroundColor: '#fff',
			pointBorderColor: '#8b5cf6',
		}]
	};

	// 3. Bar Chart Config
	const barChartData: ChartData<'bar'> = {
		labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
		datasets: [{
			label: 'Сярэдняя актыўнасць',
			data: hourlyData,
			backgroundColor: '#fb923c', // Orange-400
			borderRadius: 4,
			hoverBackgroundColor: '#f97316'
		}]
	};

	const commonOptions: ChartOptions<any> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: '#1e293b',
				padding: 12,
				cornerRadius: 8,
				titleFont: { size: 13 },
				bodyFont: { size: 13, weight: 'bold' }
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: { color: '#f1f5f9' },
				ticks: { font: { size: 11 }, color: '#94a3b8' },
				border: { display: false }
			},
			x: {
				grid: { display: false },
				ticks: { font: { size: 11 }, color: '#94a3b8' }
			}
		}
	};

	return (
		<div className="max-w-7xl mx-auto space-y-8 pb-16 px-4">

			{/* HEADER */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
				<div>
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Аналітыка праглядаў</h1>
					<p className="text-gray-500 mt-2 font-medium">
						Агляд актыўнасці за <span className="text-blue-600 font-bold">
							{currentRange === 'today' ? 'сёння' : currentRange === 'week' ? 'апошні тыдзень' : 'апошні месяц'}
						</span>
					</p>
				</div>
				<div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
					{[
						{ val: 'today', label: 'Сёння' },
						{ val: 'week', label: '7 дзён' },
						{ val: 'month', label: '30 дзён' }
					].map((opt) => (
						<button
							key={opt.val}
							onClick={() => router.push(`?range=${opt.val}`)}
							className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentRange === opt.val
								? 'bg-gray-900 text-white shadow-md'
								: 'text-gray-500 hover:bg-gray-50'
								}`}
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{/* METRICS QUICK VIEW */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard title="Прагляды" value={total} icon={<TrendingUp size={26} />} color="text-blue-600" iconBg="bg-blue-50" />
				<StatCard title="Сесіі" value={uniqueSessions} icon={<Users size={26} />} color="text-green-600" iconBg="bg-green-50" />
				<StatCard title="Каментары" value={newComments} icon={<MessageSquareText size={26} />} color="text-orange-600" iconBg="bg-orange-50" />
				<StatCard title="Геа-кропкі" value={points.length} icon={<MapPin size={26} />} color="text-purple-600" iconBg="bg-purple-50" />
			</div>

			{/* РАД 1: Дынаміка наведванняў (Full Width) */}
			<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
				<SectionHeader title="Дынаміка наведванняў" color="bg-blue-500" />
				<div className="h-[350px] mt-4">
					<Line data={lineChartData} options={{ ...commonOptions, maintainAspectRatio: false }} />
				</div>
			</div>

			{/* РАД 2: Пікавыя гадзіны і Тыднёвы рытм */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
					<SectionHeader title="Пікавыя гадзіны" color="bg-orange-400" />
					<div className="h-[300px] mt-4">
						<Bar
							data={barChartData}
							options={{
								...commonOptions,
								maintainAspectRatio: false,
								scales: { x: { display: true, grid: { display: false } }, y: { display: false } }
							}}
						/>
					</div>
					<p className="text-center text-xs text-gray-400 mt-4">Сумарная актыўнасць па часе сутак</p>
				</div>

				<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
					<SectionHeader title="Тыднёвы рытм" color="bg-purple-500" />
					<div className="flex-1 flex items-center justify-center min-h-[300px]">
						<Radar
							data={radarChartData}
							options={{
								...commonOptions,
								scales: {
									r: {
										ticks: { display: false },
										grid: { color: '#f3f4f6' },
										angleLines: { color: '#f3f4f6' },
										pointLabels: { font: { size: 12, weight: 'bold' }, color: '#64748b' }
									}
								}
							}}
						/>
					</div>
				</div>
			</div>

			{/* РАД 3: Геаграфія і Топ Лакацый */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
					<div className="p-6 pb-2">
						<SectionHeader title="Геаграфія карыстальнікаў" color="bg-red-500" />
					</div>
					<div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden relative border border-gray-100 mx-2 mb-2">
						<MapWithNoSSR points={points} />
					</div>
				</div>

				<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
					<SectionHeader title="Топ Лакацый" color="bg-emerald-500" />
					<div className="space-y-3 mt-4 overflow-y-auto max-h-[400px] custom-scrollbar">
						{byCity.map(([location, count], i) => (
							<div key={location} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
								<div className="flex items-center gap-3">
									<span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
									<div className="flex flex-col">
										<span className="font-bold text-gray-800 text-sm">{location.split('/')[0]}</span>
										<span className="text-[10px] text-gray-400 uppercase tracking-wide">{location.split('/')[1] || 'Unknown'}</span>
									</div>
								</div>
								<span className="font-black text-emerald-600 text-sm">{count}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* РАД 4: Папулярны кантэнт (Full Width) */}
			<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
				<SectionHeader title="Папулярны кантэнт" color="bg-blue-600" />
				<div className="overflow-x-auto mt-4">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
								<th className="pb-4 pl-2 font-bold">Старонка</th>
								<th className="pb-4 font-bold text-right w-24">Візіты</th>
								<th className="pb-4 font-bold text-right px-4 w-32">Доля</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{popularPages.map((page, idx) => {
								const percent = total > 0 ? ((page.count / total) * 100).toFixed(1) : "0";
								return (
									<tr key={idx} className="group hover:bg-gray-50 transition-colors">
										<td className="py-4 pl-2">
											<div className="flex flex-col">
												<span className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{page.title}</span>
												<span className="text-[10px] text-gray-400 font-mono">{page.path}</span>
											</div>
										</td>
										<td className="py-4 text-right font-black text-gray-700">{page.count}</td>
										<td className="py-4 text-right px-4">
											<div className="flex items-center justify-end gap-3">
												<div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
													<div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }} />
												</div>
												<span className="text-[10px] font-bold text-gray-400 w-8">{percent}%</span>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* РАД 5: Топ па лайках і каментарах */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<EngagementList
					title="Топ па лайках"
					items={topLiked}
					type="likes"
					icon={<Flame className="text-red-500" size={20} />}
				/>
				<EngagementList
					title="Топ па каментарах"
					items={topCommented}
					type="count"
					icon={<MessageCircle className="text-blue-500" size={20} />}
				/>
			</div>
		</div>
	);
}