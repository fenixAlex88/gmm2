'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Кампанент для кіравання межамі карты
function MapBoundsUpdater({ points }: { points: any[] }) {
	const map = useMap();

	useEffect(() => {
		if (!points || points.length === 0) return;
		const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
		map.fitBounds(bounds, {
			padding: [50, 50],
			maxZoom: 12        
		});
	}, [points, map]);

	return null;
}

export default function AnalyticsMap({ points }: { points: any[] }) {
	const defaultCenter: [number, number] = [53.9, 27.5];

	return (
		<div className="h-[450px] w-full rounded-lg overflow-hidden border">
			<MapContainer
				center={defaultCenter}
				zoom={3}
				style={{ height: '100%', width: '100%' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Дадаем наш апдэйтэр межаў */}
				<MapBoundsUpdater points={points} />

				{points.map((p, idx) => (
					<CircleMarker
						key={idx}
						center={[p.lat, p.lng]}
						radius={6}
						pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }}
					>
						<Popup>
							<div className="text-sm">
								<strong>{p.city}</strong><br />
								Шлях: {p.path}
							</div>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</div>
	);
}