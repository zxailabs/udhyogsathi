import { LocalServicePartner, SectionId, ServiceCategory } from "@/types";

export interface ServiceCategoryInfo {
  id: ServiceCategory;
  label: string;
  shortLabel: string;
  description: string;
  keywords: string[];
  mapsQuery: string;
  colorClass: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryInfo[] = [
  {
    id: "udyam",
    label: "उद्यम आधार / MSME नोंदणी",
    shortLabel: "उद्यम आधार",
    description: "नवीन Udyam नोंदणी, सुधारणा व MSME प्रमाणपत्र मदत",
    keywords: [
      "udyam",
      "उद्यम",
      "उद्योग आधार",
      "udyog aadhar",
      "udyog aadhaar",
      "msme registration",
      "msme नोंदणी",
      "एमएसएमई नोंदणी",
      "उद्यम आधार",
    ],
    mapsQuery: "Maha e Seva Kendra CSC Center Udyam MSME Registration",
    colorClass: "bg-orange-500/15 text-orange-300 border-orange-500/35",
  },
  {
    id: "shop_act",
    label: "शॉप ॲक्ट / गुमास्ता लायसन्स",
    shortLabel: "शॉप ॲक्ट",
    description: "दुकान व आस्थापना नोंदणी (Shop Act / Gumasta License)",
    keywords: [
      "shop act",
      "shopact",
      "शॉप ॲक्ट",
      "शॉपअॅक्ट",
      "शॉप अक्ट",
      "शॉप अॅक्ट",
      "gumasta",
      "गुमास्ता",
      "दुकान परवाना",
      "दुकान नोंदणी",
      "aaple sarkar",
    ],
    mapsQuery: "Shop Act Gumasta License Consultant Maha e Seva Kendra",
    colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  },
  {
    id: "dpr",
    label: "DPR / प्रकल्प अहवाल (Project Report)",
    shortLabel: "DPR / प्रकल्प अहवाल",
    description: "बँक कर्ज, CMEGP, PMEGP व अण्णासाहेब पाटीलसाठी प्रोजेक्ट रिपोर्ट",
    keywords: [
      "dpr",
      "डीपीआर",
      "प्रकल्प अहवाल",
      "प्रोजेक्ट रिपोर्ट",
      "project report",
      "cma data",
      "cma रिपोर्ट",
      "detailed project report",
      "quotation",
      "प्रकल्प प्रस्ताव",
    ],
    mapsQuery: "DPR Project Report Consultant Chartered Accountant MSME Loan",
    colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  },
  {
    id: "gst_ca",
    label: "GST नोंदणी, ITR व CA सेवा",
    shortLabel: "GST / CA",
    description: "GST नंबर, टॅक्स रिटर्न, कंपनी/पार्टनरशिप नोंदणी व ऑडिट",
    keywords: [
      "gst",
      "जीएसटी",
      "itr",
      "income tax",
      "टॅक्स",
      "ca ",
      "सीए",
      "chartered accountant",
      "कंपनी नोंदणी",
      "pvt ltd",
      "llp",
      "partnership",
      "भागीदारी",
    ],
    mapsQuery: "Chartered Accountant GST Consultant Tax Practitioner",
    colorClass: "bg-sky-500/15 text-sky-300 border-sky-500/35",
  },
  {
    id: "loan_file",
    label: "कर्ज व महामंडळ फाईल मदत",
    shortLabel: "कर्ज / महामंडळ फाईल",
    description: "CMEGP, PMEGP, अण्णासाहेब पाटील, मुद्रा व स्टँड-अप इंडिया फाईल",
    keywords: [
      "cmegp",
      "pmegp",
      "मुद्रा",
      "mudra",
      "कर्ज फाईल",
      "लोन फाईल",
      "loan file",
      "अण्णासाहेब",
      "annasaheb",
      "महामंडळ",
      "सबसिडी अर्ज",
      "बँक कर्ज",
      "subsidy",
      "अनुदान",
      "stand up",
      "महाज्योती",
    ],
    mapsQuery: "MSME Business Loan Consultant DIC Office District Industries Centre",
    colorClass: "bg-purple-500/15 text-purple-300 border-purple-500/35",
  },
  {
    id: "fssai_license",
    label: "FSSAI अन्न परवाना व इतर लायसन्स",
    shortLabel: "FSSAI / परवाने",
    description: "फूड लायसन्स (FSSAI), ट्रेडमार्क, ISO, पॅकिंग व MPCB परवाने",
    keywords: [
      "fssai",
      "फूड लायसन्स",
      "अन्न परवाना",
      "food license",
      "trademark",
      "ट्रेडमार्क",
      "mpcb",
      "प्रदूषण",
      "परवाना",
      "लायसन्स",
      "license",
      "iec",
      "निर्यात परवाना",
      "iso",
    ],
    mapsQuery: "FSSAI Food License Business Registration Consultant",
    colorClass: "bg-teal-500/15 text-teal-300 border-teal-500/35",
  },
  {
    id: "midc_maitri",
    label: "MIDC भूखंड व MAITRI पोर्टल मदत",
    shortLabel: "MIDC / MAITRI",
    description: "औद्योगिक भूखंड अर्ज, MAITRI सिंगल विंडो व PSI प्रोत्साहन योजना",
    keywords: [
      "midc",
      "एमआयडीसी",
      "maitri",
      "मैत्री",
      "भूखंड",
      "plot",
      "औद्योगिक जागा",
      "psi",
      "industrial plot",
    ],
    mapsQuery: "MIDC Regional Office District Industries Centre",
    colorClass: "bg-rose-500/15 text-rose-300 border-rose-500/35",
  },
];

export function getServiceCategoryInfo(id: ServiceCategory): ServiceCategoryInfo {
  return (
    SERVICE_CATEGORIES.find((s) => s.id === id) || SERVICE_CATEGORIES[0]
  );
}

/**
 * Extracts English district name from "पुणे (Pune)" -> "Pune"
 */
export function getDistrictEnglishName(district?: string): string {
  if (!district) return "Maharashtra";
  const match = district.match(/\(([^)]+)\)/);
  if (match && match[1]) return match[1].trim();
  return district.trim();
}

