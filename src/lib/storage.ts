import { EntrepreneurProfile, LocalServicePartner } from "@/types";
import { SEED_SERVICE_PARTNERS } from "@/data/service-partners";

export const PROFILE_STORAGE_KEY = "udhyogAghadiProfile";
export const AUTH_STORAGE_KEY = "udhyogAghadiAuth";
export const PARTICLES_STORAGE_KEY = "udhyogAghadiParticles";
export const USERS_REGISTRY_KEY = "udhyogAghadiUsersRegistry";
export const SERVICE_PARTNERS_KEY = "udhyogAghadiServicePartners";
export const SERVICE_PARTNERS_VERSION_KEY = "udhyogAghadiServicePartnersVersion";
export const CURRENT_PARTNERS_SEED_VERSION = "v3-maharashtra-167";

export interface AuthSession {
  role: "entrepreneur" | "admin";
  name: string;
  loggedInAt: string;
}

export function loadProfile(): EntrepreneurProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EntrepreneurProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: EntrepreneurProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    saveToUsersRegistry(profile);
  } catch {
    // Ignore storage errors
  }
}

export function loadAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors
  }
}

const SEED_ENTREPRENEURS: EntrepreneurProfile[] = [
  {
    name: "राजेश विठ्ठलराव पाटील",
    mobile: "9822145670",
    district: "पुणे (Pune)",
    caste: "मराठा (SEBC / EWS)",
    sector: "उत्पादन (Manufacturing)",
    stage: "लघु उद्योग (Small - ₹10 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-26-0045123",
    updatedAt: "2026-03-10T10:30:00.000Z",
  },
  {
    name: "सुनीता गणेश भोंडवे",
    mobile: "9423589120",
    district: "सातारा (Satara)",
    caste: "इतर मागासवर्गीय (OBC)",
    sector: "कृषी-प्रक्रिया (Agro-Processing)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-30-0012894",
    updatedAt: "2026-03-12T14:15:00.000Z",
  },
  {
    name: "अमित प्रकाश कांबळे",
    mobile: "9975412389",
    district: "कोल्हापूर (Kolhapur)",
    caste: "अनुसूचित जाती (SC)",
    sector: "उत्पादन (Manufacturing)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-19-0034112",
    updatedAt: "2026-03-14T09:40:00.000Z",
  },
  {
    name: "पूजा संदीप कुलकर्णी",
    mobile: "9890123456",
    district: "मुंबई उपनगर (Mumbai Suburban)",
    caste: "खुला / सर्वसाधारण (General)",
    sector: "आयटी / स्टार्टअप (IT / Startup)",
    stage: "नवीन कल्पना / सुरू करायचा आहे (New Idea)",
    updatedAt: "2026-03-15T11:20:00.000Z",
  },
  {
    name: "विलास नामदेव वाघमारे",
    mobile: "9763214587",
    district: "छत्रपती संभाजीनगर (Chh. Sambhajinagar)",
    caste: "मराठा (SEBC / EWS)",
    sector: "उत्पादन (Manufacturing)",
    stage: "लघु उद्योग (Small - ₹10 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-04-0021458",
    updatedAt: "2026-03-16T16:05:00.000Z",
  },
  {
    name: "दीपक किसन राठोड",
    mobile: "9552147896",
    district: "नांदेड (Nanded)",
    caste: "विमुक्त जाती व भटक्या जमाती (VJNT)",
    sector: "किरकोळ / घाऊक व्यापार (Retail / Trading)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    updatedAt: "2026-03-18T13:45:00.000Z",
  },
  {
    name: "रेश्मा इक्बाल तांबोळी",
    mobile: "9860234561",
    district: "सोलापूर (Solapur)",
    caste: "अल्पसंख्याक (Minority)",
    sector: "महिला बचत गट / गृहउद्योग (Women SHG)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    updatedAt: "2026-03-19T10:10:00.000Z",
  },
  {
    name: "संजय तुकाराम नाईक",
    mobile: "9404123890",
    district: "सिंधुदुर्ग (Sindhudurg)",
    caste: "विशेष मागास प्रवर्ग (SBC)",
    sector: "कृषी-प्रक्रिया (Agro-Processing)",
    stage: "नवीन कल्पना / सुरू करायचा आहे (New Idea)",
    updatedAt: "2026-03-20T12:30:00.000Z",
  },
  {
    name: "किरण बाळकृष्ण मडावी",
    mobile: "9158472390",
    district: "गडचिरोली (Gadchiroli)",
    caste: "अनुसूचित जमाती (ST)",
    sector: "उत्पादन (Manufacturing)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    updatedAt: "2026-03-21T15:00:00.000Z",
  },
  {
    name: "महेश रमेश सोनवणे",
    mobile: "9823014785",
    district: "नाशिक (Nashik)",
    caste: "इतर मागासवर्गीय (OBC)",
    sector: "सेवा क्षेत्र (Services)",
    stage: "लघु उद्योग (Small - ₹10 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-23-0056781",
    updatedAt: "2026-03-22T17:15:00.000Z",
  },
  {
    name: "प्रमोद सुधाकर देशमुख",
    mobile: "9765891234",
    district: "अमरावती (Amravati)",
    caste: "मराठा (SEBC / EWS)",
    sector: "कृषी-प्रक्रिया (Agro-Processing)",
    stage: "लघु उद्योग (Small - ₹10 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-03-0019845",
    updatedAt: "2026-03-23T11:40:00.000Z",
  },
  {
    name: "भाग्यश्री विनोद जोशी",
    mobile: "9922456789",
    district: "नागपूर (Nagpur)",
    caste: "खुला / सर्वसाधारण (General)",
    sector: "महिला बचत गट / गृहउद्योग (Women SHG)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    updatedAt: "2026-03-24T09:20:00.000Z",
  },
  {
    name: "संतोष दादाराव गायकवाड",
    mobile: "9822987654",
    district: "जालना (Jalna)",
    caste: "अनुसूचित जाती (SC)",
    sector: "उत्पादन (Manufacturing)",
    stage: "मध्यम उद्योग (Medium - ₹50 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-18-0078912",
    updatedAt: "2026-03-25T14:50:00.000Z",
  },
  {
    name: "नितीन पांडुरंग शिंदे",
    mobile: "9422334455",
    district: "अहिल्यानगर (Ahilyanagar)",
    caste: "मराठा (SEBC / EWS)",
    sector: "सेवा क्षेत्र (Services)",
    stage: "सूक्ष्म उद्योग (Micro - ₹1 Cr पर्यंत)",
    updatedAt: "2026-03-26T16:30:00.000Z",
  },
  {
    name: "शबाना रफिक शेख",
    mobile: "9890887766",
    district: "ठाणे (Thane)",
    caste: "अल्पसंख्याक (Minority)",
    sector: "किरकोळ / घाऊक व्यापार (Retail / Trading)",
    stage: "लघु उद्योग (Small - ₹10 Cr पर्यंत)",
    udyamNumber: "UDYAM-MH-33-0091245",
    updatedAt: "2026-03-27T10:05:00.000Z",
  },
];

