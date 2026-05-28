import { NextResponse } from 'next/server';
import { formDb } from '@/lib/form-db';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  referredBy: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const record = await formDb.waitlistEntry.upsert({
      where: { email: data.email },
      update: { name: data.name, referredBy: data.referredBy, notes: data.notes },
      create: data,
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: e.issues }, { status: 400 });
    }
    console.error('[waitlist]', e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
