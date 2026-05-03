// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMAIL TEMPLATES — WAYGO.ge
// Enterprise-grade transactional email system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BookingEmailData {
  guestName: string;
  lang: 'en' | 'ka' | 'ru';
  booking: {
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
    deliveryType: string;
    deliveryCost: number;
    deliveryAddress?: string | null;
  };
  car: {
    brand: string;
    model: string;
    year: number;
    type: string;
    transmission: string;
    fuelType: string;
    seats: number;
    location: string;
    color: string;
    images: string[];
  };
  totals: {
    base: number;
    insurance: number;
    platformFee: number;
    deductible: number;
  };
  days: number;
  insurancePlan: 'basic' | 'standard' | 'premium';
  grandTotal: number;
  siteUrl: string;
}

export interface HostRequestEmailData {
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestPhone: string;
  guestIdNumber: string;
  car: { brand: string; model: string; year: number; imageUrl: string | null };
  booking: { id: string; startDate: Date; endDate: Date; totalPrice: number };
  days: number;
  deadline: Date;
  siteUrl: string;
}

export interface BookingRejectedEmailData {
  guestName: string;
  lang: 'en' | 'ka' | 'ru';
  car: { brand: string; model: string; year: number };
  booking: { startDate: Date; endDate: Date };
  isAutoRejected: boolean;
  rejectionComment?: string;
  siteUrl: string;
}

// ─── Shared helpers ───────────────────────────────────────────