export function saveToUsersRegistry(profile: EntrepreneurProfile): void {
  if (typeof window === "undefined" || !profile.name) return;
  try {
    const existing = loadAllRegisteredEntrepreneurs();
    const filtered = existing.filter(
      (p) =>
        p.name.trim().toLowerCase() !== profile.name.trim().toLowerCase() &&
        (!p.mobile || p.mobile !== profile.mobile)
    );
    const updated = [profile, ...filtered];
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function loadAllRegisteredEntrepreneurs(): EntrepreneurProfile[] {
  if (typeof window === "undefined") return SEED_ENTREPRENEURS;
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (!raw) {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(SEED_ENTREPRENEURS));
      return SEED_ENTREPRENEURS;
    }
    const parsed = JSON.parse(raw) as EntrepreneurProfile[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ENTREPRENEURS;
  } catch {
    return SEED_ENTREPRENEURS;
  }
}

export function loadAllServicePartners(): LocalServicePartner[] {
  if (typeof window === "undefined") return SEED_SERVICE_PARTNERS;
  try {
    const savedVersion = localStorage.getItem(SERVICE_PARTNERS_VERSION_KEY);
    const raw = localStorage.getItem(SERVICE_PARTNERS_KEY);

    if (!raw || savedVersion !== CURRENT_PARTNERS_SEED_VERSION) {
      // Preserve any custom/pending entries added by users/admin (exclude old dummy sp-* seeds)
      let customEntries: LocalServicePartner[] = [];
      if (raw) {
        const parsed = JSON.parse(raw) as LocalServicePartner[];
        if (Array.isArray(parsed)) {
          const oldDummyIds = new Set([
            "sp-pune-1",
            "sp-pune-2",
            "sp-mumbai-1",
            "sp-thane-1",
            "sp-nashik-1",
            "sp-sambhajinagar-1",
            "sp-nagpur-1",
            "sp-kolhapur-1",
            "sp-satara-1",
            "sp-solapur-1",
          ]);
          const newSeedIds = new Set(SEED_SERVICE_PARTNERS.map((p) => p.id));
          customEntries = parsed.filter(
            (p) => p.id && !oldDummyIds.has(p.id) && !newSeedIds.has(p.id)
          );
        }
      }
      const upgraded = [...customEntries, ...SEED_SERVICE_PARTNERS];
      localStorage.setItem(SERVICE_PARTNERS_KEY, JSON.stringify(upgraded));
      localStorage.setItem(
        SERVICE_PARTNERS_VERSION_KEY,
        CURRENT_PARTNERS_SEED_VERSION
      );
      return upgraded;
    }

    const parsed = JSON.parse(raw) as LocalServicePartner[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : SEED_SERVICE_PARTNERS;
  } catch {
    return SEED_SERVICE_PARTNERS;
  }
}

export function saveAllServicePartners(partners: LocalServicePartner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SERVICE_PARTNERS_KEY, JSON.stringify(partners));
  } catch {
    // ignore
  }
}

export function upsertServicePartner(
  partner: LocalServicePartner
): LocalServicePartner[] {
  const existing = loadAllServicePartners();
  const idx = existing.findIndex((p) => p.id === partner.id);
  const updated =
    idx >= 0
      ? existing.map((p) => (p.id === partner.id ? partner : p))
      : [partner, ...existing];
  saveAllServicePartners(updated);
  return updated;
}

export function deleteServicePartnerLocal(id: string): LocalServicePartner[] {
  const existing = loadAllServicePartners();
  const updated = existing.filter((p) => p.id !== id);
  saveAllServicePartners(updated);
  return updated;
}

export function mergeServicePartners(
  localList: LocalServicePartner[],
  remoteList: LocalServicePartner[]
): LocalServicePartner[] {
  if (!remoteList || remoteList.length === 0) return localList;
  const map = new Map<string, LocalServicePartner>();
  localList.forEach((p) => map.set(p.id, p));
  // Remote Firestore records take precedence for shared live updates
  remoteList.forEach((p) => map.set(p.id, p));
  return Array.from(map.values());
}
