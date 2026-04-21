import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_5: IntentMap = new Map([
 ['TRANSLATION_REQUEST', {
    keywords: { 'translate': 4.0, 'translation': 4.0, 'say': 3.0, 'in': 2.0, 'language': 3.0, 'english': 2.5, 'spanish': 2.5, 'french': 2.5 },
    booster_phrases: { 'translate hello to Spanish': 5, 'how do you say thank you in French': 4.5, 'translate this sentence to German': 4.5, 'can you translate this for me': 4.5 }
 }],
 ['NEWS_INQUIRY', {
    keywords: { 'news': 4.0, 'latest': 3.5, 'headlines': 3.5, 'current': 3.0, 'events': 3.0, 'topic': 2.5 },
    booster_phrases: { 'what\'s the latest news': 4.5, 'tell me the top headlines': 4.5, 'what are the current events': 4.5, 'news about X topic': 4.5 }
 }],
 ['SPORTS_SCORES', {
    keywords: { 'sports': 4.0, 'scores': 4.0, 'game': 3.5, 'match': 3.0, 'team': 3.0, 'who won': 3.0, 'results': 3.0 },
    booster_phrases: { 'what are the latest sports scores': 4.5, 'who won the game last night': 4.5, 'what were the results of the football match': 4.5, 'tell me the scores for my team': 4.5 }
 }],
 ['RECIPE_REQUEST', {
    keywords: { 'recipe': 4.0, 'cook': 3.5, 'bake': 3.5, 'how to make': 3.0, 'ingredients': 3.0, 'dish': 2.5 },
    booster_phrases: { 'give me a recipe for lasagna': 5, 'how to make chocolate chip cookies': 4.5, 'do you have any healthy recipes': 4.5, 'ingredients for spaghetti bolognese': 4.5 }
 }],
 ['MOVIE_RECOMMENDATION', {
    keywords: { 'movie': 4.0, 'recommendation': 4.0, 'film': 3.5, 'watch': 3.0, 'genre': 3.0, 'good': 2.5, 'best': 2.5 },
    booster_phrases: { 'recommend a movie': 5, 'what film should I watch': 4.5, 'suggest a good movie': 4.5, 'best movies in the action genre': 4.5 }
 }],
 ['BOOK_RECOMMENDATION', {
    keywords: { 'book': 4.0, 'recommendation': 4.0, 'read': 3.5, 'author': 3.0, 'genre': 3.0, 'novel': 3.0, 'good': 2.5, 'best': 2.5 },
    booster_phrases: { 'recommend a book': 5, 'what book should I read next': 4.5, 'suggest a good novel': 4.5, 'best books by this author': 4.5 }
 }],
 ['MUSIC_RECOMMENDATION', {
    keywords: { 'music': 4.0, 'recommendation': 4.0, 'song': 3.5, 'artist': 3.0, 'band': 3.0, 'genre': 3.0, 'listen': 2.5, 'play': 2.5 },
    booster_phrases: { 'recommend some music': 5, 'what song should I listen to': 4.5, 'suggest an artist': 4.5, 'play some rock music': 4.5 }
 }],
 ['RESTAURANT_RECOMMENDATION', {
    keywords: { 'restaurant': 4.0, 'recommendation': 4.0, 'eat': 3.5, 'dining': 3.0, 'cuisine': 3.0, 'food': 2.5, 'nearby': 2.5, 'best': 2.5 },
    booster_phrases: { 'recommend a restaurant': 5, 'where should I eat nearby': 4.5, 'suggest a good Italian restaurant': 4.5, 'best dining options in this area': 4.5 }
 }],
 ['TRAVEL_PLANNING', {
    keywords: { 'travel': 4.0, 'plan': 4.0, 'trip': 3.5, 'vacation': 3.5, 'destination': 3.0, 'itinerary': 3.0, 'budget': 3.0, 'how to': 2.5 },
    booster_phrases: { 'help me plan a trip': 5, 'I want to plan a vacation to X': 4.5, 'create a travel itinerary': 4.5, 'how to plan a trip on a budget': 4.5 }
 }],
 ['HISTORICAL_FACT', {
    keywords: { 'history': 4.0, 'historical': 4.0, 'fact': 3.5, 'event': 3.0, 'when': 2.5, 'who': 2.5, 'what': 2.5 },
    booster_phrases: { 'tell me a historical fact': 5, 'what happened on this date in history': 4.5, 'who was X historical figure': 4.5, 'tell me about the history of Y': 4.5 }
 }],
 ['SCIENCE_FACT', {
    keywords: { 'science': 4.0, 'fact': 4.0, 'scientific': 3.5, 'discovery': 3.5, 'theory': 3.0, 'concept': 3.0, 'explain': 2.5 },
    booster_phrases: { 'tell me a science fact': 5, 'explain the theory of relativity': 4.5, 'what\'s a recent scientific discovery': 4.5, 'tell me about quantum physics': 4.5 }
 }],
 ['GENERAL_KNOWLEDGE', {
    keywords: { 'knowledge': 4.0, 'general': 4.0, 'fact': 3.5, 'learn': 3.0, 'trivia': 3.0, 'something': 2.5, 'know': 2.5 },
    booster_phrases: { 'tell me a general knowledge fact': 5, 'teach me something new': 4.5, 'give me some trivia': 4.5, 'what\'s an interesting fact about X': 4.5 }
 }],
 ['EXPLAIN_CONCEPT', {
    keywords: { 'explain': 4.0, 'concept': 4.0, 'define': 3.5, 'what is': 3.0, 'how does': 3.0, 'meaning': 3.0, 'understand': 2.5 },
    booster_phrases: { 'explain this concept to me': 5, 'what is the meaning of X': 4.5, 'how does Y work': 4.5, 'can you help me understand Z': 4.5 }
 }],
 ['TUTORIAL_REQUEST', {
    keywords: { 'tutorial': 4.0, 'how to': 4.0, 'guide': 3.5, 'steps': 3.0, 'teach me': 3.0, 'learn': 2.5, 'walkthrough': 3.5 },
    booster_phrases: { 'give me a tutorial on X': 5, 'how to do Y step by step': 4.5, 'teach me how to use this': 4.5, 'walk me through the process': 4.5 }
 }],
 ['PRICE_MATCH_INQUIRY', {
    keywords: { 'price match': 4.0, 'match': 3.5, 'lower': 3.0, 'beat': 3.0, 'competitor': 3.0, 'same': 2.5 },
    booster_phrases: { 'do you price match': 5, 'will you match a competitor\'s price': 4.5, 'can you beat this price': 4.5, 'do you have a price matching policy': 4.5 }
 }],
 ['PRODUCT_CUSTOMIZATION', {
    keywords: { 'customize': 4.0, 'customization': 4.0, 'personalize': 3.5, 'options': 3.0, 'design': 3.0, 'modify': 3.0, 'unique': 2.5 },
    booster_phrases: { 'can I customize this product': 5, 'what are the customization options': 4.5, 'can you personalize this item': 4.5, 'design my own X': 4.5 }
 }],
 ['GIFT_CARD_INQUIRY', {
    keywords: { 'gift card': 4.0, 'balance': 3.5, 'check': 3.0, 'buy': 3.0, 'redeem': 3.0, 'purchase': 2.5, 'voucher': 2.5 },
    booster_phrases: { 'how to check my gift card balance': 5, 'where can I buy a gift card': 4.5, 'how to redeem a gift card': 4.5, 'can I purchase a voucher': 4.5 }
 }],
 ['LOYALTY_POINTS_CHECK', {
    keywords: { 'loyalty': 4.0, 'points': 4.0, 'check': 3.5, 'balance': 3.5, 'rewards': 3.0, 'earn': 2.5, 'redeem': 2.5 },
    booster_phrases: { 'check my loyalty points balance': 5, 'how many reward points do I have': 4.5, 'how to earn more loyalty points': 4.5, 'can I redeem my points': 4.5 }
 }],
 ['CAREER_DEVELOPMENT_RESOURCES', {
    keywords: { 'career': 4.0, 'development': 4.0, 'resources': 3.5, 'grow': 3.0, 'advance': 3.0, 'skills': 3.0, 'training': 2.5 },
    booster_phrases: { 'do you have career development resources': 5, 'help me with career growth': 4.5, 'resources to advance my career': 4.5, 'training for skill development': 4.5 }
 }],
 ['JOB_APPLICATION_ASSISTANCE', {
    keywords: { 'job application': 4.0, 'apply': 3.5, 'assistance': 3.5, 'help': 3.0, 'fill out': 2.5, 'submit': 2.5 },
    booster_phrases: { 'help me with my job application': 5, 'how to fill out the application form': 4.5, 'can you assist with submitting my application': 4.5, 'I need help with my application': 4.5 }
 }],
 ['EMPLOYEE_BENEFITS_INQUIRY', {
    keywords: { 'employee': 4.0, 'benefits': 4.0, 'health insurance': 3.5, 'retirement': 3.5, 'paid time off': 3.5, 'perks': 3.0, 'package': 3.0 },
    booster_phrases: { 'what are the employee benefits': 5, 'tell me about your health insurance': 4.5, 'do you offer retirement plans': 4.5, 'how much paid time off do employees get': 4.5 }
 }],
 ['COMPANY_CULTURE_INQUIRY', {
    keywords: { 'company culture': 4.0, 'culture': 4.0, 'work environment': 3.5, 'values': 3.0, 'mission': 3.0, 'atmosphere': 3.0 },
    booster_phrases: { 'tell me about your company culture': 5, 'what\'s the work environment like': 4.5, 'what are your company values': 4.5, 'describe the atmosphere at your company': 4.5 }
 }],
 ['CORPORATE_SOCIAL_RESPONSIBILITY', {
    keywords: { 'csr': 4.0, 'corporate social responsibility': 4.0, 'sustainability': 3.5, 'environment': 3.0, 'community': 3.0, 'initiatives': 3.0, 'ethical': 3.0 },
    booster_phrases: { 'tell me about your CSR initiatives': 5, 'what is your corporate social responsibility policy': 4.5, 'how are you contributing to sustainability': 4.5, 'what are your ethical practices': 4.5 }
 }],
 ['STOCK_PRICE_INQUIRY', {
    keywords: { 'stock': 4.0, 'price': 4.0, 'share': 3.5, 'market': 3.0, 'quote': 3.0, 'ticker': 3.0, 'current': 2.5 },
    booster_phrases: { 'what\'s your current stock price': 5, 'get me a stock quote for X': 4.5, 'what\'s the share price of Y company': 4.5, 'tell me the latest stock market update': 4.5 }
 }],
 ['INVESTOR_NEWS', {
    keywords: { 'investor': 4.0, 'news': 4.0, 'updates': 3.5, 'announcements': 3.0, 'latest': 2.5, 'financial': 2.5 },
    booster_phrases: { 'show me the latest investor news': 5, 'what are the recent investor updates': 4.5, 'any new financial announcements': 4.5, 'where can I find investor news': 4.5 }
 }],
 ['PRESS_KIT_REQUEST', {
    keywords: { 'press kit': 4.0, 'media kit': 4.0, 'download': 3.5, 'resources': 3.0, 'assets': 3.0, 'branding': 3.0, 'logo': 2.5 },
    booster_phrases: { 'can I get your press kit': 5, 'where can I download the media kit': 4.5, 'I need your branding assets': 4.5, 'do you have a press kit available': 4.5 }
 }],
 ['SPEAKING_ENGAGEMENT_INQUIRY', {
    keywords: { 'speaking': 4.0, 'engagement': 4.0, 'event': 3.5, 'speaker': 3.5, 'book': 3.0, 'invite': 3.0, 'guest': 2.5 },
    booster_phrases: { 'how can I inquire about a speaking engagement': 5, 'can I book a speaker for my event': 4.5, 'how to invite a guest speaker': 4.5, 'interested in a speaking opportunity': 4.5 }
 }],
 ['SPONSORSHIP_INQUIRY', {
    keywords: { 'sponsorship': 4.0, 'sponsor': 4.0, 'opportunity': 3.5, 'event': 3.0, 'partnership': 3.0, 'advertise': 2.5, 'support': 2.5 },
    booster_phrases: { 'I\'m interested in sponsorship opportunities': 5, 'how can I sponsor your event': 4.5, 'do you offer sponsorship packages': 4.5, 'looking to sponsor an initiative': 4.5 }
 }],
 ['ACADEMIC_PROGRAM_DETAILS', {
    keywords: { 'academic': 4.0, 'program': 4.0, 'details': 3.5, 'course': 3.0, 'curriculum': 3.0, 'faculty': 3.0, 'admission': 3.0, 'fees': 3.0 },
    booster_phrases: { 'tell me about your academic programs': 5, 'what are the details of the X course': 4.5, 'who are the faculty members': 4.5, 'admission requirements for academic programs': 4.5 }
 }],
 ['RESEARCH_INQUIRY', {
    keywords: { 'research': 4.0, 'study': 3.5, 'publication': 3.5, 'paper': 3.0, 'data': 3.0, 'findings': 3.0, 'report': 3.0, 'latest': 2.5 },
    booster_phrases: { 'can you tell me about your research': 4.5, 'where can I find your latest publications': 4.5, 'do you have data on X study': 4.5, 'show me your research findings': 4.5 }
 }],
 ['SOFTWARE_UPDATE_INQUIRY', {
    keywords: { 'software': 4.0, 'update': 4.0, 'latest': 3.5, 'version': 3.5, 'new features': 3.0, 'bug fixes': 3.0, 'release notes': 3.0 },
    booster_phrases: { 'what\'s the latest software update': 5, 'tell me about new features in the latest version': 4.5, 'where can I find release notes for the update': 4.5, 'any bug fixes in the recent software update': 4.5 }
 }],
 ['SYSTEM_REQUIREMENTS_INQUIRY', {
    keywords: { 'system': 4.0, 'requirements': 4.0, 'specs': 3.5, 'minimum': 3.0, 'compatible': 3.0, 'run': 2.5, 'hardware': 2.5, 'software': 2.5 },
    booster_phrases: { 'what are the system requirements': 5, 'what are the minimum specs to run this software': 4.5, 'is my hardware compatible': 4.5, 'what operating system do I need': 4.5 }
 }],
 ['CUSTOMER_ONBOARDING_HELP', {
    keywords: { 'onboarding': 4.0, 'customer': 4.0, 'new user': 3.5, 'get started': 3.5, 'setup': 3.0, 'first steps': 3.0, 'guide': 3.0 },
    booster_phrases: { 'help with customer onboarding': 5, 'how to get started as a new user': 4.5, 'guide for new customers': 4.5, 'what are the first steps for onboarding': 4.5 }
 }],
 ['FEATURE_REQUEST', {
    keywords: { 'feature': 4.0, 'request': 4.0, 'suggestion': 3.5, 'idea': 3.0, 'new': 2.5, 'add': 2.5, 'implement': 2.5 },
    booster_phrases: { 'I have a feature request': 5, 'can you add this new feature': 4.5, 'I suggest a new feature': 4.5, 'I have an idea for a feature': 4.5 }
 }],
 ['BUG_REPORT', {
    keywords: { 'bug': 4.0, 'report': 4.0, 'error': 3.5, 'issue': 3.0, 'problem': 3.0, 'glitch': 3.0, 'malfunction': 3.0 },
    booster_phrases: { 'I want to report a bug': 5, 'I found an error': 4.5, 'there\'s a problem with X': 4.5, 'I\'m experiencing a glitch': 4.5, 'report a malfunction': 4.5 }
 }],
 ['PRODUCT_REPAIR_STATUS', {
    keywords: { 'repair': 4.0, 'status': 4.0, 'product': 3.5, 'device': 3.0, 'fix': 2.5, 'check': 2.5 },
    booster_phrases: { 'what\'s the status of my product repair': 5, 'check repair status for device X': 4.5, 'when will my item be fixed': 4.5, 'status of my repair': 4.5 }
 }],
 ['ACCOUNT_BALANCE_INQUIRY', {
    keywords: { 'account': 4.0, 'balance': 4.0, 'check': 3.5, 'current': 3.0, 'amount': 2.5, 'funds': 2.5 },
    booster_phrases: { 'what\'s my account balance': 5, 'check my current balance': 4.5, 'how much do I have in my account': 4.5, 'inquiry about account funds': 4.5 }
 }],
 ['INVESTMENT_ACCOUNT_OPENING', {
    keywords: { 'investment account': 4.0, 'open': 4.0, 'brokerage': 3.5, 'start': 3.0, 'invest': 3.0, 'set up': 3.0 },
    booster_phrases: { 'how to open an investment account': 5, 'I want to open a brokerage account': 4.5, 'how to start investing': 4.5, 'set up an investment account': 4.5 }
 }],
 ['LOAN_PAYMENT_INQUIRY', {
    keywords: { 'loan': 4.0, 'payment': 4.0, 'due': 3.5, 'amount': 3.0, 'pay': 3.0, 'schedule': 3.0, 'missed': 2.5, 'late': 2.5 },
    booster_phrases: { 'when is my loan payment due': 5, 'what\'s my loan payment amount': 4.5, 'how to pay my loan': 4.5, 'I missed a loan payment': 4.5 }
 }],
 ['STOCK_MARKET_NEWS', {
    keywords: { 'stock market': 4.0, 'news': 4.0, 'updates': 3.5, 'trends': 3.0, 'analysis': 3.0, 'report': 3.0, 'today': 2.5 },
    booster_phrases: { 'what\'s the latest stock market news': 5, 'give me today\'s stock market updates': 4.5, 'any analysis on market trends': 4.5, 'stock market report': 4.5 }
 }],
 ['CREDIT_SCORE_CHECK', {
    keywords: { 'credit score': 4.0, 'check': 4.0, 'improve': 3.5, 'report': 3.0, 'how to': 2.5, 'my': 2.0 },
    booster_phrases: { 'how can I check my credit score': 5, 'how to improve my credit score': 4.5, 'can I get my credit report': 4.5, 'what impacts my credit score': 4.5 }
 }],
 ['MORTGAGE_CALCULATOR', {
    keywords: { 'mortgage': 4.0, 'calculator': 4.0, 'calculate': 3.5, 'payment': 3.0, 'affordability': 3.0, 'estimate': 3.0 },
    booster_phrases: { 'use your mortgage calculator': 5, 'calculate my mortgage payment': 4.5, 'estimate my mortgage affordability': 4.5, 'how to use the mortgage calculator': 4.5 }
 }],
 ['LOAN_REPAYMENT_OPTIONS', {
    keywords: { 'loan': 4.0, 'repayment': 4.0, 'options': 3.5, 'plan': 3.0, 'pay off': 3.0, 'early': 2.5, 'flexible': 2.5 },
    booster_phrases: { 'what are my loan repayment options': 5, 'can I pay off my loan early': 4.5, 'do you have flexible repayment plans': 4.5, 'tell me about loan repayment options': 4.5 }
 }],
 ['ACCOUNT_CLOSURE_INQUIRY', {
    keywords: { 'account': 4.0, 'close': 4.0, 'terminate': 3.5, 'shut down': 3.0, 'cancel': 3.0, 'procedure': 2.5 },
    booster_phrases: { 'how do I close my account': 5, 'what\'s the procedure to terminate my account': 4.5, 'can I shut down my account': 4.5, 'I want to cancel my account': 4.5 }
 }],
 ['ATM_LOCATOR', {
    keywords: { 'atm': 4.0, 'locator': 4.0, 'find': 3.5, 'nearby': 3.0, 'closest': 3.0, 'branch': 3.0, 'cash': 2.5, 'withdraw': 2.5 },
    booster_phrases: { 'find an ATM near me': 5, 'closest ATM location': 4.5, 'where can I find an ATM': 4.5, 'ATM locator': 4.5 }
 }],
 ['BANK_HOLIDAY_SCHEDULE', {
    keywords: { 'bank': 4.0, 'holiday': 4.0, 'schedule': 3.5, 'closed': 3.0, 'open': 2.5, 'hours': 2.5, 'operating': 2.5 },
    booster_phrases: { 'what\'s the bank holiday schedule': 5, 'are you closed on X holiday': 4.5, 'what are your operating hours during holidays': 4.5, 'bank holidays for this year': 4.5 }
 }],
 ['SERVICE_DISRUPTION_STATUS', {
    keywords: { 'service': 4.0, 'disruption': 4.0, 'outage': 4.0, 'down': 3.5, 'status': 3.5, 'problem': 3.0, 'issue': 3.0 },
    booster_phrases: { 'is there a service disruption': 5, 'is your system down': 4.5, 'what\'s the status of the outage': 4.5, 'are there any known service issues': 4.5 }
 }],
 ['API_DOCUMENTATION_REQUEST', {
    keywords: { 'api': 4.0, 'documentation': 4.0, 'docs': 3.5, 'integration': 3.5, 'developer': 3.0, 'guide': 3.0, 'sdk': 3.0 },
    booster_phrases: { 'where can I find your API documentation': 5, 'I need API docs for integration': 4.5, 'developer guide for your API': 4.5, 'do you have an SDK': 4.5 }
 }],
 ['WEBHOOK_SETUP_HELP', {
    keywords: { 'webhook': 4.0, 'setup': 4.0, 'configure': 3.5, 'integrate': 3.5, 'help': 3.0, 'guide': 3.0 },
    booster_phrases: { 'how do I set up a webhook': 5, 'help me configure webhooks': 4.5, 'guide on webhook integration': 4.5, 'I need assistance with webhook setup': 4.5 }
 }],
 ['PRODUCT_ROADMAP_INQUIRY', {
    keywords: { 'product': 4.0, 'roadmap': 4.0, 'future': 3.5, 'plan': 3.0, 'upcoming': 3.0, 'features': 3.0, 'development': 3.0 },
    booster_phrases: { 'what\'s on your product roadmap': 5, 'tell me about future product plans': 4.5, 'what upcoming features are planned': 4.5, 'where can I see your product development plans': 4.5 }
 }],
 ['DATA_IMPORT_EXPORT_HELP', {
    keywords: { 'data': 4.0, 'import': 4.0, 'export': 4.0, 'transfer': 3.5, 'migrate': 3.5, 'upload': 3.0, 'download': 3.0, 'file': 2.5 },
    booster_phrases: { 'how do I import my data': 5, 'help with data export': 4.5, 'how to migrate my data': 4.5, 'can I upload a file for import': 4.5 }
 }],
]);