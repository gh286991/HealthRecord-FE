import { notFound } from 'next/navigation';
import TermsPage from '../page';

export default async function TermsVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';
  try {
    const resp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { cache: 'no-store' });
    if (!resp.ok) return notFound();
    const data = await resp.json();
    const latest = data?.terms as string | undefined;
    if (!latest) return notFound();
    if (version !== latest) return notFound();
    return <TermsPage />;
  } catch {
    return notFound();
  }
}