function fmtDate(d: Date, lang: string): string {
  const m: Record<string, string[]> = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    ka: ['იანვ.','თებ.','მარ.','აპრ.','მაი.','ივნ.','ივლ.','აგვ.','სექ.','ოქტ.','ნოე.','დეკ.'],
    ru: ['янв.','фев.','мар.','апр.','май','июн.','июл.','авг.','сен.','окт.','ноя.','дек.'],
  };
  return `${d.getDate()} ${(m[lang] ?? m.en)[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateTime(d: Date, lang: string): string {
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tbilisi' });
  return `${fmtDate(d, lang)}, ${time} (Tbilisi)`;
}

function emailShell(lang: string, body: string, footNote: string, copy: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>WAYGO.ge</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:34px 48px;text-align:center;">
      <div style="font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;">WAYGO<span style="color:#93c5fd;">.ge</span></div>
      <div style="font-size:10px;color:#93c5fd;margin-top:8px;letter-spacing:4px;text-transform:uppercase;">P2P Car Rental &middot; Georgia</div>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:40px 44px 28px;">
      ${body}
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:26px 44px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">${copy}</p>
      <p style="margin:0;font-size:11px;color:#cbd5e1;">${footNote}</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;
}

function divider(label: string): string {
  return `
  <tr><td style="background:#ffffff;padding:0 44px;">
    <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
    <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">${label}</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:0 44px 28px;">`;
}

function row(label: string, value: string, bold = false, last = false): string {
  return `<tr>
    <td style="padding:11px 0;font-size:13px;color:#64748b;${last ? '' : 'border-bottom:1px solid #f1f5f9;'}">${label}</td>
    <td style="padding:11px 0;font-size:13px;color:#1e293b;${bold ? 'font-weight:700;' : ''}text-align:right;${last ? '' : 'border-bottom:1px solid #f1f5f9;'}">${value}</td>
  </tr>`;
}

// ─── 1. GUEST STRINGS (booking submitted / approved / rejected) ───

const GS = {
  ka: {
    subjectSubmitted: (b: string, m: string, y: number) => `📋 ჯავშნის მოთხოვნა გაიგზავნა — ${b} ${m} ${y}`,
    subjectApproved:  (b: string, m: string, y: number) => `✅ ჯავშანი დადასტურდა — ${b} ${m} ${y}`,
    subjectRejected:  (b: string, m: string, y: number) => `❌ ჯავშანი ვერ დადასტურდა — ${b} ${m} ${y}`,
    badgeAwaiting: 'ჰოსტის პასუხის მოლოდინში',
    badgeConfirmed: 'დადასტურებული',
    badgeRejected: 'უარყოფილი',
    greeting: (n: string) => `გამარჯობა, ${n}!`,
    introSubmitted: 'შენი ჯავშნის მოთხოვნა წარმატებით გაიგზავნა. მასპინძელი 24 საათის განმავლობაში გადაწყვეტს — შეიტყობ პასუხს ელ-ფოსტით.',
    introApproved: 'გილოცავ! 🎉 შენი ჯავშანი დაადასტურა მასპინძელმა. მანქანა გელოდება — გახსენი ჯავშანი დეშბორდიდან.',
    introRejectedByHost: 'სამწუხაროდ, მასპინძელმა ვერ მიიღო შენი ჯავშნის მოთხოვნა. ბლოკირებული თანხა 3-5 სამუშაო დღეში დაგიბრუნდება.',
    introAutoRejected: 'სამწუხაროდ, მასპინძელმა 24 საათის განმავლობაში ვერ გასცა პასუხი. ჯავშანი ავტომატურად გაუქმდა. ბლოკირებული თანხა 3-5 სამუშაო დღეში დაგიბრუნდება.',
    sCar: 'მანქანა', sBooking: 'ჯავშნის დეტალები', sPricing: 'ფასების სპეციფიკაცია',
    lType: 'ტიპი', lGear: 'გადაცემათა კოლოფი', lFuel: 'საწვავი', lSeats: 'ადგილი', lLocation: 'ადგილი',
    lId: 'ჯავშნის ID', lPickDate: 'აყვანის თარიღი', lRetDate: 'დაბრუნების თარიღი',
    lDur: 'ხანგრძლივობა', lDays: (n: number) => `${n} დღე`,
    lPickLoc: 'აყვანის ადგილი', lDeliv: 'მიტანის მისამართი',
    dtypes: { none: '', airport_tbilisi: 'თბილისის აეროპორტი', airport_kutaisi: 'ქუთაისის აეროპორტი', airport_batumi: 'ბათუმის აეროპორტი', city: 'ქალაქში მიტანა' } as Record<string,string>,
    lBase: (n: number, p: number) => `ბაზისური ქირა (${n} დღე × ${p} ₾)`,
    lIns: (pl: string, dp: number, n: number) => dp > 0 ? `${pl} დაზღვევა (${dp} ₾/დღ × ${n})` : `${pl} დაზღვევა (ჩართულია)`,
    lFee: 'სერვის საკომისიო (5%)', lDeliveryCost: 'მიტანა',
    lTotal: 'სულ გადასახდელი', lDeposit: 'უსაფრთხოების დეპოზიტი',
    lDepositNote: '(ბლოკირება · ბრუნდება მანქანის დაბრუნების შემდეგ)',
    plans: { basic: 'ბაზისური', standard: 'სტანდარტული', premium: 'პრემიუმი' } as Record<string,string>,
    deduct: (n: number) => n === 0 ? 'ნულოვანი ფრანშიზა ✓' : `ფრანშიზა: ${n} ₾`,
    sIns: 'დაზღვევის გეგმა',
    photoTitle: '📸 სავალდებულო: გადაიღეთ ფოტოები',
    photoSub: 'ფოტოები — თქვენი ერთადერთი დაცვა. ატვირთეთ დეშბორდიდან.',
    pickupH: 'მანქანის აყვანისას', pickupBody: 'გახსენით ჯავშანი დეშბორდიდან. გადაიღეთ ფოტოები წინა, უკანა, ორივე გვერდიდან და სალონიდან. ატვირთეთ და მხოლოდ შემდეგ დააჭირეთ <strong>"მანქანა აყვანილია"</strong>.',
    returnH: 'მანქანის დაბრუნებისას', returnBody: 'ბრუნვამდე გადაიღეთ ფოტოები, ატვირთეთ და დააჭირეთ <strong>"მანქანა დაბრუნებულია"</strong>.',
    photoWarn: 'ფოტოების გარეშე WAYGO.ge ვერ დაიცავს თქვენ გაურკვეველ სიტუაციებში. <strong>ფოტოები = თქვენი უფლებების დაცვა.</strong>',
    ctaBooking: 'ჩემი ჯავშნის ნახვა',
    ctaFind: 'სხვა მანქანა ნახე',
    ctaNote: 'თუ ავტორიზებული არ ხარ, ჯერ შესვლის გვერდი გამოჩნდება.',
    rejectedFindNote: 'სხვა შესაფერისი მანქანები ელოდებიან!',
    footNote: 'ეს ავტომატური შეტყობინებაა — გთხოვთ პასუხი არ გამოაგზავნოთ.',
    copy: `© ${new Date().getFullYear()} WAYGO.ge — P2P ავტოდაქირავება საქართველოში`,
  },
  ru: {
    subjectSubmitted: (b: string, m: string, y: number) => `📋 Запрос на бронирование отправлен — ${b} ${m} ${y}`,
    subjectApproved:  (b: string, m: string, y: number) => `✅ Бронирование подтверждено — ${b} ${m} ${y}`,
    subjectRejected:  (b: string, m: string, y: number) => `❌ Бронирование не подтверждено — ${b} ${m} ${y}`,
    badgeAwaiting: 'Ожидает подтверждения',
    badgeConfirmed: 'Подтверждено',
    badgeRejected: 'Отклонено',
    greeting: (n: string) => `Здравствуйте, ${n}!`,
    introSubmitted: 'Ваш запрос на бронирование успешно отправлен. Хозяин автомобиля примет решение в течение 24 часов — вы получите ответ на почту.',
    introApproved: 'Поздравляем! 🎉 Хозяин подтвердил ваше бронирование. Автомобиль вас ждёт — откройте бронирование в личном кабинете.',
    introRejectedByHost: 'К сожалению, хозяин не смог принять ваш запрос на бронирование. Заблокированная сумма будет возвращена в течение 3–5 рабочих дней.',
    introAutoRejected: 'К сожалению, хозяин не ответил в течение 24 часов. Бронирование было автоматически отменено. Заблокированная сумма будет возвращена в течение 3–5 рабочих дней.',
    sCar: 'Автомобиль', sBooking: 'Детали бронирования', sPricing: 'Детализация стоимости',
    lType: 'Тип', lGear: 'Коробка передач', lFuel: 'Топливо', lSeats: 'Мест', lLocation: 'Город',
    lId: 'ID бронирования', lPickDate: 'Дата получения', lRetDate: 'Дата возврата',
    lDur: 'Длительность', lDays: (n: number) => `${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'}`,
    lPickLoc: 'Место получения', lDeliv: 'Адрес доставки',
    dtypes: { none: '', airport_tbilisi: 'Аэропорт Тбилиси', airport_kutaisi: 'Аэропорт Кутаиси', airport_batumi: 'Аэропорт Батуми', city: 'Доставка по городу' } as Record<string,string>,
    lBase: (n: number, p: number) => `Базовая аренда (${n} дн. × ${p} ₾)`,
    lIns: (pl: string, dp: number, n: number) => dp > 0 ? `${pl} страховка (${dp} ₾/дн. × ${n})` : `${pl} страховка (включена)`,
    lFee: 'Комиссия сервиса (5%)', lDeliveryCost: 'Доставка',
    lTotal: 'Итого к оплате', lDeposit: 'Залог (блокировка)',
    lDepositNote: 'Возвращается после возврата автомобиля',
    plans: { basic: 'Базовый', standard: 'Стандартный', premium: 'Премиум' } as Record<string,string>,
    deduct: (n: number) => n === 0 ? 'Нулевая франшиза ✓' : `Франшиза: ${n} ₾`,
    sIns: 'Страховой план',
    photoTitle: '📸 Обязательно: Сфотографируйте автомобиль',
    photoSub: 'Фотографии — ваша единственная защита. Загрузите через личный кабинет.',
    pickupH: 'При получении автомобиля', pickupBody: 'Откройте бронирование в личном кабинете. Сфотографируйте автомобиль со всех сторон. Загрузите фото и нажмите <strong>«Автомобиль получен»</strong>.',
    returnH: 'При возврате автомобиля', returnBody: 'Перед возвратом сделайте фотографии, загрузите и нажмите <strong>«Автомобиль возвращён»</strong>.',
    photoWarn: 'Без фотографий WAYGO.ge не сможет защитить вас в спорных ситуациях. <strong>Фотографии = защита ваших прав.</strong>',
    ctaBooking: 'Посмотреть бронирование',
    ctaFind: 'Найти другой автомобиль',
    ctaNote: 'Если вы не авторизованы, сначала появится страница входа.',
    rejectedFindNote: 'Другие подходящие автомобили уже ждут вас!',
    footNote: 'Это автоматическое уведомление — пожалуйста, не отвечайте на него.',
    copy: `© ${new Date().getFullYear()} WAYGO.ge — P2P аренда авто в Грузии`,
  },
  en: {
    subjectSubmitted: (b: string, m: string, y: number) => `📋 Booking Request Sent — ${b} ${m} ${y}`,
    subjectApproved:  (b: string, m: string, y: number) => `✅ Booking Confirmed — ${b} ${m} ${y}`,
    subjectRejected:  (b: string, m: string, y: number) => `❌ Booking Not Confirmed — ${b} ${m} ${y}`,
    badgeAwaiting: 'Awaiting Host Approval',
    badgeConfirmed: 'Confirmed',
    badgeRejected: 'Declined',
    greeting: (n: string) => `Hello, ${n}!`,
    introSubmitted: 'Your booking request has been submitted successfully. The host has 24 hours to respond — you will receive their decision by email.',
    introApproved: 'Congratulations! 🎉 Your booking has been confirmed by the host. The car is ready for you — open the booking from your dashboard.',
    introRejectedByHost: 'Unfortunately, the host was unable to accept your booking request. Any held amount will be released within 3–5 business days.',
    introAutoRejected: 'Unfortunately, the host did not respond within 24 hours. Your booking has been automatically cancelled. Any held amount will be released within 3–5 business days.',
    sCar: 'Your Rental Car', sBooking: 'Booking Details', sPricing: 'Price Breakdown',
    lType: 'Type', lGear: 'Transmission', lFuel: 'Fuel', lSeats: 'Seats', lLocation: 'Location',
    lId: 'Booking ID', lPickDate: 'Pick-up Date', lRetDate: 'Return Date',
    lDur: 'Duration', lDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    lPickLoc: 'Pick-up Location', lDeliv: 'Delivery Address',
    dtypes: { none: '', airport_tbilisi: 'Tbilisi Airport', airport_kutaisi: 'Kutaisi Airport', airport_batumi: 'Batumi Airport', city: 'City Delivery' } as Record<string,string>,
    lBase: (n: number, p: number) => `Base Rent (${n} ${n === 1 ? 'day' : 'days'} × ${p} ₾)`,
    lIns: (pl: string, dp: number, n: number) => dp > 0 ? `${pl} Insurance (${dp} ₾/day × ${n})` : `${pl} Insurance (Included)`,
    lFee: 'Service Fee (5%)', lDeliveryCost: 'Delivery',
    lTotal: 'Total Payable', lDeposit: 'Security Deposit (Hold)',
    lDepositNote: 'Released after vehicle return',
    plans: { basic: 'Basic', standard: 'Standard', premium: 'Premium' } as Record<string,string>,
    deduct: (n: number) => n === 0 ? 'Zero Deductible ✓' : `Deductible: ${n} ₾`,
    sIns: 'Insurance Plan',
    photoTitle: '📸 Required: Photograph the Vehicle',
    photoSub: 'Photos are your only protection — upload them from your dashboard.',
    pickupH: 'When picking up the car', pickupBody: 'Open this booking in your dashboard. Photograph the car from all angles. Upload the photos, then press <strong>"Car Picked Up"</strong>.',
    returnH: 'When returning the car', returnBody: 'Before handing over the keys, take the same photos, upload them, and press <strong>"Car Returned"</strong>.',
    photoWarn: 'Without photos, WAYGO.ge cannot protect you in disputed situations. <strong>Photos = protection of your rights.</strong>',
    ctaBooking: 'View My Booking',
    ctaFind: 'Browse Other Cars',
    ctaNote: 'If not logged in, you will be redirected to sign in first.',
    rejectedFindNote: 'Other great cars are waiting for you!',
    footNote: 'This is an automated message — please do not reply.',
    copy: `© ${new Date().getFullYear()} WAYGO.ge — P2P Car Rental in Georgia`,
  },
};

