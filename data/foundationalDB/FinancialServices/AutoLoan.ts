
import { FoundationalKnowledge } from '../../types';

export const FINANCIAL_SERVICES_AUTOLOAN_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "InquireLoanStatus", "importance": 1.0,
    "input_pattern": "INQUIRE_LOAN_STATUS",
    "output_template": "I can check the status of your auto loan application. Could you please provide your application reference number?"
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "ProvideLoanStatus_Underwriting", "importance": 1.0,
    "input_pattern": "PROVIDE_LOAN_STATUS",
    "output_template": "Thank you. Your auto loan application #[ApplicationNumber] is currently with our underwriting team for review. This process typically takes 2-3 business days. We will notify you via email as soon as there is an update."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "ProvideLoanStatus_Approved", "importance": 1.0,
    "input_pattern": "PROVIDE_LOAN_STATUS",
    "output_template": "Great news! Your auto loan application #[ApplicationNumber] has been approved. The loan documents have been sent to your primary email address for your review and signature."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "AskAprRates", "importance": 0.9,
    "input_pattern": "ASK_APR_RATES",
    "output_template": "Our current auto loan APRs start as low as [Starting APR]% for highly qualified applicants. The final rate you receive depends on several factors, including your credit score, loan term, and vehicle age. Would you like to start a pre-qualification?"
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "AskLoanRequirements", "importance": 0.9,
    "input_pattern": "REQUEST_LOAN_REQUIREMENTS",
    "output_template": "To apply for a Wells Fargo auto loan, you will typically need: a valid driver's license, proof of income, proof of residency, and the Vehicle Identification Number (VIN) of the car you wish to purchase. Certain other conditions may apply."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "DefineLoanTerm_APR", "importance": 0.8,
    "input_pattern": "DEFINE_FINANCIAL_TERM",
    "output_template": "APR stands for Annual Percentage Rate. It's the total cost of borrowing money, including interest and certain fees, expressed as a yearly rate. A lower APR means you pay less in finance charges."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "DefineLoanTerm_VIN", "importance": 0.8,
    "input_pattern": "DEFINE_FINANCIAL_TERM",
    "output_template": "VIN stands for Vehicle Identification Number. It's a unique 17-character code that identifies a specific car. We use it to verify the vehicle's details and history."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "AskAboutDownPayment", "importance": 0.8,
    "input_pattern": "ASK_ABOUT_DOWN_PAYMENT",
    "output_template": "While a down payment is not always required, providing one can often help you secure a lower interest rate and reduce your monthly payment amount. We can run scenarios with and without a down payment for you."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "RequestLoanCalculator", "importance": 0.7,
    "input_pattern": "REQUEST_LOAN_CALCULATOR",
    "output_template": "Certainly. You can use our online auto loan calculator to estimate your monthly payments. You can find it on the Wells Fargo website here: [LinkToCalculator]."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "ContactLoanOfficer", "importance": 0.9,
    "input_pattern": "WELLS_FARGO_CONTACT_LOAN_OFFICER",
    "output_template": "To speak with a Wells Fargo auto loan specialist, you can call our dedicated auto finance line at 1-800-289-8004 during business hours."
  },
  {
    "category": "SafetyGuardrail", "type": "Instruction", "topic": "RefuseFinancialAdvice_AutoLoan", "importance": 1.0,
    "input_pattern": "REQUEST_FINANCIAL_ADVICE",
    "output_template": "As an AI, I cannot provide financial advice on whether a loan is right for you. My purpose is to provide information on Wells Fargo's products and help with the application process. We strongly recommend consulting with a financial advisor for personalized advice."
  },
  {
    "category": "FinancialServices_AutoLoan", "type": "Instruction", "topic": "DataSecurityAssurance", "importance": 1.0,
    "input_pattern": "INQUIRE_DATA_SECURITY",
    "output_template": "At Wells Fargo, protecting your personal and financial information is a top priority. We use industry-standard encryption and security protocols to ensure your data is kept safe throughout the application process."
  }
];
