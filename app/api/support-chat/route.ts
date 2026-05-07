import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { policies } from '@/lib/policies';

type Lang = 'ka' | 'en' | 'ru';

const MODEL = 'gpt-4o-mini';
const ADMIN_SUPPORT_EMAIL = 'waygo.ge@gmail.com';
const EMAIL_FROM = 'WAYGO Support <no-reply@waygo.ge>';

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeLang(value: unknown): Lang {
  return value === 'ka' || value === 'ru' || value === 'en' ? value : 'en';
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://waygo.ge'
  ).replace(/\/$/, '');
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString('en-GB', {
      timeZone: 'Asia/Tbilisi',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}

function collectPolicyText(value: unknown, path: string[] = []): string[] {
  const lines: string[] = [];

  if (typeof value === 'string') {
    const label = path.length ? path.join(' > ') : 'text';
    lines.push(`${label}: ${value}`);
    return lines;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      lines.push(...collectPolicyText(item, [...path, String(index + 1)]));
    });
    return lines;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      if (
        key === 'icon' ||
        key === 'accent' ||
        key === 'iconBg' ||
        key === 'color' ||
        key === 'badge' ||
        key === 'badgeCls' ||
        key === 'cls' ||
        key === 'key'
      ) {
        return;
      }

      lines.push(...collectPolicyText(child, [...path, key]));
    });
  }

  return lines;
}

function buildPolicyContext() {
  return collectPolicyText(policies).join('\n');
}

