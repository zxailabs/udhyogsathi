"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Sparkles,
} from "lucide-react";
import { MAHARASHTRA_DISTRICTS } from "@/data/departments";
import {
  buildGoogleMapsSearchUrl,
  buildPartnerMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  getDistrictMarathiName,
  getPartnerWhatsAppNumber,
  getServiceCategoryInfo,
  matchLocalPartners,
} from "@/lib/local-help";
import { LocalServicePartner, ServiceCategory } from "@/types";

interface LocalHelpCardProps {
  partners: LocalServicePartner[];
  userDistrict?: string;
  userName?: string;
  detectedServices: ServiceCategory[];
}

export function LocalHelpCard({
  partners,
  userDistrict,
  userName,
  detectedServices,
}: LocalHelpCardProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    userDistrict || MAHARASHTRA_DISTRICTS[25] // पुणे default
  );

  const primaryService = detectedServices[0];
  const primaryServiceMeta = primaryService
    ? getServiceCategoryInfo(primaryService)
    : null;

  const matchedPartners = useMemo(
    () => matchLocalPartners(partners, selectedDistrict, detectedServices),
    [partners, selectedDistrict, detectedServices]
  );

  const districtMarathi = getDistrictMarathiName(selectedDistrict);
  const topPartners = matchedPartners.slice(0, 2);
  const remainingCount = Math.max(0, matchedPartners.length - topPartners.length);

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.08]">
      <div className="rounded-xl bg-gradient-to-br from-[#FF6B00]/[0.09] via-[#0b1224]/90 to-emerald-500/[0.06] border border-[#FF6B00]/30 p-3.5 sm:p-4 space-y-3">
        {/* Header with quick District selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                <span>
                  {districtMarathi} जिल्ह्यातील स्थानिक मदत व सेवा केंद्रे
                </span>
                {primaryServiceMeta && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/35">
                    {primaryServiceMeta.shortLabel}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                त्वरित कागदपत्रे, नोंदणी किंवा DPR मदतीसाठी थेट संपर्क करा किंवा लोकेशन पहा
              </p>
            </div>
          </div>

          <select
            aria-label="जिल्हा बदला"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-lg bg-[#0a1020] border border-white/15 px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-[#FF6B00] shrink-0"
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Partners List (Layer 1 of Hybrid Model) */}
        {topPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {topPartners.map((partner) => {
              const waNumber = getPartnerWhatsAppNumber(partner);
              return (
                <div
                  key={partner.id}
                  className="rounded-xl bg-white/[0.04] border border-white/10 p-3 flex flex-col justify-between gap-2.5 hover:border-orange-500/35 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {partner.name}
                        </p>
                        <p className="text-[11px] text-orange-300/90 font-medium">
                          {partner.roleTitle}
                        </p>
                      </div>
                      {partner.verifiedByAghadi && (
                        <span
                          title="सत्यापित सेवा केंद्र"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-semibold text-emerald-300 shrink-0"
                        >
                          <BadgeCheck className="w-3 h-3" />
                          प्रमाणित
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{partner.talukaOrArea}</strong> — {partner.address}
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-200 font-space font-semibold">
                      📞 {partner.mobile}
                      {partner.secondaryPhone ? ` / ${partner.secondaryPhone}` : ""}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {partner.services.slice(0, 4).map((svcId) => {
                        const meta = getServiceCategoryInfo(svcId);
                        return (
                          <span
                            key={svcId}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.colorClass}`}
                          >
                            {meta.shortLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Call / WhatsApp or Email / Location Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.06]">
                    <a
                      href={buildTelUrl(partner.mobile)}
                      className="flex-1 min-w-[85px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-[11px] font-bold hover:brightness-110 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>कॉल करा</span>
                    </a>
                    {waNumber ? (
                      <a
                        href={buildWhatsAppUrl(
                          waNumber,
                          partner.name,
                          primaryServiceMeta?.label,
                          userName,
                          selectedDistrict
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[95px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : partner.email ? (
                      <a
                        href={`mailto:${partner.email}`}
                        className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-200 text-[11px] font-bold transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>ईमेल</span>
                      </a>
                    ) : null}
                    <a
                      href={buildPartnerMapsUrl(partner)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-[11px] font-semibold transition"
                    >
                      <Navigation className="w-3 h-3 text-sky-400" />
                      <span>लोकेशन</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Layer 2: Smart Google Maps Instant Fallback when district has no registered partner yet */
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 space-y-2.5">
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>{districtMarathi}</strong> जिल्ह्यात अद्याप प्रमाणित सल्लागार नोंदणीकृत नाही. तुम्ही खालील बटनावरून थेट तुमच्या जवळील केंद्रे <strong>Google Maps</strong> वर नंबर व लोकेशनसह पाहू शकता:
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={buildGoogleMapsSearchUrl(selectedDistrict, primaryService)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-200 text-xs font-bold transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>
                  {districtMarathi} मधील {primaryServiceMeta?.shortLabel || "सेवा"} केंद्रे शोधा
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={buildGoogleMapsSearchUrl(
                  selectedDistrict,
                  undefined,
                  "District Industries Centre DIC Office"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-slate-200 text-xs font-semibold transition"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>जिल्हा उद्योग केंद्र (DIC) लोकेशन</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Footer: Always show quick Google Maps nearby search + full directory link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          {topPartners.length > 0 && (
            <a
              href={buildGoogleMapsSearchUrl(selectedDistrict, primaryService)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 font-medium transition"
            >
              <Navigation className="w-3 h-3" />
              <span>
                Google Maps वर {districtMarathi} मधील इतर जवळची केंद्रे पहा
              </span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <Link
            href={`/local-help?district=${encodeURIComponent(selectedDistrict)}${
              primaryService ? `&service=${primaryService}` : ""
            }`}
            className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200 font-semibold ml-auto transition"
          >
            <span>
              {remainingCount > 0
                ? `${districtMarathi} मधील आणखी ${remainingCount} केंद्रे पहा`
                : "सर्व स्थानिक सेवा केंद्रे / सल्लागार पहा"}
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
