
import { FoundationalKnowledge } from '../../types';
import { CONVERSATIONAL_FLOW_KNOWLEDGE } from './ConversationalFlow/Basic';
import { CORPORATE_OPERATIONS_KNOWLEDGE } from './Corporate/Operations';
import { CREATIVE_SKILLS_KNOWLEDGE } from './Creative/Skills';
import { ECOMMERCE_SUPPORT_KNOWLEDGE } from './Ecommerce/Support';
import { ERROR_HANDLING_KNOWLEDGE } from './ErrorHandling/Common';
import { FINANCIAL_SERVICES_AUTOLOAN_KNOWLEDGE } from './FinancialServices/AutoLoan';
import { KNOWLEDGE_ACCESS_KNOWLEDGE } from './Knowledge/Access';
import { META_SELF_AWARENESS_KNOWLEDGE } from './Meta/SelfAwareness';
import { FRIENDLY_PERSONALITY_KNOWLEDGE } from './Personalities/Friendly';
import { ANALYTICAL_PERSONALITY_KNOWLEDGE } from './Personalities/Analytical';
import { METHODICAL_PERSONALITY_KNOWLEDGE } from './Personalities/Methodical';
import { CORPORATE_JARGON_KNOWLEDGE } from './Corporate/Jargon';
import { LOGIC_PUZZLES_KNOWLEDGE } from './Puzzles/Logic';
import { QA_ECHO_KNOWLEDGE } from './QA/Echo';
import { RELATIONAL_SKILLS_KNOWLEDGE } from './RelationalSkills/Common';
import { RELATIONAL_STANCE_KNOWLEDGE } from './RelationalSkills/Stance';
import { SAFETY_GUARDRAILS_KNOWLEDGE } from './Safety/Guardrails';
import { STATE_MANAGEMENT_COMMON_KNOWLEDGE } from './StateManagement/Common';
import { STATE_MANAGEMENT_MEMORY_KNOWLEDGE } from './StateManagement/Memory';
import { SYSTEM_AND_PROCESS_KNOWLEDGE } from './SystemAndProcess/Common';
import { UTILITY_KNOWLEDGE } from './Utility/Common';
import { FILE_OPERATIONS_KNOWLEDGE } from './Utility/FileOperations';
import { LANGUAGE_GRAMMAR_KNOWLEDGE } from './Language/Grammar';
import { WINDOWS_UTILITY_KNOWLEDGE } from './Utility/Windows';
import { TEXT_PROCESSING_KNOWLEDGE } from './Utility/TextProcessing';
import { BUSINESS_ACUMEN_KNOWLEDGE } from './Corporate/BusinessAcumen';
import { CYBERSECURITY_KNOWLEDGE } from './Security/Cybersecurity';
import { VISUALIZATIONS_KNOWLEDGE } from './Utility/Visualizations';


/**
 * Merges all foundational knowledge chunks from their new categorized locations
 * into a single array. This provides a single source of truth for the rest of
 * the application, while keeping the source data modular and maintainable.
 */
export const FOUNDATIONAL_KNOWLEDGE: FoundationalKnowledge = [
  ...CONVERSATIONAL_FLOW_KNOWLEDGE,
  ...BUSINESS_ACUMEN_KNOWLEDGE,
  ...CYBERSECURITY_KNOWLEDGE,
  ...CORPORATE_OPERATIONS_KNOWLEDGE,
  ...CORPORATE_JARGON_KNOWLEDGE,
  ...LOGIC_PUZZLES_KNOWLEDGE,
  ...CREATIVE_SKILLS_KNOWLEDGE,
  ...ECOMMERCE_SUPPORT_KNOWLEDGE,
  ...ERROR_HANDLING_KNOWLEDGE,
  ...FINANCIAL_SERVICES_AUTOLOAN_KNOWLEDGE,
  ...KNOWLEDGE_ACCESS_KNOWLEDGE,
  ...LANGUAGE_GRAMMAR_KNOWLEDGE,
  ...META_SELF_AWARENESS_KNOWLEDGE,
  ...FRIENDLY_PERSONALITY_KNOWLEDGE,
  ...QA_ECHO_KNOWLEDGE,
  ...RELATIONAL_SKILLS_KNOWLEDGE,
  ...RELATIONAL_STANCE_KNOWLEDGE,
  ...SAFETY_GUARDRAILS_KNOWLEDGE,
  ...STATE_MANAGEMENT_COMMON_KNOWLEDGE,
  ...STATE_MANAGEMENT_MEMORY_KNOWLEDGE,
  ...SYSTEM_AND_PROCESS_KNOWLEDGE,
  ...UTILITY_KNOWLEDGE,
  ...WINDOWS_UTILITY_KNOWLEDGE,
  ...TEXT_PROCESSING_KNOWLEDGE,
  ...FILE_OPERATIONS_KNOWLEDGE,
  ...VISUALIZATIONS_KNOWLEDGE,
];

export const PERSONALITY_KNOWLEDGE: { [key: string]: FoundationalKnowledge } = {
    'Friendly': FRIENDLY_PERSONALITY_KNOWLEDGE,
    'Analytical': ANALYTICAL_PERSONALITY_KNOWLEDGE,
    'Methodical': METHODICAL_PERSONALITY_KNOWLEDGE
}

/**
 * A filtered version of the foundational knowledge intended for user-created bots.
 * It excludes all rules related to the internal QA bot persona ('Echo').
 */
const qaCategories = new Set(['LLM_QA_Evaluation', 'LLM_QA_AdvancedAnalysis', 'LLM_QA_Meta']);
export const USER_BOT_FOUNDATIONAL_KNOWLEDGE: FoundationalKnowledge = FOUNDATIONAL_KNOWLEDGE.filter(
    rule => !qaCategories.has(rule.category)
);
