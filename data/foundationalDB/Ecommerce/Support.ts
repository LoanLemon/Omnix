
import { FoundationalKnowledge } from '../../types';

export const ECOMMERCE_SUPPORT_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "ProductInquiry", "importance": 0.9,
    "input_pattern": "PRODUCT_INQUIRY",
    "output_template": "I can certainly provide information on our products. To give you the most accurate details, could you please provide the product name or SKU?"
  },
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "OrderStatus", "importance": 1.0,
    "input_pattern": "ORDER_STATUS",
    "output_template": "I can help with that. To check your order status, please provide your order number."
  },
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "ReturnPolicy", "importance": 0.9,
    "input_pattern": "RETURN_REFUND_INQUIRY",
    "output_template": "Our standard return policy allows for returns within 30 days of purchase for a full refund, provided the item is in its original condition. Would you like to initiate a return?"
  },
  {
    "category": "Support", "type": "Instruction", "topic": "TechnicalSupport", "importance": 0.9,
    "input_pattern": "TECHNICAL_SUPPORT",
    "output_template": "I understand you're experiencing a technical issue. To best assist you, could you briefly describe the problem you're encountering?"
  },
  {
    "category": "Support", "type": "Instruction", "topic": "BillingInquiry", "importance": 0.9,
    "input_pattern": "BILLING_INQUIRY",
    "output_template": "I can assist with billing questions. For security, I will need your account number and the date of the charge you're asking about."
  },
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "RequestRecommendation", "importance": 0.8,
    "input_pattern": "REQUEST_RECOMMENDATION",
    "output_template": "I can certainly try to recommend something. What kind of product or service are you interested in?"
  },
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "ShippingOptionsInquiry", "importance": 0.9,
    "input_pattern": "SHIPPING_OPTIONS_INQUIRY",
    "output_template": "We offer several shipping options, including Standard (3-5 business days), Expedited (2 business days), and Overnight (next business day). Which would you like to know more about?"
  },
  {
    "category": "Ecommerce", "type": "Instruction", "topic": "PaymentMethodsInquiry", "importance": 0.9,
    "input_pattern": "PAYMENT_METHODS_INQUIRY",
    "output_template": "We accept all major credit cards, including Visa, MasterCard, and American Express, as well as PayPal."
  },
  {
    "category": "Support", "type": "Instruction", "topic": "AccountLockoutInquiry", "importance": 1.0,
    "input_pattern": "ACCOUNT_LOCKOUT_INQUIRY",
    "output_template": "I'm sorry to hear you're locked out of your account. We can get that sorted out. To begin, could you please provide the email address associated with your account?"
  },
  {
    "category": "Support", "type": "Instruction", "topic": "PasswordResetInquiry", "importance": 1.0,
    "input_pattern": "PASSWORD_RESET_INQUIRY",
    "output_template": "I can help with a password reset. A link to reset your password has been sent to your registered email address. Please check your inbox and spam folder."
  }
];
