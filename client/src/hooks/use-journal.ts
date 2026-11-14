import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type JournalData,
  type JournalArticle,
  type InsertArticle,
  type JournalPerson,
  type InsertPerson,
  type JournalSettings,
} from "@shared/schema";
import { initialJournalData } from "@shared/default-data";
import { currentIssueArticles, setDynamicArticles } from "@/data/articles";
import { useEffect, useMemo } from "react";

const LOCAL_STORAGE_KEY = "jpsg_journal_data";

// Utility to deduplicate articles and people strictly
export function deduplicateJournalData(data: JournalData): JournalData {
  if (!data) return data;

  const seenArticleKeys = new Set<string>();
  const uniqueArticles: JournalArticle[] = [];
  for (const a of data.articles || []) {
    const slugKey = a.slug ? a.slug.toLowerCase().trim() : "";
    const serialKey = a.serialNumber ? a.serialNumber.trim() : "";
    const titleKey = a.title ? a.title.toLowerCase().trim() : "";
    const idKey = a.id ? a.id.trim() : "";

    const primaryKey = slugKey || serialKey || idKey || titleKey;
    if (!seenArticleKeys.has(primaryKey)) {
      seenArticleKeys.add(primaryKey);
      if (slugKey) seenArticleKeys.add(slugKey);
      if (serialKey) seenArticleKeys.add(`s-${serialKey}`);
      uniqueArticles.push(a);
    }
  }

  const seenPeopleKeys = new Set<string>();
  const uniquePeople: JournalPerson[] = [];
  for (const p of data.people || []) {
    const nameKey = `${p.category || "board_member"}-${(p.name || "").toLowerCase().trim()}`;
    const idKey = p.id ? `id-${p.id}` : "";
    if (!seenPeopleKeys.has(nameKey) && (!idKey || !seenPeopleKeys.has(idKey))) {
      seenPeopleKeys.add(nameKey);
      if (idKey) seenPeopleKeys.add(idKey);
      uniquePeople.push(p);
    }
  }

  return {
    settings: data.settings || initialJournalData.settings,
    articles: uniqueArticles,
    people: uniquePeople,
  };
}

// Helper to get local data safely with deduplication
export function getLocalJournalData(): JournalData {
  if (typeof window === "undefined") {
    return initialJournalData;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.articles) && Array.isArray(parsed.people) && parsed.settings) {
        const cleaned = deduplicateJournalData(parsed as JournalData);
        return cleaned;
      }
    }
  } catch (err) {
    console.warn("Could not read journal data from localStorage, falling back to initial data:", err);
  }
  // Initialize with initial data
  saveLocalJournalData(initialJournalData);
  return initialJournalData;
}

// Helper to save local data safely with deduplication
export function saveLocalJournalData(data: JournalData): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = deduplicateJournalData(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    setDynamicArticles(cleaned.articles);
  } catch (err) {
    console.warn("Could not write journal data to localStorage:", err);
  }
}

