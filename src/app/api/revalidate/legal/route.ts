import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET || '';
  const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-revalidate-token') || '';
  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    revalidateTag('legal-latest');
    revalidatePath('/terms');
    revalidatePath('/privacy');
    revalidatePath('/cookies');
    revalidatePath('/terms/latest');
    revalidatePath('/privacy/latest');
    revalidatePath('/cookies/latest');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

