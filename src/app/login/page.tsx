"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Layers,
  LogOut,
  MapPin,
  Phone,
  UserCheck,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  BUSINESS_STAGES,
  CASTE_CATEGORIES,
  INDUSTRY_SECTORS,
  MAHARASHTRA_DISTRICTS,
} from "@/data/departments";
import {
  AuthSession,
  loadAuthSession,
  loadProfile,
  saveAuthSession,
  saveProfile,
} from "@/lib/storage";
import { saveEntrepreneurToFirestore } from "@/lib/firestore-service";

export default function LoginPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthSession | null>(null);

  // Entrepreneur fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[25]);
  const [caste, setCaste] = useState(CASTE_CATEGORIES[0]);
  const [sector, setSector] = useState(INDUSTRY_SECTORS[0]);
  const [stage, setStage] = useState(BUSINESS_STAGES[1]);
  const [error, setError] = useState("");

  useEffect(() => {
    setAuth(loadAuthSession());
    const prof = loadProfile();
    if (prof) {
      setName(prof.name);
      setMobile(prof.mobile || "");
      setDistrict(prof.district);
      if (prof.caste) setCaste(prof.caste);
      setSector(prof.sector);
      setStage(prof.stage);
    }
  }, []);

  const handleEntrepreneurLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("कृपया तुमचे पूर्ण नाव प्रविष्ट करा.");
      return;
    }
    const entrepreneurProfile = {
      name: name.trim(),
      mobile: mobile.trim(),
      district,
      caste,
      sector,
      stage,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(entrepreneurProfile);
    void saveEntrepreneurToFirestore(entrepreneurProfile);
    saveAuthSession({
      role: "entrepreneur",
      name: name.trim(),
      loggedInAt: new Date().toISOString(),
    });
    router.push("/chat");
  };

  const handleLogout = () => {
    saveAuthSession(null);
    setAuth(null);
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#030712] flex flex-col">
        <AmbientBackground particlesEnabled={false} />

        {/* Top Header */}
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
              भाजप उद्योग आघाडी — उद्योजक नोंदणी कक्ष
            </span>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 sm:p-7 border border-white/10 space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-3 pb-2 border-b border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#f59e0b] p-[1px] shadow-lg shadow-orange-500/25 shrink-0">
                <div className="w-full h-full rounded-[11px] bg-[#0a0f1e] flex items-center justify-center text-[#FF6B00]">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">
                  उद्योजक नोंदणी व लॉगिन
                </h1>
                <p className="text-xs text-slate-400">
                  अचूक शासकीय सबसिडी, महामंडळ व AI मार्गदर्शनासाठी प्रोफाइल नोंदवा
                </p>
              </div>
            </div>

            {auth && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-bold text-emerald-300">
                    सध्या नोंदणीकृत: {auth.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  बाहेर पडा
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleEntrepreneurLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  उद्योजकाचे नाव *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="उदा. राजेश पाटील"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    मोबाईल क्रमांक
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
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    जिल्हा (महाराष्ट्र)
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
                  (अण्णासाहेब पाटील महामंडळ, महात्मा फुले महामंडळ व CMEGP सबसिडी तपासणीसाठी)
                </p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  उद्योग क्षेत्र
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
                  व्यवसाय टप्पा
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

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition"
              >
                प्रोफाइल जतन करून AI संवाद सुरू करा
              </button>
            </form>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