// ─── 2. HOST STRINGS (always KA + EN bilingual) ───────────────

const HS = {
  ka: {
    subject:       (b: string, m: string, y: number, guest: string) => `🔔 ახალი ჯავშნის მოთხოვნა — ${b} ${m} ${y} · ${guest}`,
    badge:         'ახალი მოთხოვნა',
    greeting:      (n: string) => `გამარჯობა, ${n}!`,
    intro:         (guest: string) => `<strong>${guest}</strong> ითხოვს თქვენი მანქანის გაქირავებას. გაქვთ <strong>24 საათი</strong> გადაწყვეტილების მისაღებად.`,
    sCar:          'მოთხოვნილი მანქანა',
    sDetails:      'ჯავშნის მოთხოვნა',
    lGuest:        'სტუმარი',
    lPhone:        'მობილური',
    lIdNumber:     'პირადი ნომერი',
    lPickDate:     'აყვანის თარიღი',
    lRetDate:      'დაბრუნების თარიღი',
    lDur:          'ხანგრძლივობა',
    lDays:         (n: number) => `${n} დღე`,
    lTotal:        'სულ ჯამი',
    lDeadline:     'პასუხის ვადა',
    urgentTitle:   '⏰ 24-საათიანი ვადა',
    urgentBody:    'თუ 24 საათის განმავლობაში არ გასცეთ პასუხი, ჯავშანი <strong>ავტომატურად გაუქმდება</strong> და სტუმარს თანხა დაუბრუნდება. თქვენი My Cars გვერდიდან შეგიძლიათ სწრაფად დაადასტუროთ ან უარყოთ მოთხოვნა.',
    cta:           'My Cars — პასუხის გაცემა',
    ctaNote:       'თუ ავტორიზებული არ ხარ, ჯერ შესვლის გვერდი გამოჩნდება.',
    footNote:      'ეს ავტომატური შეტყობინებაა — გთხოვთ პასუხი არ გამოაგზავნოთ.',
    copy:          `© ${new Date().getFullYear()} WAYGO.ge — P2P ავტოდაქირავება საქართველოში`,
  },
  en: {
    subject:       (b: string, m: string, y: number, guest: string) => `🔔 New Booking Request — ${b} ${m} ${y} · ${guest}`,
    badge:         'New Request',
    greeting:      (n: string) => `Hello, ${n}!`,
    intro:         (guest: string) => `<strong>${guest}</strong> wants to rent your car. You have <strong>24 hours</strong> to respond.`,
    sCar:          'Requested Car',
    sDetails:      'Booking Request',
    lGuest:        'Guest',
    lPhone:        'Mobile',
    lIdNumber:     'ID Number',
    lPickDate:     'Pick-up Date',
    lRetDate:      'Return Date',
    lDur:          'Duration',
    lDays:         (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    lTotal:        'Total Amount',
    lDeadline:     'Response Deadline',
    urgentTitle:   '⏰ 24-Hour Response Window',
    urgentBody:    'If you do not respond within 24 hours, the booking will be <strong>automatically cancelled</strong> and the guest will be refunded. Open My Cars to quickly approve or decline.',
    cta:           'My Cars — Respond Now',
    ctaNote:       'If not logged in, you will be redirected to sign in first.',
    footNote:      'This is an automated message — please do not reply.',
    copy:          `© ${new Date().getFullYear()} WAYGO.ge — P2P Car Rental in Georgia`,
  },
};

// ─── 3. buildGuestSection (shared for submitted/approved emails) ──

function buildGuestSection(
  lang: 'en' | 'ka' | 'ru',
  data: BookingEmailData,
  type: 'submitted' | 'approved',
): string {
  const s = GS[lang];
  const { booking, car, totals, days, insurancePlan, grandTotal, siteUrl } = data;
  const dailyPrice = days > 0 ? Math.round(totals.base / days) : totals.base;
  const dailyIns   = totals.insurance > 0 && days > 0 ? Math.round(totals.insurance / days) : 0;
  const bookingUrl = `${siteUrl}/bookings/${booking.id}`;
  const imgUrl     = car.images[0] ?? null;
  const hasDelivery = booking.deliveryType !== 'none' && booking.deliveryCost > 0;
  const deliveryLabel = booking.deliveryAddress ?? s.dtypes[booking.deliveryType] ?? booking.deliveryType;
  const planLabel = s.plans[insurancePlan] ?? insurancePlan;
  const badge = type === 'approved' ? s.badgeConfirmed : s.badgeAwaiting;
  const badgeBg = type === 'approved' ? '#dcfce7' : '#eff6ff';
  const badgeColor = type === 'approved' ? '#166534' : '#1e40af';
  const intro = type === 'approved' ? s.introApproved : s.introSubmitted;

  return `
  <!-- Badge -->
  <div style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:${badgeBg};color:${badgeColor};font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">${badge}</span>
  </div>

  <!-- Greeting -->
  <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 10px;line-height:1.3;">${s.greeting(data.guestName)}</h1>
  <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.8;">${intro}</p>

  <!-- Car -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sCar}</p>
  <div style="border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;">
    ${imgUrl ? `<img src="${imgUrl}" alt="${car.brand} ${car.model}" width="100%" style="width:100%;height:200px;object-fit:cover;display:block;" />` : ''}
    <div style="background:#f8fafc;padding:20px 24px;">
      <p style="font-size:20px;font-weight:800;color:#1e293b;margin:0 0 14px;letter-spacing:-0.3px;">${car.brand} ${car.model} &middot; ${car.year}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;">🚗 ${s.lType}</td>
          <td style="padding:3px 16px 3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.type}</td>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;">⚙️ ${s.lGear}</td>
          <td style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.transmission}</td>
        </tr>
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;">⛽ ${s.lFuel}</td>
          <td style="padding:3px 16px 3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.fuelType}</td>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;">👥 ${s.lSeats}</td>
          <td style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.seats}</td>
        </tr>
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;">📍 ${s.lLocation}</td>
          <td colspan="3" style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.location}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Booking Details -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sBooking}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lId, `<span style="font-family:monospace;font-size:12px;background:#e2e8f0;padding:2px 8px;border-radius:4px;">#${booking.id.slice(-8).toUpperCase()}</span>`)}
      ${row(s.lPickDate, fmtDate(booking.startDate, lang), true)}
      ${row(s.lRetDate, fmtDate(booking.endDate, lang), true)}
      ${row(s.lDur, s.lDays(days), true)}
      ${hasDelivery ? row(s.lDeliv, deliveryLabel, false, true) : row(s.lPickLoc, car.location, false, true)}
    </table>
  </div>

  <!-- Pricing -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sPricing}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lBase(days, dailyPrice), `${totals.base} ₾`)}
      ${row(s.lIns(planLabel, dailyIns, days), totals.insurance > 0 ? `${totals.insurance} ₾` : `<span style="color:#94a3b8;">—</span>`)}
      ${row(s.lFee, `${totals.platformFee} ₾`)}
      ${hasDelivery ? row(s.lDeliveryCost, `${booking.deliveryCost} ₾`) : ''}
      <tr>
        <td style="padding:14px 0 10px;font-size:15px;font-weight:800;color:#1e293b;border-top:2px solid #1a56db;">${s.lTotal}</td>
        <td style="padding:14px 0 10px;font-size:20px;font-weight:900;color:#1a56db;text-align:right;border-top:2px solid #1a56db;">${grandTotal} ₾</td>
      </tr>
      <tr>
        <td style="padding:4px 0 14px;font-size:12px;color:#64748b;">${s.lDeposit}<br/><span style="font-size:11px;color:#94a3b8;">${s.lDepositNote}</span></td>
        <td style="padding:4px 0 14px;font-size:13px;color:#475569;text-align:right;vertical-align:top;">250 ₾</td>
      </tr>
    </table>
  </div>

  <!-- Insurance -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 20px;margin-bottom:24px;">
    <p style="font-size:13px;color:#1e40af;font-weight:700;margin:0 0 3px;">🛡️ ${s.sIns}: ${planLabel}</p>
    <p style="font-size:12px;color:#3b82f6;margin:0;">${s.deduct(totals.deductible)}</p>
  </div>

  ${type === 'approved' ? `
  <!-- Photo Instructions (only on approval) -->
  <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:14px;padding:24px;margin-bottom:28px;">
    <p style="font-size:17px;font-weight:900;color:#78350f;margin:0 0 5px;">${s.photoTitle}</p>
    <p style="font-size:13px;color:#b45309;margin:0 0 20px;font-style:italic;">${s.photoSub}</p>
    <div style="background:#fff;border-radius:10px;padding:16px 18px;margin-bottom:10px;border-left:4px solid #f59e0b;">
      <p style="font-size:13px;font-weight:800;color:#78350f;margin:0 0 6px;">🚗 ${s.pickupH}</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.7;">${s.pickupBody}</p>
    </div>
    <div style="background:#fff;border-radius:10px;padding:16px 18px;margin-bottom:16px;border-left:4px solid #f59e0b;">
      <p style="font-size:13px;font-weight:800;color:#78350f;margin:0 0 6px;">🔑 ${s.returnH}</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.7;">${s.returnBody}</p>
    </div>
    <div style="background:#fef9c3;border-radius:8px;padding:13px 16px;">
      <p style="font-size:12px;color:#713f12;margin:0;line-height:1.7;">⚠️ ${s.photoWarn}</p>
    </div>
  </div>
  ` : ''}

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:10px;">
    <a href="${bookingUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);color:#ffffff;padding:18px 52px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.4px;">${s.ctaBooking}</a>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:0 0 8px;">${s.ctaNote}</p>
  `;
}

// ─── 4. buildHostSection ──────────────────────────────────────

function buildHostSection(lang: 'ka' | 'en', data: HostRequestEmailData): string {
  const s = HS[lang];
  const { hostName, guestName, guestPhone, guestIdNumber, car, booking, days, deadline, siteUrl } = data;
  const myCarsUrl = `${siteUrl}/my-cars`;
  const imgUrl = car.imageUrl;

  return `
  <!-- Badge -->
  <div style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:#fff7ed;color:#c2410c;font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">🔔 ${s.badge}</span>
  </div>

  <!-- Greeting + Intro -->
  <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 10px;line-height:1.3;">${s.greeting(hostName)}</h1>
  <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.8;">${s.intro(guestName)}</p>

  <!-- Car -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sCar}</p>
  <div style="border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;">
    ${imgUrl ? `<img src="${imgUrl}" alt="${car.brand} ${car.model}" width="100%" style="width:100%;height:180px;object-fit:cover;display:block;" />` : ''}
    <div style="background:#f8fafc;padding:18px 22px;">
      <p style="font-size:20px;font-weight:800;color:#1e293b;margin:0;letter-spacing:-0.3px;">${car.brand} ${car.model} &middot; ${car.year}</p>
    </div>
  </div>

  <!-- Request Details -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sDetails}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lGuest, `<strong>${guestName}</strong>`, true)}
      ${guestPhone ? row(s.lPhone, guestPhone, true) : ''}
      ${guestIdNumber ? row(s.lIdNumber, `<span style="font-family:monospace;font-weight:700;">${guestIdNumber}</span>`, true) : ''}
      ${row(s.lPickDate, fmtDate(booking.startDate, lang), true)}
      ${row(s.lRetDate, fmtDate(booking.endDate, lang), true)}
      ${row(s.lDur, s.lDays(days), true)}
      <tr>
        <td style="padding:14px 0;font-size:15px;font-weight:800;color:#1e293b;border-top:2px solid #1a56db;">${s.lTotal}</td>
        <td style="padding:14px 0;font-size:20px;font-weight:900;color:#1a56db;text-align:right;border-top:2px solid #1a56db;">${booking.totalPrice} ₾</td>
      </tr>
    </table>
  </div>

  <!-- Deadline warning -->
  <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;padding:22px 24px;margin-bottom:28px;">
    <p style="font-size:16px;font-weight:900;color:#c2410c;margin:0 0 8px;">${s.urgentTitle}</p>
    <p style="font-size:13px;color:#9a3412;margin:0 0 12px;line-height:1.7;">${s.urgentBody}</p>
    <div style="background:#ffffff;border-radius:8px;padding:10px 14px;display:inline-block;">
      <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 3px;">${s.lDeadline}</p>
      <p style="font-size:14px;font-weight:800;color:#c2410c;margin:0;">⏱ ${fmtDateTime(deadline, lang)}</p>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:10px;">
    <a href="${myCarsUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;padding:18px 52px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.4px;">${s.cta}</a>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:0 0 8px;">${s.ctaNote}</p>
  `;
}

// ─── 5. buildRejectedSection ──────────────────────────────────

function buildRejectedSection(lang: 'en' | 'ka' | 'ru', data: BookingRejectedEmailData): string {
  const s = GS[lang];
  const carsUrl = `${data.siteUrl}/cars`;
  const intro = data.isAutoRejected ? s.introAutoRejected : s.introRejectedByHost;

  return `
  <!-- Badge -->
  <div style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:#fee2e2;color:#991b1b;font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">${s.badgeRejected}</span>
  </div>

  <!-- Greeting -->
  <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 10px;line-height:1.3;">${s.greeting(data.guestName)}</h1>
  <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.8;">${intro}</p>

  ${data.rejectionComment ? `
  <!-- Host comment -->
  <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
    <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#c2410c;margin:0 0 8px;">Host Note</p>
    <p style="font-size:14px;color:#7c2d12;line-height:1.7;margin:0;">${data.rejectionComment.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
  </div>
  ` : ''}

  <!-- Car reference -->
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:20px 24px;margin-bottom:24px;">
    <p style="font-size:18px;font-weight:800;color:#1e293b;margin:0 0 8px;">${data.car.brand} ${data.car.model} &middot; ${data.car.year}</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lPickDate, fmtDate(data.booking.startDate, lang), true)}
      ${row(s.lRetDate, fmtDate(data.booking.endDate, lang), true, true)}
    </table>
  </div>

  <!-- Find another car -->
  <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;padding:22px 24px;margin-bottom:28px;text-align:center;">
    <p style="font-size:28px;margin:0 0 8px;">🚗</p>
    <p style="font-size:15px;font-weight:700;color:#166534;margin:0 0 6px;">${s.rejectedFindNote}</p>
    <p style="font-size:13px;color:#4ade80;margin:0;color:#16a34a;">waygo.ge/cars</p>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:10px;">
    <a href="${carsUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);color:#ffffff;padding:18px 52px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.4px;">${s.ctaFind}</a>
  </div>
  `;
}

// ─── 6. PUBLIC FUNCTIONS ──────────────────────────────────────

export function hostBookingRequestEmail(data: HostRequestEmailData): { html: string; subject: string } {
  const { car } = data;
  const subject = HS.ka.subject(car.brand, car.model, car.year, data.guestName);

  const kaSection = buildHostSection('ka', data);
  const enSection = buildHostSection('en', data);

  const html = `<!DOCTYPE html>
