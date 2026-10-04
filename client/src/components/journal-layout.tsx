import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import logoImage from "@assets/Untitled_design_(1)_1769111819978.png";

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Current issue", href: "/current-issue" },
  { label: "Archives", href: "/archives" },
  { label: "Editorial board", href: "/editorial-board" },
  { label: "Submissions", href: "/submissions" },
  { label: "Author guidelines", href: "/author-guidelines" },
  { label: "Peer review", href: "/peer-review" },
  { label: "Publication ethics", href: "/publication-ethics" },
  { label: "Contact", href: "/contact" },
];

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const [location] = useLocation();
  const active = href === "/" ? location === "/" : location === href;
  return <Link href={href} onClick={onNavigate} className="nav-link" aria-current={active ? "page" : undefined}>{label}</Link>;
}

export function JournalLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);
  return (
    <div className="min-h-[100dvh] flex flex-col paper-texture">
      <header className="site-header">
        <div className="page-wrap">
          <div className="flex items-center justify-between gap-5 py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3 no-underline" aria-label="JPSG home">
              <span className="relative block h-10 w-[80px] shrink-0 overflow-hidden sm:h-[66px] sm:w-[146px]" aria-hidden="true">
                <img
                  src={logoImage}
                  alt=""
                  className="absolute left-0 top-[-26px] h-[160px] w-[160px] max-w-none object-contain sm:top-[-47px]"
                />
              </span>
              <span className="min-w-0">
                <span className="block font-editorial text-[1.07rem] leading-tight font-semibold tracking-tight text-[#233859]">Journal of Politics, Society<br className="hidden sm:block" /> and Governance</span>
                <span className="mt-1 block text-[.61rem] tracking-[.13em] text-[#77736d] uppercase">JPSG · An independent scholarly journal</span>
              </span>
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-xs text-[#77736d]">Vol. 1 · Issue 1 · 2027</span>
              <Link href="/submissions" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold">
                Submit your work <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center border border-[#cfc7b9] text-[#273c60] md:hidden" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
          <nav aria-label="Main navigation" className="hidden border-t border-[#d9d2c6] md:flex md:flex-wrap md:items-center md:gap-x-2 md:py-1">
            {navigation.map((item) => <NavLink key={item.href} {...item} />)}
          </nav>
        </div>
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-[#d9d2c6] bg-[#f7f5ef] px-4 pb-4 pt-2 md:hidden">
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-3 gap-y-1">
              {navigation.map((item) => <NavLink key={item.href} {...item} onNavigate={closeMenu} />)}
              <Link href="/submissions" onClick={closeMenu} className="btn-primary col-span-2 mt-2 px-4 py-3 text-center text-sm font-bold">Submission information</Link>
            </div>
          </nav>
        )}
      </header>
      <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
      <footer className="mt-16 border-t border-[#cfc7b9] bg-[#ece9e1]">
        <div className="page-wrap py-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative block h-8 w-[66px] shrink-0 overflow-hidden" aria-hidden="true">
                  <img
                    src={logoImage}
                    alt=""
                    className="absolute left-0 top-[-22px] h-[88px] w-[88px] max-w-none object-contain"
                  />
                </span>
                <div className="font-editorial text-lg font-semibold text-[#233859]">Journal of Politics,<br />Society and Governance</div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#676660]">Peer-reviewed scholarship across political institutions, public life and governance.</p>
              <p className="mt-4 text-xs leading-5 text-[#77736d]">Published by the Democratic Organisation for Civic Knowledge Foundation.</p>
            </div>
            <div>
              <h2 className="eyebrow mb-3">Explore</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {navigation.slice(1, 7).map((item) => <Link key={item.href} href={item.href} className="text-sm text-[#4b4d54] no-underline hover:text-[#a45a40]">{item.label}</Link>)}
              </div>
            </div>
            <div>
              <h2 className="eyebrow mb-3">Journal office</h2>
              <p className="text-sm leading-6 text-[#4b4d54]">Visakhapatnam, Andhra Pradesh<br />India</p>
              <p className="mt-3 text-xs leading-5 text-[#77736d]">Official contact email and online journal portal are forthcoming. Please do not send manuscripts to unverified addresses.</p>
            </div>
          </div>
          <div className="mt-9 flex flex-col gap-2 border-t border-[#d0c9bd] pt-4 text-xs text-[#77736d] sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Democratic Organisation for Civic Knowledge Foundation</span>
            <span>Open-access intent · English · Four issues planned annually</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ kicker, title, summary }: { kicker: string; title: string; summary: string }) {
  return (
    <section className="border-b border-[#d6cfc2] bg-[#f1eee6] py-12 sm:py-16">
      <div className="page-wrap">
        <div className="max-w-3xl enter">
          <p className="eyebrow mb-4">{kicker}</p>
          <h1 className="font-editorial text-4xl font-medium leading-[1.08] tracking-[-.035em] text-[#223758] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5b5c62] sm:text-lg sm:leading-8">{summary}</p>
        </div>
      </div>
    </section>
  );
}

export function ContentFrame({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return <div className="page-wrap grid gap-12 py-10 md:grid-cols-[minmax(0,1fr)_280px] md:py-14"><article className="content-prose min-w-0">{children}</article>{aside && <aside className="md:pt-1">{aside}</aside>}</div>;
}

export function NoteBox({ title, children }: { title: string; children: ReactNode }) {
  return <div className="my-6 border-l-[3px] border-[#a45a40] bg-[#f0ece4] px-5 py-4"><h3 className="!mt-0 font-sans text-sm font-bold text-[#273c60]">{title}</h3><div className="text-sm leading-6 text-[#5e5d58]">{children}</div></div>;
}

export function SideCard({ children, title = "Journal information" }: { children: ReactNode; title?: string }) {
  return <div className="border border-[#d6cfc2] bg-[#f2efe8] p-5"><p className="eyebrow mb-3">{title}</p>{children}</div>;
}