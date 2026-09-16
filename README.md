# قنوات يوتيوب — بحث بالكلمة

تطبيق Next.js للبحث عن قنوات يوتيوب مع Supabase للمصادقة وقاعدة البيانات.

## الميزات

- بحث بالكلمة عبر YouTube Data API v3
- ترند الفيديوهات حسب الدولة والتصنيف
- تسجيل دخول: Email، Google، Facebook، X
- حفظ القنوات (localStorage للزوار / Supabase للمسجّلين)
- قنوات مقترحة في الرئيسية (يختارها الأدمن)
- دليل القنوات مع فلاتر
- لوحة إدارة للأدمن

## إعداد Supabase

1. أنشئ مشروعاً على [supabase.com](https://supabase.com)
2. نفّذ `supabase/schema.sql` في **SQL Editor**
3. فعّl OAuth من **Authentication → Providers**:
   - Google
   - Facebook
   - Twitter (X)
4. أضف Redirect URL:
   ```
   http://localhost:3000/auth/callback
   https://your-app.vercel.app/auth/callback
   ```
5. لتعيين أدمن بعد التسجيل:
   ```sql
   update public.profiles set role = 'admin' where email = 'your@email.com';
   ```

## متغيرات البيئة

```env
YOUTUBE_API_KEYS=key1,key2
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## التشغيل

```bash
npm install
npm run dev
```

## استهلاك YouTube API

كل بحث = **2 طلبات**: `search.list` + `channels.list`
