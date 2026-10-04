import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Check, FileText, Mail, MapPin, Printer } from "lucide-react";
import { ContentFrame, NoteBox, PageIntro, SideCard } from "@/components/journal-layout";

export type JournalPageType = "about" | "current-issue" | "archives" | "editorial-board" | "submissions" | "author-guidelines" | "peer-review" | "publication-ethics" | "contact" | "not-found";

const interests = [
  "Political Science", "Indian Politics", "Comparative Politics", "Political Theory", "Public Administration",
  "Public Policy", "Governance", "Constitutional Studies", "Democracy and Civic Engagement", "Political Communication",
  "Social Justice", "Caste and Social Studies", "Human Rights", "Gender and Politics", "Education and Society",
  "Development Studies", "Local Governance", "Digital Democracy", "Contemporary Social and Political Issues",
];
const reviewCriteria = ["Originality", "Methodology", "Theoretical contribution", "Quality of analysis", "Relevance", "Academic writing", "References", "Overall contribution to the field"];
const manuscriptKinds = ["Original Research Article", "Review Article", "Research Note", "Policy Analysis", "Book Review"];
const ethicalTopics = [
  ["Responsibilities of authors", "Authors should submit original work, accurately represent their research and sources, disclose relevant conflicts of interest, and take responsibility for the integrity of the manuscript."],
  ["Responsibilities of reviewers", "Reviewers should assess work objectively and confidentially, provide constructive reasoning, disclose conflicts, and avoid using unpublished material for personal advantage."],
  ["Responsibilities of editors", "Editors should make fair, evidence-led decisions, protect confidentiality, manage conflicts and ensure that editorial decisions are independent of improper influence."],
  ["Plagiarism", "Submitted work must acknowledge the ideas and words of others. Suspected unattributed use should be examined before an editorial decision."],
  ["Duplicate publication", "Authors should not submit the same manuscript simultaneously to another journal or present substantially overlapping work as a new contribution without clear disclosure."],
  ["Fabrication and falsification", "Research records, evidence and findings must be represented honestly. Concerns about invented or altered data require careful investigation."],
  ["Authorship", "Authorship should reflect meaningful scholarly contribution. All listed authors should approve the manuscript and accept responsibility for their contribution."],
  ["Conflicts of interest", "Authors, reviewers and editors should disclose relationships or interests that could reasonably affect impartiality."],
  ["Corrections", "The journal intends to correct the scholarly record when a published work contains a material error."],
  ["Retractions", "Retraction may be considered when serious concerns undermine the reliability or integrity of a published work."],
  ["Complaints and appeals", "Concerns about editorial conduct or a decision should be presented with supporting information and reviewed impartially."],
  ["Use of artificial intelligence", "Authors remain responsible for the accuracy, originality and integrity of submitted work. Any journal-specific disclosure requirements will be published before submissions open."],
];

const pageMetadata: Record<JournalPageType, { title: string; kicker: string; summary: string }> = {
  about: { title: "About the journal", kicker: "Purpose & scope", summary: "An interdisciplinary home for rigorous inquiry into contemporary politics, society and governance." },
  "current-issue": { title: "Current issue", kicker: "Inaugural issue · Forthcoming", summary: "Volume 1, Issue 1 is planned for January–March 2027. Article contents have not yet been announced." },
  archives: { title: "Journal archive", kicker: "Issues & publication record", summary: "Browse issue information as it becomes available. The journal is preparing its first issue; no published archive is yet available." },
  "editorial-board": { title: "Editorial board", kicker: "Editorial leadership", summary: "Meet the Editor-in-Chief, Managing Editor, and Editorial Board members guiding the journal." },
  submissions: { title: "Submit your manuscript", kicker: "For authors", summary: "JPSG welcomes original scholarship within its scope. Submission channels are not yet open; prepare your manuscript using the guidance below." },
  "author-guidelines": { title: "Author guidelines", kicker: "Prepare a manuscript", summary: "The essential requirements for work considered by the Journal of Politics, Society and Governance." },
  "peer-review": { title: "Peer-review policy", kicker: "Editorial standards", summary: "A transparent outline of editorial screening, independent assessment and the criteria used to evaluate submitted work." },
  "publication-ethics": { title: "Publication ethics", kicker: "Integrity in scholarship", summary: "Responsibilities and procedures that support fairness, accuracy and trust in the scholarly record." },
  contact: { title: "Contact the journal", kicker: "Editorial office", summary: "The editorial office is based in Visakhapatnam, Andhra Pradesh, India. Official contact channels are forthcoming." },
  "not-found": { title: "Page not found", kicker: "404 · Not found", summary: "This page is not part of the journal website. Return to the homepage or browse journal information." },
};

