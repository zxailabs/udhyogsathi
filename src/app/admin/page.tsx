"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CloudUpload,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  KeyRound,
  Layers,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProfileModal } from "@/components/ProfileModal";
import { ServicePartnerModal } from "@/components/ServicePartnerModal";
import {
  BUSINESS_STAGES,
  CASTE_CATEGORIES,
  INDUSTRY_SECTORS,
  MAHARASHTRA_DISTRICTS,
} from "@/data/departments";
import {
  getAllKnowledgeRecords,
  searchKnowledgeBase,
} from "@/lib/knowledge-search";
import {
  buildPartnerMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  getDistrictMarathiName,
  getPartnerWhatsAppNumber,
  getServiceCategoryInfo,
  SERVICE_CATEGORIES,
} from "@/lib/local-help";
import {
  AuthSession,
  deleteServicePartnerLocal,
  loadAllRegisteredEntrepreneurs,
  loadAllServicePartners,
  loadAuthSession,
  mergeServicePartners,
  saveAuthSession,
  upsertServicePartner,
} from "@/lib/storage";
import {
  deleteServicePartnerFromFirestore,
  fetchEntrepreneursFromFirestore,
  fetchServicePartnersFromFirestore,
  saveServicePartnerToFirestore,
  syncAllServicePartnersToFirestore,
} from "@/lib/firestore-service";
import {
  EntrepreneurProfile,
  LocalServicePartner,
  ServiceCategory,
} from "@/types";

const TOP_FAQ_TOPICS = [
  { topic: "CMEGP व PMEGP ३५% सबसिडी पात्रता", count: 148, section: "कर्ज व अनुदान" },
  { topic: "मोफत Udyam नोंदणी व फायदे", count: 126, section: "MSME नोंदणी" },
  { topic: "MIDC नवीन औद्योगिक भूखंड अर्ज", count: 94, section: "MIDC / MAITRI" },
  { topic: "अण्णासाहेब पाटील ₹१५ लाख व्याज परतावा", count: 87, section: "महिला व युवा" },
  { topic: "GeM पोर्टल MSME विक्रेता नोंदणी", count: 72, section: "निर्यात व GeM" },
];

