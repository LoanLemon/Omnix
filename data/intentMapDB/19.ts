import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_19: IntentMap = new Map([
  ['DEFINE_PHISHING', {
    keywords: { 'phishing': 5.0, 'email': 2.5, 'scam': 3.0, 'define': 2.0 },
    booster_phrases: { 'what is phishing': 5, 'define phishing': 5 }
  }],
  ['DEFINE_SPEAR_PHISHING', {
    keywords: { 'spear phishing': 5.0, 'targeted': 3.0, 'attack': 2.5 },
    booster_phrases: { 'what is spear phishing': 5, 'define spear phishing': 5 }
  }],
  ['EXPLAIN_PHISHING_RED_FLAGS', {
    keywords: { 'phishing': 3.0, 'red flags': 4.0, 'signs': 3.0, 'how to spot': 3.5 },
    booster_phrases: { 'signs of phishing': 5, 'phishing red flags': 5, 'how to spot a phishing email': 5 }
  }],
  ['DEFINE_MALWARE', {
    keywords: { 'malware': 5.0, 'malicious': 3.0, 'software': 2.5, 'virus': 2.0 },
    booster_phrases: { 'what is malware': 5, 'define malware': 5 }
  }],
  ['DEFINE_RANSOMWARE', {
    keywords: { 'ransomware': 5.0, 'malware': 2.5, 'encrypts': 3.0, 'files': 2.0 },
    booster_phrases: { 'what is ransomware': 5, 'define ransomware': 5 }
  }],
  ['DEFINE_MFA', {
    keywords: { 'mfa': 5.0, 'multi-factor': 3.5, 'two-factor': 3.5, '2fa': 4.0, 'authentication': 3.0 },
    booster_phrases: { 'what is mfa': 5, 'define multi factor authentication': 5, 'what is 2fa': 5 }
  }],
  ['EXPLAIN_PASSWORD_SECURITY', {
    keywords: { 'password': 3.5, 'security': 3.0, 'best practices': 3.0, 'strong password': 3.5 },
    booster_phrases: { 'password security best practices': 5, 'how to create a strong password': 5 }
  }],
  ['DEFINE_SOCIAL_ENGINEERING', {
    keywords: { 'social': 3.0, 'engineering': 4.0, 'manipulating': 3.0, 'people': 2.0 },
    booster_phrases: { 'what is social engineering': 5, 'define social engineering': 5 }
  }],
  ['DEFINE_ZERO_TRUST', {
    keywords: { 'zero trust': 5.0, 'security': 3.0, 'model': 2.5, 'never trust': 3.5 },
    booster_phrases: { 'what is zero trust': 5, 'define zero trust model': 5 }
  }],
  ['EXPLAIN_SOFTWARE_UPDATES_IMPORTANCE', {
    keywords: { 'software': 2.5, 'updates': 4.0, 'security': 3.0, 'patches': 3.0, 'why update': 3.5 },
    booster_phrases: { 'why are software updates important': 5, 'importance of software updates': 5 }
  }],
  ['EXPLAIN_INCIDENT_RESPONSE', {
    keywords: { 'incident': 3.0, 'response': 4.0, 'security breach': 3.5, 'cyberattack': 3.0 },
    booster_phrases: { 'what is incident response': 5, 'explain incident response': 5 }
  }],
  ['DEFINE_SHARED_RESPONSIBILITY_MODEL', {
    keywords: { 'shared': 3.0, 'responsibility': 4.0, 'model': 3.0, 'cloud': 2.5, 'security': 2.5 },
    booster_phrases: { 'what is the shared responsibility model': 5, 'define shared responsibility': 5 }
  }],
  ['DEFINE_LEAST_PRIVILEGE', {
    keywords: { 'least': 3.0, 'privilege': 4.0, 'principle': 3.0, 'access': 2.5 },
    booster_phrases: { 'what is the principle of least privilege': 5, 'define least privilege': 5 }
  }]
]);