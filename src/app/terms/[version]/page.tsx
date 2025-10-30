import { notFound } from 'next/navigation';
import TermsPage from '../page';
import MarkdownArticle from '@/components/legal/MarkdownArticle';

export default async function TermsVersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';

  // 最新版簡化：/terms/latest 直接顯示最新頁
  if (version === 'latest') {
    return <TermsPage />;
  }

  // 舊版 → 從後端取回凍結內容（contentMd）+ 顯示系統帶的版本與日期
  try {
    const resp = await fetch(`${API_BASE_URL}/legal/doc/terms/${version}`, { cache: 'no-store' });
    if (!resp.ok) return notFound();
    const data = await resp.json();
    const md = data?.contentMd as string | undefined;
    const eff = data?.effectiveDate as string | undefined;
    const formattedDate = eff ? new Date(eff).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined;
    if (!md) return notFound();
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">服務條款（{version}）</h1>
          <p className="mt-2 text-sm text-gray-600">最後更新日期：{formattedDate ?? '—'}</p>
        </div>
        <MarkdownArticle content={md} suppressTopHeading />
      </div>
    );
  } catch {
    return notFound();
  }
}
