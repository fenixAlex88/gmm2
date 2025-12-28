'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Вызначаем інтэрфейс для маркера
interface MapMarker {
	lat: number;
	lng: number;
	label?: string;
}

const DefaultIcon = L.icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41]
});

// Выкарыстоўваем інтэрфейс у якасці тыпу для прапсаў
function RecenterMap({ markers }: { markers: MapMarker[] }) {
	const map = useMap();
	useEffect(() => {
		if (markers.length > 0) {
			const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [markers, map]);
	return null;
}

export default function MapComponentInner({ markers = [] }: { markers: MapMarker[] }) {
	// Абарона: калі markers чамусьці не масіў, робім яго пустым масівам
	const safeMarkers: MapMarker[] = Array.isArray(markers) ? markers : [];

	return (
		<MapContainer
			center={[53.9, 27.5]}
			zoom={13}
			style={{ height: '100%', width: '100%' }}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

			{safeMarkers.map((m: MapMarker, i: number) => (
				<Marker key={`${m.lat}-${m.lng}-${i}`} position={[m.lat, m.lng]} icon={DefaultIcon}>
					{m.label && <Popup>{m.label}</Popup>}
				</Marker>
			))}

			<RecenterMap markers={safeMarkers} />
		</MapContainer>
	);
}