<html lang="ka">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WAYGO.ge — Booking Request</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:34px 48px;text-align:center;">
      <div style="font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;">WAYGO<span style="color:#93c5fd;">.ge</span></div>
      <div style="font-size:10px;color:#93c5fd;margin-top:8px;letter-spacing:4px;text-transform:uppercase;">Host Notification &middot; Georgia</div>
    </td></tr>

    <!-- KA Section -->
    <tr><td style="background:#ffffff;padding:40px 44px 28px;">${kaSection}</td></tr>

    <!-- Divider + EN Section -->
    <tr><td style="background:#ffffff;padding:0 44px;">
      <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
      <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">🇬🇧 &nbsp;English Version</p>
    </td></tr>
    <tr><td style="background:#ffffff;padding:0 44px 28px;">${enSection}</td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:26px 44px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">${HS.ka.copy}</p>
      <p style="margin:0;font-size:11px;color:#cbd5e1;">${HS.ka.footNote}</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  return { html, subject };
}

export function bookingSubmittedEmail(data: BookingEmailData): { html: string; subject: string } {
  const { lang, car } = data;
  const s = GS[lang];
  const subject = s.subjectSubmitted(car.brand, car.model, car.year);
  const primarySection = buildGuestSection(lang, data, 'submitted');
  const needsEn = lang !== 'en';
  const enSection = needsEn ? buildGuestSection('en', data, 'submitted') : '';

  const html = emailShell(lang,
    primarySection + (needsEn ? `
      <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
      <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">🇬🇧 &nbsp;English Version</p>
      ${enSection}
    ` : ''),
    s.footNote, s.copy
  );

  return { html, subject };
}

