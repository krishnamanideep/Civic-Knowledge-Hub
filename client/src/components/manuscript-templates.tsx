import { Download, FileDown, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ManuscriptTemplatesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="my-8 rounded-sm border border-[#d6cfc2] bg-[#fbf9f5] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd7c9] pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1ede2] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#a45a40] border border-[#dfd7c9]">
            <FileDown size={13} /> Official Author Templates
          </span>
          <h3 className="!mt-2 !mb-1 text-2xl font-editorial font-bold text-[#1f314d]">
            Manuscript & Title Page Templates
          </h3>
          <p className="!m-0 text-sm leading-6 text-[#5b5c62]">
            Authors must prepare their submission using these official templates to comply with our double-blind peer-review guidelines.
          </p>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        {/* Template 1: First Page / Title Page */}
        <div className="flex flex-col justify-between rounded-sm border border-[#d6cfc2] bg-[#f4f0e6] p-5 shadow-xs hover:border-[#a45a40] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f314d]">
                <FileText size={16} className="text-[#a45a40]" /> Template 1
              </span>
              <span className="rounded bg-[#e8e1cf] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-[#735c43]">
                Author Details & Abstract
              </span>
            </div>
            <h4 className="!mt-0 !mb-1 font-editorial text-xl font-bold text-[#1f314d]">
              First Page / Title Page Template
            </h4>
            <p className="!mt-1 text-xs font-semibold text-[#a45a40]">
              JPSG_First_Page_Template
            </p>
            <p className="!mt-2 text-xs leading-5 text-[#53565e]">
              Includes manuscript title, complete author names, academic designations, institutional affiliations, corresponding author email, ORCID identifiers, and structured abstract with keywords.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#dfd7c9] flex flex-wrap gap-2.5">
            <a
              href="/downloads/JPSG_First_Page_Template.docx"
              download="JPSG_First_Page_Template.docx"
              className="btn-primary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold shadow-sm"
              title="Download Word Document (.docx)"
            >
              <Download size={13} /> Download .DOCX
            </a>
            <a
              href="/downloads/JPSG_First_Page_Template.dotx"
              download="JPSG_First_Page_Template.dotx"
              className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold"
              title="Download Word Template (.dotx)"
            >
              <FileDown size={13} /> .DOTX
            </a>
          </div>
        </div>

        {/* Template 2: Main Manuscript Template */}
        <div className="flex flex-col justify-between rounded-sm border border-[#d6cfc2] bg-[#f4f0e6] p-5 shadow-xs hover:border-[#a45a40] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f314d]">
                <FileDown size={16} className="text-[#a45a40]" /> Template 2
              </span>
              <span className="rounded bg-[#e8e1cf] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-[#735c43]">
                Double-Blind Anonymized
              </span>
            </div>
            <h4 className="!mt-0 !mb-1 font-editorial text-xl font-bold text-[#1f314d]">
              Main Manuscript Template
            </h4>
            <p className="!mt-1 text-xs font-semibold text-[#a45a40]">
              JPSG_Manuscript_Template
            </p>
            <p className="!mt-2 text-xs leading-5 text-[#53565e]">
              Pre-formatted two-column layout (Times New Roman, 10 pt) containing Title, Abstract, Keywords, Introduction, Methodology, Analysis/Discussion, Conclusion, and References. <strong>Must not contain author names or affiliations.</strong>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#dfd7c9] flex flex-wrap gap-2.5">
            <a
              href="/downloads/JPSG_Manuscript_Template.docx"
              download="JPSG_Manuscript_Template.docx"
              className="btn-primary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold shadow-sm"
              title="Download Word Document (.docx)"
            >
              <Download size={13} /> Download .DOCX
            </a>
            <a
              href="/downloads/JPSG_Manuscript_Template.dotx"
              download="JPSG_Manuscript_Template.dotx"
              className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold"
              title="Download Word Template (.dotx)"
            >
              <FileDown size={13} /> .DOTX
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-sm bg-[#efe9dc] p-4 border border-[#dfd7c9] text-xs leading-5 text-[#53565e]">
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#a45a40]" />
          <div>
            <strong className="text-[#1f314d]">Double-Blind Review Requirement:</strong>
            {" "}Please ensure that author names, acknowledgments, or institutional affiliations do not appear within the Main Manuscript file or file properties. Author information must only be included in the First Page / Title Page document. Both files should be emailed together upon submission.
          </div>
        </div>
      </div>
    </section>
  );
}
