import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  limit,
  writeBatch,
  Firestore,
} from "firebase/firestore";
import { EntrepreneurProfile, LocalServicePartner } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  try {
    const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getFirestore(app);
  } catch {
    return null;
  }
}

export interface CachedFaqEntry {
  questionKey: string;
  section: string;
  answer: string;
  hits: number;
  updatedAt: string;
}

/**
 * Safely retrieves a cached FAQ response from Firestore if configured.
 * Returns null gracefully when Firebase env vars are absent or unreachable.
 */
export async function getCachedFaq(
  questionText: string,
  section: string
): Promise<CachedFaqEntry | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const normalizedKey = questionText.trim().toLowerCase().slice(0, 180);
    const faqRef = collection(db, "faq_cache");
    const q = query(
      faqRef,
      where("questionKey", "==", normalizedKey),
      where("section", "==", section),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const first = snapshot.docs[0];
    return first.data() as CachedFaqEntry;
  } catch {
    return null;
  }
}

/**
 * Safely saves a verified AI FAQ answer into Firestore cache for analytics & fast hits.
 */
export async function saveFaqCache(
  questionText: string,
  section: string,
  answer: string
): Promise<void> {
  const db = getDb();
  if (!db || !answer) return;

  try {
    const normalizedKey = questionText.trim().toLowerCase().slice(0, 180);
    await addDoc(collection(db, "faq_cache"), {
      questionKey: normalizedKey,
      section,
      answer,
      hits: 1,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Non-blocking fallback: ignore Firestore errors cleanly
  }
}

/**
 * Logs top searched query topics for Admin analytics (safe fallback).
 */
export async function logSearchTopic(
  topicQuery: string,
  section: string
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await addDoc(collection(db, "search_logs"), {
      query: topicQuery.slice(0, 200),
      section,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Ignore cleanly
  }
}

/**
 * Saves registered entrepreneur profile to Firestore (if configured).
 */
export async function saveEntrepreneurToFirestore(
  profile: EntrepreneurProfile
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await addDoc(collection(db, "registered_entrepreneurs"), profile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches registered entrepreneurs from Firestore (if configured).
 */
export async function fetchEntrepreneursFromFirestore(): Promise<EntrepreneurProfile[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, "registered_entrepreneurs"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as EntrepreneurProfile);
  } catch {
    return [];
  }
}

/**
 * Saves or updates a LocalServicePartner in Firestore (if configured).
 */
export async function saveServicePartnerToFirestore(
  partner: LocalServicePartner
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await setDoc(doc(db, "service_partners", partner.id), partner, { merge: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches all LocalServicePartners from Firestore (if configured).
 */
export async function fetchServicePartnersFromFirestore(): Promise<LocalServicePartner[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, "service_partners"), limit(300));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LocalServicePartner);
  } catch {
    return [];
  }
}

/**
 * Deletes a LocalServicePartner from Firestore (if configured).
 */
export async function deleteServicePartnerFromFirestore(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "service_partners", id));
    return true;
  } catch {
    return false;
  }
}

/**
 * Bulk-uploads all LocalServicePartners into Firestore `service_partners` collection
 * using chunked batches (max 400 writes per batch) so Admin can sync the entire
 * Maharashtra seed database to Firestore in one click whenever Firebase is enabled.
 */
export async function syncAllServicePartnersToFirestore(
  partners: LocalServicePartner[]
): Promise<{ ok: boolean; syncedCount: number; error?: string }> {
  const db = getDb();
  if (!db) {
    return {
      ok: false,
      syncedCount: 0,
      error: "Firebase Firestore अद्याप कॉन्फिगर केलेले नाही (NEXT_PUBLIC_FIREBASE_* व्हेरिएबल्स जोडा).",
    };
  }
  try {
    const chunkSize = 400;
    let syncedCount = 0;
    for (let i = 0; i < partners.length; i += chunkSize) {
      const chunk = partners.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const partner of chunk) {
        const cleanData = JSON.parse(JSON.stringify(partner)) as Record<string, unknown>;
        batch.set(doc(db, "service_partners", partner.id), cleanData, { merge: true });
      }
      await batch.commit();
      syncedCount += chunk.length;
    }
    return { ok: true, syncedCount };
  } catch (err) {
    return {
      ok: false,
      syncedCount: 0,
      error: err instanceof Error ? err.message : "Firestore सिंक करताना त्रुटी आली.",
    };
  }
}

