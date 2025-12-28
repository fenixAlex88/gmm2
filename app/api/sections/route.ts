import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const sections = await prisma.section.findMany();
	return NextResponse.json(sections);
}
