"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DepartmentIcon } from "@/components/DepartmentIcon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ProfileModal } from "@/components/ProfileModal";
import { VoiceButton } from "@/components/VoiceButton";
import { DEPARTMENTS, getDepartmentById } from "@/data/departments";
import { PARTICLES_STORAGE_KEY, loadProfile } from "@/lib/storage";
import {
  ChatMessage,
  EntrepreneurProfile,
  GroundingSource,
  SectionId,
  VerifiedSourceMeta,
} from "@/types";

export default function ChatPage() {
  const [selectedSection, setSelectedSection] = useState<SectionId>("msme");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dossierExpanded, setDossierExpanded] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isMandatoryPrompt, setIsMandatoryPrompt] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  const activeDept = getDepartmentById(selectedSection);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const loaded = loadProfile();
    setProfile(loaded);
    if (!loaded || !loaded.name || !loaded.name.trim()) {
      const timer = setTimeout(() => {
        setIsMandatoryPrompt(true);
        setProfileModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
    try {
      const savedParticles = localStorage.getItem(PARTICLES_STORAGE_KEY);
      if (savedParticles !== null) {
        setParticlesEnabled(savedParticles === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(
    async (
      rawText: string,
      overrideSection?: SectionId,
      overrideProfile?: EntrepreneurProfile | null
    ) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      const sectionToUse = overrideSection || selectedSection;
      const profileToUse = overrideProfile !== undefined ? overrideProfile : profile;

      setDossierExpanded(false);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };

      const assistantId = `a-${Date.now() + 1}`;
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            section: sectionToUse,
            history: historyPayload,
            profile: profileToUse,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("सर्व्हरकडून प्रतिसाद मिळाला नाही.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr) as {
                type: string;
                text?: string;
                source?: VerifiedSourceMeta;
                sources?: GroundingSource[];
                model?: string;
                offlineFallback?: boolean;
              };

              if (event.type === "source" && event.source) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, verifiedSource: event.source } : m
                  )
                );
              } else if (event.type === "delta" && typeof event.text === "string") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: m.content + event.text,
                          isOfflineFallback:
                            m.isOfflineFallback || Boolean(event.offlineFallback),
                        }
                      : m
                  )
                );
              } else if (
                event.type === "grounding_sources" &&
                Array.isArray(event.sources)
              ) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, groundingSources: event.sources }
                      : m
                  )
                );
              } else if (event.type === "done") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, modelUsed: event.model } : m
                  )
                );
              }
            } catch {
              // ignore malformed SSE chunk
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "क्षमस्व, सध्या नेटवर्क किंवा सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, profile, selectedSection]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const storedSection = sessionStorage.getItem("selectedSection") as SectionId | null;
      const pendingMessage = sessionStorage.getItem("pendingMessage");
      const currentProfile = loadProfile();

      const validSection = DEPARTMENTS.some((d) => d.id === storedSection)
        ? (storedSection as SectionId)
        : "msme";

      setSelectedSection(validSection);

      if (pendingMessage && pendingMessage.trim()) {
        sessionStorage.removeItem("pendingMessage");
        void sendMessage(pendingMessage, validSection, currentProfile);
      }
    } catch {
      // ignore
    }
  }, [sendMessage]);

  const handleSelectSection = (id: SectionId) => {
    setSelectedSection(id);
    setDossierExpanded(true);
    setMobileDrawerOpen(false);
    try {
      sessionStorage.setItem("selectedSection", id);
    } catch {
      // ignore
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setDossierExpanded(true);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
        >
          <Home className="w-4 h-4 text-[#FF6B00]" />
          {(!sidebarCollapsed || isMobile) && <span>मुख्यपृष्ठ</span>}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? "साइडबार उघडा" : "साइडबार लहान करा"}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span>नवीन संवाद (New Chat)</span>}
        </button>
      </div>

      {/* Departments List */}
      <div className="flex-1 overflow-y-auto chat-scrollbar px-2.5 space-y-1">
        {(!sidebarCollapsed || isMobile) && (
          <p className="text-[11px] font-semibold text-slate-400 px-2 pb-1">
            उद्योग विभाग व विषय
          </p>
        )}
        {DEPARTMENTS.map((dept) => {
          const active = dept.id === selectedSection;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => handleSelectSection(dept.id)}
              title={dept.title}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition ${
                active
                  ? "bg-white/[0.08] border border-white/15 text-white"
                  : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${dept.color}22`,
                  color: dept.color,
                }}
              >
                <DepartmentIcon name={dept.iconName} className="w-4 h-4" />
              </span>
              {(!sidebarCollapsed || isMobile) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{dept.title}</p>
                  <p className="text-[10px] text-slate-400 truncate font-space">
                    {dept.subtitle}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Scheme Finder */}
      <div className="p-3 border-t border-white/[0.07] space-y-2">
        <Link
          href="/scheme-finder"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-semibold transition"
        >
          <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
          {(!sidebarCollapsed || isMobile) && (
            <span className="truncate">योजना पात्रता तपासणी</span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition"
        >
          <UserCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
          {(!sidebarCollapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.name ? `${profile.name}जी` : "उद्योजक प्रोफाइल जोडा"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {profile?.district
                  ? `${profile.district.split(" ")[0]} • ${profile.sector.split(" ")[0]}`
                  : "जिल्हा व उद्योग निवडा"}
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="relative h-screen flex overflow-hidden bg-[#030712]">
        <AmbientBackground particlesEnabled={particlesEnabled} />

        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col relative z-20 border-r border-white/[0.07] bg-[#0a0f1e]/80 backdrop-blur-xl transition-all duration-200 ${
            sidebarCollapsed ? "w-[74px]" : "w-[290px]"
          }`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] h-full bg-[#0a0f1e] border-r border-white/10 z-10">
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          {/* Top Bar */}
          <header className="px-4 sm:px-6 py-3 border-b border-white/[0.07] bg-[#030712]/75 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="मेनू उघडा"
                className="lg:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
                style={{
                  backgroundColor: `${activeDept.color}1A`,
                  borderColor: `${activeDept.color}45`,
                  color: activeDept.color,
                }}
              >
                <DepartmentIcon name={activeDept.iconName} className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeDept.title}
                </h1>
                <p className="text-[11px] text-slate-400 truncate">
                  भाजप उद्योग आघाडी • उद्योग साथी AI
                </p>
              </div>
            </div>

            {/* Dossier Toggle Button */}
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDossierExpanded((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>{dossierExpanded ? "माहिती पत्रक लपवा" : "विभाग माहिती पहा"}</span>
                </button>
              )}
            </div>
          </header>

          {/* Gentle reminder banner if profile is not filled */}
          {!profile?.name && (
            <div className="mx-4 sm:mx-6 mt-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/30 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs animate-msgIn">
              <div className="flex items-center gap-2 text-orange-200">
                <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>
                  आपली <strong>जात/प्रवर्ग (Caste)</strong> व <strong>जिल्हा</strong> नोंदवून योग्य सरकारी अनुदान व योजना (उदा. अण्णासाहेब पाटील महामंडळ, CMEGP) मिळवा.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMandatoryPrompt(false);
                  setProfileModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white font-bold text-xs shrink-0 shadow hover:brightness-110 transition"
              >
                माहिती भरा
              </button>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto chat-scrollbar px-4 sm:px-6 py-5">
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Department Dossier Card */}
                  {dossierExpanded && (
                    <section className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 animate-msgIn">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.07]">
                        <div>
                          <span
                            className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mb-2"
                            style={{
                              backgroundColor: `${activeDept.color}1A`,
                              borderColor: `${activeDept.color}40`,
                              color: "#f8fafc",
                            }}
                          >
                            {activeDept.badge} • अधिकृत विभाग माहिती पत्रक
                          </span>
                          <h2 className="text-lg sm:text-xl font-bold text-white">
                            {activeDept.officialName}
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">
                            नोडल यंत्रणा: {activeDept.nodalAgency}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          <a
                            href={activeDept.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-orange-300 font-medium transition"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>अधिकृत वेबसाईट</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-space">
                            <Phone className="w-3.5 h-3.5" />
                            {activeDept.helpline}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed mt-4">
                        {activeDept.about}
                      </p>

                      {/* Wings / Schemes Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {activeDept.wings.map((wing) => (
                          <div
                            key={wing.title}
                            className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h3 className="text-xs sm:text-sm font-bold text-white">
                                  {wing.title}
                                </h3>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-orange-300 border border-[#FF6B00]/30 shrink-0">
                                  {wing.tag}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {wing.description}
                              </p>
                            </div>
                            {wing.portalUrl && (
                              <a
                                href={wing.portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 mt-2 font-medium"
                              >
                                पोर्टल उघडा
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 4 Clickable Quick Questions */}
                      <div className="mt-5 pt-4 border-t border-white/[0.07]">
                        <p className="text-xs font-semibold text-slate-300 mb-2.5">
                          त्वरित प्रश्न विचारा (Quick Questions):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeDept.quickQuestions.map((q) => (
                            <button
                              key={q}
                              type="button"
                              disabled={isStreaming}
                              onClick={() => void sendMessage(q)}
                              className="text-left px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#FF6B00]/15 border border-white/10 hover:border-[#FF6B00]/45 text-xs text-slate-200 hover:text-white transition flex items-start gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                              <span>{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Chat Messages */}
                  <div className="space-y-4 pb-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        } animate-msgIn`}
                      >
                        {msg.role === "user" ? (
                          <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 bg-gradient-to-br from-[#FF6B00]/25 to-[#f59e0b]/15 border border-[#FF6B00]/40 text-sm text-white shadow-lg">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="w-full max-w-[95%] sm:max-w-[88%] glass-card rounded-2xl rounded-bl-sm p-4 sm:p-5 border border-white/10 space-y-3">
                            {/* Verified Source Pill */}
                            {msg.verifiedSource && (
                              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                                <div className="flex items-center gap-2 text-emerald-300">
                                  <ShieldCheck className="w-4 h-4 shrink-0" />
                                  <span className="font-semibold">
                                    प्रमाणित स्रोत: {msg.verifiedSource.department}
                                  </span>
                                  <span className="hidden sm:inline text-emerald-400/75">
                                    ({msg.verifiedSource.grReference})
                                  </span>
                                </div>
                                <a
                                  href={msg.verifiedSource.officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-200 hover:underline font-medium"
                                >
                                  अधिकृत पोर्टल
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {/* Typing indicator or Content */}
                            {!msg.content && isStreaming ? (
                              <div className="flex items-center gap-2.5 py-2.5">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="text-xs font-semibold text-orange-200/90 ml-1">
                                  उद्योग साथी AI मार्गदर्शन तयार करत आहे...
                                </span>
                              </div>
                            ) : (
                              <MarkdownRenderer content={msg.content} />
                            )}

                            {/* Live Web Grounding Sources */}
                            {msg.groundingSources && msg.groundingSources.length > 0 && (
                              <div className="pt-3 border-t border-white/[0.07]">
                                <p className="text-[11px] font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5" />
                                  ताजे संदर्भ / Live Sources (Google Search):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.groundingSources.map((src) => (
                                    <a
                                      key={src.url}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[11px] text-slate-200 transition max-w-full"
                                    >
                                      <span className="truncate max-w-[210px]">
                                        {src.title}
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-[#FF6B00] shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Message Action Bar (Copy + Model label) */}
                            {msg.content && (
                              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleCopy(msg.id, msg.content)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition"
                                  >
                                    {copiedId === msg.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-300">कॉपी झाले</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>कॉपी</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {msg.modelUsed && (
                                  <span className="font-space text-[10px] text-slate-500">
                                    {msg.modelUsed}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-white/[0.07] bg-[#030712]/80 backdrop-blur-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(input);
                }}
                className="max-w-4xl mx-auto glass-panel rounded-2xl p-2 border border-orange-500/25 flex items-end gap-2"
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  placeholder={`${activeDept.title} बद्दल तुमचा प्रश्न विचारा...`}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none resize-none max-h-28"
                />

                <VoiceButton
                  disabled={isStreaming}
                  onTranscript={(text) => setInput(text)}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#f59e0b] text-white text-xs font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 disabled:opacity-45 transition shrink-0"
                >
                  <span className="hidden sm:inline">पाठवा</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
        </div>

        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          initialProfile={profile}
          onSave={(saved) => setProfile(saved)}
          isMandatoryPrompt={isMandatoryPrompt}
        />
      </div>
    </ErrorBoundary>
  );
}

