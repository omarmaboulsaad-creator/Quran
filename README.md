# حافظ | Hafez — Production Full-Stack Foundation

هذا المشروع هو أساس إنتاجي حقيقي وليس Prototype للواجهة فقط.

## ما تم بناؤه
- Next.js App Router + TypeScript.
- PostgreSQL + Prisma: المستخدمون، الخطط، جلسات الحفظ، الأخطاء، التسجيلات، التقدم، الأهداف، الشارات، الإشعارات، العلامات، سجل البحث.
- Session authentication بتوقيع HMAC وHTTP-only cookie.
- مصحف حقيقي من مصدر Quran API قابل للتغيير عبر `QURAN_API_BASE_URL`.
- واجهة المصحف والحفظ والتسميع والتلاوة والتقدم وPremium والإعدادات.
- تسجيل صوتي من المتصفح.
- Endpoint حقيقي لتحليل التلاوة؛ يرسل ملف الصوت إلى مزود Speech/Recitation AI قابل للتهيئة ثم يحفظ الأخطاء والدقة في PostgreSQL.
- بحث وحفظ سجل البحث.
- Premium endpoint جاهز للربط ببوابة دفع عبر `BILLING_CHECKOUT_URL`.

## التشغيل
1. ثبّت Node.js 20+ وPostgreSQL.
2. انسخ `.env.example` إلى `.env`.
3. ضع `DATABASE_URL` و`AUTH_SECRET`.
4. شغّل:
   `npm install`
   `npx prisma generate`
   `npx prisma db push`
   `npm run dev`

## الحساب التجريبي المحلي
بعد `npm run db:seed`:
- email: demo@hafez.local
- password: ChangeMe123!

## تشغيل AI الحقيقي
ضع:
- `RECITATION_AI_URL`
- `RECITATION_AI_KEY`

المزود يجب أن يقبل multipart `audio` و`context` ويعيد JSON بالشكل:
{
  "accuracy": 92,
  "transcript": "...",
  "durationSec": 34,
  "issues": [
    {
      "surah": 1,
      "ayah": 4,
      "type": "PRONUNCIATION",
      "expectedText": "...",
      "heardText": "...",
      "confidence": 0.91,
      "note": "..."
    }
  ]
}

بهذا يصبح تحليل التلاوة فعليًا ويتم حفظ الأخطاء في قاعدة البيانات.

## Billing
ضع رابط checkout الخاص بمزود الدفع في `BILLING_CHECKOUT_URL`، ثم أضف webhook خاص بالمزود لتغيير `User.plan` إلى `PREMIUM` بعد نجاح الدفع. لا تضع مفاتيح الدفع داخل الواجهة.

## التسجيلات في الإنتاج
المتصفح يستطيع التسجيل، لكن حفظ الملفات الدائم يحتاج Object Storage مثل S3-compatible storage. أضف upload/signing في `app/api/recordings` واربط `Recording.url` بالرابط الموقّع.

## ما يحتاج مفاتيح/خدمات خارجية
لا يمكن لأي كود أن يخترع حسابات الدفع أو مفاتيح AI أو التخزين. هذه القيم تُحقن في `.env` عند تشغيل المشروع الحقيقي.


## المصحف الكامل — تحديث جديد

صفحة `/mushaf` أصبحت واجهة مصحف متجاوبة بدل عرض سورة واحدة في بطاقات:
- 604 صفحة مع تنقل مباشر بين الصفحات.
- عرض عربي بخط Uthmanic Hafs، مع تصميم صفحة مصحف.
- تشغيل السورة أو الآية، اختيار القارئ، التكرار، الانتقال التلقائي.
- متابعة الكلمة الحالية أثناء تشغيل الآية، مع fallback زمني عندما لا تتوفر بيانات التوقيت.
- بحث داخل القرآن.
- علامات مرجعية محفوظة في المتصفح.
- إخفاء الآيات ووضع اختبار الحفظ.
- تغيير حجم الخط والوضع الليلي.
- شريط تلاوة ثابت ومناسب للموبايل.
- Responsive للموبايل والتابلت والكمبيوتر.

### بيانات القرآن والتوقيت الدقيق

الوضع الافتراضي يستخدم `api.alquran.cloud` للمحتوى، لذلك يعمل بدون مفاتيح خارجية. 
وللوصول إلى بيانات Quran Foundation الأكثر دقة، خصوصًا word-level timing ومواضع الكلمات، يمكن إضافة:
`QF_CLIENT_ID`, `QF_CLIENT_SECRET`, `QF_ENV`, و`QF_CHAPTER_RECITER_ID` في `.env`.

مفاتيح Quran Foundation يجب أن تبقى على الخادم ولا توضع في `NEXT_PUBLIC_*`.
