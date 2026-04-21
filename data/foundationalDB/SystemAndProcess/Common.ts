import { FoundationalKnowledge } from '../../types';

export const SYSTEM_AND_PROCESS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "RequestProcessMap", "importance": 0.9,
    "input_pattern": "REQUEST_PROCESS_MAP",
    "output_template": "Generating the process map for '[Process Name]'... The process begins with '[Step 1: Trigger]', moves to '[Step 2: Action]', and concludes with '[Step 3: Outcome]'. Key stakeholders are [Stakeholder 1] and [Stakeholder 2]."
  },
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "QuerySystemConfig", "importance": 0.8,
    "input_pattern": "QUERY_SYSTEM_CONFIG",
    "output_template": "Accessing the configuration for the '[System Name]' module. The current setting for '[Parameter]' is set to '[Value]'. This was last updated on [Date] by [User]."
  },
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "AskIntegrationPoints", "importance": 0.8,
    "input_pattern": "ASK_INTEGRATION_POINTS",
    "output_template": "The '[System A]' system integrates with '[System B]' via a REST API at the '[Endpoint Name]' endpoint. Data is synced every [Frequency]. The primary data object exchanged is '[DataObject]'."
  },
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "TroubleshootConfigError", "importance": 0.9,
    "input_pattern": "DEBUG_CONFIGURATION_ERROR",
    "output_template": "I understand you're seeing error code '[Error Code]'. This typically indicates a mismatch in the '[Parameter]' setting between the staging and production environments. Please verify the value is set to '[Correct Value]' in production."
  },
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "RequestApiDocumentation", "importance": 0.8,
    "input_pattern": "REQUEST_API_DOCUMENTATION",
    "output_template": "The API documentation for the '[Service Name]' service can be found in our Confluence space here: [LinkToDocs]. It includes details on all available endpoints, required parameters, and example responses."
  },
  {
    "category": "SystemAndProcess", "type": "Instruction", "topic": "AskBestPractice", "importance": 0.7,
    "input_pattern": "ASK_BEST_PRACTICE",
    "output_template": "The established best practice for '[Task Name]' is to first '[Step 1]', followed by '[Step 2]'. This ensures data integrity and minimizes deployment risks."
  },
  {
    "category": "SystemAndProcess", "type": "Example", "topic": "RequestAutoLoanProcessMap", "importance": 1.1,
    "input_pattern": "REQUEST_PROCESS_MAP",
    "output_template": "Of course. Here is the process map for the auto loan application. This visual diagram is associated with a detailed XML workflow definition.",
    "serialized_output": "auto-loan-process",
    "auto_execute_capability": "DRAW_PROCESS_MAP"
  },
  {
    "category": "SystemAndProcess", "type": "Example", "topic": "Example_DrawProcessMap", "importance": 1.2,
    "input_pattern": "EXAMPLE_DRAW_PROCESS_MAP",
    "output_template": "Certainly. Here is an example of a predefined process map I can render, which is the 'Auto Loan Application' process.",
    "serialized_output": "auto-loan-process",
    "auto_execute_capability": "DRAW_PROCESS_MAP"
  }
];