// Local mutations fallback helpers with deduplication
function localCreateArticle(article: InsertArticle): JournalArticle {
  const current = getLocalJournalData();
  const slug =
    article.slug?.trim() ||
    article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // Check if article already exists by slug or title (do not match solely on default serialNumber)
  const existingIdx = current.articles.findIndex(
    (a) =>
      (article.slug && a.slug.toLowerCase() === article.slug.toLowerCase()) ||
      a.slug.toLowerCase() === slug.toLowerCase() ||
      a.title.trim().toLowerCase() === article.title.trim().toLowerCase()
  );

  const maxSerial = current.articles.reduce((max, a) => {
    const num = parseInt(a.serialNumber, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  const nextNum = (maxSerial + 1).toString().padStart(2, "0");
  const serialAlreadyTaken = article.serialNumber && current.articles.some((a) => a.serialNumber === article.serialNumber);
  const serialNumber = existingIdx !== -1 ? current.articles[existingIdx].serialNumber : ((!article.serialNumber || serialAlreadyTaken) ? nextNum : article.serialNumber);
  const id = existingIdx !== -1 ? current.articles[existingIdx].id : serialNumber;

  const newArticle: JournalArticle = {
    ...article,
    id,
    slug,
    serialNumber,
    doi: article.doi || "",
    aliases: article.aliases || [],
    keywords: article.keywords || [],
    status: article.status || "published",
  };

  if (existingIdx !== -1) {
    current.articles[existingIdx] = newArticle;
  } else {
    current.articles.push(newArticle);
  }

  saveLocalJournalData(current);
  setDynamicArticles(current.articles);
  return newArticle;
}

function localUpdateArticle(id: string, updates: Partial<InsertArticle>): JournalArticle {
  const current = getLocalJournalData();
  const idx = current.articles.findIndex((a) => a.id === id || a.slug === id);
  if (idx === -1) {
    throw new Error(`Article with id ${id} not found`);
  }
  current.articles[idx] = {
    ...current.articles[idx],
    ...updates,
    id: current.articles[idx].id,
  };
  saveLocalJournalData(current);
  return current.articles[idx];
}

function localDeleteArticle(id: string): boolean {
  const current = getLocalJournalData();
  current.articles = current.articles.filter((a) => a.id !== id && a.slug !== id);
  saveLocalJournalData(current);
  return true;
}

function localCreatePerson(person: InsertPerson): JournalPerson {
  const current = getLocalJournalData();
  const existingIdx = current.people.findIndex(
    (p) =>
      p.category === person.category &&
      p.name.trim().toLowerCase() === person.name.trim().toLowerCase()
  );

  const prefix = person.category === "leadership" ? "lead" : "board";
  const id = existingIdx !== -1 ? current.people[existingIdx].id : `${prefix}-${Date.now()}`;
  const maxOrder = current.people.reduce((max, p) => Math.max(max, p.order || 0), 0);
  const order = person.order !== undefined && person.order !== 0 ? person.order : (existingIdx !== -1 ? current.people[existingIdx].order : maxOrder + 1);

  const newPerson: JournalPerson = {
    ...person,
    id,
    order,
    secondaryEmail: person.secondaryEmail || "",
    orcid: person.orcid || "",
    note: person.note || "",
    address: person.address || "",
  };

  if (existingIdx !== -1) {
    current.people[existingIdx] = newPerson;
  } else {
    current.people.push(newPerson);
  }

  saveLocalJournalData(current);
  return newPerson;
}

function localUpdatePerson(id: string, updates: Partial<InsertPerson>): JournalPerson {
  const current = getLocalJournalData();
  const idx = current.people.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new Error(`Person with id ${id} not found`);
  }
  current.people[idx] = {
    ...current.people[idx],
    ...updates,
    id: current.people[idx].id,
  };
  saveLocalJournalData(current);
  return current.people[idx];
}

function localDeletePerson(id: string): boolean {
  const current = getLocalJournalData();
  current.people = current.people.filter((p) => p.id !== id);
  saveLocalJournalData(current);
  return true;
}

function localReorderPeople(orderedIds: string[]): JournalPerson[] {
  const current = getLocalJournalData();
  const orderMap = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    orderMap.set(id, index + 1);
  });

  current.people = current.people.map((p) => {
    if (orderMap.has(p.id)) {
      return { ...p, order: orderMap.get(p.id)! };
    }
    return p;
  });

  current.people.sort((a, b) => a.order - b.order);
  saveLocalJournalData(current);
  return current.people;
}

function localUpdateSettings(updates: Partial<JournalSettings>): JournalSettings {
  const current = getLocalJournalData();
  current.settings = {
    ...current.settings,
    ...updates,
  };
  saveLocalJournalData(current);
  return current.settings;
}

function localResetData(): JournalData {
  saveLocalJournalData(initialJournalData);
  return initialJournalData;
}

