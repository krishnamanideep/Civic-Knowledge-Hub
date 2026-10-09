import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpenText, CalendarDays, Globe2, Scale } from "lucide-react";

export const subjectAreas = [
  "Political Science and Public Administration",
  "Sociology and Anthropology",
  "Management Studies",
  "Philosophy",
  "Economics",
  "Gender Studies",
  "Social Justice",
  "Literature (Languages)",
  "History and Archaeology",
  "International Relations and Foreign Policy",
  "Journalism and Mass Communication",
  "Law and Ethics",
  "Rural and Urban Studies",
  "Social Exclusion and Inclusive Policy",
  "Psychology",
  "Social Work",
  "Contemporary Social and Political Issues",
  "Education and Society",
  "Human Rights",
  "Democracy and Civic Engagement",
  "Constitutional Studies",
];

export default function Home() {
  useEffect(() => {
    document.title = "JPSG — Journal of Politics, Society and Governance";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", "An interdisciplinary, peer-reviewed academic journal for scholarship on politics, society and governance.");
  }, []);
  return (
    <div>
      <section className="page-wrap grid min-h-[520px] items-center gap-10 py-12 md:grid-cols-[1.25fr_.75fr] md:py-16">
        <div className="enter">
          <p className="eyebrow mb-6 flex items-center gap-2"><span className="inline-block h-px w-8 bg-[#a45a40]" />A scholarly forum for public life</p>
          <h1 className="font-editorial max-w-3xl text-[clamp(2.1rem,4.8vw,4.6rem)] font-medium leading-[.95] tracking-[-.045em] text-[#213858]">Ideas for a<br /><em className="font-normal text-[#a45a40]">changing</em> society.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#565860] sm:text-lg sm:leading-8">The Journal of Politics, Society and Governance brings careful, interdisciplinary scholarship to the questions shaping democratic life, public institutions and social change.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/current-issue" className="btn-primary inline-flex min-h-12 items-center justify-center gap-3 px-5 text-sm font-bold">Explore the current issue <ArrowRight size={16} /></Link>
            <Link href="/submissions" className="btn-secondary inline-flex min-h-12 items-center justify-center gap-3 px-5 text-sm font-bold">For authors <ArrowUpRight size={15} /></Link>
          </div>
          <a href="#journal-overview" className="mt-12 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.13em] text-[#77736d] no-underline hover:text-[#a45a40]"><ArrowDown size={14} /> Read about the journal</a>
        </div>
        <aside className="relative md:ml-auto md:w-full md:max-w-[360px]">
          <div className="absolute -right-5 -top-5 h-20 w-20 border-r border-t border-[#bf8972]" aria-hidden="true" />
          <div className="border border-[#d0c8ba] bg-[#efede6] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#d2c9bb] pb-4">
              <span className="eyebrow">Forthcoming issue</span>
              <span className="h-2 w-2 rounded-full bg-[#b5684d]" aria-hidden="true" />
            </div>
            <p className="mt-7 font-editorial text-[2.8rem] leading-none tracking-tight text-[#263c5d]">01<span className="text-[#a45a40]">/</span>01</p>
            <h2 className="mt-4 font-editorial text-2xl font-semibold text-[#263c5d]">Volume 1, Issue 1</h2>
            <p className="mt-1 text-sm text-[#676660]">January–March 2027</p>
            <div className="my-6 border-t border-[#d2c9bb]" />
            <p className="text-sm leading-6 text-[#5b5c62]">The inaugural issue is planned for 2027. Article contents and publication details will be announced when confirmed.</p>
            <Link href="/current-issue" className="rule-link mt-6">Issue information <ArrowRight size={15} /></Link>
          </div>
          <p className="mt-4 text-right text-[.65rem] uppercase tracking-[.14em] text-[#868077]">Research · Reflection · Public purpose</p>
        </aside>
      </section>

      <section className="bg-[#24395a] text-[#f6f3eb]" aria-label="Journal at a glance">
        <div className="page-wrap grid gap-5 py-7 sm:grid-cols-2 md:grid-cols-4 md:gap-0">
          {[
            { icon: CalendarDays, title: "Four issues", text: "Planned annually" },
            { icon: Globe2, title: "Open access", text: "Online publication intent" },
            { icon: BookOpenText, title: "English", text: "Primary publication language" },
            { icon: Scale, title: "Peer reviewed", text: "Editorial screening and review" },
          ].map(({ icon: Icon, title, text }, index) => (
            <div key={title} className={`flex items-center gap-4 py-2 md:px-5 ${index ? "md:border-l md:border-white/20" : ""}`}>
              <Icon className="h-5 w-5 shrink-0 text-[#d99b7e]" strokeWidth={1.6} />
              <div><p className="font-editorial text-lg">{title}</p><p className="text-xs text-[#d6d7da]">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="journal-overview" className="page-wrap grid gap-10 py-16 sm:py-24 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">About the journal</p>
          <h2 className="font-editorial mt-4 max-w-sm text-4xl leading-tight tracking-[-.03em] text-[#263c5d] sm:text-5xl">Scholarship that meets the moment.</h2>
        </div>
        <div className="max-w-2xl">
          <p className="font-editorial text-xl leading-8 text-[#454957] sm:text-2xl sm:leading-9">JPSG is a peer-reviewed academic journal published by the Democratic Organisation for Civic Knowledge Foundation.</p>
          <p className="mt-5 leading-7 text-[#62616a]">We provide a platform for original research, theoretical contributions, empirical studies, policy analysis and scholarly discussion on contemporary political, social and governance issues. The journal welcomes research that deepens understanding across disciplines and connects rigorous inquiry with questions of public life.</p>
          <Link href="/about" className="rule-link mt-6">Learn about our scope <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="border-y border-[#d9d2c6] bg-[#f0ede6] py-14 sm:py-20">
        <div className="page-wrap">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Areas of interest</p>
              <h2 className="font-editorial mt-3 text-3xl text-[#263c5d] sm:text-4xl">A broad lens on public life</h2>
            </div>
            <Link href="/about" className="rule-link">Full journal scope <ArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectAreas.map((area, idx) => (
              <div
                key={area}
                className="flex items-center gap-3 border border-[#d5ccbd] bg-[#f7f5ef] px-4 py-3 rounded-sm shadow-xs hover:border-[#a45a40] transition-colors"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8e2d2] text-[0.7rem] font-bold text-[#a45a40]">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-[#263c5d] leading-tight">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap grid gap-8 py-16 sm:py-24 md:grid-cols-[1fr_1fr]">
        <div className="border border-[#d6cfc2] bg-[#f0ede6] p-7 sm:p-9">
          <div className="h-px w-12 bg-[#a45a40]" aria-hidden="true" />
          <p className="font-editorial mt-5 text-[1.65rem] leading-[1.35] text-[#263c5d] sm:text-[2rem]">Scholarship with a public purpose.</p>
          <p className="mt-5 text-xs uppercase tracking-[.12em] text-[#77736d]">The purpose of JPSG</p>
        </div>
        <div className="flex flex-col justify-center py-2 md:pl-8">
          <p className="eyebrow">Contribute</p>
          <h2 className="font-editorial mt-3 text-3xl leading-tight text-[#263c5d] sm:text-4xl">Bring your research into the conversation.</h2>
          <p className="mt-4 max-w-lg leading-7 text-[#62616a]">Authors are invited to prepare original work within the journal’s scope. Review the manuscript categories, word limits, ethics guidance and double-blind review process before submission.</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/author-guidelines" className="rule-link">Author guidelines <ArrowRight size={15} /></Link>
            <Link href="/peer-review" className="rule-link">Review process <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#e8e4db]">
        <div className="page-wrap grid gap-8 py-10 sm:py-14 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">Editorial leadership</p>
            <h2 className="font-editorial mt-3 text-3xl text-[#263c5d]">Built for careful scholarship.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#62616a]">The editorial team supports rigorous, constructive assessment and clear publication standards. Meet our Editor-in-Chief, Managing Editor, and Editorial Board members.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                role: "Editor-in-Chief / Co-Founder",
                name: "Dr. Priyanka Gangarapu",
                designation: "Faculty, Department of Political Science and Public Administration",
                institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
              },
              {
                role: "Managing Editor / Founder",
                name: "Raghu Raja Isampalli",
                designation: "MA Political Science",
                institution: "Democratic Organisation for Civic Knowledge Foundation, Hyderabad, Telangana, India",
              },
            ].map((person) => (
              <div key={person.role} className="border-t border-[#bdb4a7] pt-4">
                <p className="eyebrow text-[#a45a40]">{person.role}</p>
                <p className="font-editorial mt-1 text-xl font-bold text-[#263c5d]">{person.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#454952] leading-5">{person.designation}</p>
                <p className="mt-0.5 text-xs text-[#77736d] leading-4">{person.institution}</p>
              </div>
            ))}
          </div>
          <Link href="/editorial-board" className="rule-link md:col-start-2">Meet the editorial board <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}