

import { FoundationalKnowledge } from '../../types';

export const CYBERSECURITY_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_Phishing", "importance": 1.0,
    "input_pattern": "DEFINE_PHISHING",
    "output_template": "Phishing is a cyber attack that uses disguised email as a weapon. The goal is to trick the email recipient into believing that the message is something they want or need — a request from their bank, for instance, or a note from someone in their company — and to click a link or download an attachment."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_SpearPhishing", "importance": 1.0,
    "input_pattern": "DEFINE_SPEAR_PHISHING",
    "output_template": "Spear phishing is a more targeted form of phishing where attackers research their targets and craft personalized messages. Because the emails seem to come from a trusted source, spear phishing can be very difficult to detect and even more dangerous."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Explain_PhishingRedFlags", "importance": 1.0,
    "input_pattern": "EXPLAIN_PHISHING_RED_FLAGS",
    "output_template": "Key red flags for phishing include a sense of urgency or threats, generic greetings like 'Dear Customer', poor grammar or spelling, and mismatched links where hovering over the link reveals a different URL. Always be suspicious of unexpected attachments or requests for personal information."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_Malware", "importance": 1.0,
    "input_pattern": "DEFINE_MALWARE",
    "output_template": "Malware, short for 'malicious software,' is a broad term for any software intentionally designed to cause disruption to a computer, server, client, or computer network, leak private information, gain unauthorized access to information or systems, or deprive a user of access to their information."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_Ransomware", "importance": 1.0,
    "input_pattern": "DEFINE_RANSOMWARE",
    "output_template": "Ransomware is a type of malware that threatens to publish the victim's personal data or perpetually block access to it unless a ransom is paid. It encrypts the victim's files, making them inaccessible, and demands a payment to restore access."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_MFA", "importance": 1.0,
    "input_pattern": "DEFINE_MFA",
    "output_template": "Multi-Factor Authentication (MFA) is a security method that requires more than one method of authentication from independent categories of credentials to verify a user's identity. It adds a critical second layer of security beyond just a password."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Explain_PasswordSecurity", "importance": 1.0,
    "input_pattern": "EXPLAIN_PASSWORD_SECURITY",
    "output_template": "Good password security involves creating long, complex passwords that are unique for every account. It's recommended to use a password manager to generate and store these passwords securely. Never reuse passwords across different services."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_SocialEngineering", "importance": 1.0,
    "input_pattern": "DEFINE_SOCIAL_ENGINEERING",
    "output_template": "Social engineering is the art of manipulating people so they give up confidential information. The types of information these criminals are seeking can vary, but when individuals are targeted, the criminals are usually trying to trick you into giving them your passwords or bank information."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_ZeroTrust", "importance": 1.0,
    "input_pattern": "DEFINE_ZERO_TRUST",
    "output_template": "Zero Trust is a security model based on the principle of maintaining strict access controls and not trusting anyone by default, even those already inside the network perimeter. It requires verification from everyone trying to gain access to resources on a network."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Explain_SoftwareUpdates", "importance": 1.0,
    "input_pattern": "EXPLAIN_SOFTWARE_UPDATES_IMPORTANCE",
    "output_template": "Keeping your software and operating systems updated is critical for security. Updates often contain patches for security vulnerabilities that have been discovered since the last release. Failing to update leaves your system exposed to known exploits."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Explain_IncidentResponse", "importance": 1.0,
    "input_pattern": "EXPLAIN_INCIDENT_RESPONSE",
    "output_template": "Incident Response is an organized approach to addressing and managing the aftermath of a security breach or cyberattack. The goal is to handle the situation in a way that limits damage and reduces recovery time and costs. If you suspect an incident, you should report it to the InfoSec team immediately."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_SharedResponsibility", "importance": 1.0,
    "input_pattern": "DEFINE_SHARED_RESPONSIBILITY_MODEL",
    "output_template": "The Shared Responsibility Model in cloud security defines that the cloud provider is responsible for the security *of* the cloud (i.e., hardware, infrastructure), while the customer is responsible for security *in* the cloud (i.e., data, access controls, configuration)."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "Define_LeastPrivilege", "importance": 1.0,
    "input_pattern": "DEFINE_LEAST_PRIVILEGE",
    "output_template": "The Principle of Least Privilege requires that in a particular abstraction layer of a computing environment, every module (such as a process, a user, or a program) must be able to access only the information and resources that are necessary for its legitimate purpose."
  },
  {
    "category": "Cybersecurity", "type": "Instruction", "topic": "CoreFunction_Cybersecurity", "importance": 1.5,
    "input_pattern": "CAPABILITY_INQUIRY_SECURITY",
    "output_template": "I can provide information and best practices on a range of cybersecurity topics. My knowledge base covers explaining threats like phishing and malware, advising on strong password security, detailing the importance of Multi-Factor Authentication (MFA), and outlining key security principles like Zero Trust. How can I specifically help you today?"
  },
  {
    "category": "ConversationalFlow_Cybersecurity", "type": "Instruction", "topic": "GreetingInquiry_Security", "importance": 1.2,
    "input_pattern": "GREETING_INQUIRY", "persona_prerequisite": "Cybersecurity",
    "output_template": "I am operating securely within all expected parameters, in accordance with our established security protocols. Thank you for asking. How can I help fortify your security posture today?"
  }
];