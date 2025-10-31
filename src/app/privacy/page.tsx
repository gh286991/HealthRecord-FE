import Link from "next/link";
import MarkdownArticle from "@/components/legal/MarkdownArticle";

export const revalidate = 3600; // 1 hour ISR for latest page

export default async function PrivacyPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';
  let latestVersion: string | null = null;
  let effectiveDate: string | null = null;
  let md: string | null = null;
  let html: string | null = null;
  let heading: string | null = null;
  try {
    const metaResp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { next: { revalidate: 3600, tags: ['legal-latest'] } });
    if (metaResp.ok) {
      const meta = await metaResp.json();
      latestVersion = meta?.privacy ?? null;
      effectiveDate = meta?.privacyEffectiveDate ?? null;
      if (latestVersion) {
        const docResp = await fetch(`${API_BASE_URL}/legal/doc/privacy/${latestVersion}`, { next: { revalidate: 60 * 60 * 24 * 365 } });
        if (docResp.ok) {
          const data = await docResp.json();
          md = data?.contentMd ?? null;
          html = data?.contentHtml ?? null;
          if (md) {
            const m = md.match(/^#\s+(.+)$/m);
            if (m) {
              const raw = m[1].trim();
              const text = raw.replace(/[*_`]/g, '').replace(/<[^>]+>/g, '');
              heading = text;
            }
          }
        }
      }
    }
  } catch {}
  const formattedDate = effectiveDate
    ? new Date(effectiveDate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    : undefined;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <div className="flex items-end gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">{heading || '隱私權政策（Privacy Policy）'}</h1>
          {latestVersion && (
            <span className="text-sm text-gray-600 pb-0.5">版本：{latestVersion}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">最後更新日期：{formattedDate ?? '—'}</p>
      </div>

      {md || html ? (
        <MarkdownArticle content={md ?? undefined} html={html ?? undefined} suppressTopHeading />
      ) : (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          無法載入最新隱私政策內容，請稍後再試。
        </div>
      )}

      <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-100 mt-8 pt-4">
        如需查看最新隱私政策，請訪問 <Link href="/privacy/latest" className="text-orange-600 hover:text-orange-700">/privacy/latest</Link>
      </div>
    </div>
  );
}
