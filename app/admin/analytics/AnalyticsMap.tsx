'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AnalyticsMap({ points }: { points: any[] }) {
	const defaultCenter: [number, number] = [53.9, 27.5]; // Мінск

	return (
		<div className="h-[450px] w-full rounded-lg overflow-hidden border">
			<MapContainer center={defaultCenter} zoom={3} style={{ height: '100%', width: '100%' }}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
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