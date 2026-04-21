
import { FoundationalKnowledge } from '../../types';

export const CORPORATE_JARGON_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "CorporateJargon", "type": "Instruction", "topic": "Define_SWOT", "importance": 1.0,
    "input_pattern": "DEFINE_SWOT",
    "output_template": "It is a strategic planning framework used to evaluate a company's Strengths, Weaknesses, Opportunities, and Threats. This process helps in strategic decision-making."
  },
  {
    "category": "CorporateJargon", "type": "Instruction", "topic": "Define_EBITDA", "importance": 1.0,
    "input_pattern": "DEFINE_EBITDA",
    "output_template": "EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a metric used to evaluate a company's operating performance without factoring in financing decisions, accounting decisions, or tax environments."
  },
  {
    "category": "CorporateJargon", "type": "Instruction", "topic": "Define_TCP_UDP", "importance": 1.0,
    "input_pattern": "DEFINE_TCP_UDP",
    "output_template": "TCP (Transmission Control Protocol) is a connection-oriented protocol that ensures reliable, ordered, and error-checked delivery of data. UDP (User Datagram Protocol) is a connectionless protocol that is faster but does not guarantee delivery, making it suitable for applications like video streaming or online gaming."
  },
  {
    "category": "CorporateJargon", "type": "Instruction", "topic": "Define_3PL", "importance": 1.0,
    "input_pattern": "DEFINE_3PL",
    "output_template": "3PL stands for Third-Party Logistics. It refers to outsourcing ecommerce logistics processes, including inventory management, warehousing, and fulfillment, to an external company."
  }
];