/**
 * Extracts Marathi district name from "पुणे (Pune)" -> "पुणे"
 */
export function getDistrictMarathiName(district?: string): string {
  if (!district) return "महाराष्ट्र";
  return district.split("(")[0].trim();
}

/**
 * Detects which local services a user query relates to.
 * Returns empty array if the message is a general greeting / unrelated query.
 */
export function detectRequestedServices(
  queryText: string,
  section?: SectionId
): ServiceCategory[] {
  const normalized = ` ${queryText.toLowerCase()} `;
  const matched: ServiceCategory[] = [];

  for (const cat of SERVICE_CATEGORIES) {
    const hit = cat.keywords.some((kw) =>
      normalized.includes(kw.toLowerCase())
    );
    if (hit) {
      matched.push(cat.id);
    }
  }

  // Generic help / agent / consultant request detection
  const genericHelpKeywords = [
    "कोण करून देईल",
    "सल्लागार",
    "एजंट",
    "केंद्र",
    "कुठे काढायचे",
    "कुठे करायचे",
    "मदत हवी",
    "नंबर",
    "संपर्क",
    "consultant",
    "office",
    "काढायचा",
    "काढायचे",
    "करायचा",
    "करायचे",
    "नोंदणी",
    "अर्ज",
    "registration",
    "apply",
  ];

  if (matched.length === 0) {
    const hasGenericHelp = genericHelpKeywords.some((kw) =>
      normalized.includes(kw.toLowerCase())
    );
    if (hasGenericHelp && section) {
      if (section === "msme") matched.push("udyam", "shop_act");
      else if (section === "loans") matched.push("dpr", "loan_file");
      else if (section === "licenses") matched.push("shop_act", "fssai_license");
      else if (section === "midc") matched.push("midc_maitri");
      else if (section === "mahila_yuva") matched.push("loan_file", "udyam");
      else if (section === "startup") matched.push("gst_ca", "dpr");
      else if (section === "export") matched.push("fssai_license", "udyam");
    }
  }

  return matched;
}

