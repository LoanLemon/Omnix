import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_4: IntentMap = new Map([
 ['DATE_INQUIRY', {
    keywords: { 'date': 4.0, 'today': 4.0, 'what': 1.5, 'day': 2.5 },
    booster_phrases: { "what's the date today": 5, 'what is the date today': 5, 'what day is it': 4, "what is today": 6.0, "what is today?": 6.0 }
  }],
 ['USAGE_INSTRUCTIONS', {
    keywords: { 'use': 4.0, 'operate': 3.5, 'instructions': 3.5, 'how to': 3.0, 'manual': 3.0, 'guide': 3.0, 'steps': 2.5 },
    booster_phrases: { 'how do I use this': 4.5, 'give me operating instructions': 4.5, 'what are the steps to use this': 4, 'manual for product X': 3.5, 'guide on how to operate': 4 }
 }],
 ['WARRANTY_INQUIRY', {
    keywords: { 'warranty': 4.0, 'guarantee': 3.5, 'coverage': 3.5, 'repair': 3.0, 'replace': 3.0 },
    booster_phrases: { 'what\'s the warranty on this': 4.5, 'do you offer a guarantee': 4.5, 'what does the warranty cover': 4, 'how to get a repair under warranty': 4.5, 'is this item covered by warranty': 4 }
 }],
 ['DONATION_INQUIRY', {
    keywords: { 'donate': 4.0, 'donation': 4.0, 'contribute': 3.5, 'support': 3.0, 'give': 2.5, 'fund': 2.5, 'charity': 3.0 },
    booster_phrases: { 'how can I donate': 4.5, 'do you accept donations': 4.5, 'where can I contribute': 4, 'how to support your cause': 4.5, 'is there a way to give money': 4 }
 }],
 ['VOLUNTEER_INQUIRY', {
    keywords: { 'volunteer': 4.0, 'help out': 3.5, 'join': 3.0, 'assist': 3.0, 'opportunities': 3.0, 'get involved': 3.0 },
    booster_phrases: { 'how can I volunteer': 4.5, 'are there volunteer opportunities': 4.5, 'how to get involved': 4, 'can I help out': 3.5, 'I want to assist': 3.5 }
 }],
 ['EVENT_REGISTRATION', {
    keywords: { 'register': 4.0, 'sign up': 3.5, 'enroll': 3.5, 'attend': 3.0, 'join': 2.5, 'event': 2.5, 'webinar': 2.5, 'conference': 2.5 },
    booster_phrases: { 'how do I register for the event': 5, 'sign up for the webinar': 4.5, 'enroll me in the conference': 4.5, 'can I register to attend': 4.5, 'how to join this event': 4 }
 }],
 ['EVENT_DETAILS_REQUEST', {
    keywords: { 'event': 4.0, 'details': 3.5, 'info': 3.0, 'what': 2.0, 'where': 2.0, 'when': 2.0, 'agenda': 3.5, 'speakers': 3.5, 'schedule': 3.5 },
    booster_phrases: { 'what are the event details': 4.5, 'where is the event taking place': 4.5, 'when is the event': 4.5, 'what\'s on the agenda': 4, 'who are the speakers': 4 }
 }],
 ['DIETARY_RESTRICTIONS_INQUIRY', {
    keywords: { 'dietary': 4.0, 'restrictions': 4.0, 'allergy': 3.5, 'food': 3.0, 'menu': 2.5, 'options': 2.5, 'vegan': 3.0, 'vegetarian': 3.0, 'gluten-free': 3.5 },
    booster_phrases: { 'do you cater to dietary restrictions': 5, 'what are your options for allergies': 4.5, 'do you have vegan options': 4.5, 'is there a gluten-free menu': 4.5, 'can you accommodate my dietary needs': 4.5 }
 }],
 ['ACCESSIBILITY_INQUIRY', {
    keywords: { 'accessibility': 4.0, 'disabled': 3.5, 'wheelchair': 3.5, 'ramp': 3.0, 'access': 3.0, 'special needs': 3.5, 'accommodate': 3.0 },
    booster_phrases: { 'is your facility wheelchair accessible': 4.5, 'do you have ramps for disabled access': 4.5, 'can you accommodate special needs': 4, 'what are your accessibility features': 4.5, 'is your website accessible': 4 }
 }],
 ['PRIVACY_POLICY_INQUIRY', {
    keywords: { 'privacy': 4.0, 'policy': 4.0, 'data': 3.5, 'information': 3.0, 'collect': 2.5, 'use': 2.5, 'share': 2.5, 'secure': 2.5 },
    booster_phrases: { 'what is your privacy policy': 5, 'how do you use my data': 4.5, 'what information do you collect': 4.5, 'do you share my personal data': 4, 'how do you keep my information secure': 4.5 }
 }],
 ['TERMS_OF_SERVICE_INQUIRY', {
    keywords: { 'terms': 4.0, 'service': 4.0, 'conditions': 4.0, 'agreement': 3.5, 'legal': 3.0, 'policy': 3.0, 'use': 2.5 },
    booster_phrases: { 'what are your terms of service': 5, 'can I see your terms and conditions': 4.5, 'where is the user agreement': 4, 'what are the legal terms of use': 4.5 }
 }],
 ['CUSTOMER_SERVICE_COMPLAINT', {
    keywords: { 'customer service': 4.0, 'complaint': 4.0, 'bad': 3.5, 'poor': 3.0, 'unhappy': 3.0, 'dissatisfied': 3.0, 'issue': 2.5, 'problem': 2.5, 'agent': 2.5 },
    booster_phrases: { 'I have a complaint about customer service': 5, 'your customer service was bad': 4.5, 'I\'m unhappy with an agent': 4.5, 'poor customer service experience': 4.5, 'I experienced a problem with support': 4 }
 }],
 ['TECHNICAL_ISSUE_REPORT', {
    keywords: { 'technical': 4.0, 'issue': 4.0, 'report': 3.5, 'bug': 3.5, 'error': 3.5, 'problem': 3.0, 'malfunction': 3.0, 'website': 2.5, 'app': 2.5, 'system': 2.5 },
    booster_phrases: { 'I want to report a technical issue': 5, 'there\'s a bug in your system': 4.5, 'I found an error on your website': 4.5, 'the app is malfunctioning': 4, 'report a problem with the system': 4.5 }
 }],
 ['FEEDBACK_ABOUT_BOT', {
    keywords: { 'feedback': 4.0, 'bot': 4.0, 'chatbot': 4.0, 'ai': 3.5, 'your': 2.0, 'performance': 3.0, 'helpful': 2.5, 'good': 2.0, 'bad': 2.0, 'improve': 2.5 },
    booster_phrases: { 'I have feedback about this bot': 5, 'how can this chatbot improve': 4.5, 'you were very helpful': 4, 'this bot is not good': 4, 'how can your AI be better': 4.5 }
 }],
 ['ACCOUNT_CREATION_ASSISTANCE', {
    keywords: { 'account': 4.0, 'create': 3.5, 'make': 2.5, 'new': 2.5, 'sign up': 3.5, 'register': 3.5, 'help': 2.0 },
    booster_phrases: { 'how do I create an account': 5, 'help me sign up': 4.5, 'I want to register for a new account': 4.5, 'how to make a new account': 4, 'can you assist with account creation': 4.5 }
 }],
 ['ACCOUNT_DEACTIVATION_REQUEST', {
    keywords: { 'account': 4.0, 'deactivate': 4.0, 'delete': 4.0, 'close': 3.5, 'remove': 3.0, 'cancel': 3.0 },
    booster_phrases: { 'how do I deactivate my account': 5, 'I want to delete my account': 5, 'can you close my account': 4.5, 'remove my account information': 4.5, 'cancel my account permanently': 4.5 }
 }],
 ['NOTIFICATION_SETTINGS_MANAGEMENT', {
    keywords: { 'notification': 4.0, 'settings': 3.5, 'manage': 3.5, 'turn off': 3.0, 'enable': 3.0, 'disable': 3.0, 'alerts': 3.0, 'email': 2.5, 'sms': 2.5 },
    booster_phrases: { 'how to manage my notification settings': 5, 'turn off email notifications': 4.5, 'enable SMS alerts': 4.5, 'where are my notification settings': 4.5, 'how to disable alerts': 4 }
 }],
 ['SUBSCRIPTION_TIER_CHANGE', {
    keywords: { 'subscription': 4.0, 'tier': 4.0, 'change': 3.5, 'upgrade': 3.5, 'downgrade': 3.5, 'plan': 3.0, 'level': 3.0 },
    booster_phrases: { 'how do I change my subscription tier': 5, 'can I upgrade my plan': 4.5, 'I want to downgrade my subscription': 4.5, 'how to switch my plan level': 4.5, 'change my subscription plan': 4.5 }
 }],
 ['PAYMENT_HISTORY_REQUEST', {
    keywords: { 'payment': 4.0, 'history': 4.0, 'transaction': 3.5, 'record': 3.0, 'past': 2.5, 'old': 2.5, 'statement': 3.0 },
    booster_phrases: { 'can I see my payment history': 5, 'show me my past transactions': 4.5, 'where are my payment records': 4.5, 'I need my old statements': 4, 'access my transaction history': 4.5 }
 }],
 ['ORDER_MODIFICATION', {
    keywords: { 'order': 4.0, 'modify': 4.0, 'change': 3.5, 'update': 3.0, 'add': 2.5, 'remove': 2.5, 'item': 2.5, 'address': 2.5, 'quantity': 2.5 },
    booster_phrases: { 'can I modify my order': 5, 'how to change my order details': 4.5, 'add an item to my order': 4.5, 'remove a product from my order': 4.5, 'update the shipping address for my order': 4.5 }
 }],
 ['PRODUCT_COMPARISON_ASSISTANCE', {
    keywords: { 'compare': 4.0, 'products': 4.0, 'which': 2.5, 'better': 2.5, 'difference': 3.0, 'recommend': 3.0, 'help': 2.0 },
    booster_phrases: { 'help me compare products': 5, 'which product is better': 4.5, 'what\'s the difference between these products': 4.5, 'can you recommend one over the other': 4.5, 'assist me in product comparison': 4.5 }
 }],
 ['SHIPPING_METHOD_CHANGE', {
    keywords: { 'shipping': 4.0, 'method': 4.0, 'change': 3.5, 'update': 3.0, 'expedited': 3.0, 'standard': 3.0, 'express': 3.0 },
    booster_phrases: { 'can I change my shipping method': 5, 'update to expedited shipping': 4.5, 'switch to express delivery': 4.5, 'change my shipping option': 4.5 }
 }],
 ['BULK_ORDER_INQUIRY', {
    keywords: { 'bulk': 4.0, 'order': 4.0, 'large': 3.5, 'quantity': 3.5, 'discount': 3.0, 'wholesale': 3.5, 'pricing': 3.0 },
    booster_phrases: { 'do you offer bulk order discounts': 5, 'I want to place a large quantity order': 4.5, 'what\'s your wholesale pricing': 4.5, 'inquiry about bulk orders': 4.5 }
 }],
 ['AFFILIATE_PROGRAM_INQUIRY', {
    keywords: { 'affiliate': 4.0, 'program': 4.0, 'join': 3.5, 'commission': 3.5, 'earnings': 3.0, 'referral': 3.0, 'partner': 3.0 },
    booster_phrases: { 'tell me about your affiliate program': 5, 'how can I join your affiliate program': 4.5, 'what are the commission rates': 4, 'how to earn through referrals': 4.5 }
 }],
 ['RESUME_ASSISTANCE', {
    keywords: { 'resume': 4.0, 'cv': 4.0, 'help': 3.5, 'build': 3.0, 'create': 3.0, 'review': 3.0, 'tips': 2.5, 'improve': 2.5 },
    booster_phrases: { 'can you help me build a resume': 5, 'I need resume assistance': 4.5, 'review my CV': 4, 'give me tips to improve my resume': 4.5, 'how to create a good resume': 4.5 }
 }],
 ['COVER_LETTER_HELP', {
    keywords: { 'cover letter': 4.0, 'write': 3.5, 'help': 3.0, 'template': 3.0, 'tips': 2.5, 'create': 2.5 },
    booster_phrases: { 'can you help me write a cover letter': 5, 'I need a cover letter template': 4.5, 'tips for a strong cover letter': 4.5, 'how to create a good cover letter': 4.5 }
 }],
 ['JOB_INTERVIEW_PREP', {
    keywords: { 'interview': 4.0, 'job': 3.5, 'prepare': 3.5, 'prep': 3.0, 'tips': 3.0, 'practice': 3.0, 'questions': 2.5 },
    booster_phrases: { 'help me prepare for a job interview': 5, 'give me interview prep tips': 4.5, 'practice interview questions': 4.5, 'how to ace a job interview': 4.5 }
 }],
 ['CAREER_ADVICE', {
    keywords: { 'career': 4.0, 'advice': 4.0, 'guidance': 3.5, 'path': 3.0, 'change': 2.5, 'grow': 2.5, 'next step': 2.5 },
    booster_phrases: { 'can you give me career advice': 5, 'I need career guidance': 4.5, 'what\'s my next career step': 4.5, 'how to change careers': 4.5, 'help me grow my career': 4 }
 }],
 ['TRAINING_PROGRAM_INQUIRY', {
    keywords: { 'training': 4.0, 'program': 4.0, 'course': 3.5, 'workshop': 3.5, 'skill': 3.0, 'learn': 2.5, 'develop': 2.5 },
    booster_phrases: { 'tell me about your training programs': 4.5, 'what courses do you offer for skill development': 4.5, 'are there any upcoming workshops': 4.5, 'how can I learn new skills': 4 }
 }],
 ['CERTIFICATION_INFORMATION', {
    keywords: { 'certification': 4.0, 'certified': 4.0, 'exam': 3.5, 'pass': 3.0, 'get': 2.5, 'qualify': 2.5, 'recognize': 2.5 },
    booster_phrases: { 'how can I get certified': 4.5, 'what certifications do you offer': 4.5, 'how to pass the certification exam': 4.5, 'is this certification recognized': 4 }
 }],
 ['LOAN_APPLICATION_STATUS', {
    keywords: { 'loan': 4.0, 'application': 4.0, 'status': 4.0, 'check': 3.0, 'update': 2.5, 'pending': 3.0, 'approved': 3.0, 'rejected': 3.0 },
    booster_phrases: { 'what\'s the status of my loan application': 5, 'check my loan application status': 5, 'is my loan approved': 4.5, 'why was my loan rejected': 4.5 }
 }],
 ['LOAN_INQUIRY', {
    keywords: { 'loan': 4.0, 'apply': 3.5, 'interest rate': 3.5, 'eligibility': 3.5, 'requirements': 3.0, 'type': 2.5, 'borrow': 2.5 },
    booster_phrases: { 'how can I apply for a loan': 4.5, 'what are your interest rates for loans': 4.5, 'am I eligible for a loan': 4.5, 'what are the loan requirements': 4.5, 'what types of loans do you offer': 4 }
 }],
 ['CREDIT_CARD_APPLICATION', {
    keywords: { 'credit card': 4.0, 'apply': 3.5, 'application': 3.5, 'benefits': 3.0, 'rewards': 3.0, 'type': 2.5, 'card': 2.5 },
    booster_phrases: { 'how to apply for a credit card': 5, 'what are the benefits of your credit card': 4.5, 'what types of credit cards do you have': 4.5, 'apply for a new credit card': 4.5 }
 }],
 ['INVESTMENT_ADVICE', {
    keywords: { 'investment': 4.0, 'advice': 4.0, 'invest': 3.5, 'portfolio': 3.5, 'stock': 3.0, 'bond': 3.0, 'mutual fund': 3.5, 'retirement': 3.0, 'plan': 3.0 },
    booster_phrases: { 'can you give me investment advice': 5, 'how should I invest my money': 4.5, 'tell me about managing a portfolio': 4.5, 'what are good investment options': 4.5, 'advice on retirement planning': 4 }
 }],
 ['MORTGAGE_INQUIRY', {
    keywords: { 'mortgage': 4.0, 'home loan': 4.0, 'rate': 3.5, 'apply': 3.0, 'refinance': 3.5, 'calculate': 3.0, 'payment': 2.5 },
    booster_phrases: { 'what are your mortgage rates': 4.5, 'how to apply for a home loan': 4.5, 'can I refinance my mortgage': 4.5, 'calculate my mortgage payment': 4.5, 'inquiry about mortgages': 4.5 }
 }],
 ['BANK_ACCOUNT_INQUIRY', {
    keywords: { 'bank account': 4.0, 'open': 3.5, 'checking': 3.5, 'savings': 3.5, 'fees': 3.0, 'interest': 3.0, 'minimum balance': 3.5 },
    booster_phrases: { 'how to open a bank account': 5, 'what are your checking account fees': 4.5, 'tell me about savings account interest rates': 4.5, 'what\'s the minimum balance for a savings account': 4.5 }
 }],
 ['CUSTOMER_SERVICE_HOURS', {
    keywords: { 'customer service': 4.0, 'hours': 4.0, 'available': 3.5, 'support': 3.0, 'when': 2.5, 'reach': 2.5 },
    booster_phrases: { 'what are the customer service hours': 5, 'when is customer support available': 4.5, 'can I reach customer service now': 4.5, 'what time does customer service close': 4.5 }
 }],
 ['CANCEL_APPOINTMENT', {
    keywords: { 'cancel': 4.0, 'appointment': 4.0, 'reschedule': 3.5, 'change': 3.0, 'meeting': 2.5 },
    booster_phrases: { 'how do I cancel my appointment': 5, 'can I reschedule my meeting': 4.5, 'change my appointment time': 4.5, 'cancel a scheduled appointment': 4.5 }
 }],
 ['BOOK_FLIGHT', {
    keywords: { 'book': 4.0, 'flight': 4.0, 'ticket': 3.5, 'travel': 3.0, 'destination': 3.0, 'date': 2.5, 'depart': 2.5, 'arrive': 2.5 },
    booster_phrases: { 'how can I book a flight': 5, 'book a flight to New York': 4.5, 'find flights to London': 4.5, 'I want to book a ticket for travel': 4.5 }
 }],
 ['CHECK_FLIGHT_STATUS', {
    keywords: { 'flight': 4.0, 'status': 4.0, 'check': 3.5, 'tracking': 3.0, 'delay': 3.0, 'on time': 3.0, 'number': 2.5 },
    booster_phrases: { 'check flight status': 5, 'what\'s the status of flight AA123': 4.5, 'is flight BA456 on time': 4.5, 'are there any delays for flight KL789': 4.5 }
 }],
 ['HOTEL_BOOKING', {
    keywords: { 'hotel': 4.0, 'book': 4.0, 'reservation': 3.5, 'room': 3.0, 'stay': 3.0, 'check in': 2.5, 'check out': 2.5, 'nights': 2.5 },
    booster_phrases: { 'how to book a hotel': 5, 'book a hotel room': 4.5, 'make a hotel reservation': 4.5, 'I need a hotel for X nights': 4.5 }
 }],
 ['RENT_CAR', {
    keywords: { 'rent': 4.0, 'car': 4.0, 'vehicle': 3.5, 'hire': 3.0, 'daily': 2.5, 'weekly': 2.5, 'type': 2.5 },
    booster_phrases: { 'how can I rent a car': 5, 'rent a vehicle for the day': 4.5, 'I want to hire a car': 4.5, 'what types of cars can I rent': 4.5 }
 }],
 ['WEATHER_INQUIRY', {
    keywords: { 'weather': 4.0, 'forecast': 3.5, 'temperature': 3.0, 'today': 2.5, 'tomorrow': 2.5, 'city': 2.5, 'current': 2.5 },
    booster_phrases: { 'what\'s the weather like today': 4.5, 'what\'s the forecast for tomorrow': 4.5, 'what\'s the temperature in London': 4.5, 'current weather in Paris': 4.5 }
 }],
 ['TIME_INQUIRY', {
    keywords: { 'time': 4.0, 'now': 3.0, 'current': 3.0, 'what': 2.0, 'city': 2.5, 'timezone': 3.0 },
    booster_phrases: { 'what time is it': 4.5, 'what\'s the current time': 4.5, 'what time is it in London': 4.5, 'what timezone are you in': 4.5 }
 }],
 ['CURRENCY_CONVERSION', {
    keywords: { 'currency': 4.0, 'convert': 4.0, 'exchange': 3.5, 'rate': 3.5, 'usd': 3.0, 'eur': 3.0, 'gbp': 3.0 },
    booster_phrases: { 'convert USD to EUR': 5, 'what\'s the exchange rate for GBP': 4.5, 'convert 100 dollars to euros': 4.5, 'currency conversion from AUD to JPY': 4.5 }
 }],
 ['UNIT_CONVERSION', {
    keywords: { 'convert': 4.0, 'unit': 4.0, 'measurement': 3.5, 'length': 3.0, 'weight': 3.0, 'volume': 3.0, 'temperature': 3.0, 'celsius': 3.0, 'fahrenheit': 3.0 },
    booster_phrases: { 'convert miles to kilometers': 5, 'convert pounds to kilograms': 4.5, 'convert celsius to fahrenheit': 4.5, 'convert liters to gallons': 4.5 }
 }],
 ['CALCULATOR', {
    keywords: { 'calculate': 4.0, 'math': 3.5, 'add': 3.0, 'subtract': 3.0, 'multiply': 3.0, 'divide': 3.0, 'sum': 2.5, 'equation': 3.0 },
    booster_phrases: { 'calculate 5 plus 3': 4.5, 'what\'s 10 multiplied by 7': 4.5, 'solve this equation': 4.5, 'add these numbers': 4.5 }
 }],
]);