const base = process.env.QURAN_API_BASE_URL || "https://api.alquran.cloud/v1";
export async function getSurah(surah:number) {
  const res = await fetch(`${base}/surah/${surah}/quran-uthmani`, {next:{revalidate:86400}});
  if(!res.ok) throw new Error("Quran source unavailable");
  const json = await res.json();
  return json.data;
}
export async function searchQuran(query:string) {
  const res = await fetch(`${base}/search/${encodeURIComponent(query)}/all/en`, {next:{revalidate:3600}});
  if(!res.ok) throw new Error("Search unavailable");
  return res.json();
}