import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X, Globe } from "lucide-react";
import { useJournalSettings } from "@/hooks/use-journal";

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Particulars", href: "/particulars" },
  { label: "Editorial board", href: "/editorial-board" },
  { label: "Current issue", href: "/current-issue" },
  { label: "Archives", href: "/archives" },
  { label: "Submissions", href: "/submissions" },
  { label: "Author guidelines", href: "/author-guidelines" },
  { label: "Peer review", href: "/peer-review" },
  { label: "Publication ethics", href: "/publication-ethics" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const [location] = useLocation();
  const active = href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`nav-link text-xs font-semibold transition-colors py-2 px-3 rounded ${
        active
          ? "text-[#1d3254] font-bold bg-[#e8e2d2] border-b-2 border-[#a45a40]"
          : "text-[#47484e] hover:bg-[#e4decb]"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span>{label}</span>
    </Link>
  );
}

export function JournalLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);
  const { settings } = useJournalSettings();

  const journalTitle = settings?.journalTitle || "Journal of Politics, Society and Governance";
  const currentVolume = settings?.currentVolume || "Volume 1";
  const currentIssue = settings?.currentIssue || "Issue 1";
  const currentYear = settings?.currentYear || "2027";

  return (
    <div className="min-h-[100dvh] flex flex-col paper-texture font-sans text-[#2c3038]">
      <header className="site-header bg-[#f7f4ec] border-b border-[#dcd4c5]">
        <div className="page-wrap">
          <div className="flex items-center justify-between gap-3 sm:gap-5 py-3.5 sm:py-4">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-4 no-underline group shrink min-w-0" aria-label="Journal Homepage">
              <img
                src="/logo.png"
                alt={`${journalTitle} Logo`}
                className="h-11 sm:h-16 w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02]"
              />
              <div className="border-l border-[#d3cbba] pl-2.5 sm:pl-4 min-w-0">
                <span className="block font-editorial text-[clamp(1.05rem,2.2vw,2.1rem)] leading-[1.12] font-bold tracking-tight text-[#1e3456]">
                  {journalTitle}
                </span>
                <a
                  href="https://docknowledge.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 hidden sm:inline-flex items-center gap-1 text-[0.63rem] font-bold tracking-[0.14em] text-[#77736d] uppercase hover:text-[#a45a40] transition-colors"
                  title="Visit Democratic Organisation for Civic Knowledge Foundation website (docknowledge.org)"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Published by Democratic Organisation for Civic Knowledge Foundation</span>
                  <ArrowUpRight size={10} className="shrink-0 text-[#a45a40]" />
                </a>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex shrink-0">
              <div className="text-right text-xs text-[#6e6a62]">
                <div className="font-semibold text-[#1f314d]">{currentVolume} · {currentIssue}</div>
                <div className="text-[#3d7a42] font-semibold">Current Issue · {currentYear}</div>
              </div>
              <a
                href="https://docknowledge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#e8e2d2] hover:bg-[#ded7c5] text-[#1e3456] border border-[#d3cbba] transition-colors shadow-xs"
                title="Visit DOCK Foundation website (docknowledge.org)"
              >
                <Globe size={13} className="text-[#a45a40]" />
                <span>docknowledge.org</span>
                <ArrowUpRight size={12} />
              </a>
              <Link
                href="/submissions"
                className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
              >
                Submit Manuscript <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center border border-[#cfc7b9] text-[#273c60] md:hidden bg-[#f0ede4]"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav aria-label="Main navigation" className="hidden border-t border-[#dfd7c9] md:flex md:flex-wrap md:items-center md:gap-x-1 md:py-1.5">
            {navigation.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-[#d9d2c6] bg-[#f2efe6] px-4 pb-4 pt-2 md:hidden">
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-2 gap-y-1">
              {navigation.map((item) => (
                <NavLink key={item.href} {...item} onNavigate={closeMenu} />
              ))}
              <a
                href="https://docknowledge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#1e3456] bg-[#e4decb] rounded border border-[#d3cbba] mt-1"
              >
                <Globe size={13} className="text-[#a45a40]" />
                <span>Visit DOCK Foundation (docknowledge.org)</span>
                <ArrowUpRight size={12} />
              </a>
              <Link
                href="/submissions"
                onClick={closeMenu}
                className="btn-primary col-span-2 mt-2 px-4 py-3 text-center text-sm font-bold shadow"
              >
                Submission Information
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <footer className="mt-16 border-t border-[#cfc7b9] bg-[#e9e5dc]">
        <div className="page-wrap py-12">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt={journalTitle}
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#5b5a54]">
                The <strong>{journalTitle}</strong> is a peer-reviewed academic journal dedicated to publishing rigorous interdisciplinary scholarship on political institutions, public policy, governance, and social transformations.
              </p>
              <p className="mt-3 text-xs leading-5 text-[#77736d]">
                Published by the{" "}
                <a
                  href="https://docknowledge.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1f314d] hover:text-[#a45a40] underline inline-flex items-center gap-1"
                  title="Visit Democratic Organisation for Civic Knowledge Foundation website"
                >
                  Democratic Organisation for Civic Knowledge Foundation
                  <ArrowUpRight size={11} className="text-[#a45a40]" />
                </a>{" "}
                (
                <a
                  href="https://docknowledge.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a45a40] hover:underline font-semibold"
                >
                  docknowledge.org
                </a>
                ).
              </p>
            </div>

            <div>
              <h2 className="eyebrow mb-3 text-[#a45a40]">Journal Navigation</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs text-[#4b4d54] no-underline hover:text-[#a45a40] transition-colors"
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#d8d0c2] text-xs">
                <span className="font-bold text-[#1f314d] block mb-1">Author Downloads:</span>
                <div className="flex flex-col gap-1">
                  <a href="/downloads/JPSG_First_Page_Template.docx" download="JPSG_First_Page_Template.docx" className="text-[#a45a40] hover:underline font-medium">
                    ↓ First Page Template (.docx)
                  </a>
                  <a href="/downloads/JPSG_Manuscript_Template.docx" download="JPSG_Manuscript_Template.docx" className="text-[#a45a40] hover:underline font-medium">
                    ↓ Manuscript Template (.docx)
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h2 className="eyebrow mb-3 text-[#a45a40]">Publisher & Editorial Offices</h2>
              <div className="space-y-3 text-xs leading-5 text-[#4b4d54]">
                <div>
                  <p className="font-bold text-[#1f314d]">Publisher's Office:</p>
                  <p>
                    <a
                      href="https://docknowledge.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1f314d] hover:text-[#a45a40] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Democratic Organisation for Civic Knowledge Foundation
                      <ArrowUpRight size={10} className="text-[#a45a40]" />
                    </a>
                  </p>
                  <p>{settings?.publisherLocation || "Hyderabad, Telangana, India"}</p>
                  <p className="mt-0.5">
                    <a
                      href="https://docknowledge.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#a45a40] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>https://docknowledge.org</span>
                      <ArrowUpRight size={11} />
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-bold text-[#1f314d]">Editorial & Publication Office:</p>
                  <p className="whitespace-pre-line">{settings?.editorialOffice || "#9-164/3, Gandhi Nagar,\nMadhurawada, Visakhapatnam,\nAndhra Pradesh, India - 530048"}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-[#6e6a62]">
                <p>
                  Contact:{" "}
                  <a
                    href={`mailto:${settings?.contactEmail || "contactus.jpsg@docknowledge.org"}`}
                    className="font-mono font-semibold text-[#1f314d] hover:underline"
                  >
                    {settings?.contactEmail || "contactus.jpsg@docknowledge.org"}
                  </a>
                </p>
                <p>
                  Submissions:{" "}
                  <a
                    href={`mailto:${settings?.submissionEmail || "jpsg@docknowledge.org"}`}
                    className="font-mono font-semibold text-[#1f314d] hover:underline"
                  >
                    {settings?.submissionEmail || "jpsg@docknowledge.org"}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#d0c9bd] pt-5 text-xs text-[#77736d] sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()}{" "}
              <a
                href="https://docknowledge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-semibold text-[#1f314d]"
              >
                Democratic Organisation for Civic Knowledge Foundation
              </a>
              . All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-[#88837a] hover:text-[#1f314d] text-[11px] transition-colors"
                title="Editor Login"
              >
                Editor Login
              </Link>
              <a
                href="https://docknowledge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-[#a45a40] font-semibold inline-flex items-center gap-0.5"
              >
                <span>docknowledge.org</span>
                <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ kicker, title, summary }: { kicker: string; title: string; summary: string }) {
  return (
    <section className="border-b border-[#d6cfc2] bg-[#efebe2] py-12 sm:py-14">
      <div className="page-wrap">
        <div className="max-w-3xl enter">
          <p className="eyebrow mb-3 text-[#a45a40]">{kicker}</p>
          <h1 className="font-editorial text-3xl font-medium leading-[1.12] tracking-[-.03em] text-[#1e3456] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b5c62] sm:text-lg sm:leading-8">{summary}</p>
        </div>
      </div>
    </section>
  );
}

export function ContentFrame({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="page-wrap grid gap-12 py-10 md:grid-cols-[minmax(0,1fr)_300px] md:py-14">
      <article className="content-prose min-w-0">{children}</article>
      {aside && <aside className="md:pt-1">{aside}</aside>}
    </div>
  );
}

export function NoteBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-6 border-l-[3px] border-[#a45a40] bg-[#eee9df] px-5 py-4 shadow-sm">
      <h3 className="!mt-0 font-sans text-sm font-bold text-[#1f314d]">{title}</h3>
      <div className="text-sm leading-6 text-[#5b5a54]">{children}</div>
    </div>
  );
}

export function SideCard({ children, title = "Journal Information" }: { children: ReactNode; title?: string }) {
  return (
    <div className="border border-[#d6cfc2] bg-[#f0ece3] p-5 shadow-sm">
      <p className="eyebrow mb-3 text-[#a45a40]">{title}</p>
      {children}
    </div>
  );
}