export function useJournalData() {
  const query = useQuery<JournalData>({
    queryKey: ["journal-data"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/journal/data");
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = (await res.json()) as JournalData;
          if (data && Array.isArray(data.articles) && data.articles.length > 0) {
            const cleaned = deduplicateJournalData(data);
            saveLocalJournalData(cleaned);
            return cleaned;
          }
        }
      } catch {
        // Fetch failed, use local storage
      }
      return getLocalJournalData();
    },
    staleTime: 5000,
  });

  // Keep articles cache in sync
  useEffect(() => {
    if (query.data?.articles && query.data.articles.length > 0) {
      setDynamicArticles(query.data.articles);
    }
  }, [query.data?.articles]);

  return query;
}

export function useArticles(): { articles: JournalArticle[]; isLoading: boolean } {
  const { data, isLoading } = useJournalData();
  const rawArticles =
    data?.articles && data.articles.length > 0 ? data.articles : currentIssueArticles;

  // Guarantee strict deduplication in UI
  const articles = useMemo(() => {
    const seen = new Set<string>();
    const result: JournalArticle[] = [];
    for (const art of rawArticles) {
      const key = (art.slug || art.id || art.serialNumber || art.title).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(art);
      }
    }
    return result;
  }, [rawArticles]);

  return { articles, isLoading };
}

export function useArticle(slug: string) {
  const { articles, isLoading } = useArticles();
  const normalized = (slug || "").toLowerCase().trim();
  const article = articles.find(
    (a) =>
      a.slug.toLowerCase() === normalized ||
      a.id.toLowerCase() === normalized ||
      a.serialNumber.toLowerCase() === normalized ||
      a.aliases?.some((al) => al.toLowerCase() === normalized)
  );
  return { article, isLoading };
}

