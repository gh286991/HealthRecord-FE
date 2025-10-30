import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";

type MarkdownArticleProps = {
  content?: string; // Markdown 字串
  html?: string;    // 已產生的 HTML 字串（將直接注入）
  suppressTopHeading?: boolean; // 隱藏 Markdown 第一個 H1（避免與頁面標題重複）
};

export default function MarkdownArticle({ content, html, suppressTopHeading }: MarkdownArticleProps) {
  // 若提供 html，直接以已產生的 HTML 顯示（用於後端凍結全文）
  if (html) {
    return (
      <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  // 預設使用 Markdown 解析
  // 以閉包旗標略過第一個 H1
  let firstH1Skipped = false;
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...(defaultSchema?.attributes || {}),
                "*": [
                  ...(((defaultSchema?.attributes || {})["*"] as unknown[]) || []),
                  ["className"],
                  ["style"],
                ],
                span: [
                  ...(((defaultSchema?.attributes || {})["span"] as unknown[]) || []),
                  ["className"],
                  ["style"],
                ],
              },
            },
          ],
        ]}
        components={{
          h1: (props) => {
            if (suppressTopHeading && !firstH1Skipped) {
              firstH1Skipped = true;
              return null;
            }
            return <h1 className="text-3xl font-bold text-gray-900" {...props} />;
          },
          h2: (props) => (
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal pl-6 space-y-1" {...props} />
          ),
          p: (props) => (
            <p className="leading-relaxed" {...props} />
          ),
          ul: (props) => (
            <ul className="list-disc pl-6 space-y-1" {...props} />
          ),
          li: (props) => <li {...props} />,
          a: (props) => (
            <a className="text-orange-600 hover:text-orange-700 underline" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800" {...props} />
          ),
          strong: (props) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          code: ({ className, children, ...props }) => (
            <code className={`rounded bg-gray-100 px-1 py-0.5 ${className ?? ""}`} {...props}>
              {children}
            </code>
          ),
          pre: (props) => (
            <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto" {...props} />
          ),
          hr: (props) => (
            <hr className="my-8 border-gray-200" {...props} />
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