/**
 * Zero-cost Google Maps search URL tailored to district + service.
 */
export function buildGoogleMapsSearchUrl(
  district?: string,
  serviceCategory?: ServiceCategory,
  customQuery?: string
): string {
  const engDistrict = getDistrictEnglishName(district);
  let baseQuery = customQuery;
  if (!baseQuery) {
    if (serviceCategory) {
      baseQuery = getServiceCategoryInfo(serviceCategory).mapsQuery;
    } else {
      baseQuery = "Maha e Seva Kendra CSC Center CA DPR Consultant";
    }
  }
  const fullQuery = `${baseQuery} in ${engDistrict} Maharashtra`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
}

/**
 * Direct Google Maps URL for a specific partner (uses pinned link if provided, else address+district).
 */
export function buildPartnerMapsUrl(partner: LocalServicePartner): string {
  if (partner.googleMapsUrl && partner.googleMapsUrl.trim().startsWith("http")) {
    return partner.googleMapsUrl.trim();
  }
  const engDistrict = getDistrictEnglishName(partner.district);
  const query = `${partner.name}, ${partner.talukaOrArea}, ${partner.address}, ${engDistrict}, Maharashtra`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Cleans phone number to digits for tel: and wa.me links.
 */
export function cleanPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function buildTelUrl(phone: string): string {
  const digits = cleanPhoneDigits(phone);
  return `tel:+${digits}`;
}

export function buildWhatsAppUrl(
  phone: string,
  partnerName: string,
  serviceLabel?: string,
  userName?: string,
  district?: string
): string {
  const digits = cleanPhoneDigits(phone);
  const districtShort = getDistrictMarathiName(district);
  const caller = userName ? `मी ${userName} (${districtShort})` : `मी ${districtShort} मधून`;
  const topic = serviceLabel
    ? `मला *${serviceLabel}* साठी मदत व मार्गदर्शन हवे आहे.`
    : `मला उद्योग नोंदणी / DPR / शासकीय योजनेसाठी मदत हवी आहे.`;

  const message = `नमस्कार ${partnerName}, ${caller} भाजप उद्योग आघाडीच्या 'उद्योग साथी AI' ॲपवरून संपर्क करत आहे. ${topic}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Filters & ranks approved partners for a given district & optional requested services.
 */
export function matchLocalPartners(
  allPartners: LocalServicePartner[],
  district?: string,
  requestedServices: ServiceCategory[] = []
): LocalServicePartner[] {
  const approved = allPartners.filter((p) => p.status === "approved");
  if (!district) return approved.slice(0, 4);

  const marathiDistrict = getDistrictMarathiName(district).toLowerCase();
  const engDistrict = getDistrictEnglishName(district).toLowerCase();

  const districtMatches = approved.filter((p) => {
    const pd = p.district.toLowerCase();
    return (
      pd === district.toLowerCase() ||
      pd.includes(marathiDistrict) ||
      pd.includes(engDistrict)
    );
  });

  if (requestedServices.length === 0) {
    return districtMatches;
  }

  // Score by number of matching requested services, keeping district matches first
  return [...districtMatches].sort((a, b) => {
    const scoreA = a.services.filter((s) => requestedServices.includes(s)).length;
    const scoreB = b.services.filter((s) => requestedServices.includes(s)).length;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (a.verifiedByAghadi !== b.verifiedByAghadi) {
      return a.verifiedByAghadi ? -1 : 1;
    }
    return 0;
  });
}
