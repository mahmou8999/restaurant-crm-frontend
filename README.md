# وِصال — واجهة إدارة العملاء

واجهة React وVite مكتوبة بـ JavaScript، تدعم العربية واتجاه RTL، وتستخدم Tailwind CSS للتنسيقات الأساسية.

## التشغيل

```bash
npm install
npm run dev
```

افتح `http://localhost:5173`. عنوان الـ API مضبوط في `.env` على:

```text
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

عدّل القيمة حسب إعدادات الخادم، وأعد تشغيل Vite بعد تغيير متغيرات البيئة. تسجيل الدخول الافتراضي للتجربة: `test@example.com` وكلمة المرور `password`.

## التحقق

```bash
npm run lint
npm run build
```

## الصفحات والـ API

- تسجيل الدخول: `POST /auth/login`، والرمز يُحفظ محلياً ويُرسل كـ Bearer Token.
- لوحة التحكم: `GET /dashboard`.
- العملاء: `GET/POST /customers`، `PUT /customers/{id}`، `POST /customers/{id}/archive`، واستيراد وتصدير العملاء.
- المجموعات: `GET/POST /groups`، `DELETE /groups/{id}`.
- الحملات: `GET/POST /campaigns`، معاينة العدد عبر `/campaigns/{id}/preview`، واختبار/بدء/إيقاف/استكمال الحملة والتقرير.
- واتساب: حالة الاتصال وإنشاء رمز الربط عبر `/whatsapp/evolution/status` و`/whatsapp/evolution/connect`. يتم تحديث الحالة كل خمس ثوانٍ أثناء انتظار الربط.
- المحادثات: `/whatsapp/conversations`، والرد عبر `/whatsapp/conversations/{id}/reply`.
- الإعدادات: `GET/PUT /settings` مع `sender_driver` و`daily_limit` و`delay`.
- مساعد وِصال: `GET/PUT /bot/settings`.

الواجهة تتصل بتطبيق Laravel فقط؛ لا تضع مفاتيح Evolution أو أي أسرار في كود المتصفح. لازم الخادم يسمح بطلبات CORS من `http://localhost:5173`.