async function getUserContext(userId?: string) {
  if (!userId) {
    return {
      type: 'guest',
      note: 'User is not logged in. You do not have access to their bookings, cars, payments, verification, or account details. Ask them to log in if they want help with their own booking/account.',
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      lang: true,
      isVerified: true,
      verificationStatus: true,
      verificationRejectionComment: true,
      hostVerified: true,
      hostVerificationStatus: true,
      hostVerificationRejectionComment: true,
      rating: true,
      reviewCount: true,
      isSuspended: true,
      suspensionReason: true,
      createdAt: true,

      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          carId: true,
          carBrand: true,
          carModel: true,
          carYear: true,
          startDate: true,
          endDate: true,
          totalPrice: true,
          deliveryType: true,
          deliveryCost: true,
          deliveryAddress: true,
          status: true,
          createdAt: true,
          insurancePolicy: {
            select: {
              planType: true,
              deductibleAmount: true,
              status: true,
            },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              amount: true,
              type: true,
              status: true,
              createdAt: true,
            },
          },
          dispute: {
            select: {
              status: true,
              damageAmount: true,
              expertFee: true,
              expertNote: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },

      cars: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          plateNumber: true,
          dailyPrice: true,
          location: true,
          carType: true,
          transmission: true,
          fuelType: true,
          isActive: true,
          listingStatus: true,
          listingRejectionComment: true,
          depositGel: true,
          createdAt: true,
          bookings: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              guestId: true,
              startDate: true,
              endDate: true,
              totalPrice: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return {
      type: 'guest',
      note: 'Session exists, but profile was not found. Treat as guest.',
    };
  }

  return {
    type: 'logged_in_user',
    privacyRule:
      'This context belongs only to the currently authenticated user. Never reveal personal information about other users. You may discuss only this user’s own bookings, cars, verification, and visible account context.',
    profile,
  };
}

function buildSystemPrompt(lang: Lang) {
  return `
You are WAYGO.ge AI Support, a 24/7 support assistant for a P2P car rental platform in Georgia.

Your job:
- Help users understand WAYGO.ge rules, rentals, bookings, verification, deposits, insurance, cancellations, host rules, guest rules, safety, and account context.
- Use ONLY the provided WAYGO policy context and the current user context.
- If something is not in the provided context, say clearly that you do not have enough information.
- Never invent prices, rules, statuses, refunds, deadlines, booking data, user data, or platform decisions.

Hard limits:
- You are support chat only.
- You cannot create, cancel, approve, reject, edit, refund, verify, delete, upload, submit, charge, unblock, release, or change anything.
- If the user asks you to do an action, explain that you cannot do it and guide them to the correct page or suggest human support.
- You may explain what the user can do, but you must not claim that you performed an action.
- Do not provide legal/financial guarantees. Explain platform policy only.

Privacy:
- Never reveal another user's personal information.
- If the current user is a guest/not logged in, do not claim you can see their bookings or account.
- If logged in, refer only to the current user's own context.
- If a host asks about a guest, only use booking-level facts visible in the provided context. Do not expose private data beyond what is provided.

Language:
- Preferred UI language is ${lang}.
- Answer in the language the user uses. If mixed, prefer the latest user message language.
- Main supported languages: Georgian, English, Russian. Other languages are allowed if the user writes in them.

Escalation:
Set needsEscalation=true when:
- user asks for an operator, human, admin, support team, manager, call, email, or “real person”
- the issue needs manual review
- the issue is about refund investigation, payment problem, blocked deposit, dispute, damage, accident, verification rejection, account suspension, suspicious behavior, urgent booking issue, or safety concern
- you are not fully sure from the provided context
- the user is upset or explicitly asks to complain

When escalation is needed:
- Tell the user that the request was sent to WAYGO support and they should wait for the support team.
- Still answer the easy explanatory part if possible.
- The user may continue chatting after escalation.

Output:
Return ONLY a valid JSON object:
{
  "reply": "string",
  "needsEscalation": boolean,
  "escalationReason": "string or null"
}
`;
}

async function callOpenAI(params: {
  lang: Lang;
  message: string;
  history: { sender: string; content: string }[];
  userContext: unknown;
}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is missing');

  const messages = [
    { role: 'system', content: buildSystemPrompt(params.lang) },
    {
      role: 'system',
      content: `WAYGO POLICY CONTEXT:\n${buildPolicyContext()}`,
    },
    {
      role: 'system',
      content: `CURRENT USER CONTEXT:\n${JSON.stringify(params.userContext, null, 2)}`,
    },
    ...params.history.slice(-14).map(m => ({
      role: m.sender === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: params.message },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.15,
      max_tokens: 850,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI failed: ${text}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw);

  return {
    reply:
      typeof parsed.reply === 'string' && parsed.reply.trim()
        ? parsed.reply.trim()
        : 'Sorry, I could not generate a reliable answer. Please contact WAYGO support.',
    needsEscalation: parsed.needsEscalation === true,
    escalationReason:
      typeof parsed.escalationReason === 'string' && parsed.escalationReason.trim()
        ? parsed.escalationReason.trim()
        : null,
  };
}

function escalationConfirmation(lang: Lang) {
  if (lang === 'ka') {
    return 'მოთხოვნა გაგზავნილია WAYGO support-თან. გთხოვთ დაელოდოთ მხარდაჭერის გუნდის პასუხს. meanwhile შეგიძლია აქვე გააგრძელო კითხვა.';
  }

  if (lang === 'ru') {
    return 'Запрос отправлен в поддержку WAYGO. Пожалуйста, дождитесь ответа команды поддержки. Вы можете продолжать писать здесь.';
  }

  return 'Your request has been sent to WAYGO support. Please wait for the support team to review it. You can continue chatting here.';
}

function supportEmailHtml(params: {
  conversationId: string;
  lang: Lang;
  reason: string | null;
  userLabel: string;
  userEmail: string | null;
  transcript: { sender: string; content: string; createdAt?: Date }[];
  latestMessage: string;
}) {
  const adminUrl = `${siteUrl()}/admin`;

  const senderLabel = (sender: string) => {
    if (sender === 'user') return 'მომხმარებელი';
    if (sender === 'assistant') return 'AI ასისტენტი';
    return 'სისტემა';
  };

  const transcriptHtml = params.transcript
    .map(m => {
      const isUser = m.sender === 'user';
      return `
        <div style="margin:0 0 12px;padding:12px 14px;border-radius:12px;background:${isUser ? '#eff6ff' : '#f8fafc'};border:1px solid #e2e8f0;">
          <div style="font-size:11px;font-weight:800;color:${isUser ? '#1d4ed8' : '#475569'};text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">
            ${escapeHtml(senderLabel(m.sender))}${m.createdAt ? ` · ${escapeHtml(formatDate(m.createdAt))}` : ''}
          </div>
          <div style="font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${escapeHtml(m.content)}</div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>WAYGO მხარდაჭერის მოთხოვნა</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 14px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 100%);padding:28px 34px;color:#ffffff;">
              <div style="font-size:26px;font-weight:900;letter-spacing:-.5px;">WAYGO მხარდაჭერის მოთხოვნა</div>
              <div style="font-size:13px;color:#bfdbfe;margin-top:7px;">AI ჩატმა მონიშნა საუბარი ადამიანური გადახედვისთვის</div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 34px;">
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:16px 18px;margin-bottom:22px;">
                <div style="font-size:12px;font-weight:900;color:#c2410c;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;">მიზეზი</div>
                <div style="font-size:14px;color:#7c2d12;line-height:1.6;">${escapeHtml(params.reason || 'AI-მ ჩათვალა, რომ ეს საუბარი საჭიროებს მხარდაჭერის გუნდის გადახედვას.')}</div>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;border-collapse:collapse;">
                <tr>
                  <td style="padding:9px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">საუბრის ID</td>
                  <td style="padding:9px 0;font-size:13px;color:#0f172a;font-family:monospace;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(params.conversationId)}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">მომხმარებელი</td>
                  <td style="padding:9px 0;font-size:13px;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(params.userLabel)}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">ელფოსტა</td>
                  <td style="padding:9px 0;font-size:13px;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${escapeHtml(params.userEmail || 'არ არის მითითებული')}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;font-size:13px;color:#64748b;">ჩატის ენა</td>
                  <td style="padding:9px 0;font-size:13px;color:#0f172a;text-align:right;">${escapeHtml(params.lang)}</td>
                </tr>
              </table>

              <div style="margin-bottom:24px;">
                <div style="font-size:12px;font-weight:900;color:#334155;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;">ბოლო შეტყობინება</div>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${escapeHtml(params.latestMessage)}</div>
              </div>

              <div style="margin-bottom:24px;">
                <div style="font-size:12px;font-weight:900;color:#334155;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;">საუბრის ისტორია</div>
                ${transcriptHtml || '<div style="font-size:14px;color:#64748b;">საუბრის ისტორია არ არის ხელმისაწვდომი.</div>'}
              </div>

              <div style="text-align:center;margin-top:26px;">
                <a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 28px;font-weight:800;font-size:14px;">ადმინ პანელის გახსნა</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 34px;text-align:center;">
              <div style="font-size:12px;color:#94a3b8;">ეს შეტყობინება ავტომატურად გამოიგზავნა WAYGO AI Support-ის მიერ.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEscalationEmail(params: {
  conversationId: string;
  lang: Lang;
  reason: string | null;
  userLabel: string;
  userEmail: string | null;
  transcript: { sender: string; content: string; createdAt?: Date }[];
  latestMessage: string;
}) {
const subject = `🚨 WAYGO მხარდაჭერის მოთხოვნა — ${params.userLabel}`;

  const html = supportEmailHtml(params);

  let status: 'sent' | 'failed' = 'sent';
  let resendId: string | undefined;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_SUPPORT_EMAIL,
      subject,
      html,
    });

    resendId = result.data?.id;
  } catch (err) {
    status = 'failed';
    console.error('Support escalation email error:', err);
  }

  try {
    await prisma.adminEmail.create({
      data: {
        from: EMAIL_FROM,
        to: ADMIN_SUPPORT_EMAIL,
        subject,
        body: html,
        status,
        resendId,
      },
    });
  } catch (err) {
    console.error('Failed to log support escalation email:', err);
  }

  return status === 'sent';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await req.json().catch(() => ({}));

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const conversationId =
      typeof body.conversationId === 'string' ? body.conversationId : null;
    const lang = normalizeLang(body.lang);

    const guestName =
      typeof body.guestName === 'string' && body.guestName.trim()
        ? body.guestName.trim()
        : null;

    const guestEmail =
      typeof body.guestEmail === 'string' && body.guestEmail.trim()
        ? body.guestEmail.trim()
        : null;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let conversation = conversationId
      ? await prisma.supportConversation.findFirst({
          where: userId
            ? { id: conversationId, userId }
            : { id: conversationId, userId: null },
        })
      : null;
      if (conversation?.status === 'closed') {
  conversation = null;
}

    if (!conversation) {
      conversation = await prisma.supportConversation.create({
        data: {
          userId: userId ?? null,
          guestName,
          guestEmail,
          guestLang: lang,
          status: 'open',
        },
      });
    } else if (!userId && (guestName || guestEmail)) {
      conversation = await prisma.supportConversation.update({
        where: { id: conversation.id },
        data: {
          guestName: conversation.guestName ?? guestName,
          guestEmail: conversation.guestEmail ?? guestEmail,
          guestLang: lang,
        },
      });
    }

    const historyBeforeUserMessage = await prisma.supportMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 24,
      select: {
        sender: true,
        content: true,
        createdAt: true,
      },
    });

    await prisma.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        content: message,
      },
    });
if (conversation.status === 'escalated') {
  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: {
      escalated: true,
      updatedAt: new Date(),
    },
  });

  const waitingReply =
    lang === 'ka'
      ? 'მხარდაჭერის გუნდი უკვე ჩართულია ამ ჩატში. გთხოვთ დაელოდოთ პასუხს. შეგიძლიათ აქვე გააგრძელოთ დამატებითი ინფორმაციის მოწერა.'
      : lang === 'ru'
      ? 'Команда поддержки уже подключена к этому чату. Пожалуйста, дождитесь ответа. Вы можете продолжать писать дополнительную информацию здесь.'
      : 'The support team is already involved in this chat. Please wait for a reply. You can continue sending additional information here.';

  return NextResponse.json({
    success: true,
    conversationId: conversation.id,
    reply: waitingReply,
    needsEscalation: true,
    escalationReason: 'Conversation is already escalated to human support.',
    escalationEmailSent: false,
  });
}
    const userContext = await getUserContext(userId);

    const ai = await callOpenAI({
      lang,
      message,
      history: historyBeforeUserMessage.map(m => ({
        sender: m.sender,
        content: m.content,
      })),
      userContext,
    });

    let finalReply = ai.reply;
    let emailSent = false;

    const shouldSendEscalationEmail = ai.needsEscalation && !conversation.escalated;

    if (shouldSendEscalationEmail) {
      const transcriptForEmail = [
        ...historyBeforeUserMessage,
        { sender: 'user', content: message, createdAt: new Date() },
      ];

      const userLabel =
        session?.user?.name ||
        guestName ||
        session?.user?.email ||
        guestEmail ||
        'Anonymous guest';

      const userEmail = session?.user?.email || guestEmail;
emailSent = await sendEscalationEmail({
  conversationId: conversation.id,
  lang,
  reason: ai.escalationReason,
  userLabel,
  userEmail,
  transcript: transcriptForEmail,
  latestMessage: message,
});

      await prisma.supportConversation.update({
        where: { id: conversation.id },
        data: {
          escalated: true,
          status: 'escalated',
        },
      });

      const confirmation = escalationConfirmation(lang);

      finalReply = `${ai.reply}\n\n${confirmation}`;
    }

    await prisma.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'assistant',
        content: finalReply,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      reply: finalReply,
      needsEscalation: ai.needsEscalation,
      escalationReason: ai.escalationReason,
      escalationEmailSent: emailSent,
    });
  } catch (error) {
    console.error('support-chat error:', error);

    return NextResponse.json(
      { error: 'Support chat failed' },
      { status: 500 }
    );
  }
}