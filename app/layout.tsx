import "./globals.css";
import Link from "next/link";
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="ar" dir="rtl"><body><div className="shell"><aside className="side"><div className="brand">حافظ <i>✦</i></div><nav className="nav">
 <Link href="/">الرئيسية</Link><Link href="/mushaf">المصحف</Link><Link href="/memorize">الحفظ والتسميع</Link><Link href="/recitation">التلاوة</Link><Link href="/progress">التقدم</Link><Link href="/premium">Premium</Link><Link href="/settings">الإعدادات</Link>
 </nav></aside><main className="content">{children}</main></div></body></html>
}