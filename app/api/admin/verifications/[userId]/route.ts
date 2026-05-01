import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

type EmailLang = 'en' | 'ka' | 'ru';

function emailLayout(content: string, ctaHref: string, ctaLabel: string): string {
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

const EMAIL_TEMPLATES: Record<
  string,
  Record<EmailLang, { subject: string; html: (name: string, comment?: string) => string }>
> = {
  approve_guest: {
    en: {
      subject: 'Your WAYGO identity verification has been approved',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">Great news &mdash; your identity verification on <strong style="color:#1e293b;">WAYGO</strong> has been approved.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; You are now a verified WAYGO guest</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">You can browse and book cars across Georgia immediately.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Head to your dashboard to start exploring available vehicles.</p>`,
        `${SITE_URL}/cars`,
        'Browse Cars →'
      ),
    },
    ka: {
      subject: 'შენი WAYGO ვერიფიკაცია დამტკიცდა',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">სასიხარულო სიახლე &mdash; შენი პიროვნების ვერიფიკაცია <strong style="color:#1e293b;">WAYGO</strong>-ზე დამტკიცდა.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; შენ ახლა ვერიფიცირებული WAYGO სტუმარი ხარ</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">შეგიძლია დაუყოვნებლივ დაათვალიერო და დაჯავშნო მანქანები საქართველოში.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">გადადი მანქანებზე და დაიწყე მოგზაურობის დაგეგმვა.</p>`,
        `${SITE_URL}/cars`,
        'მანქანების ნახვა →'
      ),
    },
    ru: {
      subject: 'Ваша верификация на WAYGO одобрена',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Отличные новости &mdash; ваша верификация личности на <strong style="color:#1e293b;">WAYGO</strong> одобрена.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; Вы теперь верифицированный гость WAYGO</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">Вы можете немедленно просматривать и бронировать автомобили по всей Грузии.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Перейдите в каталог, чтобы начать планировать поездку.</p>`,
        `${SITE_URL}/cars`,
        'Смотреть автомобили →'
      ),
    },
  },

  reject_guest: {
    en: {
      subject: 'Action required — WAYGO identity verification',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">We reviewed your identity verification submission on <strong style="color:#1e293b;">WAYGO</strong> and unfortunately could not approve it at this time.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Admin note</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">Please ensure your documents are clear, well-lit, and fully legible before resubmitting.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Log in to WAYGO and resubmit your documents from your dashboard.</p>`,
        `${SITE_URL}/dashboard`,
        'Resubmit documents →'
      ),
    },
    ka: {
      subject: 'საჭიროა ქმედება — WAYGO ვერიფიკაცია',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">ჩვენ განვიხილეთ შენი ვერიფიკაციის განაცხადი <strong style="color:#1e293b;">WAYGO</strong>-ზე და სამწუხაროდ ამ ეტაპზე ვერ დავამტკიცეთ.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">ადმინის შენიშვნა</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">გთხოვ დარწმუნდე, რომ ფოტოები მკაფიოა, კარგად განათებული და ყველა დეტალი კითხვადია.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">შეხვიდე WAYGO-ში და ხელახლა გამოაგზავნე დოკუმენტები დეშბორდიდან.</p>`,
        `${SITE_URL}/dashboard`,
        'დოკუმენტების ხელახლა გაგზავნა →'
      ),
    },
    ru: {
      subject: 'Требуется действие — верификация WAYGO',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Мы рассмотрели вашу заявку на верификацию личности на <strong style="color:#1e293b;">WAYGO</strong> и, к сожалению, не смогли её одобрить на данном этапе.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Комментарий администратора</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">Убедитесь, что ваши документы чёткие, хорошо освещены и все детали хорошо читаемы.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Войдите в WAYGO и повторно отправьте документы из личного кабинета.</p>`,
        `${SITE_URL}/dashboard`,
        'Повторно отправить документы →'
      ),
    },
  },

  approve_host: {
    en: {
      subject: 'Your WAYGO host verification has been approved',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">Congratulations! Your host verification on <strong style="color:#1e293b;">WAYGO</strong> has been approved.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; You are now a verified WAYGO host</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">You can list your cars, manage bookings and start earning immediately.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Head to the listing page to publish your first car.</p>`,
        `${SITE_URL}/become-host`,
        'List your car →'
      ),
    },
    ka: {
      subject: 'შენი WAYGO ჰოსტის ვერიფიკაცია დამტკიცდა',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">გილოცავ! შენი ჰოსტის ვერიფიკაცია <strong style="color:#1e293b;">WAYGO</strong>-ზე დამტკიცდა.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; შენ ახლა ვერიფიცირებული WAYGO ჰოსტი ხარ</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">შეგიძლია განათავსო მანქანები, მართო ჯავშნები და დაუყოვნებლივ დაიწყო შემოსავლის მიღება.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">გადადი განცხადების გვერდზე და გამოაქვეყნე შენი პირველი მანქანა.</p>`,
        `${SITE_URL}/become-host`,
        'განათავსე მანქანა →'
      ),
    },
    ru: {
      subject: 'Ваша верификация хоста на WAYGO одобрена',
      html: (name) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Поздравляем! Ваша верификация хоста на <strong style="color:#1e293b;">WAYGO</strong> одобрена.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:700;">&#10003; Вы теперь верифицированный хост WAYGO</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534;">Вы можете размещать автомобили, управлять бронированиями и сразу начать зарабатывать.</p>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:13px;">Перейдите на страницу объявлений и опубликуйте свой первый автомобиль.</p>`,
        `${SITE_URL}/become-host`,
        'Разместить автомобиль →'
      ),
    },
  },

  reject_host: {
    en: {
      subject: 'Action required — WAYGO host verification',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#475569;">We reviewed your host verification submission on <strong style="color:#1e293b;">WAYGO</strong> and unfortunately could not approve it at this time.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Admin note</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">Please ensure your ID card photos are clear, well-lit, and fully legible before resubmitting.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Log in to WAYGO and resubmit your host documents from My Cars page.</p>`,
        `${SITE_URL}/my-cars`,
        'Resubmit host documents →'
      ),
    },
    ka: {
      subject: 'საჭიროა ქმედება — WAYGO ჰოსტის ვერიფიკაცია',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">გამარჯობა, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">ჩვენ განვიხილეთ შენი ჰოსტის ვერიფიკაციის განაცხადი <strong style="color:#1e293b;">WAYGO</strong>-ზე და სამწუხაროდ ამ ეტაპზე ვერ დავამტკიცეთ.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">ადმინის შენიშვნა</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">გთხოვ დარწმუნდე, რომ პირადობის მოწმობის ფოტოები მკაფიოა და ყველა დეტალი კითხვადია.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">შეხვიდე WAYGO-ში და ხელახლა გამოაგზავნე ჰოსტის დოკუმენტები ჩემი მანქანები გვერდიდან.</p>`,
        `${SITE_URL}/my-cars`,
        'ჰოსტის დოკუმენტების გაგზავნა →'
      ),
    },
    ru: {
      subject: 'Требуется действие — верификация хоста WAYGO',
      html: (name, comment) => emailLayout(
        `<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">Здравствуйте, ${name}!</p>
        <p style="margin:0 0 20px;color:#475569;">Мы рассмотрели вашу заявку на верификацию хоста на <strong style="color:#1e293b;">WAYGO</strong> и, к сожалению, не смогли её одобрить на данном этапе.</p>
        ${comment ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Комментарий администратора</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${comment}</p>
        </div>` : `<div style="background:#fef9ef;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:14px;color:#78350f;">Убедитесь, что фотографии удостоверения личности чёткие и все детали хорошо читаемы.</p>
        </div>`}
        <p style="margin:0;color:#94a3b8;font-size:13px;">Войдите в WAYGO и повторно отправьте документы хоста со страницы Мои авто.</p>`,
        `${SITE_URL}/my-cars`,
        'Повторно отправить документы →'
      ),
    },
  },
};

async function sendVerificationEmail(to: string, name: string, lang: EmailLang, action: string, comment?: string) {
  const tpl = EMAIL_TEMPLATES[action]?.[lang];
  if (!tpl || !to) return;
  try {
    await resend.emails.send({
      from: 'WAYGO <info@waygo.ge>',
      to,
      subject: tpl.subject,
      html: tpl.html(name, comment),
    });
  } catch (err) {
    console.error('Verification email error:', err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, comment } = await req.json();
  const { userId } = params;

  const updates: Record<string, unknown> = {};

  switch (action) {
    case 'approve_guest':
      updates.isVerified = true;
      updates.verificationStatus = 'APPROVED';
      updates.verificationRejectionComment = null;
      break;
    case 'reject_guest':
      updates.isVerified = false;
      updates.verificationStatus = 'REJECTED';
      if (comment) updates.verificationRejectionComment = comment;
      break;
    case 'request_selfie_guest':
      updates.selfieUrl = null;
      updates.verificationStatus = 'SUBMITTED';
      break;
    case 'request_docs_guest':
      updates.driverLicenseFront = null;
      updates.driverLicenseBack = null;
      updates.verificationStatus = 'SUBMITTED';
      break;
    case 'approve_host':
      updates.hostVerified = true;
      updates.hostVerificationStatus = 'APPROVED';
      updates.hostVerificationRejectionComment = null;
      break;
    case 'reject_host':
      updates.hostVerified = false;
      updates.hostVerificationStatus = 'REJECTED';
      if (comment) updates.hostVerificationRejectionComment = comment;
      break;
    case 'request_selfie_host':
      updates.hostSelfieUrl = null;
      updates.hostVerificationStatus = 'SUBMITTED';
      break;
    case 'request_docs_host':
      updates.idCardFront = null;
      updates.idCardBack = null;
      updates.hostVerificationStatus = 'SUBMITTED';
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const profile = await prisma.profile.update({
    where: { id: userId },
    data: updates as any,
    select: { email: true, fullName: true, lang: true },
  });

  const emailActions = ['approve_guest', 'reject_guest', 'approve_host', 'reject_host'];
  if (emailActions.includes(action) && profile.email) {
    const lang = (profile.lang === 'ka' || profile.lang === 'ru' ? profile.lang : 'en') as EmailLang;
    await sendVerificationEmail(profile.email, profile.fullName, lang, action, comment);
  }

  return NextResponse.json({ ok: true });
}
