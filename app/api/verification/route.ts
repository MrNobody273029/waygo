import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';
const ADMIN_EMAIL = 'admin@waygo.ge';

function adminNotificationEmail(userName: string, userEmail: string, verificationType: 'guest' | 'host'): string {
  const typeLabel = verificationType === 'host' ? 'Host (ჰოსტი)' : 'Guest (სტუმარი)';
  const typeColor = verificationType === 'host' ? '#7c3aed' : '#1a56db';
  const typeBg = verificationType === 'host' ? '#f5f3ff' : '#eff6ff';
  const typeBorder = verificationType === 'host' ? '#7c3aed' : '#1a56db';
  const adminUrl = `${SITE_URL}/admin/verifications`;

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
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;">&#128276; ახალი ვერიფიკაციის მოთხოვნა</p>
        <p style="margin:0 0 24px;font-size:22px;font-weight:800;color:#0f172a;">პასუხი გეკუთვნის</p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;">მომხმარებელი</td>
            </tr>
            <tr>
              <td style="font-size:17px;font-weight:700;color:#0f172a;padding-bottom:4px;">${userName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#64748b;">${userEmail}</td>
            </tr>
          </table>
        </div>

        <div style="background:${typeBg};border-left:4px solid ${typeBorder};border-radius:8px;padding:16px 20px;margin:0 0 28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${typeColor};text-transform:uppercase;letter-spacing:1px;">ვერიფიკაციის ტიპი</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${typeLabel}</p>
        </div>

        <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">მომხმარებელმა ატვირთა ვერიფიკაციის დოკუმენტები და ელოდება შენს გადაწყვეტილებას. გადადი ადმინ პანელში, გაეცანი დოკუმენტებს და დაამტკიცე ან უარყავი.</p>
      </td></tr>
      <tr><td style="background:#ffffff;padding:0 48px 48px;text-align:center;">
        <a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:16px 40px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px;">ადმინ პანელში გადასვლა &rarr;</a>
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { type, docFront, docBack, selfieUrl, lang } = await req.json();
  if (!docFront || !docBack || !selfieUrl) {
    return NextResponse.json({ error: 'All documents required' }, { status: 400 });
  }

  const validLang = lang === 'ka' || lang === 'ru' ? lang : 'en';

  let profile: { email: string | null; fullName: string };

  if (type === 'host') {
    profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        idCardFront: docFront,
        idCardBack: docBack,
        hostSelfieUrl: selfieUrl,
        hostVerificationStatus: 'SUBMITTED',
        lang: validLang,
      },
      select: { email: true, fullName: true },
    });
  } else {
    profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        driverLicenseFront: docFront,
        driverLicenseBack: docBack,
        selfieUrl,
        verificationStatus: 'SUBMITTED',
        lang: validLang,
      },
      select: { email: true, fullName: true },
    });
  }

  try {
    await resend.emails.send({
      from: 'WAYGO <info@waygo.ge>',
      to: ADMIN_EMAIL,
      subject: `ახალი ვერიფიკაცია: ${profile.fullName} (${type === 'host' ? 'Host' : 'Guest'})`,
      html: adminNotificationEmail(profile.fullName, profile.email ?? '', type === 'host' ? 'host' : 'guest'),
    });
  } catch (err) {
    console.error('Admin verification notification email error:', err);
  }

  return NextResponse.json({ ok: true });
}
