// lib/analytics.ts
import { prisma } from "@/lib/prisma";

export async function logVisit({
	ip,
	sessionId,
	path,
}: {
	ip: string;
	sessionId: string;
	path: string;
}) {
	try {
		// 1. Вызначаем мяжу "свежасці" дадзеных (24 гадзіны)
		const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		// 2. Шукаем, ці быў гэты IP у нас за апошнія суткі
		const lastVisitWithGeo = await prisma.visit.findFirst({
			where: {
				ip: ip,
				createdAt: { gte: dayAgo },
				country: { not: null }, // Нам патрэбны запіс, дзе API паспяхова вярнуў лакацыю
			},
			orderBy: { createdAt: 'desc' },
		});

		let geoData = {
			country: null as string | null,
			city: null as string | null,
			latitude: null as number | null,
			longitude: null as number | null,
		};

		if (lastVisitWithGeo) {
			// КЭШ: Калі знайшлі свежы запіс — капіюем дадзеныя адтуль
			geoData = {
				country: lastVisitWithGeo.country,
				city: lastVisitWithGeo.city,
				latitude: lastVisitWithGeo.latitude,
				longitude: lastVisitWithGeo.longitude,
			};
		} else {
			// API: Калі запісаў няма (або яны старыя) і гэта не лакальны IP — робім запыт
			const isLocal = ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1';

			if (!isLocal) {
				try {
					const res = await fetch(`https://ipwho.is/${ip}`);
					const data = await res.json();

					if (data.success) {
						geoData = {
							country: data.country,
							city: data.city,
							latitude: data.latitude,
							longitude: data.longitude,
						};
					}
				} catch (e) {
					console.error("IPWhois API Fetch Error:", e);
				}
			}
		}

		// 3. ЗАЎСЁДЫ ствараем новы запіс (Log entry)
		// Нават калі дадзеныя ўзяты з кэша, кожны клік па старонцы будзе зафіксаваны
		const newVisit = await prisma.visit.create({
			data: {
				ip,
				sessionId,
				path,
				country: geoData.country,
				city: geoData.city,
				latitude: geoData.latitude,
				longitude: geoData.longitude,
				// createdAt падставіцца аўтаматычна (DateTime.now())
			},
		});

		return newVisit;
	} catch (error) {
		console.error("Critical Analytics Error:", error);
	}
}