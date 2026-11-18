export interface OfficialLocatorResource {
  id: string;
  title: string;
  agency: string;
  services: string;
  howToFind: string;
  helpline: string;
  portalUrl: string;
}

export const OFFICIAL_VILLAGE_LOCATORS: OfficialLocatorResource[] = [
  {
    id: "loc-aaple-sarkar",
    title: "आपले सरकार / महा-ई-सेवा केंद्र लोकेटर",
    agency: "MahaIT / महाराष्ट्र शासन",
    services:
      "सर्व महसूल दाखले (उत्पन्न, जात, अधिवास), शॉप ॲक्ट, उद्योग आधार, ७/१२ उतारा व शासकीय योजनांचे अर्ज",
    howToFind:
      "पोर्टलवर जाऊन आपला जिल्हा, तालुका व गाव निवडा — गावातील सर्व अधिकृत केंद्रांची यादी दिसेल",
    helpline: "1800-120-8040",
    portalUrl: "https://aaplesarkar.mahaonline.gov.in",
  },
  {
    id: "loc-csc-gis",
    title: "CSC डिजिटल सेवा केंद्र लोकेटर (GIS Map)",
    agency: "CSC e-Governance India (MeitY)",
    services:
      "पॅन कार्ड, उद्यम आधार, GST, ई-श्रम, पीएम विश्वकर्मा, विमा, बँक मित्र सेवा व केंद्र सरकारच्या योजना",
    howToFind:
      "GIS लोकेटरवर राज्य (Maharashtra), जिल्हा व तालुका निवडल्यास जवळच्या सर्व CSC केंद्रांचे नाव व नकाशा लोकेशन मिळते",
    helpline: "14599 / 1800-121-3468",
    portalUrl: "https://locator.csccloud.in",
  },
  {
    id: "loc-csc-loan-bazar",
    title: "CSC लोन बाजार (बँक कर्ज व बँक मित्र मदत)",
    agency: "CSC Loan Bazar",
    services:
      "मुद्रा कर्ज, व्यवसाय कर्ज, MSME कर्ज व बँक फाईलसाठी CSC केंद्रामार्फत बँकांशी जोडणी",
    howToFind:
      "तुमच्या गावातील CSC VLE मार्फत किंवा CSC Loan Bazar वरून कर्ज अर्जाची नोंदणी व पाठपुरावा करता येतो",
    helpline: "14599 / (011) 4975-4975",
    portalUrl: "https://cscloanbazar.in",
  },
  {
    id: "loc-umed-bc-sakhi",
    title: "बँक सखी / BC सखी (ग्रामीण बँक साथी - UMED)",
    agency: "महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (MSRLM - उमेद)",
    services:
      "बचत गट व वैयक्तिक व्यवसायासाठी बँक कर्ज (७% व्याजदर गट कर्ज), खाते उघडणे व ग्रामीण बँकिंग",
    howToFind:
      "गावातील ग्रामपंचायत / प्रभाग संघ (CLF) किंवा पंचायत समितीमधील उमेद (UMED) कार्यालयात तुमच्या गावातील BC सखीचा नंबर मिळतो",
    helpline: "जिल्हा / तालुका उमेद (MSRLM) कक्ष",
    portalUrl: "https://www.umed.in",
  },
  {
    id: "loc-bom-ldm",
    title: "बँक ऑफ महाराष्ट्र (अग्रणी बँक व BC / बँक मित्र)",
    agency: "Bank of Maharashtra (महाराष्ट्रातील मुख्य अग्रणी बँक)",
    services:
      "CMEGP, PMEGP, मुद्रा कर्ज, अण्णासाहेब पाटील कर्ज व ग्रामीण BC पॉईंटद्वारे बँक सेवा",
    howToFind:
      "जवळच्या बँक ऑफ महाराष्ट्र शाखेत किंवा तालुका/जिल्हा अग्रणी बँक व्यवस्थापक (LDM) कार्यालयात संपर्क साधा",
    helpline: "1800-233-4526 / 1800-102-2636",
    portalUrl: "https://bankofmaharashtra.in",
  },
  {
    id: "loc-sbi-csp",
    title: "स्टेट बँक ऑफ इंडिया (SBI ग्राहक सेवा / CSP)",
    agency: "State Bank of India (SBI)",
    services:
      "SBI CSP (बँक साथी) केंद्रावर खाते, व्यवहार, विमा व शाखेत मुद्रा / स्टँड-अप इंडिया / CMEGP कर्ज फाईल",
    howToFind:
      "गूगल मॅप्सवर 'SBI CSP near me' सर्च करा किंवा जवळच्या SBI शाखेतून अधिकृत BC पॉईंटची माहिती घ्या",
    helpline: "1800-1234 / 1800-2100",
    portalUrl: "https://sbi.co.in",
  },
];
