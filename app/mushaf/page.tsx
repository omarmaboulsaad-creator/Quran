/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Ayah = {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  juz: number;
  surah: { number: number; name: string; englishName: string };
};

type PagePayload = {
  page: number;
  ayahs: Ayah[];
};

const RECITERS = [
  { id: "alafasy", name: "مشاري العفاسي", folder: "ar.alafasy" },
  { id: "minshawi", name: "محمد صديق المنشاوي", folder: "ar.minshawi" },
  { id: "husary", name: "محمود خليل الحصري", folder: "ar.husary" },
];

function audioUrl(reciter: string, surah: number) {
  const r = RECITERS.find((x) => x.id === reciter) || RECITERS[0];
  return `https://cdn.islamic.network/quran/audio-surah/128/${r.folder}/${surah}.mp3`;
}

export default function Mushaf() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [dark, setDark] = useState(false);
  const [hideVerses, setHideVerses] = useState(false);
  const [repeat, setRepeat] = useState(1);
  const [reciter, setReciter] = useState("alafasy");
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState(-1);
  const [autoNext, setAutoNext] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showTools, setShowTools] = useState(false);
  const [mode, setMode] = useState<"mushaf" | "reading" | "test">("mushaf");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordTimer = useRef<number | null>(null);

  const loadPage = useCallback(async (target: number) => {
    const safe = Math.max(1, Math.min(604, target));
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/quran/page?page=${safe}`, { cache: "no-store" });
      if (!res.ok) throw new Error("تعذر تحميل الصفحة");
      const json = await res.json();
      setData(json);
      setPage(safe);
      window.scrollTo({ top: 0, behavior: "smooth" });
      localStorage.setItem("hafez:lastPage", String(safe));
    } catch (e: any) {
      setError(e?.message || "حدث خطأ أثناء تحميل المصحف");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = Number(localStorage.getItem("hafez:lastPage") || 1);
    const savedBookmarks = JSON.parse(localStorage.getItem("hafez:bookmarks") || "[]");
    const savedDark = localStorage.getItem("hafez:dark") === "1";
    setBookmarks(savedBookmarks);
    setDark(savedDark);
    loadPage(saved || 1);
  }, [loadPage]);

  useEffect(() => {
    document.documentElement.dataset.mushafDark = dark ? "1" : "0";
    localStorage.setItem("hafez:dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    return () => {
      if (wordTimer.current) window.clearInterval(wordTimer.current);
      audioRef.current?.pause();
    };
  }, []);

  const firstAyah = data?.ayahs?.[0];
  const title = firstAyah?.surah?.name || "المصحف الشريف";
  const juz = firstAyah?.juz || 1;

  const words = useMemo(() => {
    if (!data?.ayahs) return [];
    return data.ayahs.flatMap((a) =>
      a.text.replace(/[۝]/g, "").split(/\s+/).filter(Boolean).map((text, i) => ({
        text,
        key: `${a.number}:${i}`,
        ayah: a.number,
      }))
    );
  }, [data]);

  function stopAudio() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingSurah(null);
    setPlayingAyah(null);
    setWordIndex(-1);
    if (wordTimer.current) window.clearInterval(wordTimer.current);
  }

  function startWordTracking(ayahText: string) {
    if (wordTimer.current) window.clearInterval(wordTimer.current);
    const count = ayahText.replace(/[۝]/g, "").split(/\s+/).filter(Boolean).length || 1;
    setWordIndex(0);
    const step = Math.max(240, Math.min(1200, 9000 / count));
    wordTimer.current = window.setInterval(() => {
      setWordIndex((v) => (v + 1) % count);
    }, step);
  }

  function playAyah(a: Ayah) {
    stopAudio();
    const src = `https://cdn.islamic.network/quran/audio/128/${RECITERS.find((r) => r.id === reciter)?.folder || "ar.alafasy"}/${a.number}.mp3`;
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingAyah(`${a.number}:${a.numberInSurah}`);
    setPlayingSurah(a.surah.number);
    startWordTracking(a.text);
    audio.onended = () => {
      if (repeat > 1) {
        setRepeat((n) => n - 1);
        playAyah(a);
        return;
      }
      setRepeat(1);
      setPlayingAyah(null);
      setWordIndex(-1);
    };
    audio.onerror = () => setError("تعذر تشغيل الصوت، جرّب قارئًا آخر.");
    audio.play().catch(() => setError("اضغط على زر التشغيل مرة أخرى للسماح بتشغيل الصوت."));
  }

  function playSurah(surah: number) {
    stopAudio();
    const src = audioUrl(reciter, surah);
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingSurah(surah);
    audio.onended = () => {
      setPlayingSurah(null);
      if (autoNext && page < 604) loadPage(page + 1);
    };
    audio.onerror = () => setError("تعذر تشغيل التلاوة.");
    audio.play().catch(() => setError("اضغط تشغيل مرة أخرى."));
  }

  function toggleBookmark(key: string) {
    const next = bookmarks.includes(key) ? bookmarks.filter((x) => x !== key) : [...bookmarks, key];
    setBookmarks(next);
    localStorage.setItem("hafez:bookmarks", JSON.stringify(next));
  }

  async function doSearch() {
    if (!search.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
      const json = await res.json();
      setSearchResults(json?.data?.matches || []);
    } catch {
      setSearchResults([]);
    }
  }

  function changePage(delta: number) {
    stopAudio();
    loadPage(page + delta);
  }

  const currentAyahWords = playingAyah
    ? data?.ayahs.find((a) => `${a.number}:${a.numberInSurah}` === playingAyah)?.text.replace(/[۝]/g, "").split(/\s+/).filter(Boolean) || []
    : [];

  return (
    <div className={`mushafApp ${dark ? "mushafDark" : ""}`}>
      <div className="mushafHeader">
        <div>
          <div className="eyebrow">القرآن الكريم</div>
          <h1>المصحف الشريف</h1>
          <p className="muted">{title} · الجزء {juz} · صفحة {page} من 604</p>
        </div>
        <div className="mushafHeaderActions">
          <button className="iconBtn" onClick={() => setShowSearch((v) => !v)} aria-label="بحث">⌕</button>
          <button className="iconBtn" onClick={() => setShowTools((v) => !v)} aria-label="الإعدادات">⚙</button>
          <button className="iconBtn" onClick={() => setDark((v) => !v)} aria-label="الوضع الليلي">{dark ? "☀" : "☾"}</button>
        </div>
      </div>

      {showSearch && (
        <section className="toolCard searchPanel">
          <div className="search">
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="ابحث في القرآن..." />
            <button className="btn" onClick={doSearch}>بحث</button>
          </div>
          {searchResults.length > 0 && (
            <div className="searchResults">
              {searchResults.slice(0, 10).map((r: any) => (
                <button key={r.number} onClick={() => { setShowSearch(false); if (r.page) loadPage(r.page); }}>
                  <b>{r.surah?.name || ""} — {r.numberInSurah}</b>
                  <span>{r.text}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {showTools && (
        <section className="toolCard controlsGrid">
          <label>القارئ<select value={reciter} onChange={(e) => setReciter(e.target.value)}>{RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label>حجم الخط<input type="range" min="0.8" max="1.7" step="0.1" value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} /></label>
          <label>التكرار<select value={repeat} onChange={(e) => setRepeat(Number(e.target.value))}><option value="1">مرة واحدة</option><option value="2">مرتين</option><option value="3">3 مرات</option></select></label>
          <label className="checkLabel"><input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} /> انتقال تلقائي</label>
          <button className={`toolToggle ${hideVerses ? "on" : ""}`} onClick={() => setHideVerses((v) => !v)}>إخفاء الآيات</button>
          <button className={`toolToggle ${mode === "test" ? "on" : ""}`} onClick={() => setMode(mode === "test" ? "mushaf" : "test")}>وضع الاختبار</button>
          <button className={`toolToggle ${mode === "reading" ? "on" : ""}`} onClick={() => setMode(mode === "reading" ? "mushaf" : "reading")}>وضع القراءة</button>
        </section>
      )}

      <div className="pageToolbar">
        <div className="pageJump">
          <button onClick={() => loadPage(1)}>الأولى</button>
          <button onClick={() => changePage(-1)} disabled={page <= 1}>‹</button>
          <input aria-label="رقم الصفحة" value={page} onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= 604) loadPage(n); }} />
          <button onClick={() => changePage(1)} disabled={page >= 604}>›</button>
          <button onClick={() => loadPage(604)}>الأخيرة</button>
        </div>
        <div className="pageToolbarRight">
          {playingSurah && <button className="stopBtn" onClick={stopAudio}>■ إيقاف التلاوة</button>}
          <button className="btn" onClick={() => firstAyah && playSurah(firstAyah.surah.number)}>▶ تلاوة السورة</button>
        </div>
      </div>

      {error && <div className="errorBox">{error}</div>}

      <main className="mushafPageWrap">
        {loading ? (
          <div className="mushafPage skeleton"><div/><div/><div/><div/><div/></div>
        ) : (
          <article className={`mushafPage mode-${mode}`} style={{ "--fontScale": fontScale } as React.CSSProperties}>
            <div className="pageOrnament">۞</div>
            <div className="pageHeaderLine">
              <span>{firstAyah?.surah?.name || "القرآن الكريم"}</span>
              <span>الجزء {juz}</span>
              <span>صفحة {page}</span>
            </div>

            <div className={`quranText ${hideVerses ? "hiddenVerses" : ""}`}>
              {data?.ayahs.map((a) => {
                const key = `${a.number}:${a.numberInSurah}`;
                const active = playingAyah === key;
                const ayahWords = a.text.replace(/[۝]/g, "").split(/\s+/).filter(Boolean);
                return (
                  <span key={a.number} className={`ayah ${active ? "activeAyah" : ""} ${bookmarks.includes(key) ? "bookmarked" : ""}`}>
                    {active ? ayahWords.map((w, i) => (
                      <span key={i} className={i === wordIndex ? "activeWord" : ""}>{w} </span>
                    )) : a.text}
                    <span className="ayahMark" onClick={() => playAyah(a)} title="تشغيل الآية">{a.numberInSurah.toLocaleString("ar-EG")}</span>
                    <button className="bookmarkBtn" onClick={() => toggleBookmark(key)} title="علامة">🔖</button>
                  </span>
                );
              })}
            </div>

            <div className="pageFooter"><span>{page}</span><span>﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾</span></div>
          </article>
        )}
      </main>

      <div className="bottomPlayer">
        <div className="playerInfo">
          <span className="playerIcon">♪</span>
          <div><b>{playingAyah ? "تشغيل الآية" : playingSurah ? "تشغيل السورة" : "التلاوة"}</b><small>{RECITERS.find((r) => r.id === reciter)?.name}</small></div>
        </div>
        <div className="playerActions">
          <button onClick={() => page > 1 && changePage(-1)}>⏮</button>
          <button className="playMain" onClick={() => playingSurah ? stopAudio() : firstAyah && playSurah(firstAyah.surah.number)}>{playingSurah ? "❚❚" : "▶"}</button>
          <button onClick={() => page < 604 && changePage(1)}>⏭</button>
        </div>
        <div className="playerOptions">
          <span>صفحة {page}/604</span>
          <span>{words.length} كلمة</span>
        </div>
      </div>

      <div className="featureStrip">
        <span>📖 مصحف كامل</span><span>🔊 تلاوة مستمرة</span><span>✨ متابعة الكلمات</span><span>🔖 علامات</span><span>🧠 اختبار الحفظ</span><span>📈 التقدم</span>
      </div>
    </div>
  );
}
