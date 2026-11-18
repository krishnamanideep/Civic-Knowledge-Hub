/**
 * IndexedDB-backed PDF & manuscript storage for client-side persistence.
 * Solves browser localStorage 5MB quota limits and browser data-URL navigation security blocks.
 */

const DB_NAME = "JPSG_PDF_CACHE";
const DB_VERSION = 1;
const STORE_NAME = "manuscript_pdfs";

// In-memory cache of resolved blob URLs so previewing and opening is synchronous & instant
const memoryBlobUrls = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts a data:application/pdf;base64,... string to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Saves a PDF File, Blob, or base64 data URL into IndexedDB.
 * Returns a permanent reference URI: "idb://pdf/<key>"
 */
export async function savePdfToIndexedDB(key: string, data: File | Blob | string): Promise<string> {
  if (typeof window === "undefined") return "";

  let blob: Blob;
  if (typeof data === "string") {
    if (data.startsWith("data:")) {
      blob = dataUrlToBlob(data);
    } else {
      // It's a standard URL path, no need to store in IndexedDB
      return data;
    }
  } else {
    blob = data;
  }

  // Create & store active in-memory blob URL
  const blobUrl = URL.createObjectURL(blob);
  memoryBlobUrls.set(key, blobUrl);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);

      req.onsuccess = () => resolve(`idb://pdf/${key}`);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not save PDF to IndexedDB, falling back to memory:", err);
    return `idb://pdf/${key}`;
  }
}

/**
 * Resolves any PDF reference (idb://, data:, or server /articles/ path)
 * into a safe, browser-renderable URL.
 */
export async function resolvePdfUrl(pdfUrlOrRef: string, fallbackKey?: string): Promise<string> {
  if (!pdfUrlOrRef) return "/articles/JPSG_Manuscript_Sample.pdf";

  // Check in-memory blob cache
  if (fallbackKey && memoryBlobUrls.has(fallbackKey)) {
    return memoryBlobUrls.get(fallbackKey)!;
  }
  if (memoryBlobUrls.has(pdfUrlOrRef)) {
    return memoryBlobUrls.get(pdfUrlOrRef)!;
  }

  // If it's a data URL, convert to Blob URL on the fly
  if (pdfUrlOrRef.startsWith("data:")) {
    try {
      const blob = dataUrlToBlob(pdfUrlOrRef);
      const blobUrl = URL.createObjectURL(blob);
      if (fallbackKey) memoryBlobUrls.set(fallbackKey, blobUrl);
      return blobUrl;
    } catch (err) {
      console.warn("Failed to convert data URL to Blob:", err);
    }
  }

  // If it's an IndexedDB reference (idb://pdf/<key>)
  if (pdfUrlOrRef.startsWith("idb://pdf/") || fallbackKey) {
    const key = pdfUrlOrRef.startsWith("idb://pdf/")
      ? pdfUrlOrRef.replace("idb://pdf/", "")
      : (fallbackKey || "");

    if (key) {
      try {
        const db = await openDatabase();
        const blob: Blob | undefined = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        });

        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          memoryBlobUrls.set(key, blobUrl);
          memoryBlobUrls.set(pdfUrlOrRef, blobUrl);
          return blobUrl;
        }
      } catch (err) {
        console.warn("Failed to retrieve PDF from IndexedDB:", err);
      }
    }

    // If IndexedDB did not contain the blob (e.g. when opening from another device/session),
    // attempt to fetch from Firebase cloud storage before falling back
    if (pdfUrlOrRef.startsWith("idb://") && key) {
      try {
        const cloudUrl = `https://jspg-6a797-default-rtdb.asia-southeast1.firebasedatabase.app/pdfs/${key}.json`;
        const res = await fetch(cloudUrl);
        if (res.ok) {
          const payload = await res.json();
          if (payload && payload.dataUrl) {
            const blob = dataUrlToBlob(payload.dataUrl);
            const blobUrl = URL.createObjectURL(blob);
            memoryBlobUrls.set(key, blobUrl);
            memoryBlobUrls.set(pdfUrlOrRef, blobUrl);
            savePdfToIndexedDB(key, blob).catch(console.warn);
            return blobUrl;
          }
        }
      } catch (cloudErr) {
        console.warn("Could not retrieve cloud PDF for key:", key, cloudErr);
      }

      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("voting")) {
        return "/articles/06_Voting_Behaviour_in_India_Caste_System.pdf";
      } else if (lowerKey.includes("artisan") || lowerKey.includes("digital-inclusion") || lowerKey.includes("05")) {
        return "/articles/JPSG_Digital_Inclusion_Artisans_AP_Full_Paper.pdf";
      } else if (lowerKey.includes("environmental") || lowerKey.includes("04")) {
        return "/articles/JPSG_Environmental_Governance_in_India.pdf";
      } else if (lowerKey.includes("microfinance") || lowerKey.includes("03")) {
        return "/articles/JPSG_Microfinance_Women_SHGs_Guntur.pdf";
      } else if (lowerKey.includes("consciousness") || lowerKey.includes("harmony") || lowerKey.includes("02")) {
        return "/articles/JPSG_Global_Harmony_Through_Consciousness.pdf";
      } else if (lowerKey.includes("heroic") || lowerKey.includes("01")) {
        return "/articles/JPSG_Beyond_the_Heroic_Narrative_Women_AP.pdf";
      }
      return "/articles/JPSG_Manuscript_Sample.pdf";
    }
  }

  // If it's a Firebase RTDB cloud PDF endpoint (e.g. https://.../pdfs/<key>.json)
  if (pdfUrlOrRef.includes("/pdfs/") && pdfUrlOrRef.endsWith(".json")) {
    try {
      const res = await fetch(pdfUrlOrRef);
      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.dataUrl) {
          const blob = dataUrlToBlob(payload.dataUrl);
          const blobUrl = URL.createObjectURL(blob);
          memoryBlobUrls.set(pdfUrlOrRef, blobUrl);
          if (fallbackKey) {
            memoryBlobUrls.set(fallbackKey, blobUrl);
            savePdfToIndexedDB(fallbackKey, blob).catch(console.warn);
          }
          return blobUrl;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch cloud PDF from Firebase:", err);
    }
    return "/articles/JPSG_Manuscript_Sample.pdf";
  }

  // If it's already an absolute or relative server URL
  return pdfUrlOrRef || "/articles/JPSG_Manuscript_Sample.pdf";
}

/**
 * Universal safe function to open any article PDF in a new browser tab without
 * getting blocked by browser top-frame data URL restrictions.
 */
export async function safeOpenPdf(pdfUrlOrRef: string, title?: string, fallbackKey?: string): Promise<void> {
  if (typeof window === "undefined") return;

  const resolved = await resolvePdfUrl(pdfUrlOrRef, fallbackKey);

  // Attempt window.open with the safe resolved URL
  const win = window.open(resolved, "_blank", "noopener,noreferrer");
  if (!win) {
    // Pop-up blocker triggered: fall back to downloading
    safeDownloadPdf(resolved, `${(title || "article").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
  }
}

/**
 * Universal safe function to download an article PDF with a clean filename.
 */
export async function safeDownloadPdf(pdfUrlOrRef: string, filename: string, fallbackKey?: string): Promise<void> {
  if (typeof window === "undefined") return;

  const resolved = await resolvePdfUrl(pdfUrlOrRef, fallbackKey);
  const a = document.createElement("a");
  a.href = resolved;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
