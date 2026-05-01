// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOKING CONFIRMATION EMAIL
// Sent immediately when a guest submits a booking.
// Language: guest's UI language first; English always appended below for KA/RU.
// Photo section is intentionally prominent — without photos the platform
// cannot resolve disputes and the guest may face financial liability.
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

const LS = {
  ka: {
    subject:        (b: string, m: string, y: number) => `✅ ჯავშანი გაიგზავნა — ${b} ${m} ${y}`,
    badge:          { pending: 'განხილვაში', confirmed: 'დადასტურებული', rejected: 'უარყოფილი', cancelled: 'გაუქმებული', completed: 'დასრულებული' } as Record<string,string>,
    greeting:       (n: string) => `გამარჯობა, ${n}!`,
    intro:          'თქვენი ჯავშანი წარმატებით გაიგზავნა. მასპინძელი განიხილავს და მალე დაადასტურებს.',
    sCar:           'დაჯავშნული მანქანა',
    lType:          'ტიპი', lGear: 'გადაცემათა კოლოფი', lFuel: 'საწვავი', lSeats: 'ადგილი', lLocation: 'ადგილი',
    sBooking:       'ჯავშნის დეტალები',
    lId:            'ჯავშნის ID', lPickDate: 'აყვანის თარიღი', lRetDate: 'დაბრუნების თარიღი',
    lDur:           'ხანგრძლივობა', lDays: (n: number) => `${n} დღე`,
    lPickLoc:       'აყვანის ადგილი', lDeliv: 'მიტანის ადგილი',
    dtypes:         { none: '', airport_tbilisi: 'თბილისის აეროპორტი', airport_kutaisi: 'ქუთაისის აეროპორტი', airport_batumi: 'ბათუმის აეროპორტი', city: 'ქალაქში მიტანა' } as Record<string,string>,
    sPricing:       'ფასების სპეციფიკაცია',
    lBase:          (n: number, p: number) => `ბაზისური ქირა (${n} დღე × ${p} ₾)`,
    lIns:           (pl: string, dp: number, n: number) => dp > 0 ? `${pl} დაზღვევა (${dp} ₾/დღეში × ${n})` : `${pl} დაზღვევა (ჩართულია)`,
    lFee:           'სერვის საკომისიო (12%)',
    lDeliveryCost:  'მიტანა',
    lTotal:         'სულ გადასახდელი',
    lDeposit:       'უსაფრთხოების დეპოზიტი',
    lDepositNote:   '(ბლოკირება · ბრუნდება მანქანის დაბრუნების შემდეგ)',
    lIncluded:      'ჩართულია',
    sIns:           'დაზღვევის გეგმა',
    plans:          { basic: 'ბაზისური', standard: 'სტანდარტული', premium: 'პრემიუმი' } as Record<string,string>,
    deduct:         (n: number) => n === 0 ? 'ნულოვანი ფრანშიზა ✓' : `ფრანშიზა: ${n} ₾`,
    photoTitle:     '📸 სავალდებულო: გადაიღეთ ფოტოები',
    photoSub:       'ფოტოები — თქვენი ერთადერთი დაცვა. ატვირთეთ დეშბორდიდან.',
    pickupH:        'მანქანის აყვანისას',
    pickupBody:     'გახსენით ჯავშანი დეშბორდიდან. გადაიღეთ ფოტოები წინა, უკანა, ორივე გვერდიდან და სალონიდან. ატვირთეთ და მხოლოდ შემდეგ დააჭირეთ <strong>"მანქანა აყვანილია"</strong>. ღილაკი ფოტოების გარეშე არ გააქტიურდება.',
    returnH:        'მანქანის დაბრუნებისას',
    returnBody:     'ბრუნვამდე გადაიღეთ ფოტოები იგივე გზით, ატვირთეთ და დააჭირეთ <strong>"მანქანა დაბრუნებულია"</strong>. ამ ნაბიჯის გარეშე ჯავშანი ვერ დაიხურება.',
    photoWarn:      'ფოტოების გარეშე Drivo.ge ვერ დაიცავს თქვენ გაურკვეველ სიტუაციებში. ასეთ შემთხვევაში მოიჯარეს შეიძლება ფინანსური პასუხისმგებლობა დაეკისროს ნებისმიერი დაზიანებისთვის. <strong>ფოტოები = თქვენი უფლებების დაცვა.</strong>',
    cta:            'ჩემი ჯავშნის ნახვა',
    ctaNote:        'თუ ავტორიზებული არ ხარ, ჯერ შესვლის გვერდი გამოჩნდება.',
    footNote:       'ეს ავტომატური შეტყობინებაა — გთხოვთ პასუხი არ გამოაგზავნოთ.',
    copy:           `© ${new Date().getFullYear()} Drivo.ge — P2P ავტოდაქირავება საქართველოში`,
  },
  ru: {
    subject:        (b: string, m: string, y: number) => `✅ Бронирование отправлено — ${b} ${m} ${y}`,
    badge:          { pending: 'На рассмотрении', confirmed: 'Подтверждено', rejected: 'Отклонено', cancelled: 'Отменено', completed: 'Завершено' } as Record<string,string>,
    greeting:       (n: string) => `Здравствуйте, ${n}!`,
    intro:          'Ваше бронирование успешно отправлено. Хозяин автомобиля скоро рассмотрит и подтвердит.',
    sCar:           'Забронированный автомобиль',
    lType:          'Тип', lGear: 'Коробка передач', lFuel: 'Топливо', lSeats: 'Мест', lLocation: 'Город',
    sBooking:       'Детали бронирования',
    lId:            'ID бронирования', lPickDate: 'Дата получения', lRetDate: 'Дата возврата',
    lDur:           'Длительность', lDays: (n: number) => `${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'}`,
    lPickLoc:       'Место получения', lDeliv: 'Адрес доставки',
    dtypes:         { none: '', airport_tbilisi: 'Аэропорт Тбилиси', airport_kutaisi: 'Аэропорт Кутаиси', airport_batumi: 'Аэропорт Батуми', city: 'Доставка по городу' } as Record<string,string>,
    sPricing:       'Детализация стоимости',
    lBase:          (n: number, p: number) => `Базовая аренда (${n} дн. × ${p} ₾)`,
    lIns:           (pl: string, dp: number, n: number) => dp > 0 ? `${pl} страховка (${dp} ₾/дн. × ${n})` : `${pl} страховка (включена)`,
    lFee:           'Комиссия сервиса (12%)',
    lDeliveryCost:  'Доставка',
    lTotal:         'Итого к оплате',
    lDeposit:       'Залог (блокировка)',
    lDepositNote:   'Возвращается после возврата автомобиля',
    lIncluded:      'Включено',
    sIns:           'Страховой план',
    plans:          { basic: 'Базовый', standard: 'Стандартный', premium: 'Премиум' } as Record<string,string>,
    deduct:         (n: number) => n === 0 ? 'Нулевая франшиза ✓' : `Франшиза: ${n} ₾`,
    photoTitle:     '📸 Обязательно: Сфотографируйте автомобиль',
    photoSub:       'Фотографии — ваша единственная защита. Загрузите через личный кабинет.',
    pickupH:        'При получении автомобиля',
    pickupBody:     'Откройте бронирование в личном кабинете. Сфотографируйте автомобиль спереди, сзади, с обоих боков и внутри. Загрузите фото и только потом нажмите <strong>«Автомобиль получен»</strong>. Без фотографий кнопка недоступна.',
    returnH:        'При возврате автомобиля',
    returnBody:     'Перед возвратом сделайте фотографии таким же образом, загрузите и нажмите <strong>«Автомобиль возвращён»</strong>. Без этого шага бронирование не закроется.',
    photoWarn:      'Без фотографий Drivo.ge не сможет защитить вас в спорных ситуациях. В таком случае арендатор может понести финансовую ответственность за любые повреждения. <strong>Фотографии = защита ваших прав.</strong>',
    cta:            'Посмотреть бронирование',
    ctaNote:        'Если вы не авторизованы, сначала появится страница входа.',
    footNote:       'Это автоматическое уведомление — пожалуйста, не отвечайте на него.',
    copy:           `© ${new Date().getFullYear()} Drivo.ge — P2P аренда авто в Грузии`,
  },
  en: {
    subject:        (b: string, m: string, y: number) => `✅ Booking Submitted — ${b} ${m} ${y}`,
    badge:          { pending: 'Pending Review', confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed' } as Record<string,string>,
    greeting:       (n: string) => `Hello, ${n}!`,
    intro:          'Your booking has been successfully submitted. The host will review and confirm shortly.',
    sCar:           'Your Rental Car',
    lType:          'Type', lGear: 'Transmission', lFuel: 'Fuel', lSeats: 'Seats', lLocation: 'Location',
    sBooking:       'Booking Details',
    lId:            'Booking ID', lPickDate: 'Pick-up Date', lRetDate: 'Return Date',
    lDur:           'Duration', lDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    lPickLoc:       'Pick-up Location', lDeliv: 'Delivery Address',
    dtypes:         { none: '', airport_tbilisi: 'Tbilisi Airport', airport_kutaisi: 'Kutaisi Airport', airport_batumi: 'Batumi Airport', city: 'City Delivery' } as Record<string,string>,
    sPricing:       'Price Breakdown',
    lBase:          (n: number, p: number) => `Base Rent (${n} ${n===1?'day':'days'} × ${p} ₾)`,
    lIns:           (pl: string, dp: number, n: number) => dp > 0 ? `${pl} Insurance (${dp} ₾/day × ${n})` : `${pl} Insurance (Included)`,
    lFee:           'Service Fee (12%)',
    lDeliveryCost:  'Delivery',
    lTotal:         'Total Payable',
    lDeposit:       'Security Deposit (Hold)',
    lDepositNote:   'Released after vehicle return',
    lIncluded:      'Included',
    sIns:           'Insurance Plan',
    plans:          { basic: 'Basic', standard: 'Standard', premium: 'Premium' } as Record<string,string>,
    deduct:         (n: number) => n === 0 ? 'Zero Deductible ✓' : `Deductible: ${n} ₾`,
    photoTitle:     '📸 Required: Photograph the Vehicle',
    photoSub:       'Photos are your only protection — upload them from your dashboard.',
    pickupH:        'When picking up the car',
    pickupBody:     'Open this booking in your dashboard. Photograph the car from all angles — front, rear, both sides, and interior. Upload the photos, then press <strong>"Car Picked Up"</strong>. The button is unavailable without photos.',
    returnH:        'When returning the car',
    returnBody:     'Before handing over the keys, take photos the same way, upload them, and press <strong>"Car Returned"</strong>. Without this step the booking cannot be closed.',
    photoWarn:      'Without photos, Drivo.ge cannot protect you in disputed situations. In such cases the renter may be held financially liable for any damage. <strong>Photos = protection of your rights.</strong>',
    cta:            'View My Booking',
    ctaNote:        'If not logged in, you will be redirected to the sign-in page first.',
    footNote:       'This is an automated message — please do not reply.',
    copy:           `© ${new Date().getFullYear()} Drivo.ge — P2P Car Rental in Georgia`,
  },
};

function fmtDate(d: Date, lang: string): string {
  const m: Record<string, string[]> = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    ka: ['იანვ.','თებ.','მარ.','აპრ.','მაი.','ივნ.','ივლ.','აგვ.','სექ.','ოქტ.','ნოე.','დეკ.'],
    ru: ['янв.','фев.','мар.','апр.','май','июн.','июл.','авг.','сен.','окт.','ноя.','дек.'],
  };
  const months = m[lang] ?? m.en;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function badgeStyle(status: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    pending:   { bg: '#fef3c7', color: '#92400e' },
    confirmed: { bg: '#dcfce7', color: '#166534' },
    rejected:  { bg: '#fee2e2', color: '#991b1b' },
    cancelled: { bg: '#f1f5f9', color: '#475569' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
  };
  return map[status] ?? map.pending;
}

function buildBookingSection(lang: 'en' | 'ka' | 'ru', data: BookingEmailData): string {
  const s = LS[lang];
  const { booking, car, totals, days, insurancePlan, grandTotal, siteUrl } = data;
  const bs = badgeStyle(booking.status);
  const badgeLabel = s.badge[booking.status] ?? booking.status;
  const planLabel = s.plans[insurancePlan] ?? insurancePlan;
  const dailyPrice = days > 0 ? Math.round(totals.base / days) : totals.base;
  const dailyIns   = totals.insurance > 0 && days > 0 ? Math.round(totals.insurance / days) : 0;
  const bookingUrl = `${siteUrl}/bookings/${booking.id}`;
  const imgUrl     = car.images[0] ?? null;
  const hasDelivery = booking.deliveryType !== 'none' && booking.deliveryCost > 0;
  const deliveryLabel = booking.deliveryAddress ?? s.dtypes[booking.deliveryType] ?? booking.deliveryType;

  const row = (label: string, value: string, bold = false, last = false) => `
    <tr>
      <td style="padding:11px 0;font-size:13px;color:#64748b;${last?'':'border-bottom:1px solid #f1f5f9;'}">${label}</td>
      <td style="padding:11px 0;font-size:13px;color:#1e293b;${bold?'font-weight:700;':''}text-align:right;${last?'':'border-bottom:1px solid #f1f5f9;'}">${value}</td>
    </tr>`;

  return `
  <!-- Badge -->
  <div style="text-align:center;margin:0 0 28px;">
    <span style="display:inline-block;background:${bs.bg};color:${bs.color};font-weight:800;font-size:11px;letter-spacing:2.5px;padding:7px 22px;border-radius:100px;text-transform:uppercase;">${badgeLabel}</span>
  </div>

  <!-- Greeting -->
  <h1 style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 10px;line-height:1.3;">${s.greeting(data.guestName)}</h1>
  <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.8;">${s.intro}</p>

  <!-- Car -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sCar}</p>
  <div style="border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;">
    ${imgUrl ? `<img src="${imgUrl}" alt="${car.brand} ${car.model}" width="100%" style="width:100%;height:200px;object-fit:cover;display:block;" />` : ''}
    <div style="background:#f8fafc;padding:20px 24px;">
      <p style="font-size:20px;font-weight:800;color:#1e293b;margin:0 0 14px;letter-spacing:-0.3px;">${car.brand} ${car.model} &middot; ${car.year}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;white-space:nowrap;">🚗 ${s.lType}</td>
          <td style="padding:3px 16px 3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.type}</td>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;white-space:nowrap;">⚙️ ${s.lGear}</td>
          <td style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.transmission}</td>
        </tr>
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;white-space:nowrap;">⛽ ${s.lFuel}</td>
          <td style="padding:3px 16px 3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.fuelType}</td>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;white-space:nowrap;">👥 ${s.lSeats}</td>
          <td style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.seats}</td>
        </tr>
        <tr>
          <td style="padding:3px 12px 3px 0;font-size:12px;color:#64748b;white-space:nowrap;">📍 ${s.lLocation}</td>
          <td colspan="3" style="padding:3px 0;font-size:12px;color:#1e293b;font-weight:600;">${car.location}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Booking Details -->
  <p style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;">${s.sBooking}</p>
  <div style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;padding:4px 24px;margin-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row(s.lId, `<span style="font-family:monospace;font-size:12px;background:#e2e8f0;padding:2px 8px;border-radius:4px;">#${booking.id.slice(-8).toUpperCase()}</span>`, false)}
      ${row(s.lPickDate, fmtDate(booking.startDate, lang), true)}
      ${row(s.lRetDate, fmtDate(booking.endDate, lang), true)}
      ${row(s.lDur, s.lDays(days), true)}
      ${hasDelivery
        ? row(s.lDeliv, deliveryLabel, false, true)
        : row(s.lPickLoc, car.location, false, true)}
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
        <td style="padding:4px 0 14px;font-size:12px;color:#64748b;">
          ${s.lDeposit}<br/>
          <span style="font-size:11px;color:#94a3b8;">${s.lDepositNote}</span>
        </td>
        <td style="padding:4px 0 14px;font-size:13px;color:#475569;text-align:right;vertical-align:top;">250 ₾</td>
      </tr>
    </table>
  </div>

  <!-- Insurance Plan -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 20px;margin-bottom:24px;">
    <p style="font-size:13px;color:#1e40af;font-weight:700;margin:0 0 3px;">🛡️ ${s.sIns}: ${planLabel}</p>
    <p style="font-size:12px;color:#3b82f6;margin:0;">${s.deduct(totals.deductible)}</p>
  </div>

  <!-- Photo Section -->
  <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:14px;padding:24px;margin-bottom:28px;">
    <p style="font-size:17px;font-weight:900;color:#78350f;margin:0 0 5px;line-height:1.3;">${s.photoTitle}</p>
    <p style="font-size:13px;color:#b45309;margin:0 0 20px;font-style:italic;">${s.photoSub}</p>

    <div style="background:#ffffff;border-radius:10px;padding:16px 18px;margin-bottom:10px;border-left:4px solid #f59e0b;">
      <p style="font-size:13px;font-weight:800;color:#78350f;margin:0 0 6px;">🚗 ${s.pickupH}</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.7;">${s.pickupBody}</p>
    </div>

    <div style="background:#ffffff;border-radius:10px;padding:16px 18px;margin-bottom:16px;border-left:4px solid #f59e0b;">
      <p style="font-size:13px;font-weight:800;color:#78350f;margin:0 0 6px;">🔑 ${s.returnH}</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.7;">${s.returnBody}</p>
    </div>

    <div style="background:#fef9c3;border-radius:8px;padding:13px 16px;">
      <p style="font-size:12px;color:#713f12;margin:0;line-height:1.7;">⚠️ ${s.photoWarn}</p>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:10px;">
    <a href="${bookingUrl}"
       style="display:inline-block;background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);color:#ffffff;padding:18px 52px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.4px;">
      ${s.cta}
    </a>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:0 0 8px;">${s.ctaNote}</p>
  `;
}

export function bookingConfirmationEmail(data: BookingEmailData): { html: string; subject: string } {
  const { lang, car } = data;
  const s = LS[lang];
  const subject = s.subject(car.brand, car.model, car.year);
  const primarySection = buildBookingSection(lang, data);
  const needsEn = lang !== 'en';
  const enSection = needsEn ? buildBookingSection('en', data) : '';

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Drivo.ge — Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1a56db 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:34px 48px;text-align:center;">
      <div style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Drivo<span style="color:#93c5fd;">.ge</span></div>
      <div style="font-size:10px;color:#93c5fd;margin-top:7px;letter-spacing:3.5px;text-transform:uppercase;">P2P Car Rental &middot; Georgia</div>
    </td></tr>

    <!-- Primary language section -->
    <tr><td style="background:#ffffff;padding:40px 44px 28px;">
      ${primarySection}
    </td></tr>

    ${needsEn ? `
    <!-- Divider -->
    <tr><td style="background:#ffffff;padding:0 44px;">
      <div style="border-top:2px dashed #e2e8f0;margin:8px 0 32px;"></div>
      <p style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;text-align:center;margin:0 0 32px;">🇬🇧 &nbsp;English Version</p>
    </td></tr>

    <!-- English section -->
    <tr><td style="background:#ffffff;padding:0 44px 28px;">
      ${enSection}
    </td></tr>
    ` : ''}

    <!-- Footer -->
    <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:26px 44px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">${s.copy}</p>
      <p style="margin:0;font-size:11px;color:#cbd5e1;">${s.footNote}</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  return { html, subject };
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
      <tr><td style="background:#ffffff;padding:48px 48px 32px;color:#1e293b;font-size:15px;line-height:1.75;">
        ${content}
      </td></tr>
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
      <tr><td style="background:#ffffff;padding:48px 48px 32px;color:#1e293b;font-size:15px;line-height:1.75;">
        ${content}
      </td></tr>
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
