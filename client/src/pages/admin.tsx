import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Users,
  Settings,
  Upload,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  AlertCircle,
  FileText,
  FileUp,
  LogOut,
  Lock,
  Eye,
  RotateCcw,
  Search,
  Sparkles,
  Download,
  Mail,
  Globe,
  HelpCircle,
  Loader2,
  Copy,
  Share2,
  CloudUpload,
  GitBranch,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  useJournalData,
  useAdminMutations,
  useArticles,
  usePeople,
  useJournalSettings,
  saveLocalJournalData,
} from "@/hooks/use-journal";
import {
  type JournalArticle,
  type InsertArticle,
  type JournalPerson,
  type InsertPerson,
  type Author,
  type JournalSettings as JournalSettingsType,
  type JournalData,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { savePdfToIndexedDB, resolvePdfUrl, safeOpenPdf, safeDownloadPdf } from "@/lib/pdf-storage";
import {
  getCloudSyncConfig,
  saveCloudSyncConfig,
  downloadJsonBackup,
  copyJsonToClipboard,
  parseImportedJson,
  pushToCloudSyncUrl,
  fetchFromCloudSyncUrl,
  deployToGitHubRepo,
  syncToLiveWebsite,
  type CloudSyncConfig,
} from "@/lib/cloud-sync";

type TabType = "dashboard" | "articles" | "people" | "settings" | "uploads" | "sync";

export default function AdminPage() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("jpsg_admin_logged_in") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const { data: journalData, isLoading, refetch } = useJournalData();
  const mutations = useAdminMutations();

  // Search / Filter states
  const [articleSearch, setArticleSearch] = useState("");
  const [peopleCategoryFilter, setPeopleCategoryFilter] = useState<"all" | "leadership" | "board_member">("all");

  // Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<InsertArticle>({
    serialNumber: "06",
    slug: "",
    aliases: [],
    title: "",
    section: "Original Research Article",
    pages: "32–40",
    doi: "",
    pdfUrl: "",
    abstract: "",
    keywords: [],
    volume: "Volume 1",
    issue: "Issue 1",
    year: "2027",
    date: "January–March 2027",
    status: "published",
    authors: [
      {
        name: "",
        isCorresponding: true,
        role: "Faculty",
        department: "",
        institution: "",
        email: "",
      },
    ],
  });
  const [keywordsText, setKeywordsText] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [isSubmittingPerson, setIsSubmittingPerson] = useState(false);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  // Person Modal State
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState<InsertPerson>({
    name: "",
    category: "board_member",
    role: "Editorial Board Member",
    designation: "Professor",
    qualifications: "Ph.D.",
    department: "",
    institution: "",
    email: "",
    secondaryEmail: "",
    orcid: "",
    note: "",
    address: "",
    order: 0,
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState<JournalSettingsType | null>(null);
  const [newSubjectArea, setNewSubjectArea] = useState("");

  useEffect(() => {
    if (journalData?.settings && !settingsForm) {
      setSettingsForm(journalData.settings);
    }
  }, [journalData?.settings]);

  // Cloud Sync & Deployment State
  const [syncConfig, setSyncConfig] = useState<CloudSyncConfig>(() => getCloudSyncConfig());
  const [cloudUrlInput, setCloudUrlInput] = useState(syncConfig.cloudUrl || "");
  const [cloudApiKeyInput, setCloudApiKeyInput] = useState(syncConfig.cloudApiKey || "");
  const [githubTokenInput, setGithubTokenInput] = useState(syncConfig.githubToken || "");
  const [githubRepoInput, setGithubRepoInput] = useState(syncConfig.githubRepo || "krishnamanideep/Civic-Knowledge-Hub");
  const [githubBranchInput, setGithubBranchInput] = useState(syncConfig.githubBranch || "main");
  const [isDeployingGitHub, setIsDeployingGitHub] = useState(false);
  const [deploySuccessMsg, setDeploySuccessMsg] = useState<string | null>(null);
  const [deployErrorMsg, setDeployErrorMsg] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Quick 1-Click Sync Modal & State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState<string | null>(null);

  const handleQuickSync = async (providedToken?: string) => {
    if (!journalData) return;
    const tokenToUse = (providedToken || githubTokenInput || syncConfig.githubToken || "").trim();

    if (!tokenToUse) {
      setIsSyncModalOpen(true);
      return;
    }

    setIsGlobalSyncing(true);
    setSyncProgressMsg("Connecting to GitHub and live backend...");

    try {
      const result = await syncToLiveWebsite(
        journalData,
        tokenToUse,
        githubRepoInput,
        githubBranchInput
      );

      if (providedToken) {
        const newConf = { ...syncConfig, githubToken: tokenToUse };
        setSyncConfig(newConf);
        saveCloudSyncConfig(newConf);
        setGithubTokenInput(tokenToUse);
      }

      setSyncProgressMsg(result.message);
      toast({
        title: "Sync & Deployment Successful! 🚀",
        description: result.message,
      });

      setTimeout(() => {
        setIsSyncModalOpen(false);
      }, 2500);
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message,
        variant: "destructive",
      });
      setSyncProgressMsg(`Error: ${err.message}`);
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  // GitHub Deploy Handler
  const handleDeployToGitHub = async () => {
    if (!githubTokenInput.trim()) {
      toast({
        title: "GitHub Token Required",
        description: "Please enter a GitHub Personal Access Token to commit and deploy directly.",
        variant: "destructive",
      });
      return;
    }
    if (!journalData) return;

    setIsDeployingGitHub(true);
    setDeploySuccessMsg(null);
    setDeployErrorMsg(null);

    try {
      const updatedConfig: CloudSyncConfig = {
        ...syncConfig,
        githubToken: githubTokenInput.trim(),
        githubRepo: githubRepoInput.trim(),
        githubBranch: githubBranchInput.trim(),
      };
      setSyncConfig(updatedConfig);
      saveCloudSyncConfig(updatedConfig);

      const result = await deployToGitHubRepo(
        journalData,
        githubTokenInput.trim(),
        githubRepoInput.trim(),
        githubBranchInput.trim()
      );

      setDeploySuccessMsg(result.message);
      toast({
        title: "Deployment Triggered Successfully! 🚀",
        description: "Changes committed to GitHub. Vercel is now building and deploying live to all devices.",
      });
    } catch (err: any) {
      setDeployErrorMsg(err.message || "Failed to deploy to GitHub.");
      toast({
        title: "Deployment Failed",
        description: err.message || "Could not commit to GitHub repository.",
        variant: "destructive",
      });
    } finally {
      setIsDeployingGitHub(false);
    }
  };

  // Cloud Sync Save Handler
  const handleSaveCloudSync = async () => {
    const updatedConfig: CloudSyncConfig = {
      ...syncConfig,
      cloudUrl: cloudUrlInput.trim(),
      cloudApiKey: cloudApiKeyInput.trim(),
    };
    setSyncConfig(updatedConfig);
    saveCloudSyncConfig(updatedConfig);

    if (cloudUrlInput.trim() && journalData) {
      setIsCloudSyncing(true);
      try {
        await pushToCloudSyncUrl(journalData, cloudUrlInput.trim());
        toast({
          title: "Cloud Sync Connected! 🌐",
          description: "All journal data uploaded to cloud. All other devices will now load live data from this endpoint.",
        });
      } catch (err: any) {
        toast({
          title: "Cloud Sync Failed",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsCloudSyncing(false);
      }
    } else {
      toast({ title: "Configuration Saved", description: "Cloud sync settings updated." });
    }
  };

  // Export handlers
  const handleExportJson = () => {
    if (!journalData) return;
    downloadJsonBackup(journalData);
    toast({ title: "Journal Data Exported", description: "Downloaded complete JPSG journal JSON file." });
  };

  const handleCopyJson = async () => {
    if (!journalData) return;
    const ok = await copyJsonToClipboard(journalData);
    if (ok) {
      toast({ title: "Copied to Clipboard!", description: "Complete journal JSON copied to your clipboard." });
    }
  };

  // Import handler
  const handleImportJson = (rawContent?: string) => {
    const content = rawContent || importJsonText;
    if (!content.trim()) {
      toast({ title: "Empty Input", description: "Please paste valid JSON or choose a file.", variant: "destructive" });
      return;
    }
    setIsImporting(true);
    try {
      const parsed = parseImportedJson(content);
      saveLocalJournalData(parsed);
      refetch();
      toast({
        title: "Data Imported Successfully! 🎉",
        description: `Imported ${parsed.articles.length} articles, ${parsed.people.length} board members, and particulars.`,
      });
      setImportJsonText("");
    } catch (err: any) {
      toast({ title: "Import Error", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      passwordInput === "admin" ||
      passwordInput === "admin123" ||
      passwordInput === "dock2027" ||
      passwordInput === "jpsg2027"
    ) {
      localStorage.setItem("jpsg_admin_logged_in", "true");
      setIsAuthenticated(true);
      setLoginError("");
      toast({
        title: "Welcome, Editor!",
        description: "You are successfully authenticated into the JPSG Admin Panel.",
      });
    } else {
      setLoginError("Invalid password. Please enter the authorized administrator password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jpsg_admin_logged_in");
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have signed out of the editorial admin panel.",
    });
  };

  // PDF Preview Modal State & Safe PDF Opener
  const [previewPdfModal, setPreviewPdfModal] = useState<{
    isOpen: boolean;
    url: string;
    resolvedUrl: string;
    title: string;
  }>({
    isOpen: false,
    url: "",
    resolvedUrl: "",
    title: "",
  });

  const openPdfPreview = async (url: string, title?: string) => {
    if (!url) {
      toast({
        title: "No PDF",
        description: "No PDF document or URL is specified for this article.",
        variant: "destructive",
      });
      return;
    }
    const resolved = await resolvePdfUrl(url);
    setPreviewPdfModal({
      isOpen: true,
      url,
      resolvedUrl: resolved,
      title: title || "Manuscript PDF",
    });
  };

  // Upload PDF Handler with IndexedDB Persistence
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingPdf(true);

    try {
      // 1. Always store locally in IndexedDB first so it is available 100% reliably
      const key = `${articleForm.slug || "manuscript"}-${Date.now()}`;
      const idbRef = await savePdfToIndexedDB(key, file);

      setArticleForm((prev) => ({ ...prev, pdfUrl: idbRef }));
      toast({
        title: "PDF Saved into Journal System",
        description: `${file.name} (${Math.round(file.size / 1024)} KB) is loaded and ready!`,
      });

      // 2. Also attempt upload to Express server if backend is active
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.url) {
          setArticleForm((prev) => ({ ...prev, pdfUrl: data.url }));
        }
      }
    } catch (err: any) {
      console.warn("Server upload not reachable (static hosting), safely stored in IndexedDB:", err);
    } finally {
      setUploadingPdf(false);
    }
  };

  // Open Article Form
  const openNewArticleModal = () => {
    const rawArticles = journalData?.articles || [];
    const maxSerial = rawArticles.reduce((max, a) => {
      const num = parseInt(a.serialNumber, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextNum = (maxSerial + 1).toString().padStart(2, "0");

    setArticleForm({
      serialNumber: nextNum,
      slug: "",
      aliases: [],
      title: "",
      section: "Original Research Article",
      pages: "1–10",
      doi: "",
      pdfUrl: "/articles/JPSG_Manuscript_Sample.pdf",
      abstract: "",
      keywords: [],
      volume: journalData?.settings.currentVolume || "Volume 1",
      issue: journalData?.settings.currentIssue || "Issue 1",
      year: journalData?.settings.currentYear || "2027",
      date: journalData?.settings.currentPeriod || "January–March 2027",
      status: "published",
      authors: [
        {
          name: "",
          isCorresponding: true,
          role: "Faculty",
          department: "",
          institution: "",
          email: "",
        },
      ],
    });
    setKeywordsText("");
    setEditingArticleId(null);
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (article: JournalArticle) => {
    setArticleForm({
      serialNumber: article.serialNumber,
      slug: article.slug,
      aliases: article.aliases || [],
      title: article.title,
      section: article.section || "Original Research Article",
      pages: article.pages || "1–10",
      doi: article.doi || "",
      pdfUrl: article.pdfUrl || "/articles/JPSG_Manuscript_Sample.pdf",
      abstract: article.abstract || "",
      keywords: article.keywords || [],
      volume: article.volume || "Volume 1",
      issue: article.issue || "Issue 1",
      year: article.year || "2027",
      date: article.date || "January–March 2027",
      status: article.status || "published",
      authors: (article.authors || []).map((a) => ({ ...a })),
    });
    setKeywordsText((article.keywords || []).join(", "));
    setEditingArticleId(article.id);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingArticle) return;

    if (!articleForm.title.trim()) {
      toast({ title: "Title Required", description: "Please enter the article title.", variant: "destructive" });
      return;
    }

    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const slug =
      articleForm.slug.trim() ||
      articleForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const authors = articleForm.authors.map((a) => ({
      name: a.name.trim() || "Author",
      isCorresponding: a.isCorresponding || false,
      role: a.role || "Faculty",
      department: a.department || "",
      institution: a.institution || "",
      email: a.email || "",
    }));

    const payload: InsertArticle = {
      ...articleForm,
      slug,
      keywords,
      authors,
      pages: articleForm.pages.trim() || "1–10",
      abstract: articleForm.abstract.trim() || "Abstract pending for this publication.",
      pdfUrl: articleForm.pdfUrl.trim() || "/articles/JPSG_Manuscript_Sample.pdf",
      section: articleForm.section.trim() || "Original Research Article",
      volume: articleForm.volume.trim() || "Volume 1",
      issue: articleForm.issue.trim() || "Issue 1",
      year: articleForm.year.trim() || "2027",
      date: articleForm.date.trim() || "January–March 2027",
      status: articleForm.status || "published",
    };

    setIsSubmittingArticle(true);
    try {
      if (editingArticleId) {
        await mutations.updateArticle.mutateAsync({ id: editingArticleId, updates: payload });
        toast({ title: "Article Updated", description: "The article changes are now live across the website!" });
      } else {
        await mutations.createArticle.mutateAsync(payload);
        toast({ title: "Article Uploaded & Live", description: "New journal article added to the homepage, current issue, and archive!" });
      }
      setIsArticleModalOpen(false);
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message || "Failed to save article", variant: "destructive" });
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will immediately remove it from the website.`)) {
      try {
        await mutations.deleteArticle.mutateAsync(id);
        toast({ title: "Article Deleted", description: "The article was removed from the journal." });
      } catch (err: any) {
        toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
      }
    }
  };

  // Author sub-form helpers
  const handleAddAuthor = () => {
    setArticleForm((prev) => ({
      ...prev,
      authors: [
        ...prev.authors,
        {
          name: "",
          isCorresponding: false,
          role: "Faculty",
          department: "",
          institution: "",
          email: "",
        },
      ],
    }));
  };

  const handleRemoveAuthor = (index: number) => {
    if (articleForm.authors.length <= 1) {
      toast({ title: "Notice", description: "An article must have at least one author." });
      return;
    }
    setArticleForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: any) => {
    setArticleForm((prev) => {
      const nextAuthors = [...prev.authors];
      nextAuthors[index] = { ...nextAuthors[index], [field]: value };
      return { ...prev, authors: nextAuthors };
    });
  };

  // Person Modal Handlers
  const openNewPersonModal = (category: "leadership" | "board_member" = "board_member") => {
    setPersonForm({
      name: "",
      category,
      role: category === "leadership" ? "Associate Editor" : "Editorial Board Member",
      designation: "Professor",
      qualifications: "Ph.D.",
      department: "",
      institution: "",
      email: "",
      secondaryEmail: "",
      orcid: "",
      note: "",
      address: "",
      order: 0,
    });
    setEditingPersonId(null);
    setIsPersonModalOpen(true);
  };

  const openEditPersonModal = (person: JournalPerson) => {
    setPersonForm({
      name: person.name,
      category: person.category,
      role: person.role,
      designation: person.designation,
      qualifications: person.qualifications || "",
      department: person.department || "",
      institution: person.institution || "",
      email: person.email || "",
      secondaryEmail: person.secondaryEmail || "",
      orcid: person.orcid || "",
      note: person.note || "",
      address: person.address || "",
      order: person.order,
    });
    setEditingPersonId(person.id);
    setIsPersonModalOpen(true);
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPerson) return;

    if (!personForm.name.trim()) {
      toast({ title: "Name Required", description: "Please enter the person's full name.", variant: "destructive" });
      return;
    }

    setIsSubmittingPerson(true);
    try {
      if (editingPersonId) {
        await mutations.updatePerson.mutateAsync({ id: editingPersonId, updates: personForm });
        toast({ title: "Person Updated", description: "Editorial board member updated and live on website!" });
      } else {
        await mutations.createPerson.mutateAsync(personForm);
        toast({ title: "Person Added", description: "New member added to the Editorial Board!" });
      }
      setIsPersonModalOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingPerson(false);
    }
  };

  const handleDeletePerson = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Editorial Board?`)) {
      try {
        await mutations.deletePerson.mutateAsync(id);
        toast({ title: "Member Removed", description: `${name} has been removed from the Editorial Board.` });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleMovePerson = async (index: number, direction: "up" | "down", list: JournalPerson[]) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const nextList = [...list];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;

    const orderedIds = nextList.map((p) => p.id);
    try {
      await mutations.reorderPeople.mutateAsync(orderedIds);
      toast({ title: "Reordered", description: "Editorial board sequence updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingSettings) return;
    if (!settingsForm) return;

    setIsSubmittingSettings(true);
    try {
      await mutations.updateSettings.mutateAsync(settingsForm);
      toast({
        title: "Settings Saved",
        description: "Journal particulars, volume/issue metadata, and publisher information have been updated live across the site!",
      });
    } catch (err: any) {
      toast({ title: "Error Saving Settings", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  const handleResetData = async () => {
    if (
      confirm(
        "Are you sure you want to reset all journal data to default? This will restore initial articles, editorial board members, and particulars."
      )
    ) {
      try {
        await mutations.resetData.mutateAsync();
        toast({ title: "Reset Complete", description: "Journal restored to default configuration." });
        refetch();
      } catch (err: any) {
        toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
      }
    }
  };

  // ==================== RENDER: LOGIN FORM ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md bg-[#f7f4ec] border border-[#d6cfc2] rounded-sm shadow-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1f314d] text-[#e8e2d2] mb-3 shadow-sm">
              <Lock size={26} />
            </div>
            <h1 className="font-editorial text-2xl font-bold text-[#1f314d]">
              Editorial Admin Panel
            </h1>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#a45a40] mt-1">
              Journal of Politics, Society and Governance
            </p>
            <p className="text-xs text-[#6e6a62] mt-2">
              Published by{" "}
              <a
                href="https://docknowledge.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#a45a40] font-semibold"
              >
                Democratic Organisation for Civic Knowledge Foundation (docknowledge.org)
              </a>
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                Admin Access Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#cfc7b9] rounded-sm text-sm focus:outline-none focus:border-[#1f314d]"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <Lock size={14} /> Sign In to Admin Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#dfd7c9] flex justify-between items-center text-xs">
            <Link href="/" className="text-[#a45a40] hover:underline flex items-center gap-1 font-medium">
              ← Back to Journal Website
            </Link>
            <a
              href="https://docknowledge.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#676660] hover:underline flex items-center gap-1"
            >
              docknowledge.org <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const rawArticles = journalData?.articles || [];
  const articles = useMemo(() => {
    const seen = new Set<string>();
    return rawArticles.filter((a) => {
      const key = (a.slug || a.id || a.serialNumber || a.title).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rawArticles]);

  const rawPeople = journalData?.people || [];
  const people = useMemo(() => {
    const seen = new Set<string>();
    return rawPeople.filter((p) => {
      const key = `${p.category || "board_member"}-${(p.name || "").toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rawPeople]);

  const settings = journalData?.settings;

  const leadershipList = useMemo(() => {
    return people
      .filter((p) => p.category === "leadership")
      .sort((a, b) => a.order - b.order);
  }, [people]);

  const boardMemberList = useMemo(() => {
    return people
      .filter((p) => p.category === "board_member")
      .sort((a, b) => a.order - b.order);
  }, [people]);

  const filteredArticles = articles.filter((art) => {
    const q = articleSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      art.title.toLowerCase().includes(q) ||
      art.serialNumber.toLowerCase().includes(q) ||
      art.authors.some((a) => a.name.toLowerCase().includes(q)) ||
      (art.keywords || []).some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Admin Top Banner */}
      <section className="bg-[#1f314d] text-[#f7f5ef] border-b border-[#35496b] shadow-sm">
        <div className="page-wrap py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JPSG Logo" className="h-10 w-auto brightness-200 contrast-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl font-bold tracking-tight">
                  Editorial Admin Panel
                </span>
                <span className="bg-[#a45a40] text-white text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#bcc5d4]">
                Manage articles, upload journals, update editorial board members & journal titles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://docknowledge.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[#e2dec9] hover:text-white underline font-medium"
            >
              docknowledge.org <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => handleQuickSync()}
              disabled={isGlobalSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Sync and deploy all articles and changes directly to live website for all sessions"
            >
              <RefreshCw size={13} className={isGlobalSyncing ? "animate-spin" : ""} />
              <span>{isGlobalSyncing ? "Syncing Live..." : "⚡ Sync to Live Website"}</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#30476e] hover:bg-[#3d5988] text-white font-semibold transition-colors border border-[#44608f]"
            >
              <Eye size={13} /> View Live Website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#4a241b] hover:bg-[#683327] text-white font-semibold transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <nav className="bg-[#ece6d8] border-b border-[#d6cfc2] sticky top-0 z-30 shadow-xs">
        <div className="page-wrap flex flex-wrap items-center gap-1 sm:gap-2 py-2 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: Sparkles },
            { id: "articles", label: `Journals & Articles (${articles.length})`, icon: BookOpen },
            { id: "people", label: `Editorial Board (${people.length})`, icon: Users },
            { id: "settings", label: "Journal Titles & Particulars", icon: Settings },
            { id: "uploads", label: "PDF File Uploader", icon: Upload },
            { id: "sync", label: "Global Deploy & Cloud Sync", icon: Globe },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as TabType)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-sm transition-all shrink-0 ${
                activeTab === id
                  ? "bg-[#1f314d] text-white shadow-sm"
                  : "text-[#3e424c] hover:bg-[#ded7c5] hover:text-[#1f314d]"
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Live Deployment Status Notice Banner */}
      <div className="bg-[#f0f9f4] border-b border-[#c8e6d9] py-2.5 px-4 text-xs text-[#1e5a3c]">
        <div className="page-wrap flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[0.7rem] shrink-0">
              ⚡
            </span>
            <span>
              <strong>Worldwide Sync:</strong> Edits reflect in your local session. To deploy changes directly to the live website so all other devices and sessions see them, click <strong>Sync to Live Website</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickSync()}
              disabled={isGlobalSyncing}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shrink-0 inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isGlobalSyncing ? "animate-spin" : ""} />
              <span>{isGlobalSyncing ? "Deploying..." : "⚡ Sync to Live Website"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="page-wrap py-8">
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 enter">
            <div>
              <h1 className="font-editorial text-3xl font-bold text-[#1f314d]">
                Editorial Overview & Quick Actions
              </h1>
              <p className="text-sm text-[#5c5f69] mt-1">
                Any modifications made here reflect immediately on the live journal website across home, issues, archives, and editorial board.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-5 rounded-sm shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Published Articles</span>
                <p className="font-editorial text-3xl font-bold text-[#1f314d] mt-2">{articles.length}</p>
                <p className="text-xs text-[#527d24] mt-1 font-semibold">Active in Current Issue & Archives</p>
              </div>

              <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-5 rounded-sm shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Editorial Leadership</span>
                <p className="font-editorial text-3xl font-bold text-[#1f314d] mt-2">{leadershipList.length}</p>
                <p className="text-xs text-[#a45a40] mt-1 font-semibold">Editor-in-Chief & Managing Editor</p>
              </div>

              <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-5 rounded-sm shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Editorial Board Members</span>
                <p className="font-editorial text-3xl font-bold text-[#1f314d] mt-2">{boardMemberList.length}</p>
                <p className="text-xs text-[#4b4e57] mt-1 font-semibold">Professors, Faculty & Scholars</p>
              </div>

              <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-5 rounded-sm shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Current Issue</span>
                <p className="font-editorial text-2xl font-bold text-[#1f314d] mt-2 truncate">
                  {settings?.currentVolume}, {settings?.currentIssue}
                </p>
                <p className="text-xs text-[#6e6a62] mt-1">{settings?.currentPeriod}</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-[#d6cfc2] bg-[#fdfbf7] p-6 rounded-sm shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="font-editorial text-xl font-bold text-[#1f314d]">
                  Quick Editorial Actions
                </h2>
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Ready to deploy to all sessions
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickSync()}
                  disabled={isGlobalSyncing}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm bg-emerald-700 hover:bg-emerald-800 border-emerald-800 cursor-pointer disabled:opacity-50"
                  title="Deploy current state directly to live website for all sessions"
                >
                  <RefreshCw size={15} className={isGlobalSyncing ? "animate-spin" : ""} />
                  <span>{isGlobalSyncing ? "Syncing..." : "⚡ Sync to Live Website (All Sessions)"}</span>
                </button>
                <button
                  type="button"
                  onClick={openNewArticleModal}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Plus size={15} /> Upload / Add New Article
                </button>
                <button
                  type="button"
                  onClick={() => openNewPersonModal("board_member")}
                  className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Plus size={15} /> Add Editorial Board Member
                </button>
                <button
                  type="button"
                  onClick={() => openNewPersonModal("leadership")}
                  className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Plus size={15} /> Add Journal Leadership / Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Settings size={15} /> Change Titles & Particulars
                </button>
              </div>
            </div>

            {/* Live Reflection Preview Links */}
            <div className="border border-[#d6cfc2] bg-[#efe9dc] p-6 rounded-sm">
              <h3 className="font-editorial text-lg font-bold text-[#1f314d] mb-2">
                Public Website Pages (Click to Verify Live Changes)
              </h3>
              <p className="text-xs text-[#5f626c] mb-4">
                Open any page in a new tab to see how changes made in this admin panel reflect live on the website:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { name: "Homepage", href: "/" },
                  { name: "Current Issue", href: "/current-issue" },
                  { name: "Archives", href: "/archives" },
                  { name: "Editorial Board", href: "/editorial-board" },
                  { name: "Journal Particulars", href: "/particulars" },
                  { name: "About the Journal", href: "/about" },
                  { name: "Author Guidelines", href: "/author-guidelines" },
                  { name: "Contact Office", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    className="p-2.5 bg-white border border-[#cfc7b9] rounded-sm hover:border-[#a45a40] font-semibold text-[#1f314d] flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    <ExternalLink size={12} className="text-[#a45a40]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ARTICLES & JOURNALS ==================== */}
        {activeTab === "articles" && (
          <div className="space-y-6 enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-editorial text-2xl font-bold text-[#1f314d]">
                  Manage Journal Articles ({articles.length})
                </h1>
                <p className="text-xs text-[#676a74]">
                  Upload new papers, change titles, authors, abstract, PDF documents, and volume/issue metadata.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleQuickSync()}
                  disabled={isGlobalSyncing}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm bg-emerald-700 hover:bg-emerald-800 border-emerald-800 cursor-pointer disabled:opacity-50"
                  title="Deploy all changes live to all sessions across the globe"
                >
                  <RefreshCw size={14} className={isGlobalSyncing ? "animate-spin" : ""} />
                  <span>{isGlobalSyncing ? "Syncing Live..." : "⚡ Sync to Live Website"}</span>
                </button>
                <button
                  type="button"
                  onClick={openNewArticleModal}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Plus size={15} /> Upload / Add New Article
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f7c75]" />
              <input
                type="text"
                placeholder="Search articles by title, author name, or keyword..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d6cfc2] rounded-sm text-sm focus:outline-none focus:border-[#1f314d]"
              />
            </div>

            {/* Articles Table */}
            <div className="border border-[#d6cfc2] bg-[#f8f5ee] rounded-sm overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#ece6d8] border-b border-[#d6cfc2] text-[#1f314d] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5 w-16">Serial</th>
                      <th className="p-3.5 min-w-[280px]">Article Title & Authors</th>
                      <th className="p-3.5 min-w-[120px]">Issue / Pages</th>
                      <th className="p-3.5 min-w-[100px]">PDF Link</th>
                      <th className="p-3.5 min-w-[90px]">Status</th>
                      <th className="p-3.5 text-right min-w-[140px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6cfc2]">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-[#77736d]">
                          No articles found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-[#f1ebe0] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#a45a40]">
                            {art.serialNumber}
                          </td>
                          <td className="p-3.5">
                            <Link
                              href={`/article/${art.slug}`}
                              target="_blank"
                              className="font-editorial text-sm font-bold text-[#1f314d] hover:text-[#a45a40] line-clamp-2"
                            >
                              {art.title}
                            </Link>
                            <p className="mt-1 text-[#5b5e68] text-[0.72rem] line-clamp-1">
                              <strong>Authors:</strong> {art.authors.map((a) => a.name).join(", ")}
                              {art.authors[0]?.institution ? ` (${art.authors[0].institution})` : ""}
                            </p>
                            <span className="inline-block mt-1 text-[0.68rem] bg-[#e4ded0] text-[#4b4e57] px-1.5 py-0.5 rounded-xs">
                              {art.section}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-[#1f314d] block">
                              {art.volume}, {art.issue}
                            </span>
                            <span className="text-[#626570] text-[0.72rem]">pp. {art.pages}</span>
                            <span className="text-[#7c7f89] block text-[0.68rem]">{art.year}</span>
                          </td>
                          <td className="p-3.5">
                            {art.pdfUrl ? (
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  type="button"
                                  onClick={() => openPdfPreview(art.pdfUrl, art.title)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#a45a40] border border-red-200 rounded text-xs font-semibold shadow-2xs transition-colors"
                                  title="View full-text PDF in interactive reader"
                                >
                                  <FileText size={13} className="text-red-600" />
                                  <span>View PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => safeOpenPdf(art.pdfUrl, art.title)}
                                  className="inline-flex items-center gap-1 text-[0.68rem] text-[#6e6a62] hover:text-[#1f314d] hover:underline"
                                  title="Open in new window or download"
                                >
                                  <ExternalLink size={10} /> Open New Tab
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#999] text-[0.72rem] italic">No PDF Attached</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                                art.status === "published"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {art.status || "published"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {art.pdfUrl && (
                              <button
                                type="button"
                                onClick={() => openPdfPreview(art.pdfUrl, art.title)}
                                className="inline-flex items-center justify-center p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                title="View / Read PDF"
                              >
                                <FileText size={14} />
                              </button>
                            )}
                            <Link
                              href={`/article/${art.slug}`}
                              target="_blank"
                              className="inline-flex items-center justify-center p-1.5 rounded bg-[#e8e2d2] hover:bg-[#ded7c5] text-[#1f314d]"
                              title="View Public Article Page"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditArticleModal(art)}
                              className="inline-flex items-center justify-center p-1.5 rounded bg-[#1f314d] hover:bg-[#2c456b] text-white"
                              title="Edit Article"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="inline-flex items-center justify-center p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700"
                              title="Delete Article"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: EDITORIAL BOARD & PEOPLE ==================== */}
        {activeTab === "people" && (
          <div className="space-y-6 enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-editorial text-2xl font-bold text-[#1f314d]">
                  Manage People & Editorial Board ({people.length})
                </h1>
                <p className="text-xs text-[#676a74]">
                  Add or change editors, professors, board members, titles, academic designations, and institutional affiliations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openNewPersonModal("leadership")}
                  className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold shadow-xs"
                >
                  <Plus size={14} /> Add Leadership
                </button>
                <button
                  type="button"
                  onClick={() => openNewPersonModal("board_member")}
                  className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold shadow-xs"
                >
                  <Plus size={14} /> Add Board Member
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#5a5d66]">Filter:</span>
              {(["all", "leadership", "board_member"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPeopleCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    peopleCategoryFilter === cat
                      ? "bg-[#1f314d] text-white"
                      : "bg-[#e8e2d2] text-[#42454d] hover:bg-[#ded7c5]"
                  }`}
                >
                  {cat === "all" ? "All People" : cat === "leadership" ? "Editorial Leadership" : "Board Members"}
                </button>
              ))}
            </div>

            {/* Leadership Section */}
            {(peopleCategoryFilter === "all" || peopleCategoryFilter === "leadership") && (
              <div className="space-y-3">
                <h2 className="font-editorial text-lg font-bold text-[#1f314d] flex items-center gap-2 border-b border-[#d6cfc2] pb-2">
                  <span className="bg-[#1f314d] text-white px-2 py-0.5 text-xs rounded-xs">Leadership</span>
                  <span>Journal Editors & Co-Founders ({leadershipList.length})</span>
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {leadershipList.map((person, idx) => (
                    <div
                      key={person.id}
                      className="border-l-4 border-[#1f314d] border-y border-r border-[#d6cfc2] bg-[#fbf9f4] p-4 rounded-xs shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="eyebrow text-[#a45a40] text-[0.68rem]">{person.role}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMovePerson(idx, "up", leadershipList)}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-[#e4decb] disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePerson(idx, "down", leadershipList)}
                              disabled={idx === leadershipList.length - 1}
                              className="p-1 rounded hover:bg-[#e4decb] disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-editorial text-lg font-bold text-[#1f314d] mt-1">{person.name}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#a45a40]">
                          {person.designation}
                        </p>
                        {person.department && (
                          <p className="text-xs text-[#484b54] mt-1 font-medium">{person.department}</p>
                        )}
                        {person.institution && (
                          <p className="text-xs text-[#6e6a62]">{person.institution}</p>
                        )}
                        {person.email && (
                          <p className="text-xs text-[#1f314d] mt-2 font-mono flex items-center gap-1">
                            <Mail size={12} className="text-[#a45a40]" /> {person.email}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e2dbce] flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => openEditPersonModal(person)}
                          className="px-2.5 py-1 bg-[#1f314d] text-white rounded hover:bg-[#2c456b] font-semibold flex items-center gap-1"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePerson(person.id, person.name)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Board Members Section */}
            {(peopleCategoryFilter === "all" || peopleCategoryFilter === "board_member") && (
              <div className="space-y-3 mt-8">
                <h2 className="font-editorial text-lg font-bold text-[#1f314d] flex items-center gap-2 border-b border-[#d6cfc2] pb-2">
                  <span className="bg-[#a45a40] text-white px-2 py-0.5 text-xs rounded-xs">Members</span>
                  <span>Editorial Board Members ({boardMemberList.length})</span>
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {boardMemberList.map((person, idx) => (
                    <div
                      key={person.id}
                      className="border border-[#d6cfc2] bg-[#fbf9f4] p-4 rounded-xs shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="eyebrow text-[#a45a40] text-[0.65rem]">{person.role}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMovePerson(idx, "up", boardMemberList)}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-[#e4decb] disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePerson(idx, "down", boardMemberList)}
                              disabled={idx === boardMemberList.length - 1}
                              className="p-1 rounded hover:bg-[#e4decb] disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-editorial text-base font-bold text-[#1f314d] mt-1">{person.name}</h3>
                        {person.qualifications && (
                          <p className="text-[0.7rem] italic text-[#6e6a62]">{person.qualifications}</p>
                        )}
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#7a766e]">
                          {person.designation}
                        </p>
                        {person.department && (
                          <p className="text-xs text-[#484b54] mt-1 font-medium line-clamp-2">
                            {person.department}
                          </p>
                        )}
                        {person.institution && (
                          <p className="text-xs text-[#6e6a62] line-clamp-1">{person.institution}</p>
                        )}
                        {person.email && (
                          <p className="text-xs text-[#1f314d] mt-2 font-mono line-clamp-1 flex items-center gap-1">
                            <Mail size={11} className="text-[#a45a40]" /> {person.email}
                          </p>
                        )}
                        {person.orcid && (
                          <p className="text-[0.7rem] text-[#527d24] font-semibold mt-1 flex items-center gap-1">
                            <span>ORCID:</span> <span className="truncate">{person.orcid}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e2dbce] flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => openEditPersonModal(person)}
                          className="px-2 py-1 bg-[#1f314d] text-white rounded hover:bg-[#2c456b] font-semibold flex items-center gap-1 text-[0.72rem]"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePerson(person.id, person.name)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold flex items-center gap-1 text-[0.72rem]"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: JOURNAL TITLES & SETTINGS ==================== */}
        {activeTab === "settings" && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-8 enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-editorial text-2xl font-bold text-[#1f314d]">
                  Journal Titles & Official Particulars
                </h1>
                <p className="text-xs text-[#676a74]">
                  Update official metadata, journal title, abbreviation, publisher details, office addresses, and current issue information.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-sm flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} /> Reset to Defaults
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSettings}
                  className="btn-primary px-5 py-2.5 text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSettings ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{isSubmittingSettings ? "Saving Settings..." : "Save All Settings"}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Journal Identity */}
            <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-6 rounded-sm shadow-xs space-y-4">
              <h2 className="font-editorial text-lg font-bold text-[#1f314d] border-b border-[#dfd7c8] pb-2">
                1. Journal Identity & Titles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Journal Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.journalTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, journalTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Journal Abbreviation
                  </label>
                  <input
                    type="text"
                    value={settingsForm.journalAbbr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, journalAbbr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Publisher Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.publisherName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, publisherName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Publisher Website (DOCK Foundation)
                  </label>
                  <input
                    type="url"
                    value={settingsForm.publisherWebsite}
                    onChange={(e) => setSettingsForm({ ...settingsForm, publisherWebsite: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                  <p className="text-[0.7rem] text-[#7a766e] mt-1">
                    Redirects to <a href="https://docknowledge.org" target="_blank" rel="noopener noreferrer" className="underline text-[#a45a40]">docknowledge.org</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Current Issue Info */}
            <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-6 rounded-sm shadow-xs space-y-4">
              <h2 className="font-editorial text-lg font-bold text-[#1f314d] border-b border-[#dfd7c8] pb-2">
                2. Current Issue Parameters
              </h2>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currentVolume}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currentVolume: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Issue Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currentIssue}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currentIssue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currentYear}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currentYear: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currentPeriod}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currentPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Issue Summary Description
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.issueDescription}
                  onChange={(e) => setSettingsForm({ ...settingsForm, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                />
              </div>
            </div>

            {/* Section 3: Publication Offices & Contacts */}
            <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-6 rounded-sm shadow-xs space-y-4">
              <h2 className="font-editorial text-lg font-bold text-[#1f314d] border-b border-[#dfd7c8] pb-2">
                3. Offices & Official Communication Emails
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Manuscript Submission Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.submissionEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, submissionEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    General Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Editorial & Publication Office Address
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.editorialOffice}
                    onChange={(e) => setSettingsForm({ ...settingsForm, editorialOffice: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Publisher Office Location
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.publisherLocation}
                    onChange={(e) => setSettingsForm({ ...settingsForm, publisherLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Subject Areas */}
            <div className="border border-[#d6cfc2] bg-[#f8f5ee] p-6 rounded-sm shadow-xs space-y-4">
              <h2 className="font-editorial text-lg font-bold text-[#1f314d] border-b border-[#dfd7c8] pb-2">
                4. Scope & Subject Areas ({settingsForm.subjectAreas.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {settingsForm.subjectAreas.map((area, idx) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ece5d7] border border-[#d6cfc2] rounded-full text-xs font-medium text-[#1f314d]"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          subjectAreas: settingsForm.subjectAreas.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#a45a40] hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md pt-2">
                <input
                  type="text"
                  placeholder="Add new subject area..."
                  value={newSubjectArea}
                  onChange={(e) => setNewSubjectArea(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSubjectArea.trim()) {
                      setSettingsForm({
                        ...settingsForm,
                        subjectAreas: [...settingsForm.subjectAreas, newSubjectArea.trim()],
                      });
                      setNewSubjectArea("");
                    }
                  }}
                  className="btn-secondary px-3 py-2 text-xs font-bold"
                >
                  Add Area
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmittingSettings}
                className="btn-primary px-7 py-3 text-sm font-bold shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingSettings ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>{isSubmittingSettings ? "Saving Changes..." : "Save All Changes"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 5: PDF UPLOADER ==================== */}
        {activeTab === "uploads" && (
          <div className="space-y-6 enter">
            <div>
              <h1 className="font-editorial text-2xl font-bold text-[#1f314d]">
                PDF File Uploader
              </h1>
              <p className="text-xs text-[#676a74]">
                Upload journal manuscripts and article PDFs directly into the system. You will receive a direct URL that can be assigned to any article.
              </p>
            </div>

            <div className="border-2 border-dashed border-[#cfc7b9] bg-[#f9f7f2] p-10 text-center rounded-sm">
              <Upload size={36} className="mx-auto text-[#a45a40] mb-3" />
              <h3 className="font-editorial text-lg font-bold text-[#1f314d]">
                Upload PDF Manuscript
              </h3>
              <p className="text-xs text-[#6e6a62] max-w-md mx-auto mt-1 mb-4">
                Select a PDF file from your device (up to 50 MB). It will be saved into the journal's public articles directory.
              </p>

              <label className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer shadow-sm">
                <FileUp size={15} /> Select PDF Document
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>

              {uploadingPdf && (
                <p className="mt-3 text-xs text-[#a45a40] font-semibold animate-pulse">
                  Uploading manuscript PDF to server...
                </p>
              )}
            </div>

            {articleForm.pdfUrl && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-xs text-emerald-800">
                <div className="min-w-0 flex-1">
                  <span className="font-bold">Latest Uploaded PDF URL: </span>
                  <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 ml-1 font-mono text-[0.72rem] break-all">
                    {articleForm.pdfUrl.startsWith("data:")
                      ? `Embedded PDF Stream (${Math.round(articleForm.pdfUrl.length / 1024)} KB)`
                      : articleForm.pdfUrl}
                  </code>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      openPdfPreview(articleForm.pdfUrl, articleForm.title || "Uploaded Manuscript PDF")
                    }
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#a45a40] border border-red-200 rounded text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                  >
                    <FileText size={13} /> View PDF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      safeOpenPdf(articleForm.pdfUrl, articleForm.title || "Uploaded Manuscript PDF")
                    }
                    className="btn-primary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                  >
                    <ExternalLink size={12} /> Open New Tab
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 6: GLOBAL DEPLOY & CLOUD SYNC ==================== */}
        {activeTab === "sync" && (
          <div className="space-y-8 enter">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="text-[#a45a40]" size={26} />
                <h1 className="font-editorial text-3xl font-bold text-[#1f314d]">
                  Global Deploy & Multi-Device Synchronization
                </h1>
              </div>
              <p className="text-sm text-[#5c5f69] mt-1 max-w-3xl">
                When editing in the admin panel on a static hosting platform like Vercel, changes are saved in this browser. Use the tools below to deploy your updates globally across every device, visitor, and session worldwide.
              </p>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#fdfbf7] border border-[#d6cfc2] rounded-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Current State</span>
                <p className="font-editorial text-xl font-bold text-[#1f314d] mt-1">
                  {articles.length} Articles · {people.length} Board Members
                </p>
                <p className="text-xs text-[#527d24] mt-0.5 font-semibold">Active in browser memory</p>
              </div>

              <div className="p-4 bg-[#fdfbf7] border border-[#d6cfc2] rounded-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Live GitHub Deployment</span>
                <p className="font-editorial text-xl font-bold text-[#1f314d] mt-1 truncate">
                  {syncConfig.githubRepo || "Civic-Knowledge-Hub"}
                </p>
                <p className="text-xs text-[#a45a40] mt-0.5 font-semibold">
                  Branch: {syncConfig.githubBranch || "main"}
                </p>
              </div>

              <div className="p-4 bg-[#fdfbf7] border border-[#d6cfc2] rounded-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736d]">Cloud Sync Database</span>
                <p className="font-editorial text-xl font-bold text-[#1f314d] mt-1 truncate">
                  {syncConfig.cloudUrl ? "Connected" : "Not Configured"}
                </p>
                <p className="text-xs text-[#6e6a62] mt-0.5">
                  {syncConfig.cloudUrl ? syncConfig.cloudUrl : "Optional instant multi-device sync"}
                </p>
              </div>
            </div>

            {/* SECTION 1: GITHUB & VERCEL AUTO-DEPLOY */}
            <div className="border border-[#d6cfc2] bg-[#fbf9f4] p-6 rounded-sm shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="text-[#1f314d]" size={20} />
                    <h2 className="font-editorial text-xl font-bold text-[#1f314d]">
                      Option 1: Deploy Directly to Live Website (GitHub & Vercel)
                    </h2>
                  </div>
                  <p className="text-xs text-[#676a74] mt-1">
                    This pushes your current articles and settings directly to your GitHub repository (<code className="font-mono bg-white px-1.5 py-0.5 border border-[#dfd7c9] rounded">krishnamanideep/Civic-Knowledge-Hub</code>). Vercel automatically detects the commit, runs the production build, and deploys it live to all visitors worldwide in ~60 seconds.
                  </p>
                </div>
                <span className="bg-[#527d24] text-white text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
                  Recommended
                </span>
              </div>

              {deploySuccessMsg && (
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-xs text-emerald-800">
                  {deploySuccessMsg}
                </div>
              )}

              {deployErrorMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-red-600 text-xs text-red-800">
                  {deployErrorMsg}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    GitHub Personal Access Token (Classic or Fine-Grained with "Contents: Read and write") *
                  </label>
                  <input
                    type="password"
                    value={githubTokenInput}
                    onChange={(e) => setGithubTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                  <p className="text-[0.7rem] text-[#6e6a62] mt-1">
                    Stored safely in your local browser only. Never shared with any third party. You can generate one at{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a45a40] underline font-semibold"
                    >
                      github.com/settings/tokens
                    </a>.
                  </p>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Repository
                  </label>
                  <input
                    type="text"
                    value={githubRepoInput}
                    onChange={(e) => setGithubRepoInput(e.target.value)}
                    placeholder="krishnamanideep/Civic-Knowledge-Hub"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={githubBranchInput}
                    onChange={(e) => setGithubBranchInput(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDeployToGitHub}
                  disabled={isDeployingGitHub}
                  className="btn-primary px-5 py-2.5 text-xs font-bold shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeployingGitHub ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                  <span>{isDeployingGitHub ? "Committing to GitHub..." : "🚀 Deploy Changes to Live Site"}</span>
                </button>
                <a
                  href={`https://github.com/${githubRepoInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={12} /> View GitHub Repository
                </a>
              </div>
            </div>

            {/* SECTION 2: INSTANT CLOUD SYNC */}
            <div className="border border-[#d6cfc2] bg-[#fbf9f4] p-6 rounded-sm shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <CloudUpload className="text-[#1f314d]" size={20} />
                  <h2 className="font-editorial text-xl font-bold text-[#1f314d]">
                    Option 2: Instant Cloud Database Sync (Zero Rebuild Wait Time)
                  </h2>
                </div>
                <p className="text-xs text-[#676a74] mt-1">
                  Connect a cloud JSON store (such as Firebase Realtime Database or a REST API). Whenever an admin saves on any device, it syncs immediately. Any other visitor opening the website loads the latest data instantly in under 1 second.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Cloud Database REST URL
                  </label>
                  <input
                    type="text"
                    value={cloudUrlInput}
                    onChange={(e) => setCloudUrlInput(e.target.value)}
                    placeholder="https://your-project.firebaseio.com/journal.json"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    API Key / Auth Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={cloudApiKeyInput}
                    onChange={(e) => setCloudApiKeyInput(e.target.value)}
                    placeholder="Optional Authorization token or API Key"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCloudSync}
                  disabled={isCloudSyncing}
                  className="btn-primary px-4 py-2 text-xs font-bold shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {isCloudSyncing ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{isCloudSyncing ? "Syncing..." : "Save & Sync to Cloud"}</span>
                </button>
              </div>
            </div>

            {/* SECTION 3: 1-CLICK BACKUP & TRANSFER */}
            <div className="border border-[#d6cfc2] bg-[#fbf9f4] p-6 rounded-sm shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <Download className="text-[#1f314d]" size={20} />
                  <h2 className="font-editorial text-xl font-bold text-[#1f314d]">
                    Option 3: 1-Click Export, Backup & Manual Data Transfer
                  </h2>
                </div>
                <p className="text-xs text-[#676a74] mt-1">
                  Export your complete journal data (all articles, people, and particulars) as a portable JSON file. You can import this file on any other phone, tablet, or browser to transfer everything instantly.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="btn-primary px-4 py-2.5 text-xs font-bold shadow flex items-center gap-2"
                >
                  <Download size={14} /> Download Journal Data (.JSON)
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="btn-secondary px-4 py-2.5 text-xs font-bold shadow flex items-center gap-2"
                >
                  <Copy size={14} /> Copy Complete JSON to Clipboard
                </button>
              </div>

              {/* Import Section */}
              <div className="pt-4 border-t border-[#dfd7c9] space-y-3">
                <span className="font-editorial text-base font-bold text-[#1f314d] block">
                  Import / Restore Journal Data
                </span>
                <p className="text-xs text-[#6e6a62]">
                  Select an exported JSON file or paste the JSON text below to update this device's journal data immediately:
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label className="btn-secondary px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                    <FileUp size={14} /> Choose JSON Backup File
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            if (content) handleImportJson(content);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-[#8c887f]">or paste raw JSON below:</span>
                </div>

                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste { &quot;settings&quot;: {...}, &quot;articles&quot;: [...], &quot;people&quot;: [...] } here..."
                  className="w-full p-3 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleImportJson()}
                    disabled={isImporting || !importJsonText.trim()}
                    className="btn-primary px-4 py-2 text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isImporting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    <span>Import and Apply to Website</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== ARTICLE MODAL (ADD / EDIT) ==================== */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#f7f4ec] border border-[#d6cfc2] rounded-sm shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden">
            <div className="p-5 border-b border-[#dfd7c8] bg-[#efe9dc] flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#1f314d]">
                  {editingArticleId ? "Edit Journal Article" : "Upload / Add New Journal Article"}
                </h3>
                <p className="text-xs text-[#6e6a62]">
                  Fill in article metadata, authors, and upload the full-text PDF document.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="text-2xl leading-none text-[#77736d] hover:text-[#1f314d]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={articleForm.serialNumber}
                    onChange={(e) => setArticleForm({ ...articleForm, serialNumber: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Section / Category *
                  </label>
                  <select
                    value={articleForm.section}
                    onChange={(e) => setArticleForm({ ...articleForm, section: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  >
                    <option value="Original Research Article">Original Research Article</option>
                    <option value="Review Article">Review Article</option>
                    <option value="Research Note">Research Note</option>
                    <option value="Policy Analysis">Policy Analysis</option>
                    <option value="Book Review">Book Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Article Title *
                </label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setArticleForm((prev) => ({
                      ...prev,
                      title,
                      slug: prev.slug && editingArticleId ? prev.slug : autoSlug,
                    }));
                  }}
                  placeholder="Enter full title of the paper..."
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm font-editorial font-bold"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                    placeholder="article-url-slug"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Page Range (e.g. 1–3 or 32–40)
                  </label>
                  <input
                    type="text"
                    value={articleForm.pages}
                    onChange={(e) => setArticleForm({ ...articleForm, pages: e.target.value })}
                    placeholder="1–10"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>

              {/* Volume & Issue */}
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">Volume</label>
                  <input
                    type="text"
                    value={articleForm.volume}
                    onChange={(e) => setArticleForm({ ...articleForm, volume: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">Issue</label>
                  <input
                    type="text"
                    value={articleForm.issue}
                    onChange={(e) => setArticleForm({ ...articleForm, issue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">Year</label>
                  <input
                    type="text"
                    value={articleForm.year}
                    onChange={(e) => setArticleForm({ ...articleForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">Status</label>
                  <select
                    value={articleForm.status}
                    onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* PDF Document Upload */}
              <div className="p-4 bg-[#eee8db] border border-[#d6cfc2] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold uppercase tracking-wider text-[#1f314d]">
                    Article PDF Document *
                  </label>
                  {articleForm.pdfUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openPdfPreview(articleForm.pdfUrl, articleForm.title || "Article Manuscript PDF")
                      }
                      className="text-xs font-bold text-[#a45a40] hover:underline inline-flex items-center gap-1"
                    >
                      <FileText size={12} /> Preview Attached PDF
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={articleForm.pdfUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, pdfUrl: e.target.value })}
                    placeholder="/articles/filename.pdf"
                    className="flex-1 px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs w-full"
                  />
                  <label className="btn-primary px-3 py-2 text-xs font-bold cursor-pointer shrink-0 inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
                    <Upload size={13} /> Upload PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                  </label>
                  {articleForm.pdfUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openPdfPreview(articleForm.pdfUrl, articleForm.title || "Article Manuscript PDF")
                      }
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-[#a45a40] border border-red-200 rounded text-xs font-bold shrink-0 inline-flex items-center gap-1 shadow-2xs"
                      title="Test view PDF"
                    >
                      <Eye size={13} /> View PDF
                    </button>
                  )}
                </div>
                {uploadingPdf && (
                  <p className="text-xs text-[#a45a40] font-semibold animate-pulse">Uploading file...</p>
                )}
              </div>

              {/* Authors Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#dfd7c8] pb-1">
                  <span className="font-editorial text-base font-bold text-[#1f314d]">
                    Authors List ({articleForm.authors.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAuthor}
                    className="btn-secondary px-2.5 py-1 text-[0.7rem] font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Another Author
                  </button>
                </div>

                {articleForm.authors.map((author, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-3 bg-white border border-[#d6cfc2] rounded-sm space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#a45a40] text-[0.72rem] uppercase tracking-wider">
                        Author {aIdx + 1}
                      </span>
                      {articleForm.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(aIdx)}
                          className="text-red-600 hover:text-red-800 text-[0.72rem] font-semibold"
                        >
                          Remove Author
                        </button>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.68rem] font-semibold text-[#555] mb-0.5">Author Name *</label>
                        <input
                          type="text"
                          required
                          value={author.name}
                          onChange={(e) => handleAuthorChange(aIdx, "name", e.target.value)}
                          placeholder="e.g. Dr. Jane Doe"
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#cfc7b9] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.68rem] font-semibold text-[#555] mb-0.5">Role / Title</label>
                        <input
                          type="text"
                          value={author.role || ""}
                          onChange={(e) => handleAuthorChange(aIdx, "role", e.target.value)}
                          placeholder="e.g. Professor / Faculty"
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#cfc7b9] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.68rem] font-semibold text-[#555] mb-0.5">Institution *</label>
                        <input
                          type="text"
                          required
                          value={author.institution}
                          onChange={(e) => handleAuthorChange(aIdx, "institution", e.target.value)}
                          placeholder="e.g. Andhra University, India"
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#cfc7b9] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.68rem] font-semibold text-[#555] mb-0.5">Email Address</label>
                        <input
                          type="email"
                          value={author.email || ""}
                          onChange={(e) => handleAuthorChange(aIdx, "email", e.target.value)}
                          placeholder="author@example.com"
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#cfc7b9] rounded-sm text-xs"
                        />
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-1.5 text-[0.72rem] text-[#333] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={author.isCorresponding || false}
                        onChange={(e) => handleAuthorChange(aIdx, "isCorresponding", e.target.checked)}
                      />
                      <span>Corresponding Author</span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Abstract */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Abstract *
                </label>
                <textarea
                  rows={5}
                  required
                  value={articleForm.abstract}
                  onChange={(e) => setArticleForm({ ...articleForm, abstract: e.target.value })}
                  placeholder="Enter full abstract of the manuscript..."
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-xs leading-relaxed"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="Governance, Political Science, Public Policy, Andhra Pradesh"
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#dfd7c8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingArticle}
                  className="btn-primary px-6 py-2 text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingArticle && <Loader2 size={13} className="animate-spin" />}
                  <span>
                    {isSubmittingArticle
                      ? "Saving..."
                      : editingArticleId
                      ? "Save Article Changes"
                      : "Publish Article to Website"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PERSON MODAL (ADD / EDIT) ==================== */}
      {isPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#f7f4ec] border border-[#d6cfc2] rounded-sm shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden">
            <div className="p-5 border-b border-[#dfd7c8] bg-[#efe9dc] flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#1f314d]">
                  {editingPersonId ? "Edit Person / Board Member" : "Add Editorial Board Member / Leader"}
                </h3>
                <p className="text-xs text-[#6e6a62]">
                  This will immediately reflect on the official Editorial Board page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPersonModalOpen(false)}
                className="text-2xl leading-none text-[#77736d] hover:text-[#1f314d]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={personForm.name}
                    onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                    placeholder="e.g. Dr. John Doe"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Category *
                  </label>
                  <select
                    value={personForm.category}
                    onChange={(e) =>
                      setPersonForm({ ...personForm, category: e.target.value as "leadership" | "board_member" })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  >
                    <option value="leadership">Editorial Leadership (Editor-in-Chief / Managing)</option>
                    <option value="board_member">Editorial Board Member</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Role in Journal *
                  </label>
                  <input
                    type="text"
                    required
                    value={personForm.role}
                    onChange={(e) => setPersonForm({ ...personForm, role: e.target.value })}
                    placeholder="e.g. Editorial Board Member or Editor-in-Chief"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Academic Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={personForm.designation}
                    onChange={(e) => setPersonForm({ ...personForm, designation: e.target.value })}
                    placeholder="e.g. Professor / Assistant Professor"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Qualifications (Optional)
                  </label>
                  <input
                    type="text"
                    value={personForm.qualifications || ""}
                    onChange={(e) => setPersonForm({ ...personForm, qualifications: e.target.value })}
                    placeholder="e.g. Ph.D., LL.M."
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    ORCID URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={personForm.orcid || ""}
                    onChange={(e) => setPersonForm({ ...personForm, orcid: e.target.value })}
                    placeholder="https://orcid.org/0000-..."
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={personForm.department || ""}
                  onChange={(e) => setPersonForm({ ...personForm, department: e.target.value })}
                  placeholder="e.g. Department of Political Science and Public Administration"
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Institution / Affiliation
                </label>
                <input
                  type="text"
                  value={personForm.institution || ""}
                  onChange={(e) => setPersonForm({ ...personForm, institution: e.target.value })}
                  placeholder="e.g. Andhra University, Visakhapatnam, Andhra Pradesh, India"
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    value={personForm.email || ""}
                    onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                    Secondary Email
                  </label>
                  <input
                    type="email"
                    value={personForm.secondaryEmail || ""}
                    onChange={(e) => setPersonForm({ ...personForm, secondaryEmail: e.target.value })}
                    placeholder="alt-email@example.com"
                    className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#494c55] mb-1">
                  Special Note or Position (Optional)
                </label>
                <input
                  type="text"
                  value={personForm.note || ""}
                  onChange={(e) => setPersonForm({ ...personForm, note: e.target.value })}
                  placeholder="e.g. State Executive Member, Human Rights Council"
                  className="w-full px-3 py-2 bg-white border border-[#cfc7b9] rounded-sm text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[#dfd7c8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPerson}
                  className="btn-primary px-6 py-2 text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPerson && <Loader2 size={13} className="animate-spin" />}
                  <span>
                    {isSubmittingPerson
                      ? "Saving..."
                      : editingPersonId
                      ? "Save Member Details"
                      : "Add to Editorial Board"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== INTERACTIVE PDF PREVIEW MODAL ==================== */}
      {previewPdfModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#f7f4ec] border border-[#d6cfc2] rounded-sm shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#dfd7c8] bg-[#efe9dc] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-red-100 text-red-700 shrink-0">
                    <FileText size={16} />
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-[#1f314d] truncate">
                    {previewPdfModal.title || "Full-Text PDF Manuscript"}
                  </h3>
                </div>
                <p className="text-[0.7rem] text-[#6e6a62] truncate mt-0.5 font-mono">
                  {previewPdfModal.url.startsWith("data:")
                    ? "Embedded PDF Manuscript"
                    : previewPdfModal.url.startsWith("idb://")
                    ? "Local Journal Vault Document"
                    : previewPdfModal.url}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    safeOpenPdf(previewPdfModal.resolvedUrl || previewPdfModal.url, previewPdfModal.title)
                  }
                  className="px-3 py-1.5 bg-white hover:bg-[#e8e2d2] border border-[#cfc7b9] text-[#1f314d] rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Open New Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    safeDownloadPdf(
                      previewPdfModal.resolvedUrl || previewPdfModal.url,
                      `${(previewPdfModal.title || "article").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
                    )
                  }
                  className="px-3 py-1.5 bg-[#1f314d] hover:bg-[#2c456b] text-white rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                  title="Download PDF"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPdfModal({ isOpen: false, url: "", resolvedUrl: "", title: "" })
                  }
                  className="p-1.5 rounded hover:bg-black/10 text-2xl leading-none text-[#555] ml-1"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body / Embedded PDF View */}
            <div className="flex-1 bg-[#2e2e2e] relative flex items-center justify-center overflow-hidden">
              {(previewPdfModal.resolvedUrl || previewPdfModal.url) ? (
                <iframe
                  src={previewPdfModal.resolvedUrl || previewPdfModal.url}
                  title={previewPdfModal.title || "PDF Preview"}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="text-center p-8 text-white">
                  <p className="text-sm font-semibold">No PDF document loaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 1-CLICK SYNC & GLOBAL DEPLOY MODAL ==================== */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#f7f4ec] border border-[#d6cfc2] rounded-sm shadow-2xl max-w-xl w-full p-6 space-y-5 my-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-800">
                  <RefreshCw size={22} className={isGlobalSyncing ? "animate-spin" : ""} />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#1f314d]">
                    ⚡ Deploy Changes Live to All Sessions
                  </h3>
                  <p className="text-xs text-[#6e6a62]">
                    Sync your articles & updates across every device and visitor worldwide
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="text-2xl leading-none text-[#77736d] hover:text-[#1f314d]"
              >
                ×
              </button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 space-y-1">
              <p className="font-bold">
                Ready to deploy {articles.length} articles and {people.length} board members to live production!
              </p>
              <p className="text-[0.72rem] text-emerald-800">
                To trigger the permanent Vercel global deployment across all sessions, enter your GitHub token once below. It will be stored in your browser so future syncs only take 1 click.
              </p>
            </div>

            {syncProgressMsg && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-600 text-xs text-blue-900 font-medium">
                {syncProgressMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase tracking-wider text-[#494c55]">
                    GitHub Personal Access Token (classic or fine-grained) *
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=JPSG%20Journal%20Deploy%20Token"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a45a40] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    Generate Token on GitHub ↗
                  </a>
                </div>
                <input
                  type="password"
                  value={githubTokenInput}
                  onChange={(e) => setGithubTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#cfc7b9] rounded-sm font-mono text-xs focus:outline-none focus:border-[#1f314d]"
                  autoFocus
                />
                <p className="text-[0.7rem] text-[#6e6a62] mt-1">
                  Stored securely in this browser only. Need a token? Click "Generate Token on GitHub" above (takes 20 seconds).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSync(githubTokenInput)}
                  disabled={isGlobalSyncing || !githubTokenInput.trim()}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold shadow flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 border-emerald-800 disabled:opacity-50 cursor-pointer"
                >
                  {isGlobalSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>{isGlobalSyncing ? "Deploying to Live Website..." : "🚀 Deploy Live to All Sessions"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="btn-secondary px-3 py-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  title="Copy JSON data to clipboard"
                >
                  <Copy size={13} /> Copy JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
