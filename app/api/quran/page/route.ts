import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.QURAN_API_BASE_URL || "https://api.alquran.cloud/v1";

export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get("page") || "1");
  const page = Math.max(1, Math.min(604, Number.isFinite(raw) ? raw : 1));

  try {
    const res = await fetch(`${BASE}/page/${page}/quran-uthmani`, {
      next: { revalidate: 86400 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error("Quran API unavailable");
    const json = await res.json();
    return NextResponse.json({ page, ...(json.data || {}) }, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل صفحة المصحف" }, { status: 502 });
  }
}
