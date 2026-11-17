"use client";

import React, { useEffect, useState } from "react";
import { X, UserCheck, MapPin, Briefcase, Layers, Phone, Award, Shield } from "lucide-react";
import {
  BUSINESS_STAGES,
  CASTE_CATEGORIES,
  INDUSTRY_SECTORS,
  MAHARASHTRA_DISTRICTS,
} from "@/data/departments";
import { EntrepreneurProfile } from "@/types";
import { saveProfile, saveToUsersRegistry } from "@/lib/storage";
import { saveEntrepreneurToFirestore } from "@/lib/firestore-service";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: EntrepreneurProfile | null;
  onSave: (profile: EntrepreneurProfile) => void;
  isMandatoryPrompt?: boolean;
}

export function ProfileModal({
  isOpen,
  onClose,
  initialProfile,
  onSave,
  isMandatoryPrompt = false,
}: ProfileModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[25]); // पुणे default
  const [caste, setCaste] = useState(CASTE_CATEGORIES[0]); // मराठा default
  const [sector, setSector] = useState(INDUSTRY_SECTORS[0]);
  const [stage, setStage] = useState(BUSINESS_STAGES[1]);
  const [udyamNumber, setUdyamNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || "");
      setMobile(initialProfile.mobile || "");
      setDistrict(initialProfile.district || MAHARASHTRA_DISTRICTS[25]);
      setCaste(initialProfile.caste || CASTE_CATEGORIES[0]);
      setSector(initialProfile.sector || INDUSTRY_SECTORS[0]);
      setStage(initialProfile.stage || BUSINESS_STAGES[1]);
      setUdyamNumber(initialProfile.udyamNumber || "");
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("कृपया तुमचे पूर्ण नाव लिहा.");
      return;
    }
    const profile: EntrepreneurProfile = {
      name: name.trim(),
      mobile: mobile.trim(),
      district,
      caste,
      sector,
      stage,
      udyamNumber: udyamNumber.trim(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    saveToUsersRegistry(profile);
    void saveEntrepreneurToFirestore(profile);
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-orange-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden animate-msgIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#f59e0b] p-[1px] shadow-lg shadow-orange-500/25">
              <div className="w-full h-full rounded-[11px] bg-[#0a0f1e] flex items-center justify-center text-[#FF6B00]">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>उद्योजक नोंदणी प्रोफाइल</span>
                {isMandatoryPrompt && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    नोंदणी करा
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                भाजप उद्योग आघाडी • अचूक शासकीय सबसिडी व योजना मार्गदर्शनासाठी
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="बंद करा"
            title={isMandatoryPrompt ? "नंतर भरा (Skip)" : "बंद करा"}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Notice */}
        <div className="px-6 pt-3.5 pb-1">
          <div className="rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/25 p-3 text-xs text-orange-200 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              तुमच्या <strong>प्रवर्ग (Caste)</strong>, <strong>जिल्हा</strong> आणि <strong>उद्योग प्रकारानुसार</strong> योग्य सरकारी अनुदान (उदा. अण्णासाहेब पाटील महामंडळ, CMEGP ३५% सबसिडी किंवा मुद्रा कर्ज) मिळवून देण्यासाठी ही माहिती आवश्यक आहे.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto chat-scrollbar">
          {error && (
            <div className="text-xs text-red-300 bg-red-500/15 border border-red-500/30 rounded-xl px-3.5 py-2.5 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              उद्योजकाचे पूर्ण नाव *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="उदा. राजेश विठ्ठलराव पाटील"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                मोबाईल क्रमांक (WhatsApp) *
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="उदा. 98XXXXXXXX"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
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
          </div>

          {/* Social Category / Caste Tab Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
              जात / सामाजिक प्रवर्ग (Caste / Category) *
            </label>
            <select
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
              className="w-full rounded-xl bg-[#0b1224] border border-orange-500/30 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
            >
              {CASTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              (अण्णासाहेब पाटील महामंडळ, महात्मा फुले महामंडळ व CMEGP मधील ३५% सबसिडी तपासण्यासाठी)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              उद्योग क्षेत्र (Industry Sector)
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
            >
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              व्यवसायाचा टप्पा (Business Stage)
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-xl bg-[#0b1224] border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
            >
              {BUSINESS_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Udyam क्रमांक (असल्यास - ऐच्छिक)
            </label>
            <input
              type="text"
              value={udyamNumber}
              onChange={(e) => setUdyamNumber(e.target.value)}
              placeholder="UDYAM-MH-XX-XXXXXXX"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-300 hover:bg-white/5 transition"
            >
              {isMandatoryPrompt ? "नंतर भरा (Skip)" : "रद्द करा"}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition"
            >
              माहिती जतन करा व सुरू करा
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
