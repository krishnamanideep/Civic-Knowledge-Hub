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
import { useEffect } from "react";

const LOCAL_STORAGE_KEY = "jpsg_journal_data";

// Helper to get local data safely
export function getLocalJournalData(): JournalData {
  if (typeof window === "undefined") {
    return initialJournalData;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.articles) && Array.isArray(parsed.people) && parsed.settings) {
        return parsed as JournalData;
      }
    }
  } catch (err) {
    console.warn("Could not read journal data from localStorage, falling back to initial data:", err);
  }
  // Initialize with initial data
  saveLocalJournalData(initialJournalData);
  return initialJournalData;
}

// Helper to save local data safely
export function saveLocalJournalData(data: JournalData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    setDynamicArticles(data.articles);
  } catch (err) {
    console.warn("Could not write journal data to localStorage:", err);
  }
}

// Local mutations fallback helpers
function localCreateArticle(article: InsertArticle): JournalArticle {
  const current = getLocalJournalData();
  const id = article.serialNumber || String(Date.now());
  const newArticle: JournalArticle = {
    ...article,
    id,
    doi: article.doi || "",
    aliases: article.aliases || [],
    keywords: article.keywords || [],
  };
  current.articles.push(newArticle);
  saveLocalJournalData(current);
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
  const id = `${person.category === "leadership" ? "lead" : "board"}-${Date.now()}`;
  const newPerson: JournalPerson = {
    ...person,
    id,
    secondaryEmail: person.secondaryEmail || "",
    orcid: person.orcid || "",
    note: person.note || "",
    address: person.address || "",
    order: person.order ?? current.people.length + 1,
  };
  current.people.push(newPerson);
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
            saveLocalJournalData(data);
            return data;
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
  const articles =
    data?.articles && data.articles.length > 0 ? data.articles : currentIssueArticles;
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
  const allPeople = data?.people || [];

  const leadership = allPeople
    .filter((p) => p.category === "leadership")
    .sort((a, b) => a.order - b.order);

  const boardMembers = allPeople
    .filter((p) => p.category === "board_member")
    .sort((a, b) => a.order - b.order);

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

  const createArticle = useMutation({
    mutationFn: async (article: InsertArticle) => {
      try {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(article),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const created = await res.json();
          // Also sync to local storage
          const current = getLocalJournalData();
          current.articles.push(created);
          saveLocalJournalData(current);
          return created;
        }
      } catch {
        // Fallback to local storage
      }
      return localCreateArticle(article);
    },
    onSuccess: invalidate,
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertArticle> }) => {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const updated = await res.json();
          const current = getLocalJournalData();
          const idx = current.articles.findIndex((a) => a.id === id);
          if (idx !== -1) {
            current.articles[idx] = updated;
            saveLocalJournalData(current);
          }
          return updated;
        }
      } catch {
        // Fallback to local storage
      }
      return localUpdateArticle(id, updates);
    },
    onSuccess: invalidate,
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const current = getLocalJournalData();
          current.articles = current.articles.filter((a) => a.id !== id);
          saveLocalJournalData(current);
          return true;
        }
      } catch {
        // Fallback to local storage
      }
      return localDeleteArticle(id);
    },
    onSuccess: invalidate,
  });

  const createPerson = useMutation({
    mutationFn: async (person: InsertPerson) => {
      try {
        const res = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(person),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const created = await res.json();
          const current = getLocalJournalData();
          current.people.push(created);
          saveLocalJournalData(current);
          return created;
        }
      } catch {
        // Fallback to local storage
      }
      return localCreatePerson(person);
    },
    onSuccess: invalidate,
  });

  const updatePerson = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertPerson> }) => {
      try {
        const res = await fetch(`/api/people/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const updated = await res.json();
          const current = getLocalJournalData();
          const idx = current.people.findIndex((p) => p.id === id);
          if (idx !== -1) {
            current.people[idx] = updated;
            saveLocalJournalData(current);
          }
          return updated;
        }
      } catch {
        // Fallback to local storage
      }
      return localUpdatePerson(id, updates);
    },
    onSuccess: invalidate,
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/people/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const current = getLocalJournalData();
          current.people = current.people.filter((p) => p.id !== id);
          saveLocalJournalData(current);
          return true;
        }
      } catch {
        // Fallback to local storage
      }
      return localDeletePerson(id);
    },
    onSuccess: invalidate,
  });

  const reorderPeople = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      try {
        const res = await fetch("/api/people/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const updated = await res.json();
          const current = getLocalJournalData();
          current.people = updated;
          saveLocalJournalData(current);
          return updated;
        }
      } catch {
        // Fallback to local storage
      }
      return localReorderPeople(orderedIds);
    },
    onSuccess: invalidate,
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<JournalSettings>) => {
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const updated = await res.json();
          const current = getLocalJournalData();
          current.settings = updated;
          saveLocalJournalData(current);
          return updated;
        }
      } catch {
        // Fallback to local storage
      }
      return localUpdateSettings(settings);
    },
    onSuccess: invalidate,
  });

  const resetData = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/journal/reset", {
          method: "POST",
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const reset = await res.json();
          saveLocalJournalData(reset);
          return reset;
        }
      } catch {
        // Fallback to local storage
      }
      return localResetData();
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