export function usePeople(): {
  leadership: JournalPerson[];
  boardMembers: JournalPerson[];
  allPeople: JournalPerson[];
  isLoading: boolean;
} {
  const { data, isLoading } = useJournalData();
  const rawPeople = data?.people || [];

  const allPeople = useMemo(() => {
    const seen = new Set<string>();
    const result: JournalPerson[] = [];
    for (const p of rawPeople) {
      const key = `${p.category || "board_member"}-${(p.name || "").toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
    return result;
  }, [rawPeople]);

  const leadership = useMemo(() => {
    return allPeople
      .filter((p) => p.category === "leadership")
      .sort((a, b) => a.order - b.order);
  }, [allPeople]);

  const boardMembers = useMemo(() => {
    return allPeople
      .filter((p) => p.category === "board_member")
      .sort((a, b) => a.order - b.order);
  }, [allPeople]);

  return { leadership, boardMembers, allPeople, isLoading };
}

export function useJournalSettings(): { settings: JournalSettings | undefined; isLoading: boolean } {
  const { data, isLoading } = useJournalData();
  return { settings: data?.settings, isLoading };
}

// ==================== ADMIN MUTATION HOOKS ====================

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["journal-data"] });
  };

  const syncCache = (updatedData: JournalData) => {
    saveLocalJournalData(updatedData);
    setDynamicArticles(updatedData.articles);
    queryClient.setQueryData(["journal-data"], updatedData);
  };

  const createArticle = useMutation({
    mutationFn: async (article: InsertArticle) => {
      let created: JournalArticle;
      try {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(article),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.message || `Server error (${res.status}) saving article`;
          if (errData.errors) {
            errMsg += ": " + Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join(", ");
          }
          throw new Error(errMsg);
        }
        created = (await res.json()) as JournalArticle;
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        created = localCreateArticle(article);
      }

      // Synchronously update local state & query cache
      const current = getLocalJournalData();
      const existingIdx = current.articles.findIndex(
        (a) => a.id === created.id || a.slug.toLowerCase() === created.slug.toLowerCase()
      );
      if (existingIdx !== -1) {
        current.articles[existingIdx] = created;
      } else {
        current.articles.push(created);
      }
      syncCache(current);
      return created;
    },
    onSuccess: invalidate,
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertArticle> }) => {
      let updated: JournalArticle;
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) updating article`);
        }
        updated = (await res.json()) as JournalArticle;
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        updated = localUpdateArticle(id, updates);
      }

      const current = getLocalJournalData();
      const idx = current.articles.findIndex((a) => a.id === id || a.slug === id);
      if (idx !== -1) {
        current.articles[idx] = updated;
      }
      syncCache(current);
      return updated;
    },
    onSuccess: invalidate,
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) deleting article`);
        }
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        localDeleteArticle(id);
      }

      const current = getLocalJournalData();
      current.articles = current.articles.filter((a) => a.id !== id && a.slug !== id);
      syncCache(current);
      return true;
    },
    onSuccess: invalidate,
  });

  const createPerson = useMutation({
    mutationFn: async (person: InsertPerson) => {
      let created: JournalPerson;
      try {
        const res = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(person),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.message || `Server error (${res.status}) saving person`;
          if (errData.errors) {
            errMsg += ": " + Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join(", ");
          }
          throw new Error(errMsg);
        }
        created = (await res.json()) as JournalPerson;
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        created = localCreatePerson(person);
      }

      const current = getLocalJournalData();
      const existingIdx = current.people.findIndex(
        (p) =>
          p.id === created.id ||
          (p.category === created.category && p.name.trim().toLowerCase() === created.name.trim().toLowerCase())
      );
      if (existingIdx !== -1) {
        current.people[existingIdx] = created;
      } else {
        current.people.push(created);
      }
      syncCache(current);
      return created;
    },
    onSuccess: invalidate,
  });

  const updatePerson = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertPerson> }) => {
      let updated: JournalPerson;
      try {
        const res = await fetch(`/api/people/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) updating person`);
        }
        updated = (await res.json()) as JournalPerson;
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        updated = localUpdatePerson(id, updates);
      }

      const current = getLocalJournalData();
      const idx = current.people.findIndex((p) => p.id === id);
      if (idx !== -1) {
        current.people[idx] = updated;
      }
      syncCache(current);
      return updated;
    },
    onSuccess: invalidate,
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/people/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) deleting person`);
        }
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        localDeletePerson(id);
      }

      const current = getLocalJournalData();
      current.people = current.people.filter((p) => p.id !== id);
      syncCache(current);
      return true;
    },
    onSuccess: invalidate,
  });

  const reorderPeople = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      let updated: JournalPerson[];
      try {
        const res = await fetch("/api/people/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) reordering people`);
        }
        updated = await res.json();
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        updated = localReorderPeople(orderedIds);
      }

      const current = getLocalJournalData();
      current.people = updated;
      syncCache(current);
      return updated;
    },
    onSuccess: invalidate,
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<JournalSettings>) => {
      let updated: JournalSettings;
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error (${res.status}) updating settings`);
        }
        updated = await res.json();
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        updated = localUpdateSettings(settings);
      }

      const current = getLocalJournalData();
      current.settings = updated;
      syncCache(current);
      return updated;
    },
    onSuccess: invalidate,
  });

  const resetData = useMutation({
    mutationFn: async () => {
      let reset: JournalData;
      try {
        const res = await fetch("/api/journal/reset", {
          method: "POST",
        });
        if (!res.ok) {
          throw new Error("Failed to reset journal data");
        }
        reset = await res.json().then((d) => d.data || d);
      } catch (err: any) {
        if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
          throw err;
        }
        reset = localResetData();
      }

      syncCache(reset);
      return reset;
    },
    onSuccess: invalidate,
  });

  return {
    createArticle,
    updateArticle,
    deleteArticle,
    createPerson,
    updatePerson,
    deletePerson,
    reorderPeople,
    updateSettings,
    resetData,
  };
}
