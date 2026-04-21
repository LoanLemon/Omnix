import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_3: IntentMap = new Map([
 ['REQUEST_RECOMMENDATION', {
    keywords: { 'recommend': 4.0, 'suggest': 3.5, 'advise': 3.5, 'good': 2.0, 'best': 3.0, 'what': 1.5, 'should': 1.5, 'pick': 2.5, 'choose': 2.5, 'idea': 2.0, 'tip': 2.5 },
    booster_phrases: { 'what do you recommend': 4.5, 'can you suggest something': 4.5, 'what is a good': 4, 'what should I choose': 4, 'any ideas for': 3.5, 'give me some tips': 3.5, 'what\'s the best': 4 }
 }],
 ['PRODUCT_INQUIRY', {
    keywords: { 'product': 4.0, 'item': 3.0, 'about': 1.5, 'info': 3.0, 'details': 3.0, 'specifications': 3.5, 'feature': 3.0, 'price': 3.5, 'cost': 3.0, 'stock': 3.0, 'available': 2.5, 'difference': 3.0, 'compare': 3.0, 'this': 1.5 },
    booster_phrases: { 'tell me about this product': 4.5, 'what are the features of': 4, 'how much does this cost': 4.5, 'is this item in stock': 4, 'what\'s the price of': 4, 'compare these two products': 4.5, 'do you have this available': 3.5 }
 }],
 ['ORDER_STATUS', {
    keywords: { 'order': 4.0, 'status': 3.5, 'where': 2.0, 'my': 1.0, 'package': 3.5, 'tracking': 3.5, 'delivery': 3.0, 'arrive': 3.0, 'when': 2.5, 'shipment': 3.0, 'number': 2.5, 'lookup': 3.0 },
    booster_phrases: { 'where is my order': 5, 'what\'s the status of my order': 5, 'track my package': 4.5, 'when will my delivery arrive': 4.5, 'can you look up my order': 4.5, 'check my order status': 4.5 }
 }],
 ['RETURN_REFUND_INQUIRY', {
    keywords: { 'return': 4.0, 'refund': 4.0, 'exchange': 3.5, 'policy': 3.0, 'process': 3.0, 'how': 1.5, 'get': 2.0, 'money': 2.5, 'back': 2.0, 'item': 2.5, 'defective': 3.5, 'wrong': 2.5 },
    booster_phrases: { 'how do I return this item': 5, 'what\'s your return policy': 5, 'can I get a refund': 4.5, 'how to exchange a product': 4.5, 'this item is defective': 4 }
 }],
 ['ACCOUNT_MANAGEMENT', {
    keywords: { 'account': 4.0, 'login': 3.5, 'password': 3.5, 'reset': 3.0, 'change': 2.5, 'update': 2.5, 'settings': 3.0, 'profile': 3.0, 'delete': 3.5, 'create': 3.0, 'manage': 3.5, 'access': 2.5 },
    booster_phrases: { 'how do I reset my password': 5, 'can I change my email address': 4.5, 'update my account information': 4, 'how to delete my account': 5, 'manage my profile settings': 4 }
 }],
 ['TECHNICAL_SUPPORT', {
    keywords: { 'technical': 4.0, 'support': 4.0, 'issue': 3.0, 'problem': 3.0, 'fix': 3.0, 'troubleshoot': 3.5, 'error': 3.5, 'not working': 3.5, 'help': 2.5, 'device': 2.5, 'software': 2.5 },
    booster_phrases: { 'I need technical support': 4.5, 'my device isn\'t working': 4.5, 'how to fix this error': 4.5, 'troubleshoot my software': 4, 'I have a technical issue': 4.5 }
 }],
 ['BILLING_INQUIRY', {
    keywords: { 'bill': 4.0, 'billing': 4.0, 'invoice': 3.5, 'payment': 3.5, 'charge': 3.0, 'statement': 3.0, 'due': 2.5, 'pay': 2.5, 'amount': 2.5, 'credit card': 3.0, 'receipt': 3.0 },
    booster_phrases: { 'what\'s my current bill': 4.5, 'can I get a copy of my invoice': 4.5, 'when is my payment due': 4, 'I have a question about a charge': 4.5, 'can you send me a receipt': 4 }
 }],
 ['CANCELLATION_REQUEST', {
    keywords: { 'cancel': 4.0, 'cancellation': 4.0, 'subscription': 3.5, 'order': 3.5, 'account': 3.0, 'service': 3.0, 'stop': 3.0, 'end': 2.5, 'terminate': 3.5 },
    booster_phrases: { 'how do I cancel my subscription': 5, 'I want to cancel my order': 4.5, 'can I terminate my service': 4.5, 'cancel my account': 4.5, 'stop my recurring payments': 4 }
 }],
 ['GENERAL_INFORMATION_REQUEST', {
    keywords: { 'info': 3.0, 'information': 3.0, 'about': 2.0, 'tell': 1.5, 'what': 1.5, 'how': 1.5, 'where': 1.5, 'when': 1.5, 'who': 1.5, 'why': 1.5, 'details': 2.5 },
    booster_phrases: { 'tell me about': 3.5, 'what is': 3, 'how does it work': 3.5, 'where can I find': 3.5, 'when is': 3, 'who is': 3, 'why is': 3 }
 }],
 ['BUSINESS_HOURS_INQUIRY', {
    keywords: { 'hours': 4.0, 'open': 3.5, 'close': 3.5, 'when': 2.5, 'business': 3.0, 'operate': 3.0, 'today': 2.0, 'weekend': 2.5, 'holiday': 2.5 },
    booster_phrases: { 'what are your business hours': 4.5, 'are you open today': 4, 'when do you close': 4, 'what time do you open': 4.5, 'are you open on weekends': 4 }
 }],
 ['LOCATION_INQUIRY', {
    keywords: { 'location': 4.0, 'address': 3.5, 'where': 2.5, 'find': 2.5, 'nearby': 3.0, 'directions': 3.0, 'map': 2.5, 'branch': 3.0, 'store': 3.0 },
    booster_phrases: { 'what\'s your address': 4.5, 'where are you located': 4.5, 'how can I find you': 4, 'directions to your store': 4, 'is there a branch nearby': 4 }
 }],
 ['CONTACT_INFORMATION_REQUEST', {
    keywords: { 'contact': 4.0, 'phone': 3.5, 'number': 3.0, 'email': 3.5, 'call': 3.0, 'reach': 2.5, 'support': 2.5, 'talk': 2.0, 'human': 3.0 },
    booster_phrases: { 'what\'s your phone number': 4.5, 'can I get your email address': 4.5, 'how can I contact support': 4, 'can I talk to a human': 4.5, 'how do I reach you': 4 }
 }],
 ['LIVE_AGENT_REQUEST', {
    keywords: { 'agent': 4.0, 'human': 4.0, 'person': 3.5, 'speak': 3.0, 'talk': 3.0, 'representative': 3.5, 'live': 3.5, 'connect': 3.0, 'transfer': 3.0 },
    booster_phrases: { 'connect me to an agent': 5, 'I want to speak to a human': 5, 'can I talk to a representative': 4.5, 'transfer me to live support': 4.5, 'put me in touch with a person': 4.5 }
 }],
 ['FEEDBACK_SUBMISSION', {
    keywords: { 'feedback': 4.0, 'suggestion': 3.5, 'idea': 3.0, 'comment': 3.0, 'complain': 3.5, 'report': 3.0, 'issue': 2.5, 'improvement': 3.0, 'experience': 2.0 },
    booster_phrases: { 'I have some feedback': 4.5, 'I want to make a suggestion': 4, 'how can I submit a complaint': 4.5, 'report an issue': 4, 'my experience was not good': 4 }
 }],
 ['APPOINTMENT_SCHEDULING', {
    keywords: { 'appointment': 4.0, 'schedule': 3.5, 'book': 3.5, 'set': 2.5, 'time': 2.0, 'date': 2.0, 'meeting': 3.0, 'reserve': 3.0, 'availability': 3.0 },
    booster_phrases: { 'schedule an appointment': 4.5, 'book a meeting': 4, 'what\'s your availability': 4, 'can I set up a time': 4.5, 'reserve a spot': 4 }
 }],
 ['PASSWORD_RESET', {
    keywords: { 'password': 4.0, 'reset': 4.0, 'forgot': 3.5, 'recover': 3.5, 'locked': 3.0, 'access': 2.5, 'account': 2.5 },
    booster_phrases: { 'I forgot my password': 5, 'how to reset my password': 5, 'recover my account': 4.5, 'my account is locked': 4, 'I can\'t access my password': 4.5 }
 }],
 ['SUBSCRIPTION_MANAGEMENT', {
    keywords: { 'subscription': 4.0, 'manage': 3.5, 'update': 3.0, 'change': 2.5, 'upgrade': 3.0, 'downgrade': 3.0, 'plan': 3.0, 'cancel': 3.5, 'renewal': 3.0 },
    booster_phrases: { 'manage my subscription': 4.5, 'how to update my plan': 4, 'can I upgrade my subscription': 4.5, 'change my billing plan': 4, 'when is my subscription renewal': 4 }
 }],
 ['SHIPPING_INQUIRY', {
    keywords: { 'shipping': 4.0, 'delivery': 3.5, 'cost': 3.0, 'time': 2.5, 'fees': 3.0, 'international': 3.5, 'expedited': 3.0, 'method': 2.5, 'option': 2.5 },
    booster_phrases: { 'what are your shipping costs': 4.5, 'how long does delivery take': 4.5, 'do you offer international shipping': 4, 'what are the shipping options': 4.5, 'can I get expedited shipping': 4 }
 }],
 ['PRICE_CHECK', {
    keywords: { 'price': 4.0, 'cost': 3.5, 'much': 2.5, 'how': 1.5, 'charge': 3.0, 'expensive': 3.0, 'cheap': 2.5, 'pricing': 3.5, 'rates': 3.0 },
    booster_phrases: { 'how much does it cost': 4.5, 'what\'s the price of': 4.5, 'what are your pricing rates': 4, 'is this expensive': 3.5, 'how much do you charge for': 4.5 }
 }],
 ['TROUBLESHOOTING_GUIDE', {
    keywords: { 'troubleshoot': 4.0, 'guide': 3.5, 'steps': 3.0, 'how to': 3.0, 'resolve': 3.0, 'fix': 3.0, 'problem': 2.5, 'issue': 2.5, 'help': 2.0 },
    booster_phrases: { 'how to troubleshoot': 4.5, 'give me a troubleshooting guide': 4.5, 'steps to resolve this problem': 4.5, 'help me fix this issue': 4.5, 'can you guide me through this': 4 }
 }],
 ['COMPLAINT_FILING', {
    keywords: { 'complaint': 4.0, 'file': 3.5, 'make': 2.5, 'register': 3.0, 'dissatisfied': 3.5, 'unhappy': 3.0, 'bad service': 3.5, 'grievance': 3.5 },
    booster_phrases: { 'I want to file a complaint': 5, 'how do I make a complaint': 4.5, 'register a grievance': 4, 'I am dissatisfied with your service': 4.5, 'I\'m unhappy with this': 4 }
 }],
 ['APPRECIATION', {
    keywords: { 'thank': 4.0, 'thanks': 4.0, 'appreciate': 3.5, 'good': 2.5, 'great': 2.5, 'help': 2.0, 'awesome': 3.0, 'useful': 3.0 },
    booster_phrases: { 'thank you for your help': 4.5, 'I appreciate that': 3.5, 'that was very helpful': 4, 'thanks a lot': 3.5, 'you\'re great': 3 }
 }],
 ['AVAILABILITY_CHECK', {
    keywords: { 'available': 4.0, 'stock': 3.5, 'in stock': 3.5, 'have': 2.5, 'can I get': 2.5, 'buy': 2.5, 'product': 2.5, 'item': 2.5 },
    booster_phrases: { 'is this product available': 4.5, 'do you have this in stock': 4.5, 'can I buy this now': 4, 'is it currently available': 4, 'check availability for': 4 }
 }],
 ['UPDATE_PERSONAL_INFO', {
    keywords: { 'update': 4.0, 'change': 3.5, 'personal': 3.5, 'info': 3.0, 'information': 3.0, 'address': 3.5, 'phone': 3.0, 'email': 3.0, 'name': 3.0 },
    booster_phrases: { 'how do I update my address': 4.5, 'change my phone number': 4.5, 'update my personal information': 4, 'can I change my email': 4.5, 'how to modify my name': 4 }
 }],
 ['CAREER_INQUIRY', {
    keywords: { 'career': 4.0, 'job': 3.5, 'opening': 3.5, 'vacancy': 3.5, 'work': 3.0, 'employment': 3.0, 'apply': 3.0, 'hire': 2.5, 'position': 3.0 },
    booster_phrases: { 'are there any job openings': 4.5, 'how can I apply for a position': 4.5, 'do you have any vacancies': 4, 'I\'m looking for employment': 4, 'tell me about careers at your company': 4.5 }
 }],
 ['PARTNERSHIP_INQUIRY', {
    keywords: { 'partner': 4.0, 'partnership': 4.0, 'collaborate': 3.5, 'joint': 3.0, 'venture': 3.0, 'business': 2.5, 'opportunity': 3.0, 'affiliate': 3.0 },
    booster_phrases: { 'I\'m interested in a partnership': 4.5, 'how can we collaborate': 4, 'do you offer affiliate programs': 4.5, 'looking for a business opportunity': 4, 'can we work together': 3.5 }
 }],
 ['INVESTOR_RELATIONS', {
    keywords: { 'investor': 4.0, 'invest': 3.5, 'shareholder': 3.5, 'financial': 3.0, 'report': 3.0, 'earnings': 3.0, 'stock': 2.5, 'public': 2.5 },
    booster_phrases: { 'I\'m an investor': 4.5, 'where can I find financial reports': 4.5, 'tell me about your earnings': 4, 'how to invest in your company': 4.5, 'information for shareholders': 4 }
 }],
 ['MEDIA_INQUIRY', {
    keywords: { 'media': 4.0, 'press': 3.5, 'interview': 3.5, 'journalist': 3.5, 'reporter': 3.5, 'statement': 3.0, 'contact': 2.5 },
    booster_phrases: { 'I\'m from the media': 4.5, 'I\'d like to request an interview': 4.5, 'press inquiry': 4, 'can I get a statement': 4, 'contact for journalists': 4 }
 }],
 ['EVENTS_INQUIRY', {
    keywords: { 'event': 4.0, 'webinar': 3.5, 'conference': 3.5, 'workshop': 3.5, 'schedule': 3.0, 'upcoming': 3.0, 'register': 3.0, 'attend': 2.5 },
    booster_phrases: { 'what upcoming events do you have': 4.5, 'how can I register for the webinar': 4.5, 'tell me about your next conference': 4, 'can I attend your workshop': 4, 'what\'s the schedule of events': 4.5 }
 }],
 ['COURSE_INFORMATION', {
    keywords: { 'course': 4.0, 'program': 3.5, 'curriculum': 3.5, 'enroll': 3.0, 'study': 2.5, 'admission': 3.0, 'fees': 3.0, 'degree': 3.0, 'certificate': 3.0, 'syllabus': 3.5 },
    booster_phrases: { 'tell me about your courses': 4.5, 'how do I enroll in this program': 4.5, 'what\'s the curriculum like': 4, 'what are the admission requirements': 4, 'how much are the course fees': 4.5 }
 }],
 ['SOFTWARE_FEATURES', {
    keywords: { 'software': 4.0, 'feature': 3.5, 'functionality': 3.5, 'tool': 3.0, 'program': 3.0, 'app': 3.0, 'capability': 3.0, 'do': 2.0, 'can': 2.0 },
    booster_phrases: { 'what features does your software have': 4.5, 'what can this app do': 4, 'explain the functionality of this tool': 4.5, 'does it have this capability': 4, 'what are the program features': 4.5 }
 }],
 ['HARDWARE_SPECIFICATIONS', {
    keywords: { 'hardware': 4.0, 'specifications': 4.0, 'specs': 3.5, 'model': 3.0, 'device': 3.0, 'component': 3.0, 'cpu': 3.5, 'ram': 3.5, 'storage': 3.5, 'display': 3.0 },
    booster_phrases: { 'what are the hardware specifications': 4.5, 'tell me the specs for this model': 4.5, 'what kind of CPU does it have': 4, 'how much RAM is in this device': 4, 'what\'s the display size': 4 }
 }],
 ['DEMO_REQUEST', {
    keywords: { 'demo': 4.0, 'demonstration': 4.0, 'trial': 3.5, 'try': 3.0, 'see': 2.5, 'show': 2.5, 'product': 2.5, 'software': 2.5 },
    booster_phrases: { 'can I get a demo': 4.5, 'I\'d like a demonstration': 4.5, 'can I try your software': 4, 'show me how it works': 4, 'request a product demo': 4.5 }
 }],
 ['PRICING_PLAN_INQUIRY', {
    keywords: { 'pricing': 4.0, 'plan': 3.5, 'tier': 3.0, 'package': 3.0, 'subscription': 3.0, 'cost': 2.5, 'how much': 2.5, 'options': 2.5 },
    booster_phrases: { 'what are your pricing plans': 4.5, 'tell me about your subscription tiers': 4, 'what\'s the cost of each package': 4.5, 'what are the pricing options': 4 }
 }],
 ['CUSTOMER_SUPPORT_HOURS', {
    keywords: { 'support': 4.0, 'customer': 4.0, 'hours': 3.5, 'available': 3.0, 'when': 2.5, 'reach': 2.5, 'team': 2.5 },
    booster_phrases: { 'what are customer support hours': 4.5, 'when is your support team available': 4, 'can I reach customer service now': 4, 'what time is support open until': 4.5 }
 }],
 ['LEGAL_INQUIRY', {
    keywords: { 'legal': 4.0, 'terms': 3.5, 'conditions': 3.5, 'privacy': 3.5, 'policy': 3.5, 'agreement': 3.0, 'compliance': 3.0, 'gdpr': 3.5, 'copyright': 3.5 },
    booster_phrases: { 'what are your terms and conditions': 4.5, 'tell me about your privacy policy': 4.5, 'are you GDPR compliant': 4, 'what\'s your legal agreement': 4, 'information on copyright': 4 }
 }],
 ['SECURITY_INQUIRY', {
    keywords: { 'security': 4.0, 'secure': 3.5, 'safe': 3.0, 'data': 3.0, 'protection': 3.5, 'encryption': 3.5, 'vulnerability': 3.0, 'breach': 3.0, 'privacy': 3.0 },
    booster_phrases: { 'how secure is your platform': 4.5, 'is my data safe with you': 4.5, 'what data protection measures do you have': 4.5, 'do you use encryption': 4, 'tell me about your security policies': 4 }
 }],
 ['BILLING_ADDRESS_UPDATE', {
    keywords: { 'billing': 4.0, 'address': 4.0, 'update': 3.5, 'change': 3.0, 'modify': 3.0, 'correct': 2.5 },
    booster_phrases: { 'how do I update my billing address': 5, 'change my billing address': 4.5, 'can I modify my billing address': 4, 'correct my billing address': 4 }
 }],
 ['SHIPPING_ADDRESS_UPDATE', {
    keywords: { 'shipping': 4.0, 'address': 4.0, 'update': 3.5, 'change': 3.0, 'modify': 3.0, 'correct': 2.5 },
    booster_phrases: { 'how do I update my shipping address': 5, 'change my shipping address': 4.5, 'can I modify my shipping address': 4, 'correct my shipping address': 4 }
 }],
 ['PAYMENT_METHOD_UPDATE', {
    keywords: { 'payment': 4.0, 'method': 4.0, 'update': 3.5, 'change': 3.0, 'credit card': 3.0, 'card': 3.0, 'details': 2.5, 'add': 2.5, 'remove': 2.5 },
    booster_phrases: { 'how do I update my payment method': 5, 'change my credit card details': 4.5, 'add a new payment method': 4, 'remove my old card': 4, 'update my payment information': 4.5 }
 }],
 ['CUSTOMER_LOYALTY_PROGRAM', {
    keywords: { 'loyalty': 4.0, 'program': 4.0, 'rewards': 3.5, 'points': 3.0, 'benefits': 3.0, 'discount': 3.0, 'membership': 3.0, 'join': 2.5 },
    booster_phrases: { 'tell me about your loyalty program': 4.5, 'how can I earn rewards points': 4.5, 'what are the membership benefits': 4, 'how to join your loyalty program': 4.5, 'do you have a customer loyalty program': 4 }
 }],
 ['PRESS_RELEASE_REQUEST', {
    keywords: { 'press release': 4.0, 'latest': 3.0, 'news': 2.5, 'announcement': 3.0, 'media': 2.5, 'updates': 2.5 },
    booster_phrases: { 'where can I find your latest press releases': 4.5, 'do you have any new announcements': 4, 'send me your press updates': 4, 'looking for media news': 4 }
 }],
 ['INVESTOR_CALL_TRANSCRIPT', {
    keywords: { 'investor': 4.0, 'call': 3.5, 'transcript': 4.0, 'earnings': 3.5, 'conference': 3.0, 'report': 2.5, 'download': 2.5 },
    booster_phrases: { 'can I get the investor call transcript': 4.5, 'where are the earnings conference transcripts': 4.5, 'download investor call report': 4 }
 }],
 ['PARTNER_PROGRAM_APPLICATION', {
    keywords: { 'partner': 4.0, 'program': 4.0, 'apply': 3.5, 'application': 3.5, 'join': 3.0, 'criteria': 3.0, 'requirements': 3.0 },
    booster_phrases: { 'how do I apply for your partner program': 5, 'what are the criteria to join the partnership': 4.5, 'where is the partner program application': 4.5 }
 }],
 ['TECHNICAL_DOCUMENTATION', {
    keywords: { 'technical': 4.0, 'documentation': 4.0, 'docs': 3.5, 'manual': 3.5, 'guide': 3.0, 'api': 3.5, 'integration': 3.0, 'developer': 3.0 },
    booster_phrases: { 'where can I find technical documentation': 4.5, 'do you have an API guide': 4, 'looking for developer documentation': 4.5, 'product manual': 3.5 }
 }],
 ['BLOG_CONTENT_REQUEST', {
    keywords: { 'blog': 4.0, 'article': 3.5, 'post': 3.0, 'content': 3.0, 'read': 2.5, 'latest': 2.5, 'new': 2.5, 'topic': 2.5 },
    booster_phrases: { 'show me your latest blog posts': 4.5, 'can I read an article about': 4, 'what\'s new on your blog': 4, 'do you have content on this topic': 4 }
 }],
 ['CASE_STUDY_REQUEST', {
    keywords: { 'case study': 4.0, 'success': 3.5, 'story': 3.0, 'example': 3.0, 'client': 2.5, 'customer': 2.5, 'demonstrate': 2.5 },
    booster_phrases: { 'do you have any case studies': 4.5, 'show me a success story': 4, 'can you demonstrate a client example': 4.5, 'where can I find customer case studies': 4.5 }
 }],
 ['TESTIMONIAL_REQUEST', {
    keywords: { 'testimonial': 4.0, 'review': 3.5, 'feedback': 3.0, 'customer': 2.5, 'client': 2.5, 'what do they say': 2.5 },
    booster_phrases: { 'can I see some testimonials': 4.5, 'do you have customer reviews': 4, 'what do clients say about you': 4, 'show me some positive feedback': 4 }
 }],
 ['FAQ_SEARCH', {
    keywords: { 'faq': 4.0, 'frequently asked questions': 4.0, 'common questions': 3.5, 'answers': 3.0, 'q&a': 3.5, 'knowledge base': 3.5, 'help center': 3.5 },
    booster_phrases: { 'where is your FAQ': 4.5, 'can you show me frequently asked questions': 4.5, 'I need answers to common questions': 4, 'access your knowledge base': 4, 'go to the help center': 4 }
 }],
 ['COMPARE_PRODUCTS', {
    keywords: { 'compare': 4.0, 'contrast': 3.5, 'versus': 3.5, 'difference': 3.0, 'better': 2.5, 'which': 2.0, 'between': 2.0 },
    booster_phrases: { 'compare product A and product B': 5, 'what\'s the difference between X and Y': 4.5, 'which one is better': 3.5, 'contrast these two items': 4 }
 }],
 ['SETUP_ASSISTANCE', {
    keywords: { 'setup': 4.0, 'install': 3.5, 'configure': 3.5, 'begin': 2.5, 'start': 2.5, 'guide': 3.0, 'assistance': 3.0, 'help': 2.0 },
    booster_phrases: { 'how do I set this up': 4.5, 'help with installation': 4.5, 'guide me through configuration': 4.5, 'how to get started': 3.5, 'need setup assistance': 4 }
 }]
]);