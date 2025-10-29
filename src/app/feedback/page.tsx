"use client";

import { useCallback, useMemo, useState } from "react";

export default function FeedbackPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("YoungFit 產品意見回饋");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const to = "service@youngfit.app"; // 依用戶提供信箱
    const parts = [] as string[];
    if (message) parts.push(message);
    if (email) parts.push(`\n\n回覆聯絡信箱：${email}`);
    const body = encodeURIComponent(parts.join("\n"));
    const sub = encodeURIComponent(subject || "YoungFit 產品意見回饋");
    return `mailto:${to}?subject=${sub}&body=${body}`;
  }, [email, subject, message]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // 透過 mailto 交給使用者的郵件用戶端
    window.location.href = mailtoHref;
  }, [mailtoHref]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs">YoungFit 客服</div>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">意見回饋</h1>
        <p className="mt-2 text-sm text-gray-600">有問題或產品建議，隨時來信，我們很在意你的使用體驗。</p>
        <div className="mt-2 text-sm">
          <a href="mailto:service@youngfit.app" className="text-orange-700 hover:text-orange-800">service@youngfit.app</a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">主旨</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-400 focus:ring-orange-400 text-gray-900 placeholder-gray-500 bg-white"
              placeholder="例如：功能建議、操作問題…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">內容</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-400 focus:ring-orange-400 text-gray-900 placeholder-gray-500 bg-white"
              rows={8}
              placeholder="請描述你的問題或建議（越具體越好，例如：操作路徑、裝置/瀏覽器、期望行為等）"
              required
            />
            <div className="mt-1 text-xs text-gray-500">送出後會開啟你的郵件程式並帶入內容。</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">回覆聯絡信箱（選填）</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-400 focus:ring-orange-400 text-gray-900 placeholder-gray-500 bg-white"
              placeholder="方便我們回覆：your@email.com"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-white hover:bg-orange-600 transition-colors"
          >
            送出意見（Email）
          </button>
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 hover:bg-gray-50"
          >
            直接寫信
          </a>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        你的信件將寄到：service@youngfit.app。我們會盡快回覆，謝謝！
      </div>
    </div>
  );
}
