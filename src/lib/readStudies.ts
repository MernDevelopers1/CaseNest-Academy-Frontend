// Helper for managing and persisting "Mark as Read" state for student case studies in localStorage.

const STORAGE_PREFIX = "casenest_read_studies_";

export function getReadStudyIds(userId: number | null | undefined): Set<number> {
  if (typeof window === "undefined" || !userId) return new Set();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(Number).filter((n) => !isNaN(n)));
    }
  } catch (err) {
    console.warn("Failed to load read study state from localStorage:", err);
  }
  return new Set();
}

export function isStudyRead(userId: number | null | undefined, caseStudyId: number): boolean {
  if (!userId || !caseStudyId) return false;
  const readSet = getReadStudyIds(userId);
  return readSet.has(caseStudyId);
}

export function toggleStudyRead(userId: number | null | undefined, caseStudyId: number): boolean {
  if (typeof window === "undefined" || !userId || !caseStudyId) return false;
  try {
    const readSet = getReadStudyIds(userId);
    const wasRead = readSet.has(caseStudyId);
    if (wasRead) {
      readSet.delete(caseStudyId);
    } else {
      readSet.add(caseStudyId);
    }
    localStorage.setItem(
      `${STORAGE_PREFIX}${userId}`,
      JSON.stringify(Array.from(readSet))
    );
    // Dispatch custom event so other components or tabs can re-sync immediately
    window.dispatchEvent(new CustomEvent("casenest:read-studies-changed", { detail: { userId, caseStudyId, isRead: !wasRead } }));
    return !wasRead;
  } catch (err) {
    console.warn("Failed to save read study state to localStorage:", err);
    return false;
  }
}
