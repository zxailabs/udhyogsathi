"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  X,
} from "lucide-react";
import { MAHARASHTRA_DISTRICTS } from "@/data/departments";
import { SERVICE_CATEGORIES } from "@/lib/local-help";
import { LocalServicePartner, ServiceCategory } from "@/types";

interface ServicePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: LocalServicePartner) => void;
  initialPartner?: LocalServicePartner | null;
  isAdmin?: boolean;
  defaultDistrict?: string;
}

export function ServicePartnerModal({
  isOpen,
  onClose,
  onSave,
  initialPartner = null,
  isAdmin = false,
  defaultDistrict,
}: ServicePartnerModalProps) {
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [district, setDistrict] = useState(
    defaultDistrict || MAHARASHTRA_DISTRICTS[25]
  );
  const [talukaOrArea, setTalukaOrArea] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [services, setServices] = useState<ServiceCategory[]>([
    "udyam",
    "shop_act",
  ]);
  const [verifiedByAghadi, setVerifiedByAghadi] = useState(isAdmin);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (initialPartner) {
      setName(initialPartner.name);
      setRoleTitle(initialPartner.roleTitle);
      setDistrict(initialPartner.district);
      setTalukaOrArea(initialPartner.talukaOrArea);
      setAddress(initialPartner.address);
      setMobile(initialPartner.mobile);
      setWhatsapp(initialPartner.whatsapp || "");
      setGoogleMapsUrl(initialPartner.googleMapsUrl || "");
      setServices(
        initialPartner.services.length > 0
          ? initialPartner.services
          : ["udyam"]
      );
      setVerifiedByAghadi(initialPartner.verifiedByAghadi);
      setNotes(initialPartner.notes || "");
    } else {
      setName("");
      setRoleTitle("");
      setDistrict(defaultDistrict || MAHARASHTRA_DISTRICTS[25]);
      setTalukaOrArea("");
      setAddress("");
      setMobile("");
      setWhatsapp("");
      setGoogleMapsUrl("");
      setServices(["udyam", "shop_act"]);
      setVerifiedByAghadi(isAdmin);
      setNotes("");
    }
    setError("");
  }, [initialPartner, isOpen, isAdmin, defaultDistrict]);

  if (!isOpen) return null;

  const toggleService = (id: ServiceCategory) => {
    setServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("कृपया सल्लागाराचे किंवा केंद्राचे नाव लिहा.");
      return;
    }
    if (!roleTitle.trim()) {
      setError("कृपया ओळख / पद लिहा (उदा. DPR सल्लागार / महा-ई-सेवा केंद्र / CA).");
      return;
    }
    if (!talukaOrArea.trim() || !address.trim()) {
      setError("कृपया तालुका/परिसर आणि पूर्ण पत्ता लिहा.");
      return;
    }
    const cleanDigits = mobile.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("कृपया १० अंकी वैध मोबाईल नंबर लिहा.");
      return;
    }
    if (services.length === 0) {
      setError("कृपया किमान एक सेवा निवडा.");
      return;
    }

    const partner: LocalServicePartner = {
      id: initialPartner?.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      district,
      talukaOrArea: talukaOrArea.trim(),
      address: address.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      services,
      verifiedByAghadi: isAdmin ? verifiedByAghadi : false,
      status: isAdmin ? initialPartner?.status || "approved" : "pending",
      notes: notes.trim() || undefined,
      createdAt: initialPartner?.createdAt || new Date().toISOString(),
    };

    onSave(partner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-orange-500/35 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden animate-msgIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.03] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#f59e0b] p-[1px] shadow-lg shadow-orange-500/25">
              <div className="w-full h-full rounded-[11px] bg-[#0a0f1e] flex items-center justify-center text-[#FF6B00]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {initialPartner
                  ? "स्थानिक सेवा केंद्र माहिती सुधारा"
                  : isAdmin
                  ? "नवीन प्रमाणित सेवा केंद्र / सल्लागार जोडा"
                  : "सेवा सहाय्यक / सल्लागार म्हणून नोंदणी करा"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAdmin
                  ? "हे केंद्र थेट युझर्सना त्यांच्या जिल्ह्यानुसार चॅट व डिरेक्टरीमध्ये दिसेल"
                  : "CA, DPR तज्ज्ञ, महा-ई-सेवा चालक किंवा समन्वयक — Admin मंजुरीनंतर यादीत दिसेल"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto chat-scrollbar p-5 sm:p-6 space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                व्यक्ती / केंद्र / संस्थेचे नाव *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="उदा. श्री समर्थ उद्योग सल्लागार / CA राजेश कुलकर्णी"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ओळख / पद *
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => {
                  setRoleTitle(e.target.value);
                  setError("");
                }}
                placeholder="उदा. DPR सल्लागार / महा-ई-सेवा केंद्र / CA"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                जिल्हा (महाराष्ट्र) *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                तालुका / शहर / परिसर *
              </label>
              <input
                type="text"
                value={talukaOrArea}
                onChange={(e) => setTalukaOrArea(e.target.value)}
                placeholder="उदा. बारामती / कोथरूड / MIDC परिसर"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              संपूर्ण ऑफिस पत्ता *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="उदा. दुकान क्र. ५, महावीर कॉम्प्लेक्स, मुख्य चौक, पिनकोड..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                मोबाईल नंबर (कॉलसाठी) *
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp नंबर (पर्यायी)
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="वरीलच असल्यास रिकामे ठेवा"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              Google Maps लोकेशन लिंक (पर्यायी — नसल्यास पत्त्यावरून आपोआप तयार होईल)
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Multi-select services */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              कोणकोणत्या सेवा देता? (किमान एक निवडा) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICE_CATEGORIES.map((svc) => {
                const selected = services.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-xs transition ${
                      selected
                        ? "bg-[#FF6B00]/20 border-[#FF6B00]/50 text-white font-semibold"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        selected
                          ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                          : "border-white/25 bg-black/30"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </span>
                    <span className="truncate">{svc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              अतिरिक्त माहिती / कामकाजाची वेळ (पर्यायी)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. सोम-शनि सकाळी १० ते ६, सर्व शासकीय योजना व बँक फाईल मार्गदर्शन"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {isAdmin && (
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedByAghadi}
                onChange={(e) => setVerifiedByAghadi(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-200">
                &ldquo;भाजप उद्योग आघाडी प्रमाणित&rdquo; (Verified Badge) दाखवा
              </span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition"
            >
              {initialPartner
                ? "बदल जतन करा"
                : isAdmin
                ? "केंद्र जतन करा (थेट लाईव्ह)"
                : "नोंदणी विनंती पाठवा"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
