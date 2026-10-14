import { useState } from "react";
import { Download, ExternalLink, FileText, Quote, ChevronDown, ChevronUp, Copy, Check, BookOpen } from "lucide-react";
import { type JournalArticle, getCitation } from "@/data/articles";

export function ArticleCard({ article, defaultExpanded = false }: { article: JournalArticle; defaultExpanded?: boolean }) {
  const [showAbstract, setShowAbstract] = useState(defaultExpanded);
  const [showCiteModal, setShowCiteModal] = useState(false);
  const [citeFormat, setCiteFormat] = useState<"APA" | "MLA" | "Chicago" | "BibTeX">("APA");
  const [copied, setCopied] = useState(false);

  const citationText = getCitation(article, citeFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id={`article-${article.serialNumber}`}
      className="group relative rounded-sm border border-[#d6cfc2] bg-[#fbf9f4] p-6 sm:p-7 shadow-xs hover:border-[#a45a40] transition-colors"
    >
      {/* Header bar: Serial Number & Section & Pages */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfd7c9] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 items-center px-2.5 rounded-xs bg-[#1f314d] text-white font-mono text-[0.7rem] font-bold tracking-wider">
            ARTICLE {article.serialNumber}
          </span>
          <span className="font-semibold text-[#a45a40] uppercase tracking-wider text-[0.68rem]">
            {article.section}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#6e6a62] font-mono text-[0.72rem]">
          <span>Pages {article.pages}</span>
          <span className="text-[#c5beaf]">·</span>
          <span>{article.date}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="!mt-4 !mb-2.5 font-editorial text-2xl font-bold leading-snug text-[#1f314d]">
        <a
          href={article.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#a45a40] transition-colors no-underline"
        >
          {article.title}
        </a>
      </h3>

      {/* Authors & Affiliations */}
      <div className="my-3 space-y-1.5">
        {article.authors.map((author) => (
          <div key={author.name} className="text-xs text-[#4b4e57]">
            <span className="font-bold text-[#1f314d] text-sm">{author.name}</span>
            {author.isCorresponding && (
              <span className="ml-1 text-[0.68rem] font-medium text-[#a45a40] italic">
                (Corresponding Author)
              </span>
            )}
            <p className="!m-0 text-xs text-[#5e616b] leading-relaxed">
              {author.role && <span>{author.role}, </span>}
              {author.department && <span>{author.department}, </span>}
              <span className="text-[#726f68]">{author.institution}</span>
            </p>
            {author.email && (
              <p className="!m-0 text-[0.72rem] text-[#86837c] font-mono">
                Email:{" "}
                <a href={`mailto:${author.email}`} className="text-[#1f314d] hover:underline">
                  {author.email}
                </a>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Abstract preview/toggle */}
      <div className="mt-4 pt-3 border-t border-[#dfd7c9]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAbstract(!showAbstract)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a45a40] hover:text-[#7f3922] transition-colors"
          >
            <BookOpen size={14} />
            <span>{showAbstract ? "Hide Abstract" : "Read Abstract"}</span>
            {showAbstract ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <span className="text-[0.7rem] font-mono text-[#8a857c]">
            DOI: {article.doi}
          </span>
        </div>

        {showAbstract && (
          <div className="mt-3 rounded-xs bg-[#f4efe4] p-4 text-xs leading-6 text-[#454850] border border-[#dcd3c4]">
            <p className="!m-0 font-sans whitespace-pre-line">{article.abstract}</p>

            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#ded5c5]">
                <strong className="text-[#1f314d] block mb-1 text-[0.72rem] uppercase tracking-wider">
                  Keywords:
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {article.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-xs bg-[#e9e2d3] px-2 py-0.5 text-[0.68rem] font-medium text-[#4b4e57] border border-[#d6cfc2]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="mt-5 pt-4 border-t border-[#dfd7c9] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={article.pdfUrl}
            download={`${article.serialNumber}_${article.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-xs"
          >
            <Download size={13} /> Download Full PDF
          </a>
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
          >
            <span>View PDF</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setShowCiteModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f314d] hover:text-[#a45a40] bg-[#eee8db] hover:bg-[#e4dcce] px-3 py-2 rounded-xs border border-[#cfc5b3] transition-colors"
        >
          <Quote size={13} className="text-[#a45a40]" />
          <span>Cite Article</span>
        </button>
      </div>

      {/* Cite Modal */}
      {showCiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-sm border border-[#cfc5b3] bg-[#fbf9f4] p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#dfd7c9] pb-3">
              <h4 className="font-editorial text-xl font-bold text-[#1f314d] flex items-center gap-2">
                <Quote size={18} className="text-[#a45a40]" /> Cite this Article
              </h4>
              <button
                type="button"
                onClick={() => setShowCiteModal(false)}
                className="text-gray-500 hover:text-black text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-[#5e616b] font-medium leading-relaxed">
              {article.title}
            </p>

            {/* Format Tabs */}
            <div className="mt-4 flex gap-1 border-b border-[#dfd7c9] pb-1 text-xs">
              {(["APA", "MLA", "Chicago", "BibTeX"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setCiteFormat(fmt)}
                  className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                    citeFormat === fmt
                      ? "bg-[#1f314d] text-white"
                      : "text-[#5e616b] hover:bg-[#eee8db]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Citation Box */}
            <div className="mt-3 p-3 bg-[#f2ece0] border border-[#d6cfc2] rounded-xs font-mono text-[0.75rem] text-[#2c3038] whitespace-pre-wrap leading-relaxed">
              {citationText}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[0.7rem] text-[#7d7971]">
                Volume 1 · Issue 1 (2027)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-xs"
              >
                {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Citation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
