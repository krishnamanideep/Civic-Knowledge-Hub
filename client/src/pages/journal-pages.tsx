import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Check, FileText, Mail, MapPin, Phone, Printer, ChevronDown, ChevronUp, BookOpen, ShieldCheck, HelpCircle } from "lucide-react";
import { ContentFrame, NoteBox, PageIntro, SideCard } from "@/components/journal-layout";
import { subjectAreas } from "./home";

export type JournalPageType =
  | "about"
  | "particulars"
  | "current-issue"
  | "archives"
  | "editorial-board"
  | "submissions"
  | "author-guidelines"
  | "peer-review"
  | "publication-ethics"
  | "faq"
  | "contact"
  | "not-found";

function getInitials(name: string) {
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const reviewCriteria = ["Originality", "Methodology", "Theoretical contribution", "Quality of analysis", "Relevance", "Academic writing", "References", "Overall contribution to the field"];
const manuscriptKinds = ["Original Research Article", "Review Article", "Research Note", "Policy Analysis", "Book Review"];

const ethicalTopics = [
  ["Responsibilities of Authors", "Authors should submit original work, accurately represent their research and sources, disclose relevant conflicts of interest, and take full responsibility for the integrity of the manuscript."],
  ["Responsibilities of Reviewers", "Reviewers should assess work objectively and confidentially, provide constructive reasoning, disclose conflicts, and avoid using unpublished material for personal advantage."],
  ["Responsibilities of Editors", "Editors should make fair, evidence-led decisions, protect confidentiality, manage conflicts of interest, and ensure editorial decisions are independent of improper influence."],
  ["Plagiarism & Originality", "Submitted work must acknowledge the ideas and words of others. Suspected unattributed use or plagiarism will be thoroughly investigated prior to editorial decisions."],
  ["Duplicate Submission & Publication", "Authors should not submit the same manuscript simultaneously to another journal or present substantially overlapping work as a new contribution without full disclosure."],
  ["Fabrication and Falsification", "Research records, empirical evidence, and findings must be represented honestly. Concerns regarding invented or altered data require careful investigation."],
  ["Authorship Criteria", "Authorship should reflect meaningful scholarly contribution. All listed authors should approve the manuscript and accept responsibility for their contribution."],
  ["Conflicts of Interest", "Authors, reviewers, and editors should disclose relationships or financial/personal interests that could reasonably affect impartiality."],
  ["Corrections & Addenda", "The journal intends to correct the scholarly record promptly when a published work contains a material error."],
  ["Retractions", "Retraction will be considered when serious concerns undermine the reliability or scientific integrity of a published work."],
  ["Complaints and Appeals", "Concerns regarding editorial conduct or publication decisions should be presented with supporting documentation and reviewed impartially."],
  ["Use of Artificial Intelligence", "Authors remain solely responsible for the accuracy, originality, and integrity of submitted work. Artificial intelligence tools cannot be listed as authors."],
];

const pageMetadata: Record<JournalPageType, { title: string; kicker: string; summary: string }> = {
  about: { title: "About the Journal", kicker: "Purpose & Scope", summary: "An interdisciplinary academic home for rigorous inquiry into contemporary politics, society, and governance." },
  particulars: { title: "Journal Particulars", kicker: "Official Metadata", summary: "Key operational parameters, publisher details, publication frequency, and scope of the Journal of Politics, Society and Governance." },
  "current-issue": { title: "Current Issue", kicker: "Inaugural Issue · Forthcoming", summary: "Volume 1, Issue 1 is planned for publication in January–March 2027. Article contents will be announced upon confirmation." },
  archives: { title: "Journal Archive", kicker: "Issues & Publication Record", summary: "Browse issue information as it becomes available. The journal is preparing its inaugural issue." },
  "editorial-board": { title: "Editorial Board", kicker: "Editorial Leadership & Governance", summary: "Meet the Editor-in-Chief, Managing Editor, and Editorial Board members guiding the Journal of Politics, Society and Governance." },
  submissions: { title: "Submit Your Manuscript", kicker: "Information for Authors", summary: "The Journal of Politics, Society and Governance welcomes original research within its scope. Review submission guidelines below." },
  "author-guidelines": { title: "Author Guidelines", kicker: "Manuscript Preparation", summary: "Essential requirements, word limits, formatting, and double-blind review preparation for authors." },
  "peer-review": { title: "Peer-Review Policy", kicker: "Editorial Standards", summary: "A transparent outline of editorial screening, independent peer review, and evaluation criteria for submitted scholarship." },
  "publication-ethics": { title: "Publication Ethics and Integrity", kicker: "Ethical Standards", summary: "Responsibilities and procedures supporting fairness, transparency, accuracy, and trust in academic scholarship." },
  faq: { title: "Frequently Asked Questions", kicker: "Questions & Answers", summary: "Find detailed answers to common inquiries regarding manuscript submission, peer review, publishing policies, and editorial guidance." },
  contact: { title: "Contact the Journal Office", kicker: "Editorial Office", summary: "Contact details for the editorial office of the Journal of Politics, Society and Governance in Visakhapatnam, Andhra Pradesh, India." },
  "not-found": { title: "Page Not Found", kicker: "404 · Not Found", summary: "The requested page is not part of the journal website. Please return to the homepage or explore journal sections." },
};

function Sidebar({ label = "Essential Pages" }: { label?: string }) {
  return (
    <SideCard title={label}>
      <div className="flex flex-col gap-3">
        {[
          ["Journal Particulars", "/particulars"],
          ["Editorial Board", "/editorial-board"],
          ["Author Guidelines", "/author-guidelines"],
          ["Peer-Review Policy", "/peer-review"],
          ["Publication Ethics", "/publication-ethics"],
          ["Frequently Asked Questions", "/faq"],
          ["Contact Editorial Office", "/contact"],
        ].map(([text, href]) => (
          <Link key={href} href={href} className="rule-link justify-between border-b border-[#d6cfc2] pb-2 text-[0.8rem]">
            {text}
            <ArrowRight size={14} />
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#77736d]">
        Published by the Democratic Organisation for Civic Knowledge Foundation, Visakhapatnam, Andhra Pradesh, India.
      </p>
    </SideCard>
  );
}

function AboutPage() {
  return (
    <>
      <PageIntro {...pageMetadata.about} />
      <ContentFrame
        aside={
          <SideCard title="Journal at a Glance">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#77736d]">Journal Title</dt>
                <dd className="mt-1 font-semibold text-[#1f314d]">Journal of Politics, Society and Governance</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#77736d]">Publisher</dt>
                <dd className="mt-1 leading-5 text-[#4b4d54]">Democratic Organisation for Civic Knowledge Foundation</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#77736d]">Frequency</dt>
                <dd className="mt-1 font-semibold text-[#1f314d]">Four Issues Annually (Quarterly)</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#77736d]">Primary Language</dt>
                <dd className="mt-1 font-semibold text-[#1f314d]">English</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#77736d]">Publication Model</dt>
                <dd className="mt-1 font-semibold text-[#1f314d]">Open Access Intent</dd>
              </div>
            </dl>
          </SideCard>
        }
      >
        <p className="!mt-0 font-editorial !text-[1.35rem] !leading-8 text-[#1f314d]">
          The <em>Journal of Politics, Society and Governance</em> is a peer-reviewed academic journal published by the <strong>Democratic Organisation for Civic Knowledge Foundation</strong>.
        </p>
        <p>
          The journal provides a rigorous scholarly platform for original empirical research, theoretical contributions, policy analysis, and interdisciplinary discussions concerning contemporary political institutions, social transformations, and governance frameworks.
        </p>
        <p>
          The journal invites research that deepens scholarly understanding of political institutions, democratic processes, public policy, public administration, constitutional studies, social justice, human rights, and contemporary socio-political developments.
        </p>

        <h2>Subject Areas and Scope</h2>
        <p>Research across the following areas is welcome. The list represents core areas of interest:</p>
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjectAreas.map((area, idx) => (
            <div
              key={area}
              className="flex items-center gap-3 border border-[#d6cfc2] bg-[#f7f4ec] px-3.5 py-3 rounded-sm shadow-xs hover:border-[#a45a40] transition-colors"
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

        <h2>Publication Model & Schedule</h2>
        <p>
          The primary language of publication is English. The journal intends to publish four issues annually (quarterly) and aims to make published research freely accessible to academics, researchers, policy analysts, and the public through an online open-access model.
        </p>
        <p>
          The journal is preparing its inaugural issue, Volume 1, Issue 1, planned for January–March 2027. Online submission details and official publication identifiers will be updated on this website.
        </p>
      </ContentFrame>
    </>
  );
}

function ParticularsPage() {
  const particulars = [
    { label: "Journal Title", value: "Journal of Politics, Society and Governance" },
    { label: "Journal Abbreviation", value: "JPSG" },
    { label: "Publisher Name", value: "Democratic Organisation for Civic Knowledge Foundation" },
    { label: "Publisher's Office Location", value: "Hyderabad, Telangana, India" },
    { label: "Editorial & Publication Office Address", value: "#9-164/3, Gandhi Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh, India - 530048" },
    { label: "Publication Frequency", value: "Four Issues Annually (Quarterly)" },
    { label: "Publication Format / Medium", value: "Online / Digital Publication" },
    { label: "Primary Language", value: "English" },
    { label: "Peer Review Type", value: "Double-Blind Peer Review" },
    { label: "Access Model", value: "Open Access Intent" },
    { label: "Official Submission Email", value: "jpsg@docknowledge.org" },
    { label: "General Contact Email", value: "contactus.jpsg@docknowledge.org" },
  ];

  return (
    <>
      <PageIntro {...pageMetadata.particulars} />
      <ContentFrame aside={<Sidebar label="Related Information" />}>
        <h2 className="!mt-0">Official Journal Particulars</h2>
        <p>
          In accordance with standard academic publishing guidelines, below are the structural parameters for the <em>Journal of Politics, Society and Governance</em>:
        </p>

        <div className="my-6 border border-[#d6cfc2] bg-[#f7f4ec] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <tbody className="divide-y divide-[#d6cfc2]">
              {particulars.map((item) => (
                <tr key={item.label} className="hover:bg-[#f0ebe0] transition-colors">
                  <th scope="row" className="p-3.5 font-semibold text-[#1f314d] bg-[#ece6d8] w-1/3 border-r border-[#d6cfc2]">
                    {item.label}
                  </th>
                  <td className="p-3.5 text-[#343842] leading-5">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <NoteBox title="Registration & Identifier Status">
          Official e-ISSN, DOI prefix assignments, and indexing listings will be published upon confirmation prior to the release of Volume 1, Issue 1.
        </NoteBox>
      </ContentFrame>
    </>
  );
}

function BoardPage() {
  const leadership = [
    {
      role: "Editor-in-Chief / Co-Founder",
      name: "Dr. Priyanka Gangarapu",
      designation: "Faculty",
      department: "Department of Political Science and Public Administration",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "priyagangarapu777@gmail.com",
    },
    {
      role: "Managing Editor / Founder",
      name: "Raghu Raja Isampalli",
      designation: "MA Political Science",
      department: "Democratic Organisation for Civic Knowledge Foundation",
      institution: "Hyderabad, Telangana, India",
      email: "iraghuraja25@gmail.com",
    },
  ];

  const boardMembers = [
    {
      name: "Dr. Peteti Premanandam",
      role: "Editorial Board Member",
      designation: "Professor",
      department: "Department of Political Science and Public Administration",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "petetip@gmail.com",
    },
    {
      name: "Dr. Devarakonda Ramesh",
      role: "Editorial Board Member",
      designation: "Professor",
      department: "Department of Anthropology",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "dr.anthro.au@gmail.com",
    },
    {
      name: "Dr. K. Satyam Narayana",
      role: "Editorial Board Member",
      designation: "Assistant Professor",
      department: "Department of Political Science and Public Administration",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "satyaknarayana45@gmail.com",
    },
    {
      name: "Dr. G. Saritha",
      role: "Editorial Board Member",
      designation: "Assistant Professor",
      department: "Department of Economics",
      institution: "Janet Degree College, Ibrahimpatnam, Andhra Pradesh, India",
      email: "Sarithagallikonda@gmail.com",
    },
    {
      name: "Dr. Valluri Prasadarao",
      role: "Editorial Board Member",
      designation: "Assistant Professor & Principal",
      department: "Pratibha Civils Academy (Krishnaveni College), Vijayawada",
      institution: "Krishna University",
      email: "valluripr@gmail.com",
    },
    {
      name: "Dr. Chippada Seshagiri Rao",
      role: "Editorial Board Member",
      designation: "Faculty",
      department: "Department of Anthropology",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "drseshuanphropologist@gmail.com",
    },
    {
      name: "Dr. Drakshayani Manduva",
      role: "Editorial Board Member",
      designation: "Faculty",
      department: "Department of Philosophy",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "drakshayanimanduva@gmail.com",
    },
    {
      name: "Dr. A. Pavan Kumar",
      role: "Editorial Board Member",
      designation: "Faculty",
      department: "Department of Commerce and Management Studies (DCMS)",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "pavankumardora@gmail.com",
    },
  ];

  return (
    <>
      <PageIntro {...pageMetadata["editorial-board"]} />
      <ContentFrame
        aside={
          <SideCard title="Editorial Governance">
            <p className="text-sm leading-6 text-[#5b5c62]">
              The Editorial Board provides academic oversight, peer-review governance, and strategic leadership for the <em>Journal of Politics, Society and Governance</em>.
            </p>
          </SideCard>
        }
      >
        <h2 className="!mt-0">Editorial Leadership</h2>
        <p>
          The editorial leadership guides the double-blind peer review process, academic integrity, and scholarly vision of the journal.
        </p>

        <div className="mt-6 space-y-6">
          {leadership.map((leader) => (
            <div key={leader.role} className="border-l-4 border-[#1f314d] border-y border-r border-[#d6cfc2] bg-[#f7f4ec] p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1f314d] text-[#e8e2d2] font-editorial text-base font-bold shadow-sm border border-[#344a6f]">
                {getInitials(leader.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#1f314d] text-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider rounded-sm">
                    {leader.role}
                  </span>
                </div>
                <h3 className="!mt-1 !mb-2 text-2xl font-editorial font-bold text-[#1f314d]">{leader.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a45a40]">{leader.designation}</p>
                <p className="!mt-1 !mb-0 text-sm font-medium text-[#2f3e58]">{leader.department}</p>
                <p className="!mt-0 text-xs text-[#676660]">{leader.institution}</p>
                <div className="mt-3 pt-2 border-t border-[#dfd7c8] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-[#1f314d]">
                  {leader.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="shrink-0 text-[#a45a40]" />
                      <a href={`mailto:${leader.email}`} className="hover:underline text-[#1f314d]">
                        {leader.email}
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12">Editorial Board Members</h2>
        <p>
          Our Editorial Board brings together distinguished faculty and researchers spanning political science, public administration, anthropology, philosophy, economics, and management studies:
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {boardMembers.map((member) => (
            <div key={member.name} className="border border-[#d6cfc2] bg-[#f5f2eb] p-5 rounded-sm shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f314d] text-[#e8e2d2] font-editorial text-sm font-bold shadow-sm border border-[#344a6f]">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-[#a45a40] text-[0.68rem]">{member.role}</p>
                  <h3 className="!mt-0.5 !mb-1 text-xl font-editorial font-bold text-[#1f314d]">{member.name}</h3>
                  {member.designation && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#77736d] mb-1">{member.designation}</p>
                  )}
                  <p className="!mt-1 !mb-0 text-sm leading-5 font-medium text-[#2f3e58]">{member.department}</p>
                  {member.institution && <p className="!mt-0 !mb-2 text-xs leading-5 text-[#676660]">{member.institution}</p>}

                  {"address" in member && (member as { address?: string }).address && (
                    <p className="!mt-2 !mb-2 text-xs leading-4 text-[#676660] flex items-start gap-1.5 bg-[#eae5d8] p-2 rounded-sm border border-[#d8d1c2]">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-[#a45a40]" />
                      <span>{(member as { address?: string }).address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#d8d1c2]">
                {member.email && (
                  <p className="!m-0 text-xs font-medium text-[#1f314d] flex items-center gap-1.5">
                    <Mail size={12} className="shrink-0 text-[#a45a40]" />
                    <a href={`mailto:${member.email}`} className="hover:underline text-[#1f314d]">
                      {member.email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ContentFrame>
    </>
  );
}

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the Journal of Politics, Society and Governance (JPSG)?",
      a: "The Journal of Politics, Society and Governance (JPSG) is an interdisciplinary, peer-reviewed academic journal published by the Democratic Organisation for Civic Knowledge Foundation, based in Visakhapatnam, Andhra Pradesh, India. It provides a platform for research in political science, public administration, public policy, governance, sociology, and international relations.",
    },
    {
      q: "What is the publication frequency of the journal?",
      a: "The journal intends to publish four issues annually (quarterly publication schedule). The inaugural issue (Volume 1, Issue 1) is planned for publication in January–March 2027.",
    },
    {
      q: "Is the Journal of Politics, Society and Governance open access?",
      a: "Yes, the journal intends to follow an Open Access publication model, ensuring that published research articles are freely accessible to researchers, academics, students, and policy analysts worldwide without subscription barriers.",
    },
    {
      q: "What type of peer-review process does JPSG follow?",
      a: "JPSG enforces a rigorous double-blind peer-review policy. Under this process, the identity of the author is concealed from reviewers, and the identity of reviewers is concealed from authors to ensure unbiased editorial evaluation.",
    },
    {
      q: "What categories of manuscripts are accepted for publication?",
      a: "The journal accepts original research articles (5,000–8,000 words), review articles (4,000–7,000 words), research notes, policy analyses, and book reviews (1,500–2,500 words).",
    },
    {
      q: "How can authors submit their manuscripts?",
      a: "Online manuscript submission channels and official editorial email submission details will be announced prior to the opening of submissions for Volume 1, Issue 1. Authors should prepare their anonymized manuscripts following our Author Guidelines.",
    },
    {
      q: "Are there any submission fees or article processing charges (APC)?",
      a: "Detailed policy information regarding Article Processing Charges (APC) and waiver policies will be published prior to accepting submissions. The journal aims to maintain transparent and equitable publication terms.",
    },
    {
      q: "What is the plagiarism and publication ethics policy?",
      a: "JPSG adheres to high publication ethics standards. All submitted manuscripts are screened for original content and attribution. Plagiarism, data fabrication, duplicate submission, or uncredited use of artificial intelligence will result in immediate rejection.",
    },
    {
      q: "Where is the editorial office located?",
      a: "The editorial office of the Journal of Politics, Society and Governance is based in Visakhapatnam, Andhra Pradesh, India, operated under the Democratic Organisation for Civic Knowledge Foundation.",
    },
  ];

  return (
    <>
      <PageIntro {...pageMetadata.faq} />
      <ContentFrame aside={<Sidebar label="Quick Navigation" />}>
        <p className="!mt-0 font-editorial text-xl font-semibold text-[#1f314d]">
          Find clear answers to common inquiries regarding the journal's scope, submission process, review policies, and editorial standards:
        </p>

        <div className="mt-6 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="border border-[#d6cfc2] bg-[#f7f4ec] rounded-sm overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 bg-[#f2ece0] hover:bg-[#eae3d5] transition-colors"
                >
                  <span className="font-editorial font-bold text-lg text-[#1f314d] flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#a45a40] shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} className="text-[#a45a40] shrink-0" /> : <ChevronDown size={20} className="text-[#77736d] shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 text-sm leading-6 text-[#454952] border-t border-[#dfd7c8] bg-[#f9f7f2]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ContentFrame>
    </>
  );
}

function CurrentIssuePage() {
  return (
    <>
      <PageIntro {...pageMetadata["current-issue"]} />
      <ContentFrame
        aside={
          <SideCard title="Issue Metadata">
            <p className="font-editorial text-2xl text-[#1f314d]">Volume 1, Issue 1</p>
            <p className="mt-1 text-sm text-[#62616a]">January–March 2027</p>
            <div className="my-4 border-t border-[#d6cfc2]" />
            <p className="text-xs leading-5 text-[#77736d]">
              Inaugural issue in preparation by the Democratic Organisation for Civic Knowledge Foundation.
            </p>
          </SideCard>
        }
      >
        <div className="mb-8 flex items-center gap-3 border-b border-[#d6cfc2] pb-5">
          <CalendarDays className="text-[#a45a40]" size={22} />
          <div>
            <p className="eyebrow text-[#a45a40]">Publication Status</p>
            <p className="mt-1 text-sm font-semibold text-[#1f314d]">Forthcoming Inaugural Issue</p>
          </div>
        </div>

        <h2 className="!mt-0">Volume 1, Issue 1 · January–March 2027</h2>
        <p>
          The inaugural issue of the <em>Journal of Politics, Society and Governance</em> is scheduled for publication in the first quarter of 2027. Confirmed article titles, abstracts, and downloadable PDF papers will be published on this page upon release.
        </p>

        <NoteBox title="No Placeholder Articles Displayed">
          This website intentionally presents true publication status and does not display mock or sample articles. Verified DOIs and article PDF downloads will become accessible upon official release.
        </NoteBox>
      </ContentFrame>
    </>
  );
}

function ArchivesPage() {
  return (
    <>
      <PageIntro {...pageMetadata.archives} />
      <ContentFrame aside={<Sidebar label="Browse Journal" />}>
        <h2 className="!mt-0">Journal Archives</h2>
        <p>
          The <em>Journal of Politics, Society and Governance</em> publishes four quarterly issues annually. The public archive will document all published volumes upon the release of Volume 1, Issue 1 in 2027.
        </p>

        <div className="mt-8 border border-[#d6cfc2] bg-[#f3f0e9] shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d6cfc2] p-6">
            <div>
              <p className="eyebrow text-[#a45a40]">2027 · Inaugural Volume</p>
              <h2 className="!mt-1 !mb-0 text-2xl font-editorial text-[#1f314d]">Volume 1, Issue 1</h2>
              <p className="mt-1 text-sm text-[#676660]">January–March 2027</p>
            </div>
            <span className="border border-[#b27a60] px-3 py-1 text-[0.67rem] font-bold uppercase tracking-wider text-[#965438] bg-[#f7ede8]">
              Forthcoming
            </span>
          </div>
          <div className="p-6">
            <p className="!m-0 text-sm leading-6 text-[#53565e]">
              Article metadata, structured XML, and full-text PDF downloads will be added upon publication.
            </p>
          </div>
        </div>
      </ContentFrame>
    </>
  );
}

function SubmissionPage() {
  return (
    <>
      <PageIntro {...pageMetadata.submissions} />
      <ContentFrame
        aside={
          <div className="space-y-4">
            <SideCard title="Editorial Submission Mail">
              <p className="font-editorial text-[#1f314d] font-bold text-lg">Email Your Manuscript</p>
              <p className="mt-2 text-xs leading-5 text-[#5b5c62]">
                Authors can submit manuscripts directly to the editorial team via email:
              </p>
              <a
                href="mailto:jpsg@docknowledge.org"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-[#1f314d] text-white text-xs font-bold rounded-sm hover:bg-[#a45a40] transition-colors w-full justify-center shadow-sm"
              >
                <Mail size={14} /> jpsg@docknowledge.org
              </a>
            </SideCard>

            <SideCard title="Author Resources">
              <div className="flex flex-col gap-2 text-xs">
                <Link href="/author-guidelines" className="rule-link">Author Guidelines <ArrowRight size={13} /></Link>
                <Link href="/peer-review" className="rule-link">Peer Review Policy <ArrowRight size={13} /></Link>
                <Link href="/publication-ethics" className="rule-link">Publication Ethics <ArrowRight size={13} /></Link>
                <Link href="/faq" className="rule-link">Frequently Asked Questions <ArrowRight size={13} /></Link>
              </div>
            </SideCard>
          </div>
        }
      >
        <h2 className="!mt-0">Invitation for Authors</h2>
        <p>
          The <em>Journal of Politics, Society and Governance</em> invites scholars, faculty members, policy researchers, and doctoral candidates to submit original research papers within the interdisciplinary scope of political science, public administration, public policy, governance, and social studies.
        </p>

        <div className="my-6 border border-[#a45a40]/30 bg-[#f9f5ee] p-6 rounded-sm shadow-sm">
          <h3 className="!mt-0 font-sans text-lg font-bold text-[#1f314d] flex items-center gap-2">
            <Mail size={20} className="text-[#a45a40]" /> Official Submission Email Channel
          </h3>
          <p className="text-sm text-[#454952] leading-6 mt-2">
            Authors should email their complete manuscript file (Microsoft Word `.doc`/`.docx` format) along with a cover letter directly to our official editorial desk:
          </p>
          <div className="mt-4 p-4 bg-[#efe8db] border border-[#d6cfc2] rounded-sm flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="block text-xs uppercase tracking-wider font-bold text-[#77736d]">Editorial Submission Email</span>
              <span className="font-mono font-bold text-lg text-[#1f314d]">jpsg@docknowledge.org</span>
            </div>
            <a
              href="mailto:jpsg@docknowledge.org?subject=Manuscript Submission - Journal of Politics, Society and Governance"
              className="btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-sm"
            >
              Submit via Email <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <h2>Manuscript Categories & Word Limits</h2>
        <div className="my-5 overflow-hidden border border-[#d6cfc2] bg-[#f7f4ec] shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#ece6d8]">
              <tr>
                <th scope="col" className="p-3.5 font-semibold text-[#1f314d]">Manuscript Category</th>
                <th scope="col" className="p-3.5 font-semibold text-[#1f314d]">Word Limit (Includes Abstract & References)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6cfc2]">
              <tr>
                <th scope="row" className="p-3.5 font-medium">Original Research Article</th>
                <td className="p-3.5">5,000–8,000 words</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-medium">Review Article</th>
                <td className="p-3.5">4,000–7,000 words</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-medium">Policy Analysis / Research Note</th>
                <td className="p-3.5">3,000–5,000 words</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-medium">Book Review</th>
                <td className="p-3.5">1,500–2,500 words</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Submission Preparation Checklist</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-[#42454d]">
          <li><strong>Anonymized Manuscript File:</strong> Prepare a main manuscript document containing manuscript title, abstract (200–250 words), keywords (5–7), main body, tables, figures, and references, with author identifying details removed for double-blind review.</li>
          <li><strong>Title Page File:</strong> A separate cover page including complete author names, designations, institutional department & university affiliations, ORCID IDs (if available), and corresponding author email address.</li>
          <li><strong>Cover Letter:</strong> A brief letter confirming that the work is original, has not been published elsewhere, and is not currently under evaluation by another journal.</li>
        </ul>
      </ContentFrame>
    </>
  );
}

function GuidelinesPage() {
  return (
    <>
      <PageIntro {...pageMetadata["author-guidelines"]} />
      <ContentFrame aside={<Sidebar label="Guidelines Checklist" />}>
        <h2 className="!mt-0">Manuscript Requirements</h2>
        <p>Manuscripts submitted to the journal must adhere to the following standards:</p>
        <ul className="list-none !pl-0 space-y-2">
          {[
            "Original scholarly research not submitted elsewhere.",
            "Prepared for double-blind peer review (anonymized title page).",
            "Structured abstract (200–250 words) and 5–7 keywords.",
            "Complete institutional affiliations and author contact details.",
            "Strict adherence to standard academic referencing styles.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-[#42454d]">
              <Check size={16} className="mt-1 shrink-0 text-[#a45a40]" />
              {item}
            </li>
          ))}
        </ul>
      </ContentFrame>
    </>
  );
}

function ReviewPage() {
  const steps = [
    ["1. Editorial Screening", "Initial evaluation by the Editor-in-Chief and editorial team for scope, formatting, and preliminary quality."],
    ["2. Double-Blind Peer Review", "Concealed assessment by independent external peer reviewers evaluated on methodology, originality, and significance."],
    ["3. Editorial Decision", "Final publication decision determined by the Editor-in-Chief informed by reviewer recommendations."],
  ];

  return (
    <>
      <PageIntro {...pageMetadata["peer-review"]} />
      <ContentFrame aside={<SideCard title="Evaluation Criteria"><ol className="space-y-2 pl-5 text-sm text-[#4b4d54]">{reviewCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ol></SideCard>}>
        <h2 className="!mt-0">Peer-Review Process</h2>
        <p>The journal maintains strict double-blind peer-review standards to ensure objective, impartial scholarly evaluation.</p>

        <div className="my-6 border-y border-[#d6cfc2] divide-y divide-[#d6cfc2]">
          {steps.map(([title, desc]) => (
            <div key={title} className="py-4">
              <h3 className="!mt-0 !mb-1 text-lg font-bold text-[#1f314d]">{title}</h3>
              <p className="!m-0 text-sm leading-6 text-[#5b5c62]">{desc}</p>
            </div>
          ))}
        </div>
      </ContentFrame>
    </>
  );
}

function EthicsPage() {
  return (
    <>
      <PageIntro {...pageMetadata["publication-ethics"]} />
      <ContentFrame aside={<Sidebar label="Ethics Summary" />}>
        <h2 className="!mt-0">Publication Ethics Framework</h2>
        <p>The journal is committed to highest ethical standards across all stages of publication:</p>

        <div className="mt-6 divide-y divide-[#d6cfc2] border-y border-[#d6cfc2]">
          {ethicalTopics.map(([title, text], idx) => (
            <section key={title} className="py-4">
              <h3 className="!mt-0 !mb-1 text-lg font-bold text-[#1f314d]">
                {idx + 1}. {title}
              </h3>
              <p className="!m-0 text-sm leading-6 text-[#4a4e56]">{text}</p>
            </section>
          ))}
        </div>
      </ContentFrame>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <PageIntro {...pageMetadata.contact} />
      <ContentFrame
        aside={
          <SideCard title="Publisher Details">
            <p className="font-editorial text-xl font-semibold leading-6 text-[#1f314d]">
              Democratic Organisation for Civic Knowledge Foundation
            </p>
            <p className="mt-3 text-sm leading-6 text-[#62616a]">
              Publisher of the Journal of Politics, Society and Governance
            </p>
          </SideCard>
        }
      >
        <h2 className="!mt-0">Editorial Office Address</h2>
        <div className="my-6 border border-[#d6cfc2] bg-[#f7f4ec] p-6 rounded-sm shadow-sm">
          <p className="!m-0 font-editorial text-xl text-[#1f314d] font-bold">
            Journal of Politics, Society and Governance
          </p>
          <p className="!mb-0 !mt-2 text-sm text-[#454952] leading-6 font-medium">
            #9-164/3, Gandhi Nagar,<br />
            Madhurawada, Visakhapatnam,<br />
            Andhra Pradesh, India - 530048
          </p>
          <div className="mt-4 pt-4 border-t border-[#dfd7c9] text-sm font-semibold text-[#1f314d]">
            <a href="mailto:contactus.jpsg@docknowledge.org" className="font-mono hover:underline">
              contactus.jpsg@docknowledge.org
            </a>
          </div>
        </div>
      </ContentFrame>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <PageIntro {...pageMetadata["not-found"]} />
      <ContentFrame>
        <h2 className="!mt-0">Page Not Found</h2>
        <p>Please return to the homepage or explore journal sections from the main navigation menu.</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link href="/" className="btn-primary px-5 py-3 text-sm font-bold">
            Journal Homepage
          </Link>
          <Link href="/about" className="btn-secondary px-5 py-3 text-sm font-bold">
            About the Journal
          </Link>
        </div>
      </ContentFrame>
    </>
  );
}

const pageComponents: Record<JournalPageType, () => JSX.Element> = {
  about: AboutPage,
  particulars: ParticularsPage,
  "current-issue": CurrentIssuePage,
  archives: ArchivesPage,
  "editorial-board": BoardPage,
  submissions: SubmissionPage,
  "author-guidelines": GuidelinesPage,
  "peer-review": ReviewPage,
  "publication-ethics": EthicsPage,
  faq: FAQPage,
  contact: ContactPage,
  "not-found": NotFoundPage,
};

export default function JournalPage({ page }: { page: JournalPageType }) {
  useEffect(() => {
    const meta = pageMetadata[page] || pageMetadata["not-found"];
    document.title = `${meta.title} | Journal of Politics, Society and Governance`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.summary);
  }, [page]);

  const Page = pageComponents[page] || NotFoundPage;
  return <div className="enter"><Page /></div>;
}