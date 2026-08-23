import {getCurrentUser} from "@/lib/auth";
import {db} from "@/lib/db";
export default async function Home(){
 const user=await getCurrentUser();
 const p=user?await db.progress.findUnique({where:{userId:user.id}}):null;
 return <><div className="top"><h1>الرئيسية</h1><span className="muted">{user?.name||"مرحبًا بك في حافظ"}</span></div>
 <section className="card hero"><h2>حفظك في مكان واحد 👋</h2><p className="muted">احفظ، سمّع، راجع أخطاءك وتابع تقدمك.</p>
 <div className="kpis"><div className="kpi">🔥<b>{p?.streak??0}</b>يوم متتالي</div><div className="kpi">📖<b>{p?.memorizedAyahs??0}</b>آية محفوظة</div><div className="kpi">🎯<b>{Math.round(p?.accuracy??0)}%</b>دقة</div><div className="kpi">⭐<b>{user?.plan==="PREMIUM"?"Premium":"Free"}</b>الخطة</div></div></section><br/>
 <div className="grid"><div className="card"><h3>جلسة الحفظ</h3><p>ابدأ جلسة جديدة أو أكمل جلستك السابقة.</p><a className="btn" href="/memorize">ابدأ التسميع</a></div><div className="card"><h3>المصحف</h3><p>اقرأ، ابحث، أضف علامات وافتح التفسير والترجمة.</p><a className="btn secondary" href="/mushaf">فتح المصحف</a></div><div className="card"><h3>تحليل التلاوة</h3><p>ارفع تسجيلك ليتم تحليله بواسطة محرك التلاوة.</p><a className="btn secondary" href="/recitation">ابدأ التحليل</a></div></div></>
}