'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	ChartOptions,
	ChartData
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

const MapWithNoSSR = dynamic(() => import('./AnalyticsMap'), {
	ssr: false,
	loading: () => (
		<div className="h-[450px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center border border-gray-200">
			<span className="text-gray-400 font-medium">Загрузка карты...</span>
		</div>
	)
});

// Інтэрфейсы для кліенцкага кампанента
interface AnalyticsData {
	total: number;
	uniqueSessions: number;
	byCity: [string, number][]
	popularPages: {
		path: string;
		title: string;
		count: number;
	}[];
	newComments: number;
	topLiked: {
		id: number;
		title: string;
		likes: number;
	}[];
	topCommented: {
		id: number;
		title: string;
		count: number;
	}[];
	points: {
		lat: number;
		lng: number;
		city: string;
		path: string;
	}[];
	timeline: Record<string, number>;
}

interface AnalyticsProps {
	initialData: AnalyticsData;
	currentRange: string;
}

export default function AnalyticsDashboard({ initialData, currentRange }: AnalyticsProps) {
	const router = useRouter();

	const handleRangeChange = (newRange: string) => {
		router.push(`/admin/analytics?range=${newRange}`);
	};

	const chartData: ChartData<'line'> = {
		labels: Object.keys(initialData.timeline),
		datasets: [{
			label: 'Візіты',
			data: Object.values(initialData.timeline),
			borderColor: '#2563eb',
			backgroundColor: 'rgba(37, 99, 235, 0.05)',
			fill: true,
			tension: 0.4,
			pointRadius: 3,
			pointHoverRadius: 6,
			pointBackgroundColor: '#2563eb',
		}]
	};

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: '#1f2937',
				padding: 12,
				cornerRadius: 8,
			}
		},
		scales: {
			y: { beginAtZero: true, ticks: { stepSize: 1 } },
			x: { grid: { display: false } }
		}
	};

	return (
		<div className="max-w-7xl mx-auto space-y-8 pb-16">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Аналітыка</h1>
					<p className="text-gray-500 mt-1">
						Агляд за {currentRange === 'today' ? 'сёння' : currentRange === 'week' ? 'тыдзень' : 'месяц'}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<select
						value={currentRange}
						onChange={(e) => handleRangeChange(e.target.value)}
						className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
					>
						<option value="today">Сёння</option>
						<option value="week">Апошні тыдзень</option>
						<option value="month">Апошні месяц</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard title="Усяго праглядаў" value={initialData.total} icon="📈" color="text-blue-600" />
				<StatCard title="Унікальныя сесіі" value={initialData.uniqueSessions} icon="👥" color="text-green-600" />
				<StatCard title="Новыя каментарыі" value={initialData.newComments} icon="💬" color="text-orange-600" />
				<StatCard title="Геа-кропак" value={initialData.points.length} icon="📍" color="text-purple-600" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
					<h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
						<span className="w-2 h-6 bg-blue-500 rounded-full"></span>
						Дынаміка візітаў
					</h2>
					<div className="h-[350px]">
						<Line data={chartData} options={chartOptions} />
					</div>
				</div>

				{/* Топ гарадоў (замест краін) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                         <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                         Топ гарадоў
                    </h2>
                    <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                        {initialData.byCity.map(([location, count]) => {
                            const [city, country] = location.split('/');
                            return (
                                <div key={location} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-sm leading-tight">{city}</span>
                                        <span className="text-xs text-gray-400">{country}</span>
                                    </div>
                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-black">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                        {initialData.byCity.length === 0 && (
                            <p className="text-center text-gray-400 mt-10 italic text-sm">Няма звестак па геалакацыі</p>
                        )}
                    </div>
                </div>
			</div>

			<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
				<h2 className="text-xl font-bold text-gray-800 mb-8">Папулярныя старонкі</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="text-gray-400 text-xs uppercase border-b border-gray-50">
								<th className="pb-4 font-semibold">Старонка</th>
								<th className="pb-4 font-semibold text-right">Візіты</th>
								<th className="pb-4 font-semibold text-right px-4 w-40">Доля</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{initialData.popularPages.map((page, idx) => {
								const percentage = initialData.total > 0
									? ((page.count / initialData.total) * 100).toFixed(1)
									: "0";
								return (
									<tr key={idx} className="group hover:bg-gray-50 transition-all">
										<td className="py-4">
											<div className="flex flex-col">
												<span className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1">{page.title}</span>
												<span className="text-xs text-gray-400 font-mono">{page.path}</span>
											</div>
										</td>
										<td className="py-4 text-right font-bold text-gray-800">{page.count}</td>
										<td className="py-4 text-right px-4">
											<div className="flex items-center justify-end gap-3">
												<span className="text-xs font-bold text-gray-500 w-8">{percentage}%</span>
												<div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
													<div className="bg-blue-500 h-full" style={{ width: `${percentage}%` }} />
												</div>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<EngagementList title="Самыя папулярныя (Лайкі)" items={initialData.topLiked} type="likes" icon="❤️" />
				<EngagementList title="Самыя абмяркоўваемыя" items={initialData.topCommented} type="count" icon="💬" />
			</div>

			<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<h2 className="text-xl font-bold text-gray-800 mb-6">Геаграфія наведвальнікаў</h2>
				<MapWithNoSSR points={initialData.points} />
			</div>
		</div>
	);
}

// Дапаможныя кампаненты з тыпізацыяй
interface StatCardProps {
	title: string;
	value: number;
	icon: string;
	color: string;
	subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
			<div>
				<p className="text-sm font-bold text-gray-400 uppercase tracking-tight">{title}</p>
				<div className="flex items-baseline gap-1 mt-2">
					<p className={`text-4xl font-black ${color}`}>{value.toLocaleString()}</p>
					{subtitle && <span className="text-gray-400 text-sm font-medium">{subtitle}</span>}
				</div>
			</div>
			<div className="text-2xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl border border-gray-100">
				{icon}
			</div>
		</div>
	);
}

interface EngagementItem {
	id: number;
	title: string;
	likes?: number;
	count?: number;
}

function EngagementList({ title, items, type, icon }: { title: string, items: EngagementItem[], type: 'likes' | 'count', icon: string }) {
	return (
		<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
				<span>{icon}</span> {title}
			</h2>
			<div className="space-y-3">
				{items.map((item) => (
					<div key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
						<span className="text-sm font-medium truncate max-w-[200px] text-gray-700">{item.title}</span>
						<span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
							{type === 'likes' ? `${item.likes} 👍` : `${item.count} камент.`}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}