import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import {
  Download,
  ExternalLink,
  Quote,
  Copy,
  Check,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  Mail,
  Share2,
} from "lucide-react";
import { ContentFrame, SideCard } from "@/components/journal-layout";
import {
  currentIssueArticles,
  getArticleBySlug,
  getCitation,
  type JournalArticle,
} from "@/data/articles";
import { useArticle, useArticles, useJournalSettings } from "@/hooks/use-journal";

export default function ArticleDetailPage({ slug: propSlug }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const slug = propSlug || params?.slug || "";
  const { article: dynamicArticle } = useArticle(slug);
  const { articles: allArticles } = useArticles();
  const { settings } = useJournalSettings();
  const article = dynamicArticle || getArticleBySlug(slug, allArticles);

  const [citeFormat, setCiteFormat] = useState<"APA" | "MLA" | "Chicago" | "BibTeX">("APA");
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Google Scholar & OpenGraph Meta Tags
  useEffect(() => {
    if (!article) return;

    const prevTitle = document.title;
    document.title = `${article.title} | Journal of Politics, Society and Governance`;

    const createdTags: HTMLMetaElement[] = [];

    const addMeta = (name: string, content: string) => {
      if (!content) return;
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      createdTags.push(meta);
    };

    const addOgMeta = (property: string, content: string) => {
      if (!content) return;
      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      meta.content = content;
      document.head.appendChild(meta);
      createdTags.push(meta);
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "https://journals.docknowledge.org";
    const fullPdfUrl = `${origin}${article.pdfUrl}`;
    const [firstPage, lastPage] = article.pages.split("–");

    // Standard meta
    addMeta("description", article.abstract.slice(0, 200) + "...");
    addMeta("keywords", (article.keywords || []).join(", "));

    // Google Scholar Highwire Press tags
    addMeta("citation_title", article.title);
    addMeta("citation_journal_title", "Journal of Politics, Society and Governance");
    addMeta("citation_volume", article.volume.replace(/[^0-9]/g, "") || "1");
    addMeta("citation_issue", article.issue.replace(/[^0-9]/g, "") || "1");
    addMeta("citation_publication_date", "2027/01/01");
    addMeta("citation_pdf_url", fullPdfUrl);
    if (firstPage) addMeta("citation_firstpage", firstPage.trim());
    if (lastPage) addMeta("citation_lastpage", lastPage.trim());

    article.authors.forEach((author) => {
      addMeta("citation_author", author.name);
      if (author.institution) {
        addMeta("citation_author_institution", author.institution);
      }
      if (author.email) {
        addMeta("citation_author_email", author.email);
      }
    });

    // OpenGraph
    addOgMeta("og:title", article.title);
    addOgMeta("og:description", article.abstract.slice(0, 200) + "...");
    addOgMeta("og:type", "article");
    addOgMeta("og:url", window.location.href);

    return () => {
      document.title = prevTitle;
      createdTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [article]);

  if (!article) {
    return (
      <div className="page-wrap py-16 text-center">
        <h1 className="font-editorial text-3xl font-bold text-[#1f314d]">Article Not Found</h1>
        <p className="mt-4 text-sm text-[#676660]">
          The article you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/current-issue" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold">
            <ArrowLeft size={14} /> Back to Current Issue
          </Link>
          <Link href="/archives" className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold">
            Browse Archives
          </Link>
        </div>
      </div>
    );
  }

  const citationText = getCitation(article, citeFormat);
  const pdfFilename = article.pdfUrl.split("/").pop() || "article.pdf";

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const otherArticles = allArticles.filter((a) => a.id !== article.id);

  return (
    <div className="enter">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="border-b border-[#dfd7c9] bg-[#fbf9f4] py-8 sm:py-10">
        <div className="page-wrap">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#7a766e]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#a45a40] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/current-issue" className="hover:text-[#a45a40] transition-colors">Current Issue (Vol. 1, Issue 1)</Link>
            <span>/</span>
            <span className="text-[#1f314d] font-semibold">Article {article.serialNumber}</span>
          </nav>

          {/* Section & Publication Badge */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3 text-xs">
            <span className="flex h-6 items-center px-2.5 rounded-xs bg-[#1f314d] text-white font-mono text-[0.7rem] font-bold tracking-wider">
              ARTICLE {article.serialNumber}
            </span>
            <span className="font-semibold text-[#a45a40] uppercase tracking-wider text-[0.7rem]">
              {article.section}
            </span>
            <span className="text-[#c5beaf]">·</span>
            <span className="text-[#6e6a62] font-mono text-[0.72rem]">
              {article.volume}, {article.issue} ({article.date}) · Pages {article.pages}
            </span>
            <span className="text-[#c5beaf]">·</span>
            <span className="inline-flex items-center rounded-xs bg-[#e8f1dc] px-2 py-0.5 text-[0.68rem] font-bold text-[#446d1b] border border-[#c4dcad]">
              Open Access
            </span>
          </div>

          {/* Title */}
          <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#1f314d] max-w-4xl">
            {article.title}
          </h1>

          {/* Authors List */}
          <div className="mt-6 pt-5 border-t border-[#dfd7c9] space-y-3">
            <div className="flex flex-wrap items-start gap-y-4 gap-x-8">
              {article.authors.map((author) => (
                <div key={author.name} className="min-w-0 max-w-md">
                  <div className="text-base font-bold text-[#1f314d] flex items-center gap-1.5">
                    <span>{author.name}</span>
                    {author.isCorresponding && (
                      <span className="text-[#a45a40] font-bold text-sm" title="Corresponding Author">
                        *
                      </span>
                    )}
                  </div>
                  <p className="!m-0 text-xs text-[#5e616b] leading-relaxed mt-0.5">
                    {author.role && <span className="font-medium text-[#4b4e57]">{author.role}, </span>}
                    {author.department && <span>{author.department}, </span>}
                    <span className="text-[#726f68]">{author.institution}</span>
                  </p>
                  {author.email && (
                    <p className="!m-0 text-xs text-[#86837c] font-mono mt-0.5 flex items-center gap-1">
                      <Mail size={12} className="text-[#a45a40] shrink-0" />
                      <a href={`mailto:${author.email}`} className="text-[#1f314d] hover:underline">
                        {author.email}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {article.authors.some((a) => a.isCorresponding) && (
              <p className="text-[0.72rem] text-[#7a766e] italic pt-2">
                * Indicates corresponding author.
              </p>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={article.pdfUrl}
              download={pdfFilename}
              className="btn-primary inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold shadow-sm"
            >
              <Download size={16} /> Download Full-Text PDF
            </a>
            <a
              href={article.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
            >
              <span>View PDF in New Tab</span>
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={handleShareUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-[#1f314d] hover:text-[#a45a40] bg-[#f0ebd9] hover:bg-[#eae3cd] border border-[#cfc5b3] rounded-xs transition-colors"
            >
              <Share2 size={13} className="text-[#a45a40]" />
              <span>{urlCopied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="page-wrap py-10 sm:py-12">
        <ContentFrame
          aside={
            <div className="space-y-6">
              {/* PDF Download Card */}
              <SideCard title="Download Options">
                <a
                  href={article.pdfUrl}
                  download={pdfFilename}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold shadow-xs mb-2"
                >
                  <Download size={14} /> Download PDF
                </a>
                <a
                  href={article.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold"
                >
                  <span>Read Full PDF Online</span>
                  <ExternalLink size={13} />
                </a>
                <p className="mt-3 text-[0.7rem] text-[#77736d] leading-4 text-center">
                  Official publisher typeset PDF for Volume 1, Issue 1.
                </p>
              </SideCard>

              {/* Publication Metadata */}
              <SideCard title="Article Particulars">
                <dl className="space-y-2.5 text-xs">
                  <div>
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Journal</dt>
                    <dd className="font-semibold text-[#1f314d] mt-0.5">
                      Journal of Politics, Society and Governance
                    </dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Volume & Issue</dt>
                    <dd className="font-semibold text-[#1f314d] mt-0.5">
                      {article.volume}, {article.issue}
                    </dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Publication Date</dt>
                    <dd className="font-medium text-[#4b4e57] mt-0.5">{article.date}</dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Pagination</dt>
                    <dd className="font-mono text-[#1f314d] mt-0.5">pp. {article.pages}</dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Article Type</dt>
                    <dd className="font-medium text-[#4b4e57] mt-0.5">{article.section}</dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Peer Review</dt>
                    <dd className="font-medium text-[#4b4e57] mt-0.5">Double-Blind Peer Reviewed</dd>
                  </div>
                  <div className="pt-2 border-t border-[#dfd7c9]">
                    <dt className="text-[0.68rem] uppercase font-bold text-[#77736d]">Publisher</dt>
                    <dd className="text-[#555861] mt-0.5 leading-snug">
                      <a
                        href="https://docknowledge.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[#1f314d] font-semibold inline-flex items-center gap-1"
                        title="Visit Democratic Organisation for Civic Knowledge Foundation website"
                      >
                        <span>Democratic Organisation for Civic Knowledge Foundation</span>
                        <ExternalLink size={10} className="text-[#a45a40]" />
                      </a>
                    </dd>
                  </div>
                </dl>
              </SideCard>

              {/* Other Articles in this Issue */}
              <SideCard title="In This Issue (Vol. 1, No. 1)">
                <div className="space-y-3 text-xs">
                  {otherArticles.map((other) => (
                    <div key={other.id} className="pb-2.5 border-b border-[#dfd7c9] last:border-b-0 last:pb-0">
                      <span className="font-mono text-[0.68rem] text-[#a45a40] font-bold block mb-0.5">
                        Article {other.serialNumber} (pp. {other.pages})
                      </span>
                      <Link
                        href={`/article/${other.slug}`}
                        className="text-[#1f314d] hover:text-[#a45a40] transition-colors font-medium line-clamp-2 leading-snug"
                      >
                        {other.title}
                      </Link>
                      <p className="!m-0 text-[0.7rem] text-[#77736d] mt-1 line-clamp-1">
                        {other.authors.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <Link href="/current-issue" className="rule-link font-bold text-xs inline-flex items-center gap-1">
                      View Full Table of Contents <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </SideCard>
            </div>
          }
        >
          {/* Abstract */}
          <div className="mb-10">
            <h2 className="!mt-0 !mb-4 font-editorial text-2xl font-bold text-[#1f314d] flex items-center gap-2 border-b-2 border-[#1f314d] pb-2">
              <BookOpen size={22} className="text-[#a45a40]" />
              Abstract
            </h2>
            <div className="rounded-sm bg-[#fbf9f4] p-6 sm:p-7 border border-[#d6cfc2] shadow-xs">
              <p className="!m-0 font-sans text-sm sm:text-base leading-7 sm:leading-8 text-[#333740] whitespace-pre-line">
                {article.abstract}
              </p>
            </div>
          </div>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="mb-10">
              <h3 className="!mt-0 !mb-3 font-editorial text-xl font-bold text-[#1f314d]">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-xs bg-[#f2ece0] px-3 py-1.5 text-xs font-medium text-[#2d323b] border border-[#d6cfc2] shadow-xs"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Citation Generator */}
          <div className="mb-10 rounded-sm border border-[#d6cfc2] bg-[#fbf9f4] p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#dfd7c9] pb-3 mb-4">
              <h3 className="!m-0 font-editorial text-xl font-bold text-[#1f314d] flex items-center gap-2">
                <Quote size={18} className="text-[#a45a40]" /> Cite this Article
              </h3>
              <span className="text-xs text-[#77736d] font-mono">Academic Citation</span>
            </div>

            {/* Format Tabs */}
            <div className="flex gap-1 border-b border-[#dfd7c9] pb-2 text-xs">
              {(["APA", "MLA", "Chicago", "BibTeX"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setCiteFormat(fmt)}
                  className={`px-3 py-1.5 font-semibold rounded-xs transition-colors ${
                    citeFormat === fmt
                      ? "bg-[#1f314d] text-white shadow-xs"
                      : "text-[#5e616b] hover:bg-[#eee8db]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Citation Box */}
            <div className="mt-3 p-4 bg-[#f2ece0] border border-[#d6cfc2] rounded-xs font-mono text-xs text-[#2c3038] whitespace-pre-wrap leading-relaxed">
              {citationText}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#7d7971]">
                {article.volume} · {article.issue} ({article.year})
              </span>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-xs"
              >
                {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Citation"}</span>
              </button>
            </div>
          </div>

          {/* Full Text PDF Banner */}
          <div className="border border-[#1f314d]/20 bg-[#f4efe4] p-6 rounded-sm shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow text-[#a45a40] block mb-1">Full-Text Access</span>
              <h4 className="font-editorial text-xl font-bold text-[#1f314d] !m-0">
                Read the Complete Research Article
              </h4>
              <p className="!m-0 text-xs text-[#5e616b] mt-1">
                Published in typeset format with full references, citations, and empirical analyses.
              </p>
            </div>
            <a
              href={article.pdfUrl}
              download={pdfFilename}
              className="btn-primary shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-xs"
            >
              <Download size={15} /> Download PDF (pp. {article.pages})
            </a>
          </div>

          {/* Navigation to Prev/Next */}
          <div className="mt-10 pt-6 border-t border-[#dfd7c9] flex items-center justify-between">
            <Link
              href="/current-issue"
              className="rule-link inline-flex items-center gap-2 text-xs font-bold"
            >
              <ArrowLeft size={14} /> Back to Table of Contents
            </Link>
            <Link
              href="/archives"
              className="rule-link inline-flex items-center gap-2 text-xs font-bold"
            >
              Browse Archives <ArrowRight size={14} />
            </Link>
          </div>
        </ContentFrame>
      </div>
    </div>
  );
}