function Sidebar({ label = "Useful pages" }: { label?: string }) {
  return <SideCard title={label}>
    <div className="flex flex-col gap-3">
      {[["Author guidelines", "/author-guidelines"], ["Peer-review policy", "/peer-review"], ["Publication ethics", "/publication-ethics"], ["Submission information", "/submissions"]].map(([text, href]) => <Link key={href} href={href} className="rule-link justify-between border-b border-[#d6cfc2] pb-2 text-[.8rem]">{text}<ArrowRight size={14} /></Link>)}
    </div>
    <p className="mt-4 text-xs leading-5 text-[#77736d]">Submission portal and contact email are forthcoming.</p>
  </SideCard>;
}

function AboutPage() {
  return <>
    <PageIntro {...pageMetadata.about} />
    <ContentFrame aside={<SideCard title="At a glance">
      <dl className="space-y-4 text-sm">
        <div><dt className="text-xs uppercase tracking-wide text-[#77736d]">Frequency</dt><dd className="mt-1 font-semibold text-[#273c60]">Four issues annually (intended)</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-[#77736d]">Language</dt><dd className="mt-1 font-semibold text-[#273c60]">English</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-[#77736d]">Access</dt><dd className="mt-1 font-semibold text-[#273c60]">Open-access intent</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-[#77736d]">Publisher</dt><dd className="mt-1 leading-5 text-[#4b4d54]">Democratic Organisation for Civic Knowledge Foundation</dd></div>
      </dl>
    </SideCard>}>
      <p className="!mt-0 font-editorial !text-[1.35rem] !leading-8 text-[#34445f]">The <em>Journal of Politics, Society and Governance (JPSG)</em> is a peer-reviewed academic journal published by the Democratic Organisation for Civic Knowledge Foundation.</p>
      <p>The journal provides a platform for original research, theoretical contributions, empirical studies, policy analysis and scholarly discussions concerning contemporary political, social and governance issues.</p>
      <p>JPSG welcomes interdisciplinary research that contributes to understanding political institutions, democratic processes, public policy, governance, constitutional studies, social justice, human rights and contemporary social transformations.</p>
      <h2>Areas of interest</h2>
      <p>Research in the following areas is welcome. The list is inclusive rather than exhaustive; work should make a clear contribution to the journal’s scope.</p>
      <ul className="grid list-inside list-disc gap-x-8 sm:grid-cols-2">
        {interests.map((interest) => <li key={interest}>{interest}</li>)}
      </ul>
      <h2>Publication model</h2>
      <p>The primary language of publication is English. The journal intends to publish four issues annually and aims to make published research accessible to researchers, students, academics and the wider public through an online, open-access publication model.</p>
      <p>The journal is currently preparing its first issue, Volume 1, Issue 1, planned for January–March 2027. Its online journal portal and publication identifiers are forthcoming.</p>
    </ContentFrame>
  </>;
}

function CurrentIssuePage() {
  return <>
    <PageIntro {...pageMetadata["current-issue"]} />
    <ContentFrame aside={<SideCard title="Issue details">
      <p className="font-editorial text-2xl text-[#263c5d]">Volume 1, Issue 1</p>
      <p className="mt-2 text-sm text-[#62616a]">January–March 2027</p>
      <div className="my-4 border-t border-[#d6cfc2]" />
      <p className="text-xs leading-5 text-[#77736d]">Planned inaugural issue. All publication details remain subject to confirmation.</p>
    </SideCard>}>
      <div className="mb-8 flex items-center gap-3 border-b border-[#d6cfc2] pb-5"><CalendarDays className="text-[#a45a40]" size={21} /><div><p className="eyebrow">Publication status</p><p className="mt-1 text-sm font-semibold text-[#273c60]">Forthcoming</p></div></div>
      <h2 className="!mt-0">Volume 1, Issue 1 · January–March 2027</h2>
      <p>This inaugural issue is planned for publication in the first quarter of 2027. The journal has not announced article titles, authors, abstracts or downloadable papers. Issue contents will be listed here only after they are confirmed.</p>
      <NoteBox title="No articles are available yet">This page intentionally does not display sample or placeholder articles. There are no article PDFs, DOI records or publication links to access at this time.</NoteBox>
      <h2>About this issue</h2>
      <p>JPSG is preparing its first issue as part of its planned quarterly publication schedule. The planned language is English, and the journal aims to make published research available through an online open-access model.</p>
      <p className="screen-only mt-8"><Link href="/archives" className="rule-link">View archive status <ArrowRight size={15} /></Link></p>
    </ContentFrame>
  </>;
}

function ArchivesPage() {
  return <>
    <PageIntro {...pageMetadata.archives} />
    <ContentFrame aside={<Sidebar label="Browse the journal" />}>
      <h2 className="!mt-0">Issues</h2>
      <p>JPSG intends to publish four issues each year. The inaugural issue is planned for January–March 2027; the public article record and archives are not yet available.</p>
      <div className="mt-8 border border-[#d6cfc2] bg-[#f3f0e9]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d6cfc2] p-5 sm:p-6">
          <div><p className="eyebrow">2027 · Inaugural issue</p><h2 className="!mt-2 !mb-0 text-2xl">Volume 1, Issue 1</h2><p className="mt-2 text-sm text-[#676660]">January–March 2027</p></div>
          <span className="border border-[#b27a60] px-3 py-1 text-[.67rem] font-bold uppercase tracking-[.1em] text-[#965438]">Forthcoming</span>
        </div>
        <div className="p-5 sm:p-6"><p className="!m-0 text-sm leading-6">Contents and article metadata will be added when publication details are confirmed.</p><Link href="/current-issue" className="rule-link mt-4">Issue status <ArrowRight size={14} /></Link></div>
      </div>
      <NoteBox title="Digital archive and indexing">The online journal portal, article metadata, DOI and eISSN arrangements, indexing and digital preservation services are not yet confirmed. No established indexing listings are claimed.</NoteBox>
      <h2>Publication schedule</h2>
      <p>The journal intends to publish four issues annually. Dates beyond the planned first issue have not been announced.</p>
    </ContentFrame>
  </>;
}

function BoardPage() {
  const leadership = [
    {
      role: "Editor-in-Chief",
      name: "Dr. Priyanka Gangarapu",
      detail: "Guest Faculty, Department of Political Science and Public Administration, Andhra University, Visakhapatnam, Andhra Pradesh, India",
    },
    {
      role: "Managing Editor",
      name: "Raghu Raja Isampalli",
      detail: "M.A. Political Science · Founder, Democratic Organisation for Civic Knowledge Foundation",
    },
  ];

  const boardMembers = [
    {
      name: "Prof. Peteti Premanandam",
      role: "Editorial Board Member",
      designation: "Professor",
      department: "Department of Political Science and Public Administration",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      email: "petetip@gmail.com",
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
      name: "Dr. A. Pavan Kumar",
      role: "Editorial Board Member",
      designation: "Faculty",
      department: "Department of Commerce and Management Studies (DCMS)",
      institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
      address: "D.No 8-42-41, Tamil Street, Chinna Waltair, Visakhapatnam - 530017",
      email: "pavankumardora@gmail.com",
    },
    {
      name: "Dr. G. Saritha",
      role: "Editorial Board Member",
      designation: "Assistant Professor",
      department: "Department of Economics",
      institution: "Janet Degree College, Ibrahimpatnam, Andhra Pradesh, India",
      email: "Sarithagallikonda@gmail.com",
    },
  ];

  return (
    <>
      <PageIntro {...pageMetadata["editorial-board"]} />
      <ContentFrame
        aside={
          <SideCard title="Editorial Governance">
            <p className="text-sm leading-6 text-[#5b5c62]">
              The Editorial Board provides academic leadership, peer-review oversight, and strategic direction for the <em>Journal of Politics, Society and Governance (JPSG)</em>.
            </p>
          </SideCard>
        }
      >
        <h2 className="!mt-0">Editorial Leadership</h2>
        <p>The editorial leadership team guides the peer review standards, academic integrity, and scholarly vision of the journal.</p>
        <div className="mt-6 divide-y divide-[#d6cfc2] border-y border-[#d6cfc2]">
          {leadership.map((editor, index) => (
            <section key={editor.role} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr]">
              <span className="font-editorial text-2xl text-[#b27a60]">0{index + 1}</span>
              <div>
                <p className="eyebrow">{editor.role}</p>
                <h3 className="!mt-2 !mb-1 text-2xl">{editor.name}</h3>
                <p className="!m-0 text-sm leading-6">{editor.detail}</p>
              </div>
            </section>
          ))}
        </div>

        <h2>Editorial Board Members</h2>
        <p>Our editorial board brings together distinguished scholars and faculty members across political science, public administration, economics, and management studies.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {boardMembers.map((member) => (
            <div key={member.name} className="border border-[#d6cfc2] bg-[#f5f2eb] p-5">
              <p className="eyebrow text-[#b27a60]">{member.role}</p>
              <h3 className="!mt-1 !mb-2 text-xl font-editorial text-[#223758]">{member.name}</h3>
              {member.designation && <p className="text-xs font-semibold uppercase tracking-wider text-[#77736d]">{member.designation}</p>}
              <p className="!mt-1 !mb-0 text-sm leading-5 font-medium text-[#2f3e58]">{member.department}</p>
              <p className="!mt-0 !mb-2 text-xs leading-5 text-[#676660]">{member.institution}</p>
              {member.address && (
                <p className="!mt-2 !mb-2 text-xs leading-4 text-[#676660] flex items-start gap-1.5">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-[#b27a60]" />
                  <span>{member.address}</span>
                </p>
              )}
              {member.email && (
                <p className="!mt-2 !mb-0 text-xs font-medium text-[#223758] flex items-center gap-1.5">
                  <Mail size={13} className="shrink-0 text-[#b27a60]" />
                  <a href={`mailto:${member.email}`} className="hover:underline text-[#223758]">{member.email}</a>
                </p>
              )}
            </div>
          ))}
        </div>
      </ContentFrame>
    </>
  );
}

function SubmissionPage() {
  return <>
    <PageIntro {...pageMetadata.submissions} />
    <ContentFrame aside={<div className="space-y-4">
      <SideCard title="Submission status"><p className="font-editorial text-xl text-[#263c5d]">Portal forthcoming</p><p className="mt-2 text-sm leading-6 text-[#62616a]">The journal is not currently accepting files through this website.</p></SideCard>
      <SideCard title="Before you submit"><div className="flex flex-col gap-3"><Link href="/author-guidelines" className="rule-link">Author guidelines <ArrowRight size={14} /></Link><Link href="/peer-review" className="rule-link">Peer-review policy <ArrowRight size={14} /></Link><Link href="/publication-ethics" className="rule-link">Publication ethics <ArrowRight size={14} /></Link></div></SideCard>
    </div>}>
      <h2 className="!mt-0">Invitation to authors</h2>
      <p>Authors are invited to prepare original research papers within the journal’s interdisciplinary scope. Before submission, review the author guidelines, publication ethics, peer-review policy, plagiarism and copyright requirements.</p>
      <NoteBox title="Submission channels are not yet open">There is no working online submission system or verified editorial email available. This website does not upload, store or send manuscripts. Please do not submit confidential files through an unverified channel.</NoteBox>
      <h2>Manuscript categories</h2>
      <ul>{manuscriptKinds.map((type) => <li key={type}>{type}</li>)}</ul>
      <h2>Word limits currently specified</h2>
      <div className="my-5 overflow-hidden border border-[#d6cfc2]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#ece8df]"><tr><th scope="col" className="p-3 font-semibold text-[#273c60]">Manuscript type</th><th scope="col" className="p-3 font-semibold text-[#273c60]">Word limit</th></tr></thead>
          <tbody className="divide-y divide-[#d6cfc2]">
            <tr><th scope="row" className="p-3 font-medium">Research Article</th><td className="p-3">5,000–8,000 words</td></tr>
            <tr><th scope="row" className="p-3 font-medium">Review Article</th><td className="p-3">4,000–7,000 words</td></tr>
            <tr><th scope="row" className="p-3 font-medium">Book Review</th><td className="p-3">1,500–2,500 words</td></tr>
          </tbody>
        </table>
      </div>
      <p>Word limits for Research Notes and Policy Analysis have not yet been specified.</p>
      <h2>What to prepare</h2>
      <ul><li>Original research, not simultaneously submitted elsewhere.</li><li>A manuscript following the journal’s formatting requirements.</li><li>An abstract and keywords.</li><li>Appropriate references and citations.</li><li>Author affiliation and contact details.</li><li>A version prepared for double-blind review, with identifying details removed where possible.</li></ul>
      <p className="screen-only mt-8"><Link href="/author-guidelines" className="btn-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold">Read author guidelines <ArrowRight size={15} /></Link></p>
    </ContentFrame>
  </>;
}

function GuidelinesPage() {
  return <>
    <PageIntro {...pageMetadata["author-guidelines"]} />
    <ContentFrame aside={<div className="space-y-4"><SideCard title="Manuscript lengths"><dl className="space-y-3 text-sm"><div><dt className="text-[#77736d]">Research Article</dt><dd className="font-semibold text-[#273c60]">5,000–8,000 words</dd></div><div><dt className="text-[#77736d]">Review Article</dt><dd className="font-semibold text-[#273c60]">4,000–7,000 words</dd></div><div><dt className="text-[#77736d]">Book Review</dt><dd className="font-semibold text-[#273c60]">1,500–2,500 words</dd></div></dl><p className="mt-4 text-xs leading-5 text-[#77736d]">Other category limits are not yet specified.</p></SideCard><button type="button" onClick={() => window.print()} className="btn-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-bold"><Printer size={16} /> Print guidelines</button></div>}>
      <div className="screen-only mb-6 flex items-center justify-between gap-3 border border-[#d6cfc2] bg-[#f0ede6] p-4">
        <span className="flex items-center gap-2 text-sm text-[#4b4d54]"><FileText size={17} className="text-[#a45a40]" /> Keep this checklist nearby while preparing your work.</span>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-bold text-[#273c60] hover:text-[#a45a40]"><Printer size={15} /> Print</button>
      </div>
      <h2 className="!mt-0">Manuscript requirements</h2>
      <p>Manuscripts should meet the following requirements before they are submitted for consideration:</p>
      <ul className="list-none !pl-0">{[
        "Be original research.",
        "Not be simultaneously submitted elsewhere.",
        "Follow the journal’s formatting requirements.",
        "Include an abstract.",
        "Include keywords.",
        "Provide appropriate references.",
        "Include author affiliation and contact details.",
      ].map((requirement) => <li key={requirement} className="flex items-start gap-3"><Check size={16} className="mt-1 shrink-0 text-[#a45a40]" />{requirement}</li>)}</ul>
      <h2>Manuscript types and length</h2>
      <p>The journal accepts original research articles, review articles, research notes, policy analyses and book reviews. Specified word limits are:</p>
      <ul><li>Research Article: 5,000–8,000 words.</li><li>Review Article: 4,000–7,000 words.</li><li>Book Review: 1,500–2,500 words.</li></ul>
      <p>Word limits for Research Notes and Policy Analysis have not yet been published. Detailed formatting and reference-style instructions will be confirmed before the submission portal opens.</p>
      <h2>Double-blind review preparation</h2>
      <p>Where possible, author identity is concealed from reviewers and reviewer identity from authors. Prepare an anonymised manuscript file by removing names, affiliations and identifying acknowledgements from the review copy. Full instructions will be provided when the submission process is established.</p>
      <NoteBox title="Submission system forthcoming">No file can be uploaded or submitted through this page. Portal access and verified editorial contact details will be announced when available.</NoteBox>
      <p className="screen-only"><Link href="/submissions" className="rule-link">Submission status <ArrowRight size={15} /></Link></p>
    </ContentFrame>
  </>;
}

function ReviewPage() {
  const steps = [
    ["Editorial screening", "Every manuscript undergoes an initial editorial screening for scope and suitability."],
    ["Independent assessment", "Manuscripts considered suitable are sent to independent reviewers."],
    ["Double-blind review", "Where possible, author identities are concealed from reviewers and reviewer identities from authors."],
    ["Editorial decision", "The final publication decision rests with the Editor-in-Chief and editorial team."],
  ];
  return <>
    <PageIntro {...pageMetadata["peer-review"]} />
    <ContentFrame aside={<SideCard title="Review criteria"><ol className="space-y-2 pl-5 text-sm text-[#4b4d54]">{reviewCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ol></SideCard>}>
      <h2 className="!mt-0">A considered review process</h2>
      <p>All manuscripts submitted to the journal undergo initial editorial screening. Manuscripts considered suitable for JPSG are sent to independent reviewers for assessment.</p>
      <div className="my-8 border-y border-[#d6cfc2]">
        {steps.map(([title, description], index) => <div key={title} className="grid grid-cols-[44px_1fr] gap-4 border-b border-[#d6cfc2] py-5 last:border-b-0">
          <span className="font-editorial text-2xl text-[#a45a40]">0{index + 1}</span><div><h3 className="!mt-0 !mb-1">{title}</h3><p className="!m-0 text-sm leading-6">{description}</p></div>
        </div>)}
      </div>
      <h2>Double-blind peer review</h2>
      <p>The journal follows a double-blind peer-review process, where possible:</p>
      <ul><li>The identity of the author is concealed from reviewers.</li><li>The identity of reviewers is concealed from authors.</li></ul>
      <h2>Reviewer criteria</h2>
      <p>Reviewers evaluate manuscripts on originality, methodology, theoretical contribution, quality of analysis, relevance, academic writing, references and overall contribution to the field.</p>
      <NoteBox title="Decision authority">The final publication decision rests with the Editor-in-Chief and editorial team. Reviewer recommendations inform, but do not replace, the editorial decision.</NoteBox>
      <p>More detailed operational timelines and appeals procedures will be published as the journal’s submission system is established.</p>
    </ContentFrame>
  </>;
}

function EthicsPage() {
  return <>
    <PageIntro {...pageMetadata["publication-ethics"]} />
    <ContentFrame aside={<div className="space-y-4"><SideCard title="Core commitments"><ul className="space-y-2 text-sm text-[#4b4d54]"><li>Fair editorial assessment</li><li>Confidential peer review</li><li>Transparent disclosures</li><li>Responsible corrections</li></ul></SideCard><div className="screen-only"><button type="button" onClick={() => window.print()} className="btn-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-bold"><Printer size={16} /> Print this policy</button></div></div>}>
      <h2 className="!mt-0">Commitment to publication integrity</h2>
      <p>JPSG is committed to responsible scholarly publishing. The following topics form the journal’s ethics framework. Detailed procedures will be updated as the editorial and submission systems are finalised.</p>
      <div className="mt-8 divide-y divide-[#d6cfc2] border-y border-[#d6cfc2]">
        {ethicalTopics.map(([title, text], index) => <section key={title} className="grid gap-2 py-5 sm:grid-cols-[34px_1fr]">
          <span className="pt-1 text-xs font-bold tabular-nums text-[#a45a40]">{String(index + 1).padStart(2, "0")}</span>
          <div><h3 className="!mt-0 !mb-1">{title}</h3><p className="!m-0 text-sm leading-6">{text}</p></div>
        </section>)}
      </div>
      <NoteBox title="Questions or concerns">A verified contact channel for complaints, appeals or ethics concerns will be published when the journal’s editorial email and portal are confirmed. No placeholder contact address is in use.</NoteBox>
    </ContentFrame>
  </>;
}

function ContactPage() {
  return <>
    <PageIntro {...pageMetadata.contact} />
    <ContentFrame aside={<SideCard title="Journal publisher"><p className="font-editorial text-xl leading-6 text-[#263c5d]">Democratic Organisation for Civic Knowledge Foundation</p><p className="mt-3 text-sm leading-6 text-[#62616a]">Publisher of the Journal of Politics, Society and Governance</p></SideCard>}>
      <h2 className="!mt-0">Editorial office</h2>
      <div className="my-6 border-y border-[#d6cfc2] py-5">
        <p className="!m-0 font-editorial text-2xl text-[#263c5d]">Visakhapatnam</p>
        <p className="!mb-0 !mt-1 text-sm text-[#676660]">Andhra Pradesh, India</p>
      </div>
      <h2>Contact channels</h2>
      <p>The journal’s official contact email and website address are forthcoming. A verified email address has not yet been provided. The placeholder address shown in planning material is not operational and should not be used.</p>
      <p>The journal’s online portal, including the manuscript submission system, remains forthcoming. This website does not receive submissions or contact requests.</p>
      <h2>Enquiries</h2>
      <p>When official channels are available, they will support enquiries concerning manuscript submission, editorial matters, peer review and general questions.</p>
      <NoteBox title="Please do not send confidential material">No contact form or submission channel is active on this site. Please wait for verified journal contact details before sending manuscripts or personal information.</NoteBox>
      <p className="screen-only"><Link href="/submissions" className="rule-link">See submission status <ArrowRight size={15} /></Link></p>
    </ContentFrame>
  </>;
}

function NotFoundPage() {
  return <><PageIntro {...pageMetadata["not-found"]} /><ContentFrame><h2 className="!mt-0">Where would you like to go?</h2><p>Explore journal information or return to the JPSG homepage.</p><div className="flex flex-wrap gap-3"><Link href="/" className="btn-primary px-5 py-3 text-sm font-bold">Journal homepage</Link><Link href="/about" className="btn-secondary px-5 py-3 text-sm font-bold">About the journal</Link></div></ContentFrame></>;
}

const pageComponents: Record<JournalPageType, () => JSX.Element> = {
  about: AboutPage,
  "current-issue": CurrentIssuePage,
  archives: ArchivesPage,
  "editorial-board": BoardPage,
  submissions: SubmissionPage,
  "author-guidelines": GuidelinesPage,
  "peer-review": ReviewPage,
  "publication-ethics": EthicsPage,
  contact: ContactPage,
  "not-found": NotFoundPage,
};

export default function JournalPage({ page }: { page: JournalPageType }) {
  useEffect(() => {
    const meta = pageMetadata[page];
    document.title = `${meta.title} | JPSG`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.summary);
  }, [page]);
  const Page = pageComponents[page];
  return <div className="enter"><Page /></div>;
}