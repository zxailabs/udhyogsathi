import rawPartners from "./service-partners.json";
import { LocalServicePartner } from "@/types";

/**
 * संपूर्ण महाराष्ट्रातील ३६ जिल्ह्यांची सत्यापित व डुप्लिकेट-मुक्त डेटाबेस यादी (१३४ नोंदी):
 * - सर्व ३६ जिल्ह्यांचे जिल्हा उद्योग केंद्र (DIC) व MCED कार्यालये
 * - पुणे, कोल्हापूर, सातारा, सांगली, सोलापूर, कोकण, नाशिक, मराठवाडा, अमरावती व नागपूर विभागांतील
 *   सत्यापित महा-ई-सेवा / CSC केंद्रे, बँक साथी (CSP), MITCON व CA/DPR सल्लागार.
 *
 * पदाधिकारी / Admin (/admin पॅनेल) मधून कोणत्याही जिल्ह्याची माहिती जोडू, बदलू किंवा
 * एका क्लिकवर Firebase Firestore मध्ये सेव्ह (Sync) करू शकतात.
 */
export const SEED_SERVICE_PARTNERS: LocalServicePartner[] =
  rawPartners as LocalServicePartner[];
