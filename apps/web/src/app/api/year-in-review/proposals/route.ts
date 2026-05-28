import { NextResponse } from 'next/server';
import { formDb } from '@/lib/form-db';
import { z } from 'zod';

export const runtime = 'nodejs';

const submitSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  category: z.string().max(50).optional(),
});

export async function GET() {
  try {
    const proposals = await formDb.proposal.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        category: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: proposals });
  } catch (e) {
    console.error('[proposals GET]', e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = submitSchema.parse(body);

    const record = await formDb.proposal.create({ data });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: e.errors }, { status: 400 });
    }
    console.error('[proposals POST]', e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, approved } = await request.json();
    const record = await formDb.proposal.update({
      where: { id },
      data: { approved },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error('[proposals PATCH]', e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
