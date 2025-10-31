import { notFound } from 'next/navigation';
import CookiesPage from '../page';
import MarkdownArticle from '@/components/legal/MarkdownArticle';

export default async function CookiesVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';

  if (version === 'latest') return <CookiesPage />;

  try {
    const resp = await fetch(`${API_BASE_URL}/legal/doc/cookies/${version}`, { next: { revalidate: 60 * 60 * 24 * 365 } });
    if (!resp.ok) return notFound();
    const data = await resp.json();
    const md = data?.contentMd as string | undefined;
    const html = data?.contentHtml as string | undefined;
    const eff = data?.effectiveDate as string | undefined;
    const formattedDate = eff
      ? new Date(eff).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
      : undefined;
    if (!md && !html) return notFound();
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cookie 政策（{version}）</h1>
          <p className="mt-2 text-sm text-gray-600">最後更新日期：{formattedDate ?? '—'}</p>
        </div>
        <MarkdownArticle content={md} html={html} suppressTopHeading />
      </div>
    );
  } catch {
    return notFound();
  }
}
