import { NextResponse } from "next/server";
import { generateDummyPacks } from "../../../lib/learningPacks";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minutesParam = searchParams.get("minutes");
  const minutes = minutesParam ? Number(minutesParam) : 25;

  const packs = generateDummyPacks(Number.isFinite(minutes) && minutes > 0 ? minutes : 25);

  return NextResponse.json({ packs });
}