export function bookingApprovedEmail(data: BookingEmailData): { html: string; subject: string } {
  const { lang, car } = data;
  const s = GS[lang];
  const subject = s.subjectApproved(car.brand, car.model, car.year);
  const primarySection = buildGuestSection(lang, data, 'approved');
  const needsEn = lang !== 'en';
  const enSection = needsEn ? buildGuestSection('en', data, 'approved') : '';

  const html = emailShell(lang,
    primarySection + (needsEn ? `
      <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
      <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">🇬🇧 &nbsp;English Version</p>
      ${enSection}
    ` : ''),
    s.footNote, s.copy
  );

  return { html, subject };
}

export function bookingRejectedEmail(data: BookingRejectedEmailData): { html: string; subject: string } {
  const { lang, car } = data;
  const s = GS[lang];
  const subject = s.subjectRejected(car.brand, car.model, car.year);
  const primarySection = buildRejectedSection(lang, data);
  const needsEn = lang !== 'en';
  const enSection = needsEn ? buildRejectedSection('en', data) : '';

  const html = emailShell(lang,
    primarySection + (needsEn ? `
      <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
      <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">🇬🇧 &nbsp;English Version</p>
      ${enSection}
    ` : ''),
    s.footNote, s.copy
  );

  return { html, subject };
}

