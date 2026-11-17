import { type JournalData } from "@shared/schema";

export interface CloudSyncConfig {
  cloudUrl?: string; // Firebase RTDB / Supabase / Remote REST endpoint
  cloudApiKey?: string;
  githubToken?: string;
  githubRepo?: string; // e.g. "krishnamanideep/Civic-Knowledge-Hub"
  githubBranch?: string; // e.g. "main"
  autoSyncToCloud?: boolean;
}

const SYNC_CONFIG_KEY = "jpsg_cloud_sync_config";

export function getCloudSyncConfig(): CloudSyncConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not parse cloud sync config:", err);
  }
  return {
    githubRepo: "krishnamanideep/Civic-Knowledge-Hub",
    githubBranch: "main",
    autoSyncToCloud: true,
  };
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("Could not save cloud sync config:", err);
  }
}

// Download formatted JSON file to computer
export function downloadJsonBackup(data: JournalData, filename?: string): void {
  try {
    const cleaned = data;
    const jsonStr = JSON.stringify(cleaned, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      filename ||
      `JPSG_Journal_Data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download JSON backup:", err);
    throw err;
  }
}

// Copy JSON string to clipboard
export async function copyJsonToClipboard(data: JournalData): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonStr);
      return true;
    }
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = jsonStr;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

// Validate and parse imported JSON string
export function parseImportedJson(rawText: string): JournalData {
  const parsed = JSON.parse(rawText);
  const data = parsed.record || parsed.data || parsed;
  if (!data || !Array.isArray(data.articles) || !Array.isArray(data.people) || !data.settings) {
    throw new Error(
      "Invalid Journal Data format: Missing settings, articles, or people collections."
    );
  }
  return data as JournalData;
}

// Push to Cloud Sync URL (e.g. Firebase Realtime DB, JSONBin, Upstash, or REST API)
export async function pushToCloudSyncUrl(data: JournalData, url?: string): Promise<boolean> {
  const config = getCloudSyncConfig();
  const targetUrl = url || config.cloudUrl;
  if (!targetUrl) {
    return false;
  }

  const cleanUrl = targetUrl.trim();
  // Support Firebase Realtime Database: if it doesn't end with .json, append .json
  let finalUrl = cleanUrl;
  if (cleanUrl.includes("firebaseio.com") && !cleanUrl.endsWith(".json")) {
    finalUrl = cleanUrl.replace(/\/+$/, "") + "/journal.json";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.cloudApiKey) {
    headers["X-Master-Key"] = config.cloudApiKey; // JSONBin
    headers["Authorization"] = `Bearer ${config.cloudApiKey}`;
  }

  const res = await fetch(finalUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // If PUT fails, try POST
    const postRes = await fetch(finalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!postRes.ok) {
      throw new Error(`Cloud Sync failed with HTTP status ${res.status} (${res.statusText})`);
    }
  }

  return true;
}

// Fetch from Cloud Sync URL
export async function fetchFromCloudSyncUrl(url?: string): Promise<JournalData | null> {
  const config = getCloudSyncConfig();
  const targetUrl = url || config.cloudUrl;
  if (!targetUrl) return null;

  let finalUrl = targetUrl.trim();
  if (finalUrl.includes("firebaseio.com") && !finalUrl.endsWith(".json")) {
    finalUrl = finalUrl.replace(/\/+$/, "") + "/journal.json";
  }

  const headers: Record<string, string> = {};
  if (config.cloudApiKey) {
    headers["X-Master-Key"] = config.cloudApiKey;
    headers["Authorization"] = `Bearer ${config.cloudApiKey}`;
  }

  const res = await fetch(finalUrl, { headers });
  if (!res.ok) return null;

  const data = await res.json();
  const payload = data.record || data.data || data;
  if (payload && Array.isArray(payload.articles) && payload.settings) {
    return payload as JournalData;
  }
  return null;
}

// GitHub API Direct Committer to trigger Vercel auto-deployment
export async function deployToGitHubRepo(
  data: JournalData,
  token: string,
  repo: string = "krishnamanideep/Civic-Knowledge-Hub",
  branch: string = "main"
): Promise<{ success: boolean; commitUrl?: string; message: string }> {
  if (!token || !token.trim()) {
    throw new Error("GitHub Personal Access Token is required to deploy to repository.");
  }

  const cleanToken = token.trim();
  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  // Helper to commit a file
  async function updateFile(filePath: string, newContentUtf8: string, commitMsg: string) {
    // 1. Get current SHA if file exists
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
        { headers }
      );
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
    } catch (e) {
      // file might not exist yet
    }

    // Convert UTF-8 to Base64 safely
    const utf8Bytes = new TextEncoder().encode(newContentUtf8);
    let binary = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    // 2. Put file
    const putRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: commitMsg,
          content: base64Content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(
        `GitHub API error on ${filePath}: ${errJson.message || putRes.statusText}`
      );
    }

    return await putRes.json();
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const tsDefaultDataContent = `import { type JournalData } from "@shared/schema";\n\nexport const initialJournalData: JournalData = ${jsonContent};\n`;
  const tsArticlesContent = `import { type JournalArticle, type Author } from "@shared/schema";\nexport type { JournalArticle, Author };\n\nexport const currentIssueArticles: JournalArticle[] = ${JSON.stringify(
    data.articles,
    null,
    2
  )};\n\nlet _dynamicArticles: JournalArticle[] = currentIssueArticles;\n\nexport function setDynamicArticles(articles: JournalArticle[]) {\n  if (Array.isArray(articles) && articles.length > 0) {\n    const seen = new Set<string>();\n    const unique: JournalArticle[] = [];\n    for (const a of articles) {\n      const key = (a.slug || a.id || a.serialNumber || a.title).toLowerCase().trim();\n      if (!seen.has(key)) {\n        seen.add(key);\n        unique.push(a);\n      }\n    }\n    _dynamicArticles = unique;\n  }\n}\n\nexport function getDynamicArticles(): JournalArticle[] {\n  return _dynamicArticles;\n}\n\nexport function getArticleBySlug(slug: string, customList?: JournalArticle[]): JournalArticle | undefined {\n  if (!slug) return undefined;\n  const normalized = slug.toLowerCase().trim();\n  const list = customList || _dynamicArticles;\n  return list.find(\n    (a) =>\n      a.slug.toLowerCase() === normalized ||\n      a.id.toLowerCase() === normalized ||\n      a.serialNumber.toLowerCase() === normalized ||\n      a.aliases?.some((alias) => alias.toLowerCase() === normalized),\n  );\n}\n\nexport function getCitation(\n  article: JournalArticle,\n  style: "APA" | "MLA" | "Chicago" | "BibTeX",\n): string {\n  const authorNames = article.authors.map((a) => a.name).join(", ");\n  const doiSuffix = article.doi && !article.doi.includes("10.XXXXX") ? \` \${article.doi}\` : "";\n  switch (style) {\n    case "APA":\n      return \`\${authorNames} (\${article.year}). \${article.title}. Journal of Politics, Society and Governance, 1(1), \${article.pages}.\${doiSuffix}\`;\n    case "MLA":\n      return \`\${authorNames}. "\${article.title}." Journal of Politics, Society and Governance, vol. 1, no. 1, \${article.year}, pp. \${article.pages}.\`;\n    case "Chicago":\n      return \`\${authorNames}. "\${article.title}." Journal of Politics, Society and Governance 1, no. 1 (\${article.year}): \${article.pages}.\${doiSuffix}\`;\n    case "BibTeX":\n      return \`@article{jpsg_\${article.id}_\${article.year},\n  title={\${article.title}},\n  author={\${authorNames}},\n  journal={Journal of Politics, Society and Governance},\n  volume={1},\n  number={1},\n  pages={\${article.pages}},\n  year={\${article.year}},\n  publisher={Democratic Organisation for Civic Knowledge Foundation}\n}\`;\n  }\n}\n`;

  // Update server/data/journal-data.json
  const resultJson = await updateFile(
    "server/data/journal-data.json",
    jsonContent,
    `Admin Global Live Sync: Update journal-data.json (${data.articles.length} articles, ${data.people.length} board members)`
  );

  // Update shared/default-data.ts
  await updateFile(
    "shared/default-data.ts",
    tsDefaultDataContent,
    `Admin Global Live Sync: Update shared/default-data.ts (${data.articles.length} articles)`
  );

  // Update client/src/data/articles.ts
  await updateFile(
    "client/src/data/articles.ts",
    tsArticlesContent,
    `Admin Global Live Sync: Update client/src/data/articles.ts (${data.articles.length} articles)`
  );

  return {
    success: true,
    commitUrl: resultJson.commit?.html_url,
    message:
      "Successfully committed changes to GitHub repository! Vercel is now building and deploying your updates live to all sessions worldwide.",
  };
}

// Master 1-Click Sync Helper: syncs to backend API and deploys to GitHub / Vercel
export async function syncToLiveWebsite(
  data: JournalData,
  token?: string,
  repo: string = "krishnamanideep/Civic-Knowledge-Hub",
  branch: string = "main"
): Promise<{
  success: boolean;
  serverSynced: boolean;
  githubDeployed: boolean;
  commitUrl?: string;
  message: string;
}> {
  let serverSynced = false;
  let githubDeployed = false;
  let commitUrl: string | undefined = undefined;

  // 1. Immediately sync with active serverless backend API
  try {
    const res = await fetch("/api/journal/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (res.ok) {
      serverSynced = true;
    }
  } catch (err) {
    console.warn("Backend /api/journal/sync not reachable:", err);
  }

  // 2. Also push to Cloud URL if configured
  try {
    await pushToCloudSyncUrl(data);
  } catch (err) {
    console.warn("Push to cloud URL failed:", err);
  }

  // 3. Commit to GitHub to trigger global Vercel production deployment
  const cleanToken = (token || getCloudSyncConfig().githubToken || "").trim();
  if (cleanToken) {
    const ghRes = await deployToGitHubRepo(data, cleanToken, repo, branch);
    githubDeployed = ghRes.success;
    commitUrl = ghRes.commitUrl;
    return {
      success: true,
      serverSynced,
      githubDeployed: true,
      commitUrl,
      message:
        "Changes deployed! Committed to GitHub repository. Vercel is building and updating all edge sessions worldwide (~60s).",
    };
  }

  return {
    success: serverSynced,
    serverSynced,
    githubDeployed: false,
    message: serverSynced
      ? "Synchronized with live backend API! (To trigger a permanent worldwide Vercel redeployment for all sessions, provide a GitHub token)."
      : "Saved locally. Enter a GitHub token to deploy globally to all sessions.",
  };
}
