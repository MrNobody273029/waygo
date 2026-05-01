import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { emailLayout } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

type EmailLang = 'en' | 'ka' | 'ru';

const CAR_EMAIL_TEMPLATES: Record<
  'approve' | 'reject',
  Record<EmailLang, {
    subject: (brand: string, model: string, year: number) => string;
    html: (name: string, brand: string, model: string, year: number, comment?: string) => string;
  }>
> = {
  approve: {
    en: {
      subject: (brand, model, year) => `Your ${brand} ${model} ${year} listing is approved — WAYGO`,
      html: (name, brand, model, year) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">Great news &mdash; your car listing on <strong style="color:#1e293b;">WAYGO</strong> has been approved and is now live.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; ${brand} ${model} ${year} is now visible to guests</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">Guests across Georgia can now find and book your car.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Head to the cars page to see your listing in action.</p>`,
        `${SITE_URL}/cars`,
        'View listings →'
      ),
    },
    ka: {
      subject: (brand, model, year) => `შენი ${brand} ${model} ${year} განცხადება დამტკიცდა — WAYGO`,
      html: (name, brand, model, year) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">სასიხარულო სიახლე &mdash; შენი მანქანის განცხადება <strong style="color:#1e293b;">WAYGO</strong>-ზე დამტკიცდა და ახლა ხელმისაწვდომია.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; ${brand} ${model} ${year} ახლა სტუმრებისთვის ხილულია</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">საქართველოს სტუმრებს შეუძლიათ ნახონ და დაჯავშნონ შენი მანქანა.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">გადადი განცხადებების გვერდზე და ნახე შენი მანქანა.</p>`,
        `${SITE_URL}/cars`,
        'განცხადებების ნახვა →'
      ),
    },
    ru: {
      subject: (brand, model, year) => `Ваше объявление ${brand} ${model} ${year} одобрено — WAYGO`,
      html: (name, brand, model, year) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Отличные новости &mdash; ваше объявление на <strong style="color:#1e293b;">WAYGO</strong> одобрено и теперь доступно.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; ${brand} ${model} ${year} теперь виден гостям</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">Гости по всей Грузии могут найти и забронировать ваш автомобиль.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Перейдите на страницу объявлений, чтобы увидеть ваш автомобиль.</p>`,
        `${SITE_URL}/cars`,
        'Смотреть объявления →'
      ),
    },
  },

  reject: {
    en: {
      subject: (brand, model, year) => `Action required — ${brand} ${model} ${year} listing (WAYGO)`,
      html: (name, brand, model, year, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">We reviewed your <strong style="color:#1e293b;">${brand} ${model} ${year}</strong> listing on WAYGO and unfortunately could not approve it at this time.</p>
        ${comment
          ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Admin note</p>
              <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
            </div>`
          : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#78350f;">Please ensure your photos are clear and your tech passport is fully legible before resubmitting.</p>
            </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Go to My Listings, click "Fix &amp; Resubmit" and update your listing.</p>`,
        `${SITE_URL}/my-cars`,
        'Fix & Resubmit →'
      ),
    },
    ka: {
      subject: (brand, model, year) => `საჭიროა ცვლილება — ${brand} ${model} ${year} (WAYGO)`,
      html: (name, brand, model, year, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">ჩვენ განვიხილეთ შენი <strong style="color:#1e293b;">${brand} ${model} ${year}</strong> განცხადება WAYGO-ზე და სამწუხაროდ ამ ეტაპზე ვერ დავამტკიცეთ.</p>
        ${comment
          ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">ადმინის შენიშვნა</p>
              <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
            </div>`
          : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#78350f;">გთხოვ დარწმუნდე, რომ ფოტოები მკაფიოა და ტექ.პასპორტი სრულად კითხვადია.</p>
            </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">გადადი ჩემი მანქანები გვერდზე, დააჭირე "შესწორება" და გაუგზავნე ხელახლა.</p>`,
        `${SITE_URL}/my-cars`,
        'შესწორება →'
      ),
    },
    ru: {
      subject: (brand, model, year) => `Требуются изменения — ${brand} ${model} ${year} (WAYGO)`,
      html: (name, brand, model, year, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Мы рассмотрели ваше объявление <strong style="color:#1e293b;">${brand} ${model} ${year}</strong> на WAYGO и, к сожалению, не можем его одобрить на данном этапе.</p>
        ${comment
          ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Комментарий администратора</p>
              <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
            </div>`
          : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#78350f;">Убедитесь, что фотографии чёткие и техпаспорт полностью читаем, прежде чем отправить снова.</p>
            </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Перейдите в «Мои авто», нажмите «Исправить и отправить» и обновите объявление.</p>`,
        `${SITE_URL}/my-cars`,
        'Исправить и отправить →'
      ),
    },
  },
};

export async function POST(req: NextRequest, { params }: { params: { carId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, comment } = await req.json();
  const { carId } = params;

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const car = await prisma.car.update({
    where: { id: carId },
    data: {
      listingStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      listingRejectionComment: action === 'approve' ? null : (comment ?? null),
    },
    include: { owner: { select: { email: true, fullName: true, lang: true } } },
  });

  const { owner } = car;
  if (owner?.email) {
    const lang = (owner.lang === 'ka' || owner.lang === 'ru' ? owner.lang : 'en') as EmailLang;
    const tpl = CAR_EMAIL_TEMPLATES[action as 'approve' | 'reject'][lang];
    try {
      await resend.emails.send({
        from: 'WAYGO <info@waygo.ge>',
        to: owner.email,
        subject: tpl.subject(car.brand, car.model, car.year),
        html: tpl.html(owner.fullName, car.brand, car.model, car.year, comment || undefined),
      });
    } catch (err) {
      console.error('Car listing decision email error:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