// Keep for backward compat (used by admin verifications flow)
export function bookingConfirmationEmail(data: BookingEmailData): { html: string; subject: string } {
  return bookingSubmittedEmail(data);
}

// ─── 7. OTP EMAIL (verify email + password reset) ─────────────

interface OtpEmailData {
  toName: string;
  toEmail: string;
  otp: string;
  type: 'verify_email' | 'reset_password';
  lang?: string;
}

const OTP_STRINGS = {
  verify_email: {
    ka: {
      subject: 'WAYGO — ელ-ფოსტის ვერიფიკაცია',
      badge: 'ელ-ფოსტის ვერიფიკაცია',
      greeting: (n: string) => `გამარჯობა, ${n}!`,
      intro: 'WAYGO-ში სარეგისტრაციოდ გთხოვთ დაადასტუროთ ელ-ფოსტის მისამართი. ქვემოთ მოცემული 6-ნიშნა კოდი შეიყვანეთ ვერიფიკაციის ველში.',
      codeLabel: 'ვერიფიკაციის კოდი',
      expiry: 'კოდი მოქმედებს 10 წუთი. ნუ გაუზიარებ მას არავის.',
      footer: 'თუ ეს მოთხოვნა შენ არ გაგზავნე, უბრალოდ გამოუშვი ეს შეტყობინება.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
    en: {
      subject: 'WAYGO — Verify your email address',
      badge: 'Email Verification',
      greeting: (n: string) => `Hello, ${n}!`,
      intro: 'To complete your WAYGO registration, please verify your email address by entering the 6-digit code below.',
      codeLabel: 'Your verification code',
      expiry: 'This code expires in 10 minutes. Never share it with anyone.',
      footer: 'If you did not request this, you can safely ignore this email.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
    ru: {
      subject: 'WAYGO — Подтвердите ваш email',
      badge: 'Подтверждение Email',
      greeting: (n: string) => `Здравствуйте, ${n}!`,
      intro: 'Для завершения регистрации на WAYGO подтвердите адрес электронной почты, введя шестизначный код ниже.',
      codeLabel: 'Ваш код подтверждения',
      expiry: 'Код действителен 10 минут. Никому не передавайте его.',
      footer: 'Если вы не запрашивали это, просто проигнорируйте письмо.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
  },
  reset_password: {
    ka: {
      subject: 'WAYGO — პაროლის აღდგენა',
      badge: 'პაროლის აღდგენა',
      greeting: (n: string) => `გამარჯობა, ${n}!`,
      intro: 'WAYGO-ს ანგარიშის პაროლის განახლებისთვის შეიყვანეთ ქვემოთ მოცემული 6-ნიშნა კოდი.',
      codeLabel: 'პაროლის აღდგენის კოდი',
      expiry: 'კოდი მოქმედებს 10 წუთი. ნუ გაუზიარებ მას არავის.',
      footer: 'თუ ეს მოთხოვნა შენ არ გაგზავნე, გადაამოწმე ანგარიშის უსაფრთხოება.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
    en: {
      subject: 'WAYGO — Password reset code',
      badge: 'Password Reset',
      greeting: (n: string) => `Hello, ${n}!`,
      intro: 'We received a request to reset your WAYGO account password. Enter the 6-digit code below to proceed.',
      codeLabel: 'Your reset code',
      expiry: 'This code expires in 10 minutes. Never share it with anyone.',
      footer: 'If you did not request a password reset, please check your account security.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
    ru: {
      subject: 'WAYGO — Код сброса пароля',
      badge: 'Сброс пароля',
      greeting: (n: string) => `Здравствуйте, ${n}!`,
      intro: 'Мы получили запрос на сброс пароля вашего аккаунта WAYGO. Введите шестизначный код ниже для продолжения.',
      codeLabel: 'Ваш код сброса',
      expiry: 'Код действителен 10 минут. Никому не передавайте его.',
      footer: 'Если вы не запрашивали сброс пароля, проверьте безопасность аккаунта.',
      copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
    },
  },
};

// ─── 8. BOOKING CANCELLED EMAIL ───────────────────────────────

export interface BookingCancelledEmailData {
  guestName: string;
  guestEmail: string;
  lang: 'en' | 'ka' | 'ru';
  car: { brand: string; model: string; year: number };
  booking: { id: string; startDate: Date; endDate: Date };
  refundAmount: number;
  depositRefund: number;
  platformFeeKept: number;
  totalRefund: number;
  tier: string;
  siteUrl: string;
}

const CS = {
  ka: {
    subject: (b: string, m: string, y: number) => `❌ ჯავშანი გაუქმდა — ${b} ${m} ${y}`,
    badge: 'ჯავშანი გაუქმდა',
    greeting: (n: string) => `გამარჯობა, ${n}!`,
    intro: 'შენი ჯავშანი წარმატებით გაუქმდა. ქვემოთ მოცემულია დაბრუნების დეტალები.',
    sBooking: 'ჯავშნის ინფო',
    sRefund: 'თანხის დაბრუნება',
    lCar: 'მანქანა',
    lDates: 'თარიღები',
    lId: 'ჯავშნის ID',
    lRentalPaid: 'გადახდილი ქირა',
    lFeeKept: 'სერვის საკომისიო (არ ბრუნდება)',
    lRentalRefund: 'ქირის დაბრუნება',
    lDepositRefund: 'დეპოზიტის დაბრუნება',
    lTotal: 'სულ დაგიბრუნდება',
    timing: '3–5 სამუშაო დღე',
    timingNote: 'თანხა დაგიბრუნდება 3–5 სამუშაო დღის განმავლობაში.',
    ctaLabel: 'ჯავშნების ნახვა',
    footNote: 'ეს ავტომატური შეტყობინებაა — გთხოვთ პასუხი არ გამოაგზავნოთ.',
    copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
  },
  ru: {
    subject: (b: string, m: string, y: number) => `❌ Бронирование отменено — ${b} ${m} ${y}`,
    badge: 'Бронирование отменено',
    greeting: (n: string) => `Здравствуйте, ${n}!`,
    intro: 'Ваше бронирование успешно отменено. Ниже приведены детали возврата.',
    sBooking: 'Информация о бронировании',
    sRefund: 'Возврат средств',
    lCar: 'Автомобиль',
    lDates: 'Даты',
    lId: 'ID бронирования',
    lRentalPaid: 'Оплачено за аренду',
    lFeeKept: 'Комиссия платформы (не возвращается)',
    lRentalRefund: 'Возврат аренды',
    lDepositRefund: 'Возврат залога',
    lTotal: 'Итого к возврату',
    timing: '3–5 рабочих дней',
    timingNote: 'Средства будут возвращены в течение 3–5 рабочих дней.',
    ctaLabel: 'Мои бронирования',
    footNote: 'Это автоматическое уведомление — пожалуйста, не отвечайте.',
    copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
  },
  en: {
    subject: (b: string, m: string, y: number) => `❌ Booking Cancelled — ${b} ${m} ${y}`,
    badge: 'Booking Cancelled',
    greeting: (n: string) => `Hello, ${n}!`,
    intro: 'Your booking has been successfully cancelled. Below are the refund details.',
    sBooking: 'Booking Information',
    sRefund: 'Refund Breakdown',
    lCar: 'Car',
    lDates: 'Dates',
    lId: 'Booking ID',
    lRentalPaid: 'Rental amount paid',
    lFeeKept: 'Platform fee (non-refundable)',
    lRentalRefund: 'Rental refund',
    lDepositRefund: 'Deposit return',
    lTotal: 'Total you will receive',
    timing: '3–5 business days',
    timingNote: 'Your refund will be processed within 3–5 business days.',
    ctaLabel: 'View My Bookings',
    footNote: 'This is an automated message — please do not reply.',
    copy: `© ${new Date().getFullYear()} WAYGO Georgia`,
  },
};

export function bookingCancelledEmail(data: BookingCancelledEmailData): { html: string; subject: string } {
  const { lang, car, booking, guestName, refundAmount, depositRefund, platformFeeKept, totalRefund, siteUrl } = data;
  const s = CS[lang];
  const rentalPaid = refundAmount + platformFeeKept;
  const dashUrl = `${siteUrl}/dashboard`;

  const html = emailShell(lang, `
  <!-- Badge -->
  <div style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:#fee2e2;color:#991b1b;font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">❌ ${s.badge}</span>
  </div>

  <!-- Greeting -->
  <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 10px;line-height:1.3;">${s.greeting(guestName)}</h1>
  <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.8;">${s.intro}</p>

  <!-- Booking info -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sBooking}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lId, `<span style="font-family:monospace;font-size:12px;background:#e2e8f0;padding:2px 8px;border-radius:4px;">#${booking.id.slice(-8).toUpperCase()}</span>`)}
      ${row(s.lCar, `${car.brand} ${car.model} ${car.year}`, true)}
      ${row(s.lDates, `${fmtDate(booking.startDate, lang)} — ${fmtDate(booking.endDate, lang)}`, false, true)}
    </table>
  </div>

  <!-- Refund breakdown -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sRefund}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lRentalPaid, `${rentalPaid} ₾`)}
      ${platformFeeKept > 0 ? row(`<span style="color:#ef4444;">− ${s.lFeeKept}</span>`, `<span style="color:#ef4444;">−${platformFeeKept} ₾</span>`) : ''}
      ${refundAmount > 0 ? row(s.lRentalRefund, `${refundAmount} ₾`, true) : `<tr><td style="padding:11px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">${s.lRentalRefund}</td><td style="padding:11px 0;font-size:13px;color:#94a3b8;text-align:right;border-bottom:1px solid #f1f5f9;">0 ₾</td></tr>`}
      ${row(s.lDepositRefund, `${depositRefund} ₾`, true)}
      <tr>
        <td style="padding:14px 0 10px;font-size:15px;font-weight:800;color:#166534;border-top:2px solid #16a34a;">${s.lTotal}</td>
        <td style="padding:14px 0 10px;font-size:20px;font-weight:900;color:#16a34a;text-align:right;border-top:2px solid #16a34a;">${totalRefund} ₾</td>
      </tr>
    </table>
  </div>

  <!-- Timing -->
  <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:16px 20px;margin-bottom:28px;text-align:center;">
    <p style="font-size:13px;font-weight:700;color:#166534;margin:0;">⏱ ${s.timingNote}</p>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:10px;">
    <a href="${dashUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);color:#ffffff;padding:18px 52px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.4px;">${s.ctaLabel}</a>
  </div>
  `, s.footNote, s.copy);

  return { html, subject: s.subject(car.brand, car.model, car.year) };
}

export function sendOtpEmail(data: OtpEmailData): { html: string; subject: string; to: string } {
  const lang = (data.lang && ['ka', 'en', 'ru'].includes(data.lang) ? data.lang : 'en') as 'ka' | 'en' | 'ru';
  const s = OTP_STRINGS[data.type][lang];
  const digits = data.otp.split('');

  const digitCells = digits.map(d =>
    `<td style="width:54px;height:72px;text-align:center;vertical-align:middle;background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;font-size:42px;font-weight:900;color:#1a56db;font-family:'Courier New',Courier,monospace;letter-spacing:0;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${s.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;margin:0 auto;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:32px 48px;text-align:center;">
      <div style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;">WAYGO<span style="color:#93c5fd;">.ge</span></div>
      <div style="font-size:10px;color:#93c5fd;margin-top:8px;letter-spacing:4px;text-transform:uppercase;">P2P Car Rental &middot; Georgia</div>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:44px 48px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <!-- Badge -->
      <div style="text-align:center;margin-bottom:28px;">
        <span style="display:inline-block;background:#eff6ff;color:#1e40af;font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">🔐 ${s.badge}</span>
      </div>

      <!-- Greeting -->
      <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 12px;text-align:center;line-height:1.3;">${s.greeting(data.toName)}</h1>
      <p style="font-size:15px;color:#475569;margin:0 0 36px;line-height:1.8;text-align:center;">${s.intro}</p>

      <!-- Code label -->
      <p style="font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#94a3b8;text-align:center;margin:0 0 16px;">${s.codeLabel}</p>

      <!-- OTP digits table -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
        <tr>${digitCells}</tr>
      </table>

      <!-- Full code copyable fallback -->
      <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:28px;">
        <p style="font-size:11px;color:#94a3b8;margin:0 0 6px;letter-spacing:1px;text-transform:uppercase;">Copy code</p>
        <p style="font-size:36px;font-weight:900;color:#1a56db;font-family:'Courier New',Courier,monospace;margin:0;letter-spacing:16px;">${data.otp}</p>
      </div>

      <!-- Expiry notice -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 20px;text-align:center;margin-bottom:12px;">
        <p style="font-size:13px;color:#9a3412;margin:0;font-weight:600;">⏱ ${s.expiry}</p>
      </div>

    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;padding:24px 48px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">${s.footer}</p>
      <p style="margin:0;font-size:11px;color:#cbd5e1;">${s.copy}</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  return { html, subject: s.subject, to: data.toEmail };
}

export function emailLayout(content: string, ctaHref: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WAYGO</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:48px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">
      <tr><td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-1px;">WAYGO</div>
        <div style="font-size:11px;color:#93c5fd;margin-top:6px;letter-spacing:3px;text-transform:uppercase;">waygo.ge</div>
      </td></tr>
      <tr><td style="background:#ffffff;padding:48px 48px 32px;color:#1e293b;font-size:15px;line-height:1.75;">${content}</td></tr>
      <tr><td style="background:#ffffff;padding:0 48px 48px;text-align:center;">
        <a href="${ctaHref}" style="display:inline-block;background:#1a56db;color:#ffffff;padding:16px 40px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px;">${ctaLabel}</a>
      </td></tr>
      <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:28px 48px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">&#169; ${new Date().getFullYear()} WAYGO Georgia &mdash; Confident Mobility</p>
        <p style="margin:0;font-size:11px;color:#cbd5e1;">This is an automated message &mdash; please do not reply to this email.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function adminNotificationLayout(content: string, ctaHref: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WAYGO Admin</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:48px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">
      <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-1px;">WAYGO</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:6px;letter-spacing:3px;text-transform:uppercase;">Admin Notification</div>
      </td></tr>
      <tr><td style="background:#ffffff;padding:48px 48px 32px;color:#1e293b;font-size:15px;line-height:1.75;">${content}</td></tr>
      <tr><td style="background:#ffffff;padding:0 48px 48px;text-align:center;">
        <a href="${ctaHref}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:16px 40px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px;">${ctaLabel}</a>
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">თუ ავტორიზებული არ ხარ, ჯერ შესვლის გვერდი გამოჩნდება.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:28px 48px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">&#169; ${new Date().getFullYear()} WAYGO Georgia &mdash; Admin System</p>
        <p style="margin:0;font-size:11px;color:#cbd5e1;">ეს შეტყობინება ავტომატურად გაიგზავნა &mdash; პასუხი არ სჭირდება.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
