"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionId } from "@/types";

type SocialCategory = "General" | "OBC" | "SC" | "ST" | "Women";
type LocationType = "Rural" | "Urban";
type SectorType =
  | "Manufacturing"
  | "Services"
  | "Agro-Processing"
  | "Retail"
  | "Artisan";

interface InvestmentOption {
  id: string;
  label: string;
  amountLakhs: number;
}

const INVESTMENT_RANGES: InvestmentOption[] = [
  { id: "1-5", label: "₹१ लाख ते ₹५ लाख", amountLakhs: 5 },
  { id: "5-15", label: "₹५ लाख ते ₹१५ लाख", amountLakhs: 15 },
  { id: "15-50", label: "₹१५ लाख ते ₹५० लाख", amountLakhs: 50 },
  { id: "50-200", label: "₹५० लाख ते ₹२ कोटी", amountLakhs: 200 },
  { id: "200-500", label: "₹२ कोटी ते ₹५ कोटी+", amountLakhs: 500 },
];

interface MatchedScheme {
  id: string;
  name: string;
  section: SectionId;
  subsidyPercent: string;
  estimatedBenefit: string;
  maxLimit: string;
  reason: string;
  portalUrl: string;
}

export default function SchemeFinderPage() {
  const router = useRouter();
  const [category, setCategory] = useState<SocialCategory>("General");
  const [location, setLocation] = useState<LocationType>("Rural");
  const [sector, setSector] = useState<SectorType>("Manufacturing");
  const [investmentId, setInvestmentId] = useState<string>("15-50");

  const selectedInv =
    INVESTMENT_RANGES.find((r) => r.id === investmentId) || INVESTMENT_RANGES[2];

  const matchedSchemes = useMemo<MatchedScheme[]>(() => {
    const results: MatchedScheme[] = [];
    const amount = selectedInv.amountLakhs;
    const isSpecial = category !== "General";

    // 1. CMEGP (Maharashtra)
    const cmegpMax = sector === "Manufacturing" ? 50 : 20;
    if (amount <= 50 && sector !== "Retail") {
      const pct =
        location === "Rural"
          ? isSpecial
            ? 35
            : 25
          : isSpecial
          ? 25
          : 15;
      const eligibleProjectCost = Math.min(amount, cmegpMax);
      const subsidyAmt = ((eligibleProjectCost * pct) / 100).toFixed(2);
      results.push({
        id: "cmegp",
        name: "मुख्यमंत्री रोजगार निर्मिती कार्यक्रम (CMEGP - महाराष्ट्र)",
        section: "loans",
        subsidyPercent: `${pct}% भांडवली अनुदान`,
        estimatedBenefit: `अंदाजे ₹${subsidyAmt} लाखांपर्यंत सबसिडी`,
        maxLimit: `कमाल ₹${cmegpMax} लाख प्रकल्प खर्च`,
        reason: `${location === "Rural" ? "ग्रामीण" : "शहरी"} व ${category} प्रवर्गासाठी थेट राज्य शासन अनुदान.`,
        portalUrl: "https://cmegp.mahaonline.gov.in",
      });
    }

    // 2. PMEGP (Central)
    const pmegpMax = sector === "Manufacturing" ? 50 : 20;
    if (amount <= 50 && sector !== "Retail") {
      const pct =
        location === "Rural"
          ? isSpecial
            ? 35
            : 25
          : isSpecial
          ? 25
          : 15;
      const eligibleCost = Math.min(amount, pmegpMax);
      const subsidyAmt = ((eligibleCost * pct) / 100).toFixed(2);
      results.push({
        id: "pmegp",
        name: "प्रधानमंत्री रोजगार निर्मिती कार्यक्रम (PMEGP)",
        section: "loans",
        subsidyPercent: `${pct}% मार्जिन मनी सबसिडी`,
        estimatedBenefit: `अंदाजे ₹${subsidyAmt} लाखांपर्यंत सबसिडी`,
        maxLimit: `कमाल ₹${pmegpMax} लाख प्रकल्प मर्यादा`,
        reason: "नवीन सूक्ष्म उद्योगासाठी केंद्र सरकारची थेट बँक-लिंक्ड सबसिडी.",
        portalUrl: "https://www.kviconline.gov.in/pmegpeportal",
      });
    }

    // 3. Mudra Yojana (PMMY)
    if (amount <= 20) {
      results.push({
        id: "mudra",
        name: "प्रधानमंत्री मुद्रा योजना (PMMY - शिशु / किशोर / तरुण प्लस)",
        section: "loans",
        subsidyPercent: "०% तारण (Collateral-Free)",
        estimatedBenefit: "जामिनदाराशिवाय ₹२० लाखांपर्यंत कर्ज",
        maxLimit: "₹५० हजार ते ₹२० लाख",
        reason: "लहान व्यवसाय, सेवा व व्यापारासाठी जलद विना-तारण कर्ज.",
        portalUrl: "https://www.jansamarth.in",
      });
    }

    // 4. Annasaheb Patil Mahamandal
    if (amount <= 50 && (category === "General" || category === "Women")) {
      results.push({
        id: "annasaheb",
        name: "अण्णासाहेब पाटील महामंडळ व्याज परतावा योजना",
        section: "mahila_yuva",
        subsidyPercent: "१२% पर्यंत संपूर्ण व्याज परतावा",
        estimatedBenefit: "₹१५ लाखांपर्यंत कर्जावर कमाल ₹४.५ लाख व्याज परतावा",
        maxLimit: "वैयक्तिक ₹१५ लाख (गट कर्ज ₹५० लाख)",
        reason: "EWS / आर्थिकदृष्ट्या दुर्बल व मराठा उद्योजकांसाठी बिनव्याजी भांडवल सुविधा.",
        portalUrl: "https://udyog.mahaswayam.gov.in",
      });
    }

    // 5. PM Vishwakarma
    if (sector === "Artisan" && amount <= 15) {
      results.push({
        id: "vishwakarma",
        name: "पीएम विश्वकर्मा कारागीर योजना",
        section: "mahila_yuva",
        subsidyPercent: "₹१५,००० टूलकिट + ५% व्याजदर",
        estimatedBenefit: "५% सवलतीच्या व्याजाने ₹३ लाखांपर्यंत तारणमुक्त कर्ज",
        maxLimit: "टप्पा १: ₹१ लाख | टप्पा २: ₹२ लाख",
        reason: "१८ पारंपारिक कारागिरांसाठी प्रशिक्षण, स्टायपेंड व आधुनिक अवजारे मदत.",
        portalUrl: "https://pmvishwakarma.gov.in",
      });
    }

    // 6. Stand-Up India
    if (
      amount >= 10 &&
      (category === "Women" || category === "SC" || category === "ST")
    ) {
      results.push({
        id: "standup",
        name: "स्टँड-अप इंडिया योजना (Stand-Up India)",
        section: "mahila_yuva",
        subsidyPercent: "ग्रीनफील्ड प्रोजेक्ट कर्ज",
        estimatedBenefit: "₹१० लाख ते ₹१ कोटीपर्यंत बँक कर्ज (CGFSIL हमीसह)",
        maxLimit: "₹१ कोटी मर्यादा",
        reason: `${category} प्रवर्गातील नवीन उद्योजकांसाठी विशेष बँक कर्ज तरतूद.`,
        portalUrl: "https://www.standupmitra.in",
      });
    }

    // 7. PSI & CGTMSE for bigger investments
    if (amount >= 15) {
      results.push({
        id: "cgtmse",
        name: "CGTMSE तारणमुक्त कर्ज हमी योजना",
        section: "loans",
        subsidyPercent: "७५% ते ८५% क्रेडिट गॅरंटी",
        estimatedBenefit: "तारणाशिवाय ₹५ कोटींपर्यंत टर्म लोन / CC",
        maxLimit: "₹५ कोटी (विशिष्ट क्षेत्रात ₹१० कोटी)",
        reason: "मोठ्या प्रकल्पांसाठी जमीन-घर गहाण न ठेवता बँक कर्ज मिळवण्यासाठी.",
        portalUrl: "https://www.cgtmse.in",
      });
    }

    if (sector === "Manufacturing" || sector === "Agro-Processing") {
      results.push({
        id: "psi",
        name: "महाराष्ट्र सामूहिक प्रोत्साहन योजना (PSI)",
        section: "midc",
        subsidyPercent: "१००% मुद्रांक शुल्क + ५% व्याज अनुदान",
        estimatedBenefit: "SGST परतावा व ७-१० वर्षे वीज शुल्क माफी",
        maxLimit: "स्थिर गुंतवणुकीच्या १००% पर्यंत लाभ",
        reason: "महाराष्ट्रातील उत्पादन व कृषी-प्रक्रिया उद्योगांना दीर्घकालीन कर परतावा.",
        portalUrl: "https://maitri.maharashtra.gov.in",
      });
    }

    return results;
  }, [category, location, sector, selectedInv]);

  const openChatWithScheme = (scheme: MatchedScheme) => {
    const prompt = `माझी माहिती: प्रवर्ग ${category}, ठिकाण ${location}, क्षेत्र ${sector}, गुंतवणूक ${selectedInv.label}. मला "${scheme.name}" या योजनेसाठी सविस्तर पात्रता, कागदपत्रे, प्रकल्प अहवाल (DPR) आणि अर्ज करण्याची पायरी-पायरीने प्रक्रिया सांगा.`;
    try {
      sessionStorage.setItem("selectedSection", scheme.section);
      sessionStorage.setItem("pendingMessage", prompt);
    } catch {
      // ignore
    }
    router.push("/chat");
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#030712] pb-16">
        <AmbientBackground particlesEnabled={false} />

        <header className="relative z-10 border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
              मुख्यपृष्ठ
            </Link>

            <div className="text-center">
              <h1 className="text-sm sm:text-lg font-bold metallic-text">
                AI उद्योग योजना व कर्ज पात्रता तपासणी
              </h1>
              <p className="text-[11px] text-slate-400">
                भाजप उद्योग आघाडी • त्वरित सबसिडी व योजना मार्गदर्शक
              </p>
            </div>

            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/35 text-orange-200 hover:bg-[#FF6B00]/25 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              AI संवाद
            </Link>
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* Selector Card */}
          <section className="glass-card rounded-2xl p-5 sm:p-7 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/35 flex items-center justify-center text-[#FF6B00]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  तुमच्या उद्योगाचा तपशील निवडा
                </h2>
                <p className="text-xs text-slate-400">
                  खालील ४ निकष निवडताच तुम्हाला लागू होणाऱ्या केंद्र व राज्य योजना आणि अंदाजित सबसिडी लगेच दिसेल.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  १. प्रवर्ग (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SocialCategory)}
                  className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="General">खुला / सर्वसाधारण (General)</option>
                  <option value="OBC">इतर मागासवर्गीय (OBC)</option>
                  <option value="SC">अनुसूचित जाती (SC)</option>
                  <option value="ST">अनुसूचित जमाती (ST)</option>
                  <option value="Women">महिला उद्योजक (Women)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  २. उद्योगाचे ठिकाण (Location)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Rural">ग्रामीण भाग (Rural)</option>
                  <option value="Urban">शहरी / महानगर (Urban)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ३. उद्योग क्षेत्र (Sector)
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as SectorType)}
                  className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Manufacturing">उत्पादन (Manufacturing)</option>
                  <option value="Agro-Processing">कृषी-प्रक्रिया (Agro-Processing)</option>
                  <option value="Services">सेवा व्यवसाय (Services)</option>
                  <option value="Retail">किरकोळ / व्यापार (Retail/Trading)</option>
                  <option value="Artisan">पारंपारिक कारागीर (Artisan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ४. अंदाजित गुंतवणूक (Investment)
                </label>
                <select
                  value={investmentId}
                  onChange={(e) => setInvestmentId(e.target.value)}
                  className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  {INVESTMENT_RANGES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Matched Schemes Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                तुमच्यासाठी पात्र योजना ({matchedSchemes.length})
              </h2>
              <span className="text-xs text-slate-400">
                गुंतवणूक: {selectedInv.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {matchedSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="glass-card glass-card-hover rounded-2xl p-5 border border-white/10 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-white leading-snug">
                        {scheme.name}
                      </h3>
                      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300">
                        {scheme.subsidyPercent}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/25 px-3.5 py-2.5 flex items-center gap-2 text-xs text-orange-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                      <span>{scheme.estimatedBenefit}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {scheme.reason}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      मर्यादा: <span className="text-slate-200">{scheme.maxLimit}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={scheme.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                    >
                      अधिकृत पोर्टल
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => openChatWithScheme(scheme)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      AI सोबत सविस्तर चर्चा करा
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}

