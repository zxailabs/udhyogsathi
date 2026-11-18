"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PlusCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServicePartnerModal } from "@/components/ServicePartnerModal";
import { MAHARASHTRA_DISTRICTS } from "@/data/departments";
import { OFFICIAL_VILLAGE_LOCATORS } from "@/data/official-locators";
import {
  buildGoogleMapsSearchUrl,
  buildPartnerMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  getDistrictMarathiName,
  getPartnerWhatsAppNumber,
  getServiceCategoryInfo,
  SERVICE_CATEGORIES,
} from "@/lib/local-help";
import {
  fetchServicePartnersFromFirestore,
  saveServicePartnerToFirestore,
} from "@/lib/firestore-service";
import {
  loadAllServicePartners,
  loadProfile,
  mergeServicePartners,
  upsertServicePartner,
} from "@/lib/storage";
import { EntrepreneurProfile, LocalServicePartner, ServiceCategory } from "@/types";

function LocalHelpContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [partners, setPartners] = useState<LocalServicePartner[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<ServiceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState("");

  useEffect(() => {
    const prof = loadProfile();
    setProfile(prof);

    const paramDistrict = searchParams.get("district");
    const paramService = searchParams.get("service") as ServiceCategory | null;

    if (paramDistrict && MAHARASHTRA_DISTRICTS.includes(paramDistrict)) {
      setSelectedDistrict(paramDistrict);
    } else if (prof?.district && MAHARASHTRA_DISTRICTS.includes(prof.district)) {
      setSelectedDistrict(prof.district);
    }

    if (
      paramService &&
      SERVICE_CATEGORIES.some((s) => s.id === paramService)
    ) {
      setSelectedService(paramService);
    }

    const localList = loadAllServicePartners();
    setPartners(localList);

    void fetchServicePartnersFromFirestore().then((remoteList) => {
      if (remoteList.length > 0) {
        setPartners((prev) => mergeServicePartners(prev, remoteList));
      }
    });
  }, [searchParams]);

  const approvedPartners = useMemo(
    () => partners.filter((p) => p.status === "approved"),
    [partners]
  );

  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return approvedPartners.filter((p) => {
      const matchesDistrict =
        selectedDistrict === "all" || p.district === selectedDistrict;
      const matchesService =
        selectedService === "all" || p.services.includes(selectedService);
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.talukaOrArea.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q);
      return matchesDistrict && matchesService && matchesQuery;
    });
  }, [approvedPartners, selectedDistrict, selectedService, searchQuery]);

  const activeDistrictForMaps =
    selectedDistrict !== "all"
      ? selectedDistrict
      : profile?.district || MAHARASHTRA_DISTRICTS[25];

  const activeDistrictMarathi = getDistrictMarathiName(activeDistrictForMaps);

  const handlePublicRegister = (newPartner: LocalServicePartner) => {
    const updated = upsertServicePartner(newPartner);
    setPartners(updated);
    void saveServicePartnerToFirestore(newPartner);
    setSubmissionNotice(
      `धन्यवाद! "${newPartner.name}" ची नोंदणी विनंती प्राप्त झाली आहे. भाजप उद्योग आघाडीच्या Admin मंजुरीनंतर तुमचे केंद्र ${getDistrictMarathiName(
        newPartner.district
      )} जिल्ह्यातील उद्योजकांना लाईव्ह दिसेल.`
    );
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#030712] pb-16">
        <AmbientBackground particlesEnabled={false} />

        {/* Header */}
        <header className="relative z-20 border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
                <span>AI संवाद</span>
              </Link>
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 transition"
              >
                मुख्यपृष्ठ
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>सल्लागार / केंद्र नोंदवा</span>
            </button>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* Hero Header */}
          <section className="glass-card rounded-2xl p-5 sm:p-6 border border-orange-500/25 bg-gradient-to-br from-[#FF6B00]/10 via-[#0a0f1e]/90 to-emerald-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-[11px] font-bold text-orange-300">
                  <MapPin className="w-3.5 h-3.5" />
                  भाजप उद्योग आघाडी • जिल्हास्तरीय सेवा सहाय्यक केंद्र
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  स्थानिक सेवा सहाय्यक व सल्लागार डिरेक्टरी
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  उद्यम आधार, शॉप ॲक्ट, DPR (प्रकल्प अहवाल), GST / CA किंवा बँक लोन फाईलसाठी तुमच्या जिल्ह्यातील प्रमाणित सल्लागार व महा-ई-सेवा केंद्रांशी थेट कॉल, WhatsApp किंवा Google Maps द्वारे संपर्क साधा.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-center">
                  <p className="text-lg font-extrabold text-[#FF6B00] font-space">
                    {approvedPartners.length}
                  </p>
                  <p className="text-[10px] text-slate-400">प्रमाणित केंद्रे</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-center">
                  <p className="text-lg font-extrabold text-emerald-400 font-space">
                    36
                  </p>
                  <p className="text-[10px] text-slate-400">जिल्हे मॅप शोध</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pending submission confirmation */}
          {submissionNotice && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/35 px-4 py-3 text-xs sm:text-sm text-emerald-200 flex items-start gap-2.5 animate-msgIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{submissionNotice}</span>
            </div>
          )}

          {/* Filter Bar */}
          <section className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  जिल्हा निवडा (District)
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-xl bg-[#0b1224] border border-white/15 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">सर्व जिल्हे (संपूर्ण महाराष्ट्र)</option>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  तालुका, शहर किंवा केंद्राच्या नावाने शोधा
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="उदा. कोथरूड, MIDC, DPR, CA, महा-ई-सेवा..."
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Service Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedService("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedService === "all"
                    ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                    : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                सर्व सेवा
              </button>
              {SERVICE_CATEGORIES.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedService === svc.id
                      ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                      : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {svc.shortLabel}
                </button>
              ))}
            </div>
          </section>

          {/* Layer 1: Verified Local Service Partners */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <span>
                  {selectedDistrict === "all"
                    ? "महाराष्ट्रातील प्रमाणित सेवा केंद्रे व सल्लागार"
                    : `${getDistrictMarathiName(selectedDistrict)} जिल्ह्यातील प्रमाणित सेवा केंद्रे`}
                </span>
              </h2>
              <span className="text-xs text-slate-400">
                एकूण सापडले: {filteredPartners.length}
              </span>
            </div>

            {filteredPartners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPartners.map((partner) => {
                  const waNumber = getPartnerWhatsAppNumber(partner);
                  return (
                    <div
                      key={partner.id}
                      className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-orange-500/35 flex flex-col justify-between gap-4 transition"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {partner.name}
                            </h3>
                            <p className="text-xs text-orange-300 font-medium mt-0.5">
                              {partner.roleTitle}
                            </p>
                          </div>
                          {partner.verifiedByAghadi && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-bold text-emerald-300 shrink-0">
                              <BadgeCheck className="w-3 h-3" />
                              प्रमाणित
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-slate-300">
                          <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                            <span>
                              {getDistrictMarathiName(partner.district)} •{" "}
                              {partner.talukaOrArea}
                            </span>
                          </p>
                          <p className="flex items-start gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>{partner.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-200 font-space text-[11px] font-semibold pt-0.5">
                            <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>
                              {partner.mobile}
                              {partner.secondaryPhone
                                ? ` | ${partner.secondaryPhone}`
                                : ""}
                            </span>
                          </p>
                          {partner.email && (
                            <p className="flex items-center gap-1.5 text-indigo-300/90 font-space text-[11px] truncate">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{partner.email}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {partner.services.map((svcId) => {
                            const meta = getServiceCategoryInfo(svcId);
                            return (
                              <span
                                key={svcId}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${meta.colorClass}`}
                              >
                                {meta.shortLabel}
                              </span>
                            );
                          })}
                        </div>

                        {partner.notes && (
                          <p className="text-[11px] text-slate-400 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-2 leading-relaxed">
                            {partner.notes}
                          </p>
                        )}
                      </div>

                      {/* Direct Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.07]">
                        <a
                          href={buildTelUrl(partner.mobile)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs font-bold hover:brightness-110 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>कॉल</span>
                        </a>
                        {waNumber ? (
                          <a
                            href={buildWhatsAppUrl(
                              waNumber,
                              partner.name,
                              selectedService !== "all"
                                ? getServiceCategoryInfo(selectedService).label
                                : undefined,
                              profile?.name,
                              partner.district
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        ) : partner.email ? (
                          <a
                            href={`mailto:${partner.email}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-200 text-xs font-bold transition"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>ईमेल</span>
                          </a>
                        ) : null}
                        <a
                          href={buildPartnerMapsUrl(partner)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-semibold transition"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-400" />
                          <span>लोकेशन</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-3">
                <p className="text-sm font-semibold text-white">
                  {activeDistrictMarathi} जिल्ह्यात या फिल्टरसाठी सध्या नोंदणीकृत केंद्र उपलब्ध नाही.
                </p>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  काळजी करू नका! खालील <strong>Google Maps थेट शोध</strong> कार्डवरून तुम्ही तुमच्या भागातील जवळचे महा-ई-सेवा केंद्र, DPR सल्लागार व जिल्हा उद्योग केंद्र लगेच पाहू शकता — किंवा तुमच्या भागातील सल्लागार म्हणून नोंदणी करू शकता.
                </p>
              </div>
            )}
          </section>

          {/* Layer 2: Smart Zero-Cost Google Maps Instant Locator (All 36 Districts Hybrid Fallback) */}
          <section className="glass-card rounded-2xl p-5 sm:p-6 border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.07] via-[#0a0f1e]/90 to-transparent space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>
                    Google Maps वर {activeDistrictMarathi} मधील जवळची केंद्रे थेट शोधा
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  एका क्लिकवर तुमच्या भागातील जवळची कार्यालये, फोन नंबर, रेटिंग आणि थेट रस्ता (Directions) पहा
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  title: "महा-ई-सेवा / CSC केंद्रे",
                  subtitle: "उद्यम आधार व शॉप ॲक्ट नोंदणी",
                  url: buildGoogleMapsSearchUrl(activeDistrictForMaps, "udyam"),
                  accent: "text-orange-300 border-orange-500/30 bg-orange-500/10",
                },
                {
                  title: "DPR व CA सल्लागार",
                  subtitle: "प्रकल्प अहवाल, GST व बँक फाईल",
                  url: buildGoogleMapsSearchUrl(activeDistrictForMaps, "dpr"),
                  accent: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
                },
                {
                  title: "शॉप ॲक्ट / FSSAI कन्सल्टंट",
                  subtitle: "गुमास्ता, अन्न परवाना व लायसन्स",
                  url: buildGoogleMapsSearchUrl(activeDistrictForMaps, "shop_act"),
                  accent: "text-amber-300 border-amber-500/30 bg-amber-500/10",
                },
                {
                  title: "जिल्हा उद्योग केंद्र (DIC)",
                  subtitle: "अधिकृत शासकीय उद्योग कार्यालय",
                  url: buildGoogleMapsSearchUrl(
                    activeDistrictForMaps,
                    undefined,
                    "District Industries Centre DIC Office"
                  ),
                  accent: "text-sky-300 border-sky-500/30 bg-sky-500/10",
                },
              ].map((card) => (
                <a
                  key={card.title}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/40 p-3.5 flex flex-col justify-between gap-3 transition group"
                >
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${card.accent}`}
                    >
                      <Navigation className="w-3 h-3" />
                      {activeDistrictMarathi}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-200 transition">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300">
                    Google Maps उघडा
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Official Village-Level Locators & Bank Saathi Helplines */}
          <section className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>
                  गाव-निहाय अधिकृत केंद्र लोकेटर व बँक साथी हेल्पलाईन (आपले सरकार / CSC / UMED)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                तुमच्या गावातील महा-ई-सेवा, CSC केंद्र, बँक सखी (UMED) किंवा बँक मित्र शोधण्यासाठी अधिकृत पोर्टल व टोल-फ्री क्रमांक
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {OFFICIAL_VILLAGE_LOCATORS.map((loc) => (
                <div
                  key={loc.id}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-3.5 flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      {loc.title}
                    </h3>
                    <p className="text-[11px] text-orange-300/90 font-medium">
                      {loc.agency}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {loc.services}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                      <strong className="text-slate-300">कसे शोधायचे:</strong>{" "}
                      {loc.howToFind}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[11px]">
                    <span className="font-space text-emerald-300 font-semibold truncate">
                      📞 {loc.helpline}
                    </span>
                    <a
                      href={loc.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200 font-semibold shrink-0"
                    >
                      पोर्टल उघडा
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Become a Partner CTA */}
          <section className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                तुम्ही CA, DPR तज्ज्ञ किंवा महा-ई-सेवा केंद्र चालक आहात का?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                भाजप उद्योग आघाडीच्या या नेटवर्कमध्ये सामील व्हा आणि तुमच्या जिल्ह्यातील उद्योजकांना उद्यम, शॉप ॲक्ट व DPR कामात मदत करा.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-orange-500/40 text-orange-200 text-xs sm:text-sm font-bold shrink-0 transition"
            >
              <PlusCircle className="w-4 h-4 text-[#FF6B00]" />
              <span>सल्लागार नोंदणी फॉर्म भरा</span>
            </button>
          </section>
        </main>

        <ServicePartnerModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onSave={handlePublicRegister}
          isAdmin={false}
          defaultDistrict={
            selectedDistrict !== "all" ? selectedDistrict : profile?.district
          }
        />
      </div>
    </ErrorBoundary>
  );
}

export default function LocalHelpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-400 text-sm">
          स्थानिक सेवा केंद्रे लोड होत आहेत...
        </div>
      }
    >
      <LocalHelpContent />
    </Suspense>
  );
}
