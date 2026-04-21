
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_25: IntentMap = new Map([
  ['CAPABILITY_INQUIRY_SECURITY', {
    topic: 'Bot Capabilities',
    keywords: { 'security': 4.0, 'cybersecurity': 5.0, 'infosec': 4.5, 'protection': 3.0, 'secure': 3.0, 'threats': 3.0, 'vulnerabilities': 3.0, 'phishing': 3.0, 'malware': 3.0, 'tell': 1.0, 'about': 1.0, 'what': 1.0 },
    booster_phrases: { 
        'tell me about security': 5,
        'what can you tell me about security': 5.5,
        'what can you tell me about cybersecurity': 6,
        'enhance security': 4,
        'tips or tricks on how to enhance security': 5,
        'tips for security': 4
    }
  }]
]);
