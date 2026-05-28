import { NextResponse } from 'next/server';
import { formDb } from '@/lib/form-db';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  team: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const record = await formDb.returnConfirmation.upsert({
      where: { email: data.email },
      update: { name: data.name, team: data.team },
      create: data,
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: e.issues }, { status: 400 });
    }
    console.error('[return-confirmation]', e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
