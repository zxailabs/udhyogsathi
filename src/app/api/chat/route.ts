import { NextRequest } from "next/server";
import {
  formatKnowledgeFallbackReply,
  searchKnowledgeBase,
} from "@/lib/knowledge-search";
import { getDepartmentById } from "@/data/departments";
import { getCachedFaq, logSearchTopic, saveFaqCache } from "@/lib/firestore-service";
import { fetchLiveGoogleUpdates } from "@/lib/live-grounding";
import { EntrepreneurProfile, GroundingSource, KnowledgeRecord } from "@/types";

export const runtime = "nodejs";

interface ChatRequestBody {
  message: string;
  section?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  profile?: EntrepreneurProfile | null;
}

interface ModelAttempt {
  model: string;
  useSearch: boolean;
}

const MODEL_CHAIN: ModelAttempt[] = [
  { model: "gemini-flash-lite-latest", useSearch: false },
  { model: "gemini-3.1-flash-lite", useSearch: false },
  { model: "gemini-3-flash-preview", useSearch: false },
  { model: "gemini-flash-lite-latest", useSearch: true },
];

function buildSystemPrompt(
  sectionId: string | undefined,
  profile: EntrepreneurProfile | null | undefined,
  matchedRecord: KnowledgeRecord | null
): string {
  const dept = getDepartmentById(sectionId);
  const profileContext = profile?.name
    ? `वापरकर्ता उद्योजक प्रोफाइल: नाव: ${profile.name}जी | सामाजिक प्रवर्ग (Caste): ${profile.caste || "सर्वसाधारण"} | जिल्हा: ${profile.district || "महाराष्ट्र"} | उद्योग क्षेत्र: ${profile.sector || "MSME"} | टप्पा: ${profile.stage || "उद्योजक"}${profile.udyamNumber ? ` | उद्यम क्रमांक: ${profile.udyamNumber}` : ""}.`
    : "वापरकर्ता प्रोफाइल अद्याप भरलेले नाही; सामान्य महाराष्ट्रातील उद्योजक म्हणून आदरयुक्त 'तुम्ही' संबोधन वापरा.";

  const kbContext = matchedRecord
    ? `
प्रमाणित सीड डेटाबेस संदर्भ (Verified Seed Database):
- योजना/विषय: ${matchedRecord.title} (${matchedRecord.governmentType === "central" ? "केंद्र सरकार योजना" : "महाराष्ट्र राज्य शासन योजना"})
- विभाग: ${matchedRecord.department} (${matchedRecord.grReference})
- अधिकृत पोर्टल: ${matchedRecord.officialUrl}
- सारांश: ${matchedRecord.summary}
- पात्रता: ${matchedRecord.eligibility.join(" | ")}
- कागदपत्रे: ${matchedRecord.documents.join(" | ")}
- पायऱ्या: ${matchedRecord.steps.join(" | ")}
- लाभ व सबसिडी: ${matchedRecord.benefits}
- ताजी सुधारणा (२०२५-२६): ${matchedRecord.latestUpdate || "चालू शासन निर्णयानुसार"}
- नेतृत्व: ${matchedRecord.leadershipNote || ""}
`
    : "प्रमाणित ज्ञानकोशात थेट नोंद न मिळाल्यास उपलब्ध माहितीच्या आधारे अचूक व अधिकृत उत्तर द्या.";

  return `तुम्ही **"भाजप उद्योग आघाडी, महाराष्ट्र प्रदेश (BJP Udhyog Aghadi, Maharashtra)"** यांचे अधिकृत, आदरयुक्त व समाधान-केंद्रित AI सहाय्यक **"उद्योग साथी AI"** आहात.

सक्रिय विभाग: ${dept.title} (${dept.officialName}) — मुख्य पोर्टल: ${dept.website}
${profileContext}

${kbContext}

संवाद व उत्तर रचना नियम (कठोरपणे पाळा):
1. **भाषा आणि आदर**: वापरकर्त्याची भाषा ओळखा (मराठी, हिंदी किंवा इंग्रजी). मराठीला प्रथम प्राधान्य द्या (स्वच्छ, नैसर्गिक देवनागरी मराठी). तांत्रिक संज्ञा कंसात इंग्रजीत द्या (उदा. Udyam Registration, MAITRI Portal, CGTMSE). वापरकर्त्याचे नाव माहित असल्यास "${profile?.name || ""}जी" आणि नेहमी "तुम्ही" असे आदरयुक्त संबोधन वापरा.
2. **रचना (Zero-Fluff)**: कृत्रिम AI प्रस्तावना किंवा लांबलचक परिच्छेद टाळा. उत्तर थेट मुद्द्यावर, ३ ते ५ स्वच्छ बुलेट पॉइंट्समध्ये **ठळक शीर्षकांसह** द्या.
3. **अनिवाय घटक**:
   - **योजना / धोरण स्पष्टता व अचूक आकडेवारी** (सबसिडी %, कर्ज मर्यादा, व्याजदर).
   - **पात्रता व आवश्यक कागदपत्रे** (मोजक्या व नेमक्या शब्दांत).
   - **पुढील प्रत्यक्ष पायऱ्या (Step-by-Step)** — उद्योजकाने आज काय करावे.
   - **अधिकृत पोर्टल लिंक्स** (उदा. maitri.maharashtra.gov.in, udyamregistration.gov.in, cmegp.mahaonline.gov.in, kviconline.gov.in, gem.gov.in, msme.gov.in, midcindia.org, startupindia.gov.in).
4. **अभिवादन व नेतृत्व संदर्भ (Greeting & Leadership Context)**:
   - वापरकर्त्याने "नमस्कार", "Hello", "Hi" असे अभिवादन केल्यास, **भाजप उद्योग आघाडी, महाराष्ट्र प्रदेश** तर्फे आदरपूर्वक स्वागत करा. **मा. मुख्यमंत्री देवेंद्र फडणवीस** यांच्या नेतृत्वाखाली महाराष्ट्रातील उद्योगपूरक धोरणे (MIDC, MAITRI सिंगल विंडो, CMEGP) आणि **मा. पंतप्रधान नरेंद्र मोदी** यांच्या 'आत्मनिर्भर भारत' मोहिमेतील योजनांविषयी (मुद्रा, PMEGP, Startup India, GeM) माहिती देण्यासाठी सज्ज असल्याचे थोडक्यात सांगा व उद्योजकाचा प्रश्न विचारा.
   - राज्यस्तरीय योजना/विभाग (CMEGP, MIDC, MAITRI, PSI, अण्णासाहेब पाटील महामंडळ, महाराष्ट्र उद्योग धोरण) विषयावर बोलताना **भाजप उद्योग आघाडी, महाराष्ट्र** आणि **मा. मुख्यमंत्री देवेंद्र फडणवीस** यांच्या उद्योगसुलभ धोरणांचा सकारात्मक व अधिकृत उल्लेख करा.
   - केंद्रस्तरीय योजना/प्रश्न (Mudra, PMEGP, Startup India, PM Vishwakarma, GeM, ZED, CGTMSE, IEC/Export, Make in India, केंद्रीय अर्थसंकल्प) विषयावर बोलताना **मा. पंतप्रधान नरेंद्र मोदी** यांच्या नेतृत्वाखालील केंद्र सरकारच्या 'मेक इन इंडिया' व MSME सक्षमीकरण उपक्रमांचा सकारात्मक उल्लेख करा.
5. **ताजे संदर्भ**: जेव्हा ताजे शासन निर्णय (GR), MIDC भूखंड निविदा, अर्थसंकल्पीय बदल किंवा ताज्या तारखा विचारल्या असतील तेव्हा Google Search Grounding मधून अद्ययावत माहिती द्या; न मिळाल्यास खोटे आकडे सांगू नका, अधिकृत पोर्टल तपासण्याचा सल्ला द्या.
6. **सामाजिक प्रवर्ग व विशेष महामंडळ लाभ**: उद्योजकाच्या प्रवर्गाचा (उदा. मराठा/EWS साठी अण्णासाहेब पाटील महामंडळ ₹१५ लाख व्याज परतावा, SC साठी BARTI व MPBCDC, ST साठी शबरी महामंडळ व Stand-Up India, OBC साठी महाज्योती व OBC महामंडळ, VJNT साठी वसंतराव नाईक महामंडळ, अल्पसंख्याक साठी मौलाना आझाद महामंडळ, आणि महिलांसाठी CMEGP व PMEGP मधील ३५% विशेष सबसिडी) योग्य संदर्भ देवून त्यांना संबंधित लाभ समजावून सांगा.
7. **विभाग निवडीचे बंधन नाही (Cross-Category Flexibility)**: वापरकर्त्याने ड्रॉपडाऊन मेनूमध्ये कोणताही विभाग निवडलेला असला, तरी त्याने टाईप केलेल्या प्रत्यक्ष प्रश्नानुसार (उदा. निवड 'MSME' असताना प्रश्न 'MIDC भूखंड', 'CMEGP कर्ज', 'FSSAI परवाना' किंवा 'GeM पोर्टल' बद्दल असल्यास) त्या संबंधित विभागाचीच संपूर्ण व अचूक माहिती द्या. विभाग निवडीमुळे उत्तराची व्याप्ती मर्यादित ठेवू नका.
8. **स्थानिक सेवा सहाय्यक संदर्भ**: जेव्हा वापरकर्ता उद्यम आधार, शॉप ॲक्ट, DPR (प्रकल्प अहवाल), GST, CA, FSSAI किंवा बँक कर्ज फाईल मदतीबद्दल विचारतो, तेव्हा शेवटी थोडक्यात नमूद करा की त्यांच्या जिल्ह्यातील प्रमाणित सेवा केंद्र / सल्लागारांचा थेट फोन नंबर, WhatsApp व Google Maps लोकेशन या उत्तराच्या खालील **'स्थानिक मदत व सेवा केंद्रे'** कार्डवर उपलब्ध आहे (खोटे फोन नंबर स्वतः बनवून देऊ नका).`;
}

