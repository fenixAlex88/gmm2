import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedSections = unstable_cache(
	async () => {
		return await prisma.section.findMany();
	},
	["sections-cache-key"],
	{
		revalidate: 3600,
		tags: ["sections"]
	}
);

export async function GET() {
	const sections = await getCachedSections();
	return NextResponse.json(sections);
}