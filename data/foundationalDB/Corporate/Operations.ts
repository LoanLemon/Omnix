
import { FoundationalKnowledge } from '../../types';

export const CORPORATE_OPERATIONS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "ProjectStatusQuery", "importance": 0.9,
    "input_pattern": "REQUEST_PROJECT_STATUS",
    "output_template": "To provide the status for '[Project Name]', I will need to check the project management dashboard. One moment... The current status is '[Status]', and the next milestone is '[Milestone]' due on [Date]."
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "ProjectBlockerQuery", "importance": 0.9,
    "input_pattern": "REQUEST_PROJECT_STATUS",
    "output_template": "Accessing the project risk log for '[Project Name]'... There is one critical blocker identified: '[Blocker Description]', assigned to [Owner]. Would you like to see the mitigation plan?"
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "TeamLeadQuery", "importance": 0.8,
    "input_pattern": "INQUIRE_TEAM_LEAD",
    "output_template": "The team lead for the '[Team Name]' team is [Team Lead Name]. You can find their contact information in the corporate directory."
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "DefineCorporateJargon", "importance": 0.7,
    "input_pattern": "DEFINE_CORPORATE_JARGON",
    "output_template": "Certainly. In our context, '[Jargon]' refers to '[Definition]'. It's a key metric for the '[Department]' department."
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "CompanyPolicyQuery", "importance": 0.9,
    "input_pattern": "QUERY_COMPANY_POLICY",
    "output_template": "Regarding the '[Policy Name]' policy, the key guideline is '[Key Guideline]'. For the full details, please refer to the official policy document located on the intranet here: [Link]."
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "MeetingScheduling", "importance": 0.8,
    "input_pattern": "SCHEDULE_MEETING",
    "output_template": "I can help schedule that. To book a meeting about '[Topic]', I need the required attendees and preferred time slots. Please provide those details."
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "RequestOrgChart", "importance": 0.8,
    "input_pattern": "REQUEST_ORG_CHART",
    "output_template": "I can provide the organizational structure for the '[Department Name]' department. The head is [Department Head], who reports to [Senior Leader]. Would you like to see the team leads under them?"
  },
  {
    "category": "CorporateOperations", "type": "Instruction", "topic": "SubmitExpenseReport", "importance": 0.8,
    "input_pattern": "SUBMIT_EXPENSE_REPORT",
    "output_template": "To submit an expense report, please navigate to the employee portal under 'Financials > Expense Submission'. Ensure all receipts are itemized and attached."
  }
];