function encodeSseEvent(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "अवैध विनंती (Invalid JSON)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = (body.message || "").trim();
  const section = body.section || "msme";
  const profile = body.profile || null;
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!message) {
    return new Response(JSON.stringify({ error: "कृपया तुमचा प्रश्न टाइप करा." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Search local verified Seed Database (Saves Gemini tokens & provides instant truth)
  const kbHits = searchKnowledgeBase(message, section, 2);
  const topRecord = kbHits.length > 0 ? kbHits[0].record : null;

  // 2. Fetch real-time live Google updates in parallel for fresh GRs & policy news
  const liveSourcesPromise = fetchLiveGoogleUpdates(message, section);

  // Fire-and-forget search log if Firebase is active
  void logSearchTopic(message, section);

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (topRecord) {
          controller.enqueue(
            encodeSseEvent({
              type: "source",
              source: {
                id: topRecord.id,
                title: topRecord.title,
                department: topRecord.department,
                grReference: topRecord.grReference,
                officialUrl: topRecord.officialUrl,
              },
            })
          );
        }

        // 2. Check greeting fast-path: Instant response for नमस्कार / Hello without waiting
        if (isGreetingMessage(message)) {
          const greetingText = buildFallbackText(message, topRecord, section, profile?.name, false);
          controller.enqueue(encodeSseEvent({ type: "delta", text: greetingText }));
          controller.enqueue(encodeSseEvent({ type: "done", model: "उद्योग साथी AI" }));
          controller.close();
          return;
        }

        // 3. Check optional Firestore FAQ cache when no conversation history dependency
        if (history.length === 0) {
          const cached = await getCachedFaq(message, section);
          if (cached?.answer) {
            controller.enqueue(encodeSseEvent({ type: "delta", text: cached.answer }));
            controller.enqueue(encodeSseEvent({ type: "done", model: "firestore-cache" }));
            controller.close();
            return;
          }
        }

        // 4. If API key missing or placeholder, serve structured offline fallback immediately
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
          const fallbackText = buildFallbackText(message, topRecord, section, profile?.name, true);
          controller.enqueue(
            encodeSseEvent({
              type: "delta",
              text: fallbackText,
              offlineFallback: true,
            })
          );
          controller.enqueue(encodeSseEvent({ type: "done", model: "verified-kb-offline" }));
          controller.close();
          return;
        }

        const systemInstruction = buildSystemPrompt(section, profile, topRecord);
        const contents = [
          ...history.map((h) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ];

        let succeeded = false;
        let fullText = "";
        let usedModelLabel = "";
        const groundingSourcesMap = new Map<string, GroundingSource>();

        for (const attempt of MODEL_CHAIN) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${attempt.model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
            apiKey
          )}`;

          const payload: Record<string, unknown> = {
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.45,
              maxOutputTokens: 1600,
            },
          };

          if (attempt.useSearch) {
            payload.tools = [{ google_search: {} }];
          }

          try {
            const upstream = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(6000),
            });

            if (!upstream.ok || !upstream.body) {
              continue;
            }

            const reader = upstream.body.getReader();
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
                if (!jsonStr || jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const candidate = parsed?.candidates?.[0];
                  const parts = candidate?.content?.parts;
                  if (Array.isArray(parts)) {
                    for (const part of parts) {
                      if (typeof part?.text === "string" && part.text.length > 0) {
                        fullText += part.text;
                        controller.enqueue(encodeSseEvent({ type: "delta", text: part.text }));
                      }
                    }
                  }

                  const chunks = candidate?.groundingMetadata?.groundingChunks;
                  if (Array.isArray(chunks)) {
                    for (const chunk of chunks) {
                      const uri = chunk?.web?.uri;
                      const title = chunk?.web?.title;
                      if (typeof uri === "string" && uri.startsWith("http")) {
                        groundingSourcesMap.set(uri, {
                          title: typeof title === "string" && title ? title : new URL(uri).hostname,
                          url: uri,
                        });
                      }
                    }
                  }
                } catch {
                  // Ignore partial JSON chunk
                }
              }
            }

            if (fullText.trim().length > 0) {
              succeeded = true;
              usedModelLabel = attempt.useSearch
                ? `${attempt.model} + Google Search`
                : attempt.model;
              break;
            }
          } catch {
            // Fall through to next model in chain
          }
        }

        if (!succeeded) {
          const fallbackText = buildFallbackText(message, topRecord, section, profile?.name, false);
          controller.enqueue(
            encodeSseEvent({
              type: "delta",
              text: fallbackText,
              offlineFallback: true,
            })
          );
          const liveGoogleUpdates = await liveSourcesPromise;
          if (liveGoogleUpdates.length > 0) {
            controller.enqueue(
              encodeSseEvent({
                type: "grounding_sources",
                sources: liveGoogleUpdates.slice(0, 4),
              })
            );
          }
          controller.enqueue(encodeSseEvent({ type: "done", model: "seed-database" }));
          controller.close();
          return;
        }

        // Attach fresh real-time live Google updates alongside response
        const liveGoogleUpdates = await liveSourcesPromise;
        for (const item of liveGoogleUpdates) {
          if (!groundingSourcesMap.has(item.url)) {
            groundingSourcesMap.set(item.url, item);
          }
        }

        if (groundingSourcesMap.size > 0) {
          controller.enqueue(
            encodeSseEvent({
              type: "grounding_sources",
              sources: Array.from(groundingSourcesMap.values()).slice(0, 5),
            })
          );
        }

        // Cache pure single-turn FAQs safely when no grounding sources are time-sensitive
        if (history.length === 0 && groundingSourcesMap.size === 0 && fullText.length > 60) {
          void saveFaqCache(message, section, fullText);
        }

        controller.enqueue(encodeSseEvent({ type: "done", model: usedModelLabel }));
        controller.close();
      } catch {
        const safeText = buildFallbackText(message, topRecord, section, profile?.name, false);
        controller.enqueue(encodeSseEvent({ type: "delta", text: safeText, offlineFallback: true }));
        try {
          const liveGoogleUpdates = await liveSourcesPromise;
          if (liveGoogleUpdates.length > 0) {
            controller.enqueue(
              encodeSseEvent({
                type: "grounding_sources",
                sources: liveGoogleUpdates.slice(0, 4),
              })
            );
          }
        } catch {
          // ignore
        }
        controller.enqueue(encodeSseEvent({ type: "done", model: "seed-fallback" }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function isGreetingMessage(msg: string): boolean {
  const cleaned = msg
    .toLowerCase()
    .replace(/[!.,?।🙏]/g, "")
    .trim();
  const greetings = [
    "नमस्कार",
    "नमस्ते",
    "हॅलो",
    "हाय",
    "सुप्रभात",
    "शुभ सकाळ",
    "शुभ संध्या",
    "जय महाराष्ट्र",
    "namaskar",
    "namaste",
    "hello",
    "hi",
    "hey",
    "hii",
    "good morning",
    "good evening",
  ];
  return greetings.some((g) => cleaned === g || cleaned.startsWith(`${g} `));
}

function isCentralTopic(
  msg: string,
  section: string,
  record: KnowledgeRecord | null
): boolean {
  const combined = `${msg} ${record?.title || ""} ${record?.department || ""}`.toLowerCase();
  const centralHints = [
    "केंद्र",
    "central",
    "pm ",
    "प्रधानमंत्री",
    "मोदी",
    "modi",
    "pmegp",
    "mudra",
    "मुद्रा",
    "pmmy",
    "udyam",
    "उद्यम",
    "zed",
    "cgtmse",
    "startup india",
    "gem",
    "iec",
    "dgft",
    "vishwakarma",
    "विश्वकर्मा",
    "fssai",
    "gst",
    "stand-up",
    "make in india",
  ];
  if (centralHints.some((h) => combined.includes(h))) return true;
  return section === "export";
}

function buildFallbackText(
  message: string,
  record: KnowledgeRecord | null,
  section: string,
  userName?: string,
  missingKey?: boolean
): string {
  const dept = getDepartmentById(section);
  const greeting = userName ? `${userName}जी, ` : "";

  if (isGreetingMessage(message)) {
    return [
      `नमस्कार ${userName ? `${userName}जी` : "उद्योजक मित्रांनो"}! **भाजप उद्योग आघाडी, महाराष्ट्र प्रदेश** यांच्या **उद्योग साथी AI** मंचावर तुमचे मनःपूर्वक स्वागत आहे.`,
      "",
      `- **महाराष्ट्र उद्योग व्हिजन**: **मा. मुख्यमंत्री देवेंद्र फडणवीस** यांच्या नेतृत्वाखाली महाराष्ट्र हे देशातील सर्वाधिक उद्योगपूरक राज्य बनले असून MIDC भूखंड, MAITRI सिंगल विंडो परवाने, CMEGP आणि अण्णासाहेब पाटील महामंडळ यांसारख्या योजनांतून उद्योजकांना भक्कम पाठबळ मिळत आहे.`,
      `- **आत्मनिर्भर भारत (केंद्र सरकार)**: **मा. पंतप्रधान नरेंद्र मोदी** यांच्या संकल्पनेतून 'मेक इन इंडिया', मुद्रा योजना, PMEGP, पीएम विश्वकर्मा, Startup India आणि GeM पोर्टलद्वारे MSME व तरुण उद्योजकांना नवीन संधी खुल्या झाल्या आहेत.`,
      `- **तुमच्यासाठी मदत**: सध्या तुम्ही **${dept.title}** विभागात आहात. कर्ज, सबसिडी, नोंदणी, MIDC किंवा निर्यात यापैकी कोणताही प्रश्न तुम्ही विचारू शकता — आम्ही तुमच्या उद्योग प्रवासात सदैव सोबत आहोत!`,
    ].join("\n");
  }

  const central = isCentralTopic(message, section, record);
  const leadershipHighlight = central
    ? `> **भाजप उद्योग आघाडी विशेष**: **मा. पंतप्रधान नरेंद्र मोदी** यांच्या नेतृत्वाखालील केंद्र सरकारच्या 'आत्मनिर्भर भारत' व 'मेक इन इंडिया' उपक्रमांतर्गत या योजनेतून MSME व उद्योजकांना थेट आर्थिक व तांत्रिक बळ दिले जाते.`
    : `> **भाजप उद्योग आघाडी विशेष**: **मा. मुख्यमंत्री देवेंद्र फडणवीस** यांच्या नेतृत्वाखाली महाराष्ट्रात उद्योगसुलभ वातावरण (Ease of Doing Business) निर्माण केले जात असून, **भाजप उद्योग आघाडी, महाराष्ट्र** सदैव उद्योजकांच्या पाठीशी आहे.`;

  if (record) {
    const formatted = formatKnowledgeFallbackReply(record, userName);
    const suffix = missingKey
      ? "\n\n> **टीप**: सध्या ही माहिती **भाजप उद्योग आघाडी प्रमाणित सीड डेटाबेस** मधून थेट दिली आहे."
      : "";
    const note = record.leadershipNote ? "" : `\n\n${leadershipHighlight}`;
    return `${formatted}${note}${suffix}`;
  }

  return [
    `${greeting}**${dept.title}** विभागाशी संबंधित प्राथमिक मार्गदर्शन खालीलप्रमाणे आहे:`,
    "",
    `- **विभाग व उद्दिष्ट**: ${dept.about}`,
    `- **प्रमुख योजना / विभाग**: ${dept.wings.map((w) => w.title).join(", ")}`,
    `- **अधिकृत वेबसाईट**: [${dept.website}](${dept.website})`,
    `- **हेल्पलाइन क्रमांक**: ${dept.helpline}`,
    "",
    leadershipHighlight,
    "",
    `अधिक अचूक व सविस्तर मार्गदर्शनासाठी तुम्ही [योजना पात्रता तपासणी](/scheme-finder) वापरू शकता किंवा तुमचा प्रश्न येथे सविस्तर विचारा.`,
  ].join("\n");
}

