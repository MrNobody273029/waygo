import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return null;
  return session;
}

async function uploadAttachment(file: File): Promise<{
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number;
  cloudinaryId: string;
  content: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'waygo/admin-emails', resource_type: 'auto' },
          (err, res) => {
            if (err || !res) reject(err ?? new Error('Upload failed'));
            else resolve(res as { secure_url: string; public_id: string });
          }
        )
        .end(buffer);
    }
  );

  return {
    fileName: file.name,
    fileUrl: result.secure_url,
    fileType: file.type || null,
    fileSize: file.size,
    cloudinaryId: result.public_id,
    content: base64,
  };
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emails = await prisma.adminEmail.findMany({
    include: { attachments: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ emails });
}

export async function POST(req: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const from    = String(formData.get('from')    ?? 'info@waygo.ge');
    const to      = String(formData.get('to')      ?? '').trim();
    const cc      = String(formData.get('cc')      ?? '').trim();
    const bcc     = String(formData.get('bcc')     ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const body    = String(formData.get('body')    ?? '').trim();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'To, subject and message are required.' },
        { status: 400 }
      );
    }

    const rawFiles = formData.getAll('attachments') as File[];
    const files    = rawFiles.filter(f => f && f.size > 0);

    const uploaded = await Promise.all(files.map(uploadAttachment));

    const { data, error: resendError } = await resend.emails.send({
      from: `Waygo <${from}>`,
      to:  to.split(',').map(e => e.trim()).filter(Boolean),
      cc:  cc  ? cc.split(',').map(e => e.trim()).filter(Boolean)  : undefined,
      bcc: bcc ? bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      subject,
      html: body.replace(/\n/g, '<br />'),
      attachments: uploaded.map(f => ({
        filename: f.fileName,
        content:  Buffer.from(f.content, 'base64'),
      })),
    });

    const saved = await prisma.adminEmail.create({
      data: {
        from,
        to,
        cc:      cc  || null,
        bcc:     bcc || null,
        subject,
        body,
        status:  resendError ? 'failed' : 'sent',
        resendId: data?.id ?? null,
        attachments: {
          create: uploaded.map(({ content: _c, ...rest }) => rest),
        },
      },
      include: { attachments: true },
    });

    if (resendError) {
      console.error('Resend error:', resendError);
    }

    return NextResponse.json({ email: saved });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
