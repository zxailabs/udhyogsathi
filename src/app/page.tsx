"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Factory,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DepartmentIcon } from "@/components/DepartmentIcon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VoiceButton } from "@/components/VoiceButton";
import { DEPARTMENTS } from "@/data/departments";
import {
  AuthSession,
  PARTICLES_STORAGE_KEY,
  loadAuthSession,
  loadProfile,
} from "@/lib/storage";
import { EntrepreneurProfile, SectionId } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<SectionId>("msme");
  const [topicMenuOpen, setTopicMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setAuth(loadAuthSession());
    try {
      const savedParticles = localStorage.getItem(PARTICLES_STORAGE_KEY);
      if (savedParticles !== null) {
        setParticlesEnabled(savedParticles === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTopicMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleParticles = () => {
    setParticlesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PARTICLES_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    try {
      sessionStorage.setItem("selectedSection", selectedTopic);
      sessionStorage.setItem("pendingMessage", text);
    } catch {
      // ignore
    }
    router.push("/chat");
  };

  const activeTopicObj = DEPARTMENTS.find((d) => d.id === selectedTopic) || DEPARTMENTS[0];

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen flex flex-col justify-between">
        <AmbientBackground particlesEnabled={particlesEnabled} />

        {/* Header */}
        <header className="relative z-20 border-b border-white/[0.07] bg-[#030712]/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            {/* Left Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-[1px] shadow-lg shadow-slate-300/10">
                <div className="w-full h-full rounded-[15px] bg-[#0a0f1e] flex items-center justify-center text-lg">
                  <Factory className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg sm:text-xl tracking-tight metallic-silver-hero">
                    udhyog
                  </span>
                  <span className="font-space font-bold text-xs sm:text-sm tracking-widest px-2 py-0.5 rounded-md bg-white/[0.08] border border-slate-300/30 text-slate-100 shadow-inner">
                    SAATHI
                  </span>
                  <span className="hidden md:inline-block text-xs text-slate-300/90 font-semibold ml-1">
                    | भाजप उद्योग आघाडी
                  </span>
                </div>
                <p className="font-space text-[10px] sm:text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                  BJP UDHYOG AGHADI • MAHARASHTRA
                </p>
              </div>
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                href="/local-help"
                title="तुमच्या जिल्ह्यातील उद्यम, शॉप ॲक्ट व DPR सल्लागार"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-xs font-semibold transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">स्थानिक मदत केंद्रे</span>
              </Link>

              <button
                type="button"
                onClick={toggleParticles}
                title={particlesEnabled ? "कण प्रभाव बंद करा" : "कण प्रभाव सुरू करा"}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  particlesEnabled
                    ? "bg-[#FF6B00]/15 border-[#FF6B00]/40 text-orange-200"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">पार्टिकल्स</span>
              </button>

              {profile?.name && (
                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-500/20 transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="font-semibold">{profile.name}जी</span>
                  <span className="text-emerald-400/70">•</span>
                  <span className="text-slate-300 max-w-[110px] truncate">
                    {profile.district.split(" ")[0]}
                  </span>
                </button>
              )}

              {auth?.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs font-semibold hover:bg-amber-500/25 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs sm:text-sm font-semibold text-white transition"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{auth ? "प्रोफाइल" : "लॉगिन"}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Centered Hero + Prompt Box */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
          <section className="text-center max-w-3xl mx-auto mb-10 animate-msgIn">
            {/* Premium Silver Organization Crest */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-slate-300/25 shadow-[0_0_24px_rgba(226,232,240,0.08)] backdrop-blur-md mb-6">
              <span className="h-[1px] w-5 bg-gradient-to-r from-transparent to-slate-300/70" />
              <span className="text-xs sm:text-sm font-bold tracking-wider metallic-silver-sheen">
                भाजप उद्योग आघाडी • महाराष्ट्र प्रदेश
              </span>
              <span className="h-[1px] w-5 bg-gradient-to-l from-transparent to-slate-300/70" />
            </div>

            {/* Luxury Liquid-Silver Hero Title */}
            <h1 className="font-extrabold tracking-tight leading-normal mb-2">
              <span className="inline-flex flex-wrap items-center justify-center gap-3 text-4xl sm:text-6xl md:text-[64px]">
                <span className="metallic-silver-hero px-1">उद्योग साथी</span>
                <span className="font-space text-2xl sm:text-4xl md:text-[42px] px-3.5 py-1 rounded-2xl bg-gradient-to-b from-slate-100/20 via-slate-300/10 to-slate-500/10 border border-slate-200/35 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_8px_24px_rgba(0,0,0,0.45)] tracking-wider">
                  AI
                </span>
              </span>
            </h1>

            {/* Premium Silver Hairline Divider + Tagline */}
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />
              <p className="text-lg sm:text-2xl font-bold tracking-wide metallic-text">
                &ldquo;उद्योगापासून समृद्धीपर्यंत — तुमच्या सोबत&rdquo;
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              महाराष्ट्रातील उद्योजक, MSME, स्टार्टअप्स आणि व्यापाऱ्यांसाठी २४x७ रिअल-टाइम AI मार्गदर्शक मंच
            </p>
          </section>

          {/* Prominent Glassmorphic Silver-Trimmed Type Box with Topic Dropdown */}
          <section className="w-full max-w-3xl mx-auto relative" ref={menuRef}>
            <form
              onSubmit={handlePromptSubmit}
              className="glass-panel rounded-2xl p-3 sm:p-3.5 border border-slate-300/20 hover:border-slate-200/35 focus-within:border-slate-200/50 shadow-[0_20px_70px_rgba(0,0,0,0.75),0_0_40px_rgba(226,232,240,0.06)] flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between sm:justify-start gap-2 relative">
                <button
                  type="button"
                  onClick={() => setTopicMenuOpen((o) => !o)}
                  aria-expanded={topicMenuOpen}
                  aria-haspopup="listbox"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-slate-300/20 text-xs font-semibold text-slate-100 transition shrink-0"
                >
                  <Menu className="w-4 h-4 text-slate-200" />
                  <span className="max-w-[160px] truncate">{activeTopicObj.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      topicMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="flex sm:hidden items-center gap-2">
                  <VoiceButton onTranscript={(text) => setPrompt(text)} />
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    aria-label="पाठवा"
                    className="w-10 h-10 rounded-xl bg-gradient-to-b from-white via-slate-200 to-slate-400 text-slate-950 font-bold flex items-center justify-center disabled:opacity-40 shadow-lg shadow-white/10"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePromptSubmit();
                  }
                }}
                placeholder="तुमचा उद्योगासंबंधी प्रश्न इथे लिहा..."
                className="flex-1 bg-transparent px-2.5 py-2 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none resize-none max-h-32"
              />

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <VoiceButton onTranscript={(text) => setPrompt(text)} />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-b from-white via-slate-200 to-slate-400 text-slate-950 text-xs sm:text-sm font-bold shadow-[0_4px_20px_rgba(226,232,240,0.2)] hover:brightness-105 disabled:opacity-40 transition"
                >
                  <span>विचारा</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {topicMenuOpen && (
              <div
                role="listbox"
                aria-label="प्रश्नासाठी विभाग निवडा"
                className="absolute bottom-full left-0 mb-2.5 w-72 sm:w-80 glass-panel rounded-2xl border border-slate-300/20 shadow-2xl p-2 max-h-72 overflow-y-auto chat-scrollbar animate-msgIn z-40"
              >
                <p className="text-[11px] font-semibold text-slate-400 px-3 py-1.5">
                  प्रश्नासाठी विभाग निवडा:
                </p>
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    role="option"
                    aria-selected={selectedTopic === dept.id}
                    onClick={() => {
                      setSelectedTopic(dept.id);
                      setTopicMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition ${
                      selectedTopic === dept.id
                        ? "bg-[#FF6B00]/20 text-white border border-[#FF6B00]/40"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span style={{ color: dept.color }}>
                      <DepartmentIcon name={dept.iconName} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{dept.title}</p>
                      <p className="text-[10px] text-slate-400 font-space truncate">
                        {dept.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="relative z-10 py-4 text-center text-[11px] text-slate-500">
          भाजप उद्योग आघाडी, महाराष्ट्र प्रदेश • उद्योग साथी AI
        </footer>
      </div>
    </ErrorBoundary>
  );
}