// Color mapping for caste categories
function getCasteBadgeColor(caste?: string): { bg: string; text: string; border: string; mahamandal: string } {
  if (!caste) {
    return { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-500/30", mahamandal: "सर्व योजना" };
  }
  if (caste.includes("मराठा")) {
    return { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/35", mahamandal: "अण्णासाहेब पाटील महामंडळ" };
  }
  if (caste.includes("मागासवर्गीय") || caste.includes("OBC")) {
    return { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/35", mahamandal: "महाज्योती / OBC महामंडळ" };
  }
  if (caste.includes("अनुसूचित जाती") || caste.includes("SC")) {
    return { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/35", mahamandal: "BARTI / MPBCDC / Stand-Up" };
  }
  if (caste.includes("अनुसूचित जमाती") || caste.includes("ST")) {
    return { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/35", mahamandal: "शबरी महामंडळ / Stand-Up" };
  }
  if (caste.includes("विमुक्त") || caste.includes("VJNT")) {
    return { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/35", mahamandal: "वसंतराव नाईक महामंडळ" };
  }
  if (caste.includes("विशेष मागास") || caste.includes("SBC")) {
    return { bg: "bg-teal-500/15", text: "text-teal-300", border: "border-teal-500/35", mahamandal: "अहिल्यादेवी होळकर महामंडळ" };
  }
  if (caste.includes("अल्पसंख्याक")) {
    return { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/35", mahamandal: "मौलाना आझाद महामंडळ" };
  }
  return { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-500/30", mahamandal: "सर्वसाधारण योजना" };
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "partners" | "kb">(
    "analytics"
  );

  // Users registry state
  const [entrepreneurs, setEntrepreneurs] = useState<EntrepreneurProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [filterCaste, setFilterCaste] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Local Service Partners state
  const [servicePartners, setServicePartners] = useState<LocalServicePartner[]>([]);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState("");
  const [partnerFilterDistrict, setPartnerFilterDistrict] = useState("all");
  const [partnerFilterService, setPartnerFilterService] = useState<
    ServiceCategory | "all"
  >("all");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<LocalServicePartner | null>(
    null
  );
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [firestoreSyncMsg, setFirestoreSyncMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Knowledge base state
  const [kbQuery, setKbQuery] = useState("");
  const allKbRecords = useMemo(() => getAllKnowledgeRecords(), []);

  // Admin login credentials state
  const [adminName, setAdminName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPasscode =
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "BUA@2026";
    if (!adminName.trim()) {
      setLoginError("कृपया पदाधिकारी / समन्वयकाचे नाव लिहा.");
      return;
    }
    if (passcode.trim() !== expectedPasscode) {
      setLoginError("चुकीचा अ‍ॅडमिन पासकोड. कृपया योग्य पासकोड प्रविष्ट करा.");
      return;
    }
    const session: AuthSession = {
      role: "admin",
      name: adminName.trim(),
      loggedInAt: new Date().toISOString(),
    };
    saveAuthSession(session);
    setAuth(session);
    setLoginError("");
    setPasscode("");
  };

  const handleLogout = () => {
    saveAuthSession(null);
    setAuth(null);
  };

  useEffect(() => {
    setAuth(loadAuthSession());
    loadAllUsers();
    loadAllPartners();
  }, []);

  const loadAllPartners = () => {
    const localList = loadAllServicePartners();
    setServicePartners(localList);
    void fetchServicePartnersFromFirestore().then((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setServicePartners((prev) => mergeServicePartners(prev, remoteList));
      }
    });
  };

  const handleSavePartner = (partner: LocalServicePartner) => {
    const updated = upsertServicePartner(partner);
    setServicePartners(updated);
    void saveServicePartnerToFirestore(partner);
    setEditingPartner(null);
  };

  const handleApprovePartner = (partner: LocalServicePartner) => {
    const approved: LocalServicePartner = {
      ...partner,
      status: "approved",
      verifiedByAghadi: true,
    };
    handleSavePartner(approved);
  };

  const handleDeletePartner = (id: string) => {
    const updated = deleteServicePartnerLocal(id);
    setServicePartners(updated);
    void deleteServicePartnerFromFirestore(id);
  };

  const handleSyncPartnersToFirestore = async () => {
    setIsSyncingFirestore(true);
    setFirestoreSyncMsg(null);
    const res = await syncAllServicePartnersToFirestore(servicePartners);
    setIsSyncingFirestore(false);
    if (res.ok) {
      setFirestoreSyncMsg({
        type: "success",
        text: `सर्व ${res.syncedCount} सेवा केंद्रे Firebase Firestore मध्ये यशस्वीरीत्या सेव्ह झाली आहेत!`,
      });
    } else {
      setFirestoreSyncMsg({
        type: "error",
        text:
          res.error ||
          "Firestore कॉन्फिगर केलेले नाही. Vercel / .env.local मध्ये Firebase keys जोडल्यावर हे बटण लगेच चालेल.",
      });
    }
  };

  const pendingPartners = useMemo(
    () => servicePartners.filter((p) => p.status === "pending"),
    [servicePartners]
  );

  const approvedPartners = useMemo(
    () => servicePartners.filter((p) => p.status === "approved"),
    [servicePartners]
  );

  const filteredPartners = useMemo(() => {
    const q = partnerSearchQuery.trim().toLowerCase();
    return approvedPartners.filter((p) => {
      const matchesDistrict =
        partnerFilterDistrict === "all" || p.district === partnerFilterDistrict;
      const matchesService =
        partnerFilterService === "all" ||
        p.services.includes(partnerFilterService);
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.talukaOrArea.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.mobile.includes(q);
      return matchesDistrict && matchesService && matchesQuery;
    });
  }, [
    approvedPartners,
    partnerSearchQuery,
    partnerFilterDistrict,
    partnerFilterService,
  ]);

  const handleExportPartnersCsv = () => {
    const headers = [
      "अनुक्रमांक",
      "नाव / केंद्र",
      "ओळख / पद",
      "जिल्हा",
      "तालुका / परिसर",
      "पत्ता",
      "मोबाईल",
      "WhatsApp",
      "सेवा",
      "प्रमाणित",
    ];
    const rows = filteredPartners.map((p, idx) => [
      idx + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.roleTitle.replace(/"/g, '""')}"`,
      `"${p.district}"`,
      `"${p.talukaOrArea.replace(/"/g, '""')}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.mobile}"`,
      `"${p.whatsapp || p.mobile}"`,
      `"${p.services.map((s) => getServiceCategoryInfo(s).shortLabel).join(", ")}"`,
      `"${p.verifiedByAghadi ? "होय" : "नाही"}"`,
    ]);
    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `भाजप_उद्योग_आघाडी_स्थानिक_सेवा_केंद्रे_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadAllUsers = () => {
    const localUsers = loadAllRegisteredEntrepreneurs();
    setEntrepreneurs(localUsers);

    // Try fetching any extra from Firestore in the background
    void fetchEntrepreneursFromFirestore().then((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setEntrepreneurs((prev) => {
          const map = new Map<string, EntrepreneurProfile>();
          // Combine firestore + local
          [...prev, ...firestoreUsers].forEach((u) => {
            if (u.name) {
              const key = `${u.name.trim().toLowerCase()}-${u.mobile || ""}`;
              if (!map.has(key)) map.set(key, u);
            }
          });
          return Array.from(map.values());
        });
      }
    });
  };

  // 1. Calculations for mini stat cards (संख्या)
  const totalCount = entrepreneurs.length;

  const newIdeaCount = useMemo(
    () => entrepreneurs.filter((u) => u.stage?.includes("नवीन") || u.stage?.includes("Idea")).length,
    [entrepreneurs]
  );

  const microCount = useMemo(
    () => entrepreneurs.filter((u) => u.stage?.includes("सूक्ष्म") || u.stage?.includes("Micro")).length,
    [entrepreneurs]
  );

  const smallCount = useMemo(
    () => entrepreneurs.filter((u) => u.stage?.includes("लघु") || u.stage?.includes("Small")).length,
    [entrepreneurs]
  );

  const mediumCount = useMemo(
    () => entrepreneurs.filter((u) => u.stage?.includes("मध्यम") || u.stage?.includes("Medium")).length,
    [entrepreneurs]
  );

  const udyamVerifiedCount = useMemo(
    () => entrepreneurs.filter((u) => Boolean(u.udyamNumber && u.udyamNumber.trim())).length,
    [entrepreneurs]
  );

  // Caste / Category breakdown counts
  const casteStats = useMemo(() => {
    return CASTE_CATEGORIES.map((c) => {
      const count = entrepreneurs.filter((u) => u.caste === c || (c.includes("मराठा") && u.caste?.includes("मराठा"))).length;
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { caste: c, count, pct, meta: getCasteBadgeColor(c) };
    });
  }, [entrepreneurs, totalCount]);

  // Sector breakdown counts
  const sectorStats = useMemo(() => {
    return INDUSTRY_SECTORS.map((s) => {
      const count = entrepreneurs.filter((u) => u.sector === s || u.sector?.includes(s.split(" ")[0])).length;
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { sector: s, count, pct };
    });
  }, [entrepreneurs, totalCount]);

  // Stage breakdown counts
  const stageStats = useMemo(() => {
    return BUSINESS_STAGES.map((st) => {
      const count = entrepreneurs.filter((u) => u.stage === st || u.stage?.includes(st.split(" ")[0])).length;
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { stage: st, count, pct };
    });
  }, [entrepreneurs, totalCount]);

  // Top districts
  const topDistricts = useMemo(() => {
    const counts: Record<string, number> = {};
    entrepreneurs.forEach((u) => {
      const d = u.district ? u.district.split(" ")[0] : "इतर";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [entrepreneurs]);

  // Filtered entrepreneurs for directory table
  const filteredEntrepreneurs = useMemo(() => {
    return entrepreneurs.filter((u) => {
      const q = userSearchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.mobile?.includes(q) ||
        u.district?.toLowerCase().includes(q) ||
        u.caste?.toLowerCase().includes(q) ||
        u.sector?.toLowerCase().includes(q) ||
        u.udyamNumber?.toLowerCase().includes(q);

      const matchesCaste =
        filterCaste === "all" ||
        u.caste === filterCaste ||
        (filterCaste.includes("मराठा") && u.caste?.includes("मराठा"));

      const matchesSector =
        filterSector === "all" ||
        u.sector === filterSector ||
        u.sector?.includes(filterSector.split(" ")[0]);

      const matchesDistrict =
        filterDistrict === "all" ||
        u.district === filterDistrict ||
        u.district?.includes(filterDistrict.split(" ")[0]);

      return matchesQuery && matchesCaste && matchesSector && matchesDistrict;
    });
  }, [entrepreneurs, userSearchQuery, filterCaste, filterSector, filterDistrict]);

  // CSV Export Function (UTF-8 BOM for flawless Marathi Excel support)
  const handleExportCsv = () => {
    const headers = [
      "अनुक्रमांक",
      "उद्योजकाचे नाव",
      "मोबाईल क्रमांक",
      "जिल्हा",
      "जात / सामाजिक प्रवर्ग",
      "उद्योग क्षेत्र",
      "व्यवसाय टप्पा",
      "Udyam क्रमांक",
      "नोंदणी तारीख",
    ];

    const rows = filteredEntrepreneurs.map((u, idx) => [
      idx + 1,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${u.mobile || ""}"`,
      `"${u.district || ""}"`,
      `"${u.caste || "सर्वसाधारण"}"`,
      `"${u.sector || ""}"`,
      `"${u.stage || ""}"`,
      `"${u.udyamNumber || ""}"`,
      `"${u.updatedAt ? new Date(u.updatedAt).toLocaleDateString("mr-IN") : ""}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `भाजप_उद्योग_आघाडी_नोंदणीकृत_उद्योजक_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kbResults = useMemo(() => {
    if (!kbQuery.trim()) {
      return allKbRecords.map((record) => ({ record, score: 100 }));
    }
    return searchKnowledgeBase(kbQuery, null, 18);
  }, [allKbRecords, kbQuery]);

  if (auth?.role !== "admin") {
    return (
      <ErrorBoundary>
        <div className="relative min-h-screen bg-[#030712] flex flex-col justify-between">
          <AmbientBackground particlesEnabled={false} />

          <header className="relative z-10 border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
                मुख्यपृष्ठ
              </Link>
              <span className="text-sm font-bold metallic-text">
                भाजप उद्योग आघाडी • Admin नियंत्रण कक्ष
              </span>
            </div>
          </header>

          <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="glass-card max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-5 border border-amber-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)]">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-lg font-bold text-white">
                  पदाधिकारी / Admin प्रवेश
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  हा कक्ष केवळ भाजप उद्योग आघाडीच्या अधिकृत समन्वयकांसाठी आहे.
                </p>
              </div>

              {loginError && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200 font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    पदाधिकारी / समन्वयकाचे नाव *
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="उदा. जिल्हा समन्वयक, पुणे"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    अधिकृत Admin पासकोड *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setLoginError("");
                      }}
                      placeholder="पासकोड प्रविष्ट करा"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    (डीफॉल्ट डेमो पासकोड: <span className="font-mono text-amber-300">BUA@2026</span>)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Admin नियंत्रण कक्षात प्रवेश करा
                </button>
              </form>
            </div>
          </main>

          <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-white/[0.05]">
            भाजप उद्योग आघाडी, महाराष्ट्र प्रदेश • सुरक्षित अंतर्गत नियंत्रण प्रणाली
          </footer>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#030712] pb-16">
        <AmbientBackground particlesEnabled={false} />

        {/* Header */}
        <header className="relative z-10 border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
                <span className="hidden sm:inline">मुख्यपृष्ठ</span>
              </Link>

              <div>
                <h1 className="text-sm sm:text-base font-bold metallic-text flex items-center gap-2">
                  <span>भाजप उद्योग आघाडी</span>
                  <span className="text-[10px] font-space px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ADMIN
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  समन्वयक: <strong className="text-slate-200">{auth.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loadAllUsers();
                  loadAllPartners();
                }}
                title="डेटा रिफ्रेश करा"
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <Link
                href="/local-help"
                className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>डिरेक्टरी पहा</span>
              </Link>

              <Link
                href="/chat"
                className="px-3.5 py-2 rounded-xl bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 border border-[#FF6B00]/40 text-xs font-bold text-orange-200 flex items-center gap-1.5 transition"
              >
                <span>AI संवाद</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Admin मधून बाहेर पडा"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-xs font-semibold text-slate-300 hover:text-red-300 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">बाहेर पडा</span>
              </button>
            </div>
          </div>

          {/* Primary Navigation Buttons / Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-3 flex flex-wrap items-center gap-2 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white shadow-orange-500/20"
                  : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>उद्योजक डेटा व ॲनालिटिक्स</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-black/25">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("partners")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "partners"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20"
                  : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>स्थानिक सेवा केंद्रे (उद्यम / शॉप ॲक्ट / DPR)</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-black/25">
                {approvedPartners.length}
              </span>
              {pendingPartners.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold">
                  +{pendingPartners.length} नवीन
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("kb")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "kb"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20"
                  : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>प्रमाणित ज्ञानकोश</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-black/25">
                {allKbRecords.length}
              </span>
            </button>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {activeTab === "analytics" ? (
            <>
              {/* Top Overview Cards (छोटे छोटे कार्ड मध्ये संख्या) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
                    उद्योजक नोंदणी सारांश (Key Registration Metrics)
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    एकूण डेटा: {totalCount} उद्योजक
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Card 1: Total */}
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500/15 via-[#FF6B00]/5 to-transparent border border-orange-500/30">
                    <p className="text-[11px] text-orange-200 font-medium">एकूण नोंदणीकृत</p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-white font-space">
                        {totalCount}
                      </p>
                      <UserCheck className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">सर्व प्रवर्गातील उद्योजक</p>
                  </div>

                  {/* Card 2: New Startups */}
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition">
                    <p className="text-[11px] text-amber-200 font-medium">नवीन सुरू करणारे</p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-space">
                        {newIdeaCount}
                      </p>
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded">
                        {totalCount > 0 ? Math.round((newIdeaCount / totalCount) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">New Idea / Startups</p>
                  </div>

                  {/* Card 3: Micro */}
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition">
                    <p className="text-[11px] text-blue-200 font-medium">सूक्ष्म उद्योग (Micro)</p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-space">
                        {microCount}
                      </p>
                      <span className="text-[10px] text-blue-300 font-bold bg-blue-500/15 px-1.5 py-0.5 rounded">
                        {totalCount > 0 ? Math.round((microCount / totalCount) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">₹१ कोटी पर्यंत गुंतवणूक</p>
                  </div>

                  {/* Card 4: Small & Medium */}
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition">
                    <p className="text-[11px] text-emerald-200 font-medium">लघु व मध्यम उद्योग</p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-space">
                        {smallCount + mediumCount}
                      </p>
                      <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        {totalCount > 0 ? Math.round(((smallCount + mediumCount) / totalCount) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">₹१० ते ₹५० कोटी MSME</p>
                  </div>

                  {/* Card 5: Udyam Verified */}
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition col-span-2 sm:col-span-1">
                    <p className="text-[11px] text-purple-200 font-medium">Udyam नोंदणीकृत</p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-space">
                        {udyamVerifiedCount}
                      </p>
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">शासकीय नोंदणी असलेले</p>
                  </div>
                </div>
              </section>

              {/* Caste / Category Mini Cards (प्रवर्गनिहाय संख्या) */}
              <section className="glass-card rounded-2xl p-5 border border-white/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FF6B00]" />
                    <h2 className="text-xs sm:text-sm font-bold text-white">
                      जात / सामाजिक प्रवर्गनिहाय आकडेवारी (Caste / Category Analytics)
                    </h2>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    महामंडळ व सबसिडी वाटप नियोजनासाठी
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {casteStats.map((item) => (
                    <div
                      key={item.caste}
                      className={`rounded-xl p-3 border transition ${item.meta.bg} ${item.meta.border} hover:brightness-110`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {item.caste.split(" ")[0]}
                        </p>
                        <span className="text-xs font-extrabold font-space text-white px-2 py-0.5 rounded-md bg-black/30">
                          {item.count}
                        </span>
                      </div>
                      <p className={`text-[10px] font-semibold mt-1 truncate ${item.meta.text}`}>
                        {item.caste}
                      </p>

                      {/* Visual progress bar */}
                      <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-[#FF6B00] h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5">
                        <span className="truncate">{item.meta.mahamandal.split(" ")[0]}</span>
                        <span className="font-space font-bold text-slate-300">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sector & Stage Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sector Breakdown */}
                <section className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs sm:text-sm font-bold text-white">
                      उद्योग क्षेत्रनिहाय संख्या (Sector Breakdown)
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sectorStats.map((sec) => (
                      <div
                        key={sec.sector}
                        className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-2.5 space-y-1 hover:border-white/20 transition"
                      >
                        <p className="text-[11px] font-semibold text-slate-200 truncate">
                          {sec.sector.split(" ")[0]}
                        </p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-bold font-space text-emerald-400">
                            {sec.count}
                          </span>
                          <span className="text-[10px] font-space text-slate-400">
                            {sec.pct}%
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${sec.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Top Districts */}
                <section className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <h2 className="text-xs sm:text-sm font-bold text-white">
                      अव्वल जिल्हानिहाय उद्योजक संख्या (Top Districts)
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {topDistricts.map((d) => (
                      <div
                        key={d.district}
                        className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-2.5 flex items-center justify-between gap-2 hover:border-amber-500/30 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {d.district}
                          </p>
                          <p className="text-[10px] text-slate-400">महाराष्ट्र</p>
                        </div>
                        <span className="text-base font-extrabold font-space text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg shrink-0">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Registered Entrepreneurs Directory Table */}
              <section className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                      नोंदणीकृत उद्योजक डिरेक्टरी ({filteredEntrepreneurs.length} पैकी {totalCount})
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      महाराष्ट्रभरातील सर्व नोंदणीकृत उद्योजकांची माहिती व संपर्क
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV / Excel डाऊनलोड</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] hover:brightness-110 text-white text-xs font-bold shadow transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>नवीन उद्योजक जोडा</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="relative sm:col-span-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="नाव, फोन, Udyam शोधा..."
                      className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <select
                      value={filterCaste}
                      onChange={(e) => setFilterCaste(e.target.value)}
                      className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="all">सर्व प्रवर्ग (All Castes)</option>
                      {CASTE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                      className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="all">सर्व क्षेत्र (All Sectors)</option>
                      {INDUSTRY_SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                      className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    >
                      <option value="all">सर्व जिल्हे (All Districts)</option>
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Directory Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/[0.04] text-[11px] font-bold text-slate-200 uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-3.5 py-3">#</th>
                        <th className="px-3.5 py-3">उद्योजकाचे नाव</th>
                        <th className="px-3.5 py-3">मोबाईल</th>
                        <th className="px-3.5 py-3">जिल्हा</th>
                        <th className="px-3.5 py-3">जात / प्रवर्ग</th>
                        <th className="px-3.5 py-3">उद्योग क्षेत्र</th>
                        <th className="px-3.5 py-3">टप्पा</th>
                        <th className="px-3.5 py-3">Udyam क्रमांक</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredEntrepreneurs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400">
                            कोणताही उद्योजक सापडला नाही.
                          </td>
                        </tr>
                      ) : (
                        filteredEntrepreneurs.map((u, idx) => {
                          const badge = getCasteBadgeColor(u.caste);
                          return (
                            <tr key={`${u.name}-${u.mobile || idx}`} className="hover:bg-white/[0.02] transition">
                              <td className="px-3.5 py-3 font-space text-slate-400">{idx + 1}</td>
                              <td className="px-3.5 py-3 font-bold text-white whitespace-nowrap">
                                {u.name}
                              </td>
                              <td className="px-3.5 py-3 font-space whitespace-nowrap">
                                {u.mobile ? (
                                  <a
                                    href={`tel:${u.mobile}`}
                                    className="text-orange-400 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {u.mobile}
                                  </a>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                {u.district ? u.district.split(" ")[0] : "-"}
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                                >
                                  {u.caste ? u.caste.split(" ")[0] : "सर्वसाधारण"}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                {u.sector ? u.sector.split(" ")[0] : "-"}
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span className="text-[11px] text-slate-300">
                                  {u.stage ? u.stage.split(" ")[0] : "-"}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 font-space text-[11px] whitespace-nowrap">
                                {u.udyamNumber ? (
                                  <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                    {u.udyamNumber}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : activeTab === "partners" ? (
            /* Local Service Partners Management Tab (Hybrid Model Layer 1 Admin Control) */
            <div className="space-y-6">
              {/* Pending Approval Requests */}
              {pendingPartners.length > 0 && (
                <section className="glass-card rounded-2xl p-5 border border-amber-500/40 bg-amber-500/[0.06] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        मंजुरीसाठी प्रलंबित नोंदणी विनंत्या ({pendingPartners.length})
                      </span>
                    </h2>
                    <span className="text-[11px] text-amber-200/80">
                      मंजूर केल्यावर थेट युझर्सना चॅट व डिरेक्टरीमध्ये दिसतील
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="rounded-xl bg-[#0a0f1e]/90 border border-amber-500/30 p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-white">
                              {partner.name}
                            </p>
                            <p className="text-xs text-amber-300">
                              {partner.roleTitle}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            प्रलंबित
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          <strong>{getDistrictMarathiName(partner.district)}</strong> •{" "}
                          {partner.talukaOrArea} — {partner.address}
                        </p>
                        <p className="text-xs text-slate-300 font-space">
                          📞 {partner.mobile}
                          {partner.whatsapp && partner.whatsapp !== partner.mobile
                            ? ` • WhatsApp: ${partner.whatsapp}`
                            : ""}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {partner.services.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200"
                            >
                              {getServiceCategoryInfo(s).shortLabel}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleApprovePartner(partner)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>मंजूर करा (Approve)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePartner(partner.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-300 text-xs font-semibold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>रद्द</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Approved Local Partners Directory & Controls */}
              <section className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-sky-400" />
                      <span>
                        जिल्हास्तरीय प्रमाणित सेवा केंद्रे ({filteredPartners.length})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      उद्यम आधार, शॉप ॲक्ट, DPR, GST व बँक फाईलसाठी युझर्सना चॅटमध्ये दिसणारी संपर्क यादी येथून मॅनेज करा
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPartner(null);
                        setIsPartnerModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>नवीन सल्लागार / केंद्र जोडा</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSyncingFirestore}
                      onClick={() => void handleSyncPartnersToFirestore()}
                      title="सर्व १३४+ सेवा केंद्रे Firebase Firestore मध्ये एका क्लिकवर सेव्ह करा"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-200 text-xs font-bold disabled:opacity-50 transition"
                    >
                      <CloudUpload className="w-4 h-4" />
                      <span>
                        {isSyncingFirestore
                          ? "Firestore सिंक सुरू..."
                          : "Firestore वर सेव्ह करा"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPartnersCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV डाउनलोड</span>
                    </button>
                  </div>
                </div>

                {firestoreSyncMsg && (
                  <div
                    className={`rounded-xl px-4 py-2.5 text-xs border ${
                      firestoreSyncMsg.type === "success"
                        ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-200"
                        : "bg-amber-500/15 border-amber-500/35 text-amber-200"
                    }`}
                  >
                    {firestoreSyncMsg.text}
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={partnerSearchQuery}
                      onChange={(e) => setPartnerSearchQuery(e.target.value)}
                      placeholder="नाव, तालुका किंवा मोबाईल नंबर शोधा..."
                      className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <select
                    value={partnerFilterDistrict}
                    onChange={(e) => setPartnerFilterDistrict(e.target.value)}
                    className="rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="all">सर्व जिल्हे (All 36 Districts)</option>
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    value={partnerFilterService}
                    onChange={(e) =>
                      setPartnerFilterService(
                        e.target.value as ServiceCategory | "all"
                      )
                    }
                    className="rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="all">सर्व सेवा (All Services)</option>
                    {SERVICE_CATEGORIES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Partners Grid */}
                {filteredPartners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span>{partner.name}</span>
                                {partner.verifiedByAghadi && (
                                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </h3>
                              <p className="text-xs text-orange-300">
                                {partner.roleTitle}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPartner(partner);
                                  setIsPartnerModalOpen(true);
                                }}
                                title="माहिती सुधारा"
                                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePartner(partner.id)}
                                title="काढून टाका"
                                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300">
                            <strong className="text-white">
                              {getDistrictMarathiName(partner.district)}
                            </strong>{" "}
                            • {partner.talukaOrArea} — {partner.address}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {partner.services.map((svc) => {
                              const meta = getServiceCategoryInfo(svc);
                              return (
                                <span
                                  key={svc}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${meta.colorClass}`}
                                >
                                  {meta.shortLabel}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06] text-xs">
                          <span className="font-space text-slate-200 font-semibold">
                            📞 {partner.mobile}
                            {partner.secondaryPhone
                              ? ` / ${partner.secondaryPhone}`
                              : ""}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={buildTelUrl(partner.mobile)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF6B00]/15 text-orange-300 hover:bg-[#FF6B00]/25 transition"
                            >
                              <Phone className="w-3 h-3" />
                              कॉल
                            </a>
                            {getPartnerWhatsAppNumber(partner) ? (
                              <a
                                href={buildWhatsAppUrl(
                                  getPartnerWhatsAppNumber(partner) || partner.mobile,
                                  partner.name
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition"
                              >
                                <MessageCircle className="w-3 h-3" />
                                WhatsApp
                              </a>
                            ) : partner.email ? (
                              <a
                                href={`mailto:${partner.email}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 transition"
                              >
                                <Mail className="w-3 h-3" />
                                ईमेल
                              </a>
                            ) : null}
                            <a
                              href={buildPartnerMapsUrl(partner)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition"
                            >
                              <Navigation className="w-3 h-3" />
                              मॅप
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    या फिल्टरनुसार कोणतेही सेवा केंद्र सापडले नाही. वरील &ldquo;नवीन सल्लागार / केंद्र जोडा&rdquo; बटनावरून लगेच जोडा.
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* Knowledge Base Tester & FAQ Section */
            <div className="space-y-6">
              {/* Top FAQ Topics */}
              <section className="glass-card rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  सर्वाधिक विचारले गेलेले उद्योग प्रश्न (Top Searched FAQ Topics)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {TOP_FAQ_TOPICS.map((item) => (
                    <div
                      key={item.topic}
                      className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {item.topic}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.section}</p>
                      </div>
                      <span className="font-space text-xs font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded shrink-0">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Knowledge Base Tester */}
              <section className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    प्रमाणित ज्ञानकोश तपासणी (Knowledge Base — {allKbRecords.length} नोंदी)
                  </h2>

                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={kbQuery}
                      onChange={(e) => setKbQuery(e.target.value)}
                      placeholder="ज्ञानकोश तपासा (उदा. CMEGP, ५० लाख, MIDC)..."
                      className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kbResults.map(({ record, score }) => (
                    <div
                      key={record.id}
                      className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white">
                          {record.title}
                        </h3>
                        <span className="font-space text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                          {kbQuery.trim() ? `Score: ${score}` : record.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {record.department} • {record.grReference}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {record.summary}
                      </p>
                      <a
                        href={record.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:underline"
                      >
                        {record.officialUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Modal to add an entrepreneur from Admin directly */}
        <ProfileModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            loadAllUsers();
          }}
          initialProfile={null}
          onSave={() => {
            loadAllUsers();
          }}
        />

        {/* Modal to add/edit Local Service Partners from Admin directly */}
        <ServicePartnerModal
          isOpen={isPartnerModalOpen}
          onClose={() => {
            setIsPartnerModalOpen(false);
            setEditingPartner(null);
          }}
          initialPartner={editingPartner}
          isAdmin={true}
          onSave={handleSavePartner}
        />
      </div>
    </ErrorBoundary>
  );
}
