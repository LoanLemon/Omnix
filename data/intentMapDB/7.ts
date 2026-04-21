import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_7: IntentMap = new Map([
 ['CAFETERIA_MENU_INQUIRY', {
    keywords: { 'cafeteria': 4.0, 'menu': 4.0, 'food': 3.5, 'lunch': 3.0, 'today': 2.5, 'options': 2.5, 'vegetarian': 2.5 },
    booster_phrases: { 'what\'s on the cafeteria menu today': 5, 'what food options are available in the cafeteria': 4.5, 'do you have vegetarian options on the menu': 4.5, 'cafeteria lunch menu': 4.5 }
 }],
 ['VEHICLE_REGISTRATION_INQUIRY', {
    keywords: { 'vehicle': 4.0, 'registration': 4.0, 'renew': 3.5, 'apply': 3.0, 'cost': 3.0, 'document': 2.5, 'required': 2.5 },
    booster_phrases: { 'how to register my vehicle': 5, 'how to renew vehicle registration': 4.5, 'what documents are required for registration': 4.5, 'what\'s the cost of vehicle registration': 4.5 }
 }],
 ['DRIVER_LICENSE_INQUIRY', {
    keywords: { 'driver\'s license': 4.0, 'renew': 3.5, 'apply': 3.0, 'test': 3.0, 'requirements': 3.0, 'license': 2.5 },
    booster_phrases: { 'how to apply for a driver\'s license': 5, 'how to renew my driver\'s license': 4.5, 'what are the requirements for a driving test': 4.5, 'inquiry about driver\'s license': 4.5 }
 }],
 ['PUBLIC_TRANSPORT_INFO', {
    keywords: { 'public transport': 4.0, 'bus': 3.5, 'train': 3.5, 'subway': 3.5, 'schedule': 3.0, 'route': 3.0, 'fare': 3.0, 'ticket': 2.5 },
    booster_phrases: { 'what\'s the schedule for the bus': 5, 'tell me about public transport options': 4.5, 'what\'s the train route to X': 4.5, 'how much is a subway ticket': 4.5 }
 }],
 ['ROAD_CLOSURE_INFO', {
    keywords: { 'road': 4.0, 'closure': 4.0, 'traffic': 3.5, 'detour': 3.5, 'accident': 3.0, 'construction': 3.0, 'update': 2.5 },
    booster_phrases: { 'are there any road closures': 5, 'report a traffic accident': 4.5, 'what\'s the detour for X road': 4.5, 'any construction updates on roads': 4.5 }
 }],
 ['PARK_HOURS_INQUIRY', {
    keywords: { 'park': 4.0, 'hours': 4.0, 'open': 3.5, 'close': 3.5, 'when': 2.5, 'operating': 2.5 },
    booster_phrases: { 'what are the park hours': 5, 'when does the park open': 4.5, 'what time does the park close': 4.5, 'is the park open now': 4.5 }
 }],
 ['PUBLIC_FACILITY_BOOKING', {
    keywords: { 'public facility': 4.0, 'book': 4.0, 'reserve': 3.5, 'community center': 3.5, 'hall': 3.0, 'room': 3.0, 'event': 2.5 },
    booster_phrases: { 'how to book a public facility': 5, 'reserve a room at the community center': 4.5, 'how to book a public hall for an event': 4.5, 'can I reserve a public facility': 4.5 }
 }],
 ['WASTE_COLLECTION_SCHEDULE', {
    keywords: { 'waste': 4.0, 'collection': 4.0, 'trash': 3.5, 'garbage': 3.5, 'recycle': 3.0, 'schedule': 3.0, 'day': 2.5 },
    booster_phrases: { 'what\'s the waste collection schedule': 5, 'when is trash collection day': 4.5, 'what day do you pick up recycling': 4.5, 'garbage collection schedule': 4.5 }
 }],
 ['UTILITY_BILL_INQUIRY', {
    keywords: { 'utility': 4.0, 'bill': 4.0, 'electricity': 3.5, 'water': 3.5, 'gas': 3.5, 'payment': 3.0, 'due': 2.5, 'amount': 2.5 },
    booster_phrases: { 'what\'s my utility bill amount': 5, 'when is my electricity bill due': 4.5, 'inquiry about my water bill': 4.5, 'how to pay my gas bill': 4.5 }
 }],
 ['VOTER_REGISTRATION_INQUIRY', {
    keywords: { 'voter': 4.0, 'registration': 4.0, 'register': 3.5, 'vote': 3.0, 'election': 3.0, 'how to': 2.5, 'eligibility': 2.5 },
    booster_phrases: { 'how to register to vote': 5, 'check my voter registration status': 4.5, 'what are the voter eligibility requirements': 4.5, 'inquiry about voter registration': 4.5 }
 }],
 ['PUBLIC_HEALTH_ADVICE', {
    keywords: { 'public health': 4.0, 'advice': 4.0, 'health': 3.5, 'safety': 3.0, 'guideline': 3.0, 'recommendation': 3.0, 'disease': 2.5, 'virus': 2.5 },
    booster_phrases: { 'what\'s the latest public health advice': 5, 'give me health safety guidelines': 4.5, 'recommendations for public health': 4.5, 'information on X disease': 4.5 }
 }],
 ['ANIMAL_CONTROL_INQUIRY', {
    keywords: { 'animal control': 4.0, 'stray': 3.5, 'lost pet': 3.5, 'wild animal': 3.5, 'report': 3.0, 'pickup': 3.0, 'issue': 2.5 },
    booster_phrases: { 'how to contact animal control': 5, 'I found a stray animal': 4.5, 'report a lost pet': 4.5, 'what to do about a wild animal issue': 4.5 }
 }],
 ['EMERGENCY_SERVICE_INFO', {
    keywords: { 'emergency': 4.0, 'service': 4.0, 'police': 3.5, 'fire': 3.5, 'ambulance': 3.5, 'contact': 3.0, 'number': 3.0, 'when to call': 2.5 },
    booster_phrases: { 'what are the emergency services numbers': 5, 'when should I call the police': 4.5, 'how to contact the fire department': 4.5, 'information about emergency services': 4.5 }
 }],
 ['PERMIT_APPLICATION_INQUIRY', {
    keywords: { 'permit': 4.0, 'application': 4.0, 'building': 3.5, 'construction': 3.5, 'event': 3.0, 'apply': 3.0, 'requirements': 3.0 },
    booster_phrases: { 'how to apply for a building permit': 5, 'what are the requirements for a construction permit': 4.5, 'how to get an event permit': 4.5, 'inquiry about permit applications': 4.5 }
 }],
 ['LICENSING_INQUIRY', {
    keywords: { 'license': 4.0, 'licensing': 4.0, 'business': 3.5, 'professional': 3.5, 'renew': 3.0, 'apply': 3.0, 'cost': 2.5 },
    booster_phrases: { 'how to get a business license': 5, 'what are the professional licensing requirements': 4.5, 'how to renew my license': 4.5, 'inquiry about licensing': 4.5 }
 }],
 ['PUBLIC_RECORDS_REQUEST', {
    keywords: { 'public records': 4.0, 'request': 4.0, 'access': 3.5, 'information': 3.0, 'document': 3.0, 'how to': 2.5 },
    booster_phrases: { 'how to request public records': 5, 'how to access public information': 4.5, 'can I get a public document': 4.5, 'request for public records': 4.5 }
 }],
 ['JOB_SEARCH_ASSISTANCE', {
    keywords: { 'job search': 4.0, 'assistance': 4.0, 'find job': 3.5, 'help': 3.0, 'career': 3.0, 'openings': 2.5, 'vacancies': 2.5 },
    booster_phrases: { 'can you help me with my job search': 5, 'how to find job openings': 4.5, 'I need assistance finding a job': 4.5, 'what career assistance do you offer': 4.5 }
 }],
 ['VOCATIONAL_TRAINING_INQUIRY', {
    keywords: { 'vocational': 4.0, 'training': 4.0, 'skill': 3.5, 'trade': 3.5, 'course': 3.0, 'program': 3.0, 'learn': 2.5 },
    booster_phrases: { 'tell me about vocational training programs': 5, 'how to learn a new trade skill': 4.5, 'what vocational courses do you offer': 4.5, 'inquiry about vocational training': 4.5 }
 }],
 ['UNEMPLOYMENT_BENEFITS_INQUIRY', {
    keywords: { 'unemployment': 4.0, 'benefits': 4.0, 'apply': 3.5, 'eligibility': 3.5, 'claim': 3.0, 'status': 3.0, 'payments': 2.5 },
    booster_phrases: { 'how to apply for unemployment benefits': 5, 'am I eligible for unemployment': 4.5, 'what\'s the status of my unemployment claim': 4.5, 'inquiry about unemployment payments': 4.5 }
 }],
 ['SMALL_BUSINESS_SUPPORT', {
    keywords: { 'small business': 4.0, 'support': 4.0, 'grant': 3.5, 'loan': 3.5, 'funding': 3.0, 'resources': 3.0, 'help': 2.5 },
    booster_phrases: { 'do you offer small business support': 5, 'how can my small business get funding': 4.5, 'what resources are available for small businesses': 4.5, 'help for small businesses': 4.5 }
 }],
 ['BUSINESS_LICENSE_APPLICATION', {
    keywords: { 'business license': 4.0, 'apply': 4.0, 'obtain': 3.5, 'requirements': 3.0, 'cost': 3.0, 'start business': 2.5 },
    booster_phrases: { 'how to apply for a business license': 5, 'what are the requirements to obtain a business license': 4.5, 'what\'s the cost of a business license': 4.5, 'how to get a license to start a business': 4.5 }
 }],
 ['TAX_INQUIRY', {
    keywords: { 'tax': 4.0, 'taxes': 4.0, 'file': 3.5, 'refund': 3.5, 'deduction': 3.0, 'form': 3.0, 'income': 2.5, 'pay': 2.5 },
    booster_phrases: { 'I have a tax inquiry': 5, 'how to file my taxes': 4.5, 'when will I get my tax refund': 4.5, 'what tax deductions can I claim': 4.5 }
 }],
 ['PROPERTY_TAX_INQUIRY', {
    keywords: { 'property tax': 4.0, 'tax': 4.0, 'bill': 3.5, 'assessment': 3.5, 'pay': 3.0, 'due': 2.5, 'amount': 2.5 },
    booster_phrases: { 'what\'s my property tax bill': 5, 'when is my property tax due': 4.5, 'how to pay property tax': 4.5, 'inquiry about property assessment': 4.5 }
 }],
 ['ZONING_REGULATIONS_INQUIRY', {
    keywords: { 'zoning': 4.0, 'regulations': 4.0, 'laws': 3.5, 'rules': 3.0, 'permit': 3.0, 'construction': 3.0, 'property': 2.5 },
    booster_phrases: { 'what are the zoning regulations': 5, 'tell me about zoning laws in this area': 4.5, 'do I need a zoning permit for construction': 4.5, 'inquiry about property zoning rules': 4.5 }
 }],
 ['CODE_VIOLATION_REPORT', {
    keywords: { 'code': 4.0, 'violation': 4.0, 'report': 3.5, 'building': 3.0, 'safety': 3.0, 'issue': 2.5, 'complain': 2.5 },
    booster_phrases: { 'how to report a code violation': 5, 'I want to report a building code violation': 4.5, 'report a safety issue': 4.5, 'where to complain about a code violation': 4.5 }
 }],
 ['PUBLIC_SAFETY_CONCERN', {
    keywords: { 'public safety': 4.0, 'concern': 4.0, 'danger': 3.5, 'hazard': 3.5, 'report': 3.0, 'issue': 2.5, 'risk': 2.5 },
    booster_phrases: { 'I have a public safety concern': 5, 'how to report a safety hazard': 4.5, 'report a public safety issue': 4.5, 'is there any danger in this area': 4.5 }
 }],
 ['EMERGENCY_ALERT_SIGN_UP', {
    keywords: { 'emergency': 4.0, 'alert': 4.0, 'sign up': 3.5, 'notification': 3.0, 'subscribe': 3.0, 'warning': 2.5, 'news': 2.5 },
    booster_phrases: { 'how to sign up for emergency alerts': 5, 'subscribe to emergency notifications': 4.5, 'I want to receive emergency warnings': 4.5, 'how to get emergency news': 4.5 }
 }],
 ['COMMUNITY_EVENT_CALENDAR', {
    keywords: { 'community': 4.0, 'event': 4.0, 'calendar': 4.0, 'local': 3.5, 'upcoming': 3.0, 'activities': 3.0, 'schedule': 3.0 },
    booster_phrases: { 'where can I find the community event calendar': 5, 'what are the upcoming local events': 4.5, 'show me community activities for this month': 4.5, 'local event schedule': 4.5 }
 }],
 ['NEIGHBORHOOD_WATCH_INQUIRY', {
    keywords: { 'neighborhood watch': 4.0, 'join': 3.5, 'start': 3.0, 'safety': 3.0, 'community': 3.0, 'group': 2.5, 'crime': 2.5 },
    booster_phrases: { 'how to join a neighborhood watch': 5, 'how to start a neighborhood watch group': 4.5, 'information on neighborhood safety programs': 4.5, 'inquiry about neighborhood watch': 4.5 }
 }],
 ['PARK_MAINTENANCE_REQUEST', {
    keywords: { 'park': 4.0, 'maintenance': 4.0, 'request': 4.0, 'repair': 3.5, 'broken': 3.0, 'issue': 2.5, 'playground': 2.5, 'bench': 2.5 },
    booster_phrases: { 'I need to request park maintenance': 5, 'report a broken bench in the park': 4.5, 'the playground equipment needs repair': 4.5, 'request for park upkeep': 4.5 }
 }],
 ['RECYCLING_GUIDELINES_INQUIRY', {
    keywords: { 'recycling': 4.0, 'guidelines': 4.0, 'what can': 3.5, 'recycle': 3.5, 'rules': 3.0, 'dispose': 2.5, 'items': 2.5 },
    booster_phrases: { 'what are the recycling guidelines': 5, 'what can I recycle': 4.5, 'what are the rules for recycling': 4.5, 'how to dispose of X item for recycling': 4.5 }
 }],
 ['WATER_QUALITY_REPORT', {
    keywords: { 'water quality': 4.0, 'report': 4.0, 'drinking water': 3.5, 'safe': 3.0, 'test': 3.0, 'results': 3.0, 'public': 2.5 },
    booster_phrases: { 'where can I find the water quality report': 5, 'is the drinking water safe': 4.5, 'show me the latest water quality test results': 4.5, 'public water quality report': 4.5 }
 }],
 ['SCHOOL_ENROLLMENT_INQUIRY', {
    keywords: { 'school': 4.0, 'enrollment': 4.0, 'register': 3.5, 'apply': 3.0, 'admission': 3.0, 'child': 2.5, 'student': 2.5 },
    booster_phrases: { 'how to enroll my child in school': 5, 'what are the school enrollment requirements': 4.5, 'how to register for school': 4.5, 'inquiry about school admission': 4.5 }
 }],
 ['SCHOOL_HOLIDAY_SCHEDULE', {
    keywords: { 'school': 4.0, 'holiday': 4.0, 'schedule': 3.5, 'break': 3.0, 'vacation': 3.0, 'when': 2.5, 'closed': 2.5 },
    booster_phrases: { 'what\'s the school holiday schedule': 5, 'when is the next school break': 4.5, 'when are schools closed for holidays': 4.5, 'school vacation dates': 4.5 }
 }],
 ['PUBLIC_LIBRARY_CARD', {
    keywords: { 'public library': 4.0, 'library card': 4.0, 'get': 3.5, 'apply': 3.0, 'membership': 3.0, 'borrow': 2.5, 'books': 2.5 },
    booster_phrases: { 'how to get a public library card': 5, 'how to apply for a library card': 4.5, 'what are the requirements for a library card': 4.5, 'can I get a public library membership': 4.5 }
 }],
 ['COMMUNITY_GARDEN_INQUIRY', {
    keywords: { 'community garden': 4.0, 'plot': 3.5, 'rent': 3.0, 'join': 3.0, 'volunteer': 3.0, 'grow': 2.5, 'vegetables': 2.5 },
    booster_phrases: { 'how to join the community garden': 5, 'can I rent a plot in the community garden': 4.5, 'how to volunteer at the community garden': 4.5, 'inquiry about community gardens': 4.5 }
 }],
 ['SENIOR_SERVICES_INQUIRY', {
    keywords: { 'senior': 4.0, 'services': 4.0, 'elderly': 3.5, 'support': 3.0, 'assistance': 3.0, 'care': 2.5, 'program': 2.5 },
    booster_phrases: { 'what senior services are available': 5, 'do you offer support for the elderly': 4.5, 'assistance for senior citizens': 4.5, 'tell me about senior care programs': 4.5 }
 }],
 ['YOUTH_PROGRAMS_INQUIRY', {
    keywords: { 'youth': 4.0, 'programs': 4.0, 'kids': 3.5, 'children': 3.5, 'activities': 3.0, 'enroll': 3.0, 'summer camp': 3.5, 'teenagers': 2.5 },
    booster_phrases: { 'what youth programs do you offer': 5, 'can I enroll my kids in an activity': 4.5, 'tell me about summer camps for children': 4.5, 'programs for teenagers': 4.5 }
 }],
 ['PUBLIC_MEETING_SCHEDULE', {
    keywords: { 'public meeting': 4.0, 'schedule': 4.0, 'council': 3.5, 'board': 3.5, 'when': 2.5, 'agenda': 3.0, 'attend': 2.5 },
    booster_phrases: { 'what\'s the public meeting schedule': 5, 'when is the next council meeting': 4.5, 'where can I find the agenda for public meetings': 4.5, 'can I attend public meetings': 4.5 }
 }],
 ['VETERAN_BENEFITS_INQUIRY', {
    keywords: { 'veteran': 4.0, 'benefits': 4.0, 'military': 3.5, 'service': 3.0, 'apply': 3.0, 'eligibility': 3.0, 'support': 2.5 },
    booster_phrases: { 'what veteran benefits are available': 5, 'how to apply for military service benefits': 4.5, 'am I eligible for veteran support': 4.5, 'inquiry about veteran benefits': 4.5 }
 }],
 ['BUSINESS_GRANTS_INQUIRY', {
    keywords: { 'business': 4.0, 'grant': 4.0, 'funding': 3.5, 'small business': 3.5, 'apply': 3.0, 'eligibility': 3.0, 'opportunity': 3.0 },
    booster_phrases: { 'are there any business grants available': 5, 'how to apply for small business funding': 4.5, 'what are the eligibility requirements for business grants': 4.5, 'inquiry about business grant opportunities': 4.5 }
 }],
 ['TOURIST_INFORMATION', {
    keywords: { 'tourist': 4.0, 'information': 4.0, 'attraction': 3.5, 'sightseeing': 3.5, 'visit': 3.0, 'places': 3.0, 'map': 2.5, 'guide': 2.5 },
    booster_phrases: { 'where can I find tourist information': 5, 'tell me about local attractions': 4.5, 'what are the best places for sightseeing': 4.5, 'do you have a tourist map': 4.5 }
 }],
 ['LOCAL_EVENTS_INQUIRY', {
    keywords: { 'local': 4.0, 'events': 4.0, 'happenings': 3.5, 'nearby': 3.0, 'today': 2.5, 'weekend': 2.5, 'festival': 3.0, 'concert': 3.0 },
    booster_phrases: { 'what local events are happening today': 5, 'any events nearby this weekend': 4.5, 'tell me about local festivals': 4.5, 'what local concerts are coming up': 4.5 }
 }],
 ['PARK_FACILITIES_INQUIRY', {
    keywords: { 'park': 4.0, 'facilities': 4.0, 'restroom': 3.5, 'playground': 3.5, 'picnic': 3.0, 'barbecue': 3.0, 'amenities': 3.0, 'available': 2.5 },
    booster_phrases: { 'what facilities are available at the park': 5, 'are there restrooms in the park': 4.5, 'is there a playground at the park': 4.5, 'do you have picnic or barbecue areas': 4.5 }
 }],
 ['PUBLIC_SWIMMING_POOL_INFO', {
    keywords: { 'swimming pool': 4.0, 'public': 4.0, 'hours': 3.5, 'cost': 3.0, 'open': 3.0, 'admission': 3.0, 'lessons': 2.5 },
    booster_phrases: { 'what are the public swimming pool hours': 5, 'how much does it cost to enter the public pool': 4.5, 'are there swimming lessons available': 4.5, 'when is the public pool open': 4.5 }
 }],
 ['JOB_TRAINING_PROGRAMS', {
    keywords: { 'job': 4.0, 'training': 4.0, 'programs': 4.0, 'skill': 3.5, 'learn': 3.0, 'employment': 3.0, 'upskill': 3.0, 'reskill': 3.0 },
    booster_phrases: { 'what job training programs are available': 5, 'how can I learn new skills for employment': 4.5, 'do you have programs for upskilling': 4.5, 'information on job reskilling programs': 4.5 }
 }],
 ['BUSINESS_DEVELOPMENT_SUPPORT', {
    keywords: { 'business': 4.0, 'development': 4.0, 'support': 4.0, 'grow': 3.5, 'expand': 3.0, 'strategy': 3.0, 'consulting': 3.0 },
    booster_phrases: { 'do you offer business development support': 5, 'how can you help my business grow': 4.5, 'I need help with business expansion strategy': 4.5, 'do you provide business consulting': 4.5 }
 }],
 ['STARTUP_ADVICE', {
    keywords: { 'startup': 4.0, 'advice': 4.0, 'found': 3.5, 'launch': 3.5, 'business': 3.0, 'mentor': 3.0, 'guidance': 3.0, 'fundraising': 3.0 },
    booster_phrases: { 'can you give me startup advice': 5, 'how to launch a successful startup': 4.5, 'do you offer startup mentoring': 4.5, 'advice on startup fundraising': 4.5 }
 }],
 ['MENTORSHIP_PROGRAM_INQUIRY', {
    keywords: { 'mentorship': 4.0, 'program': 4.0, 'mentor': 3.5, 'mentee': 3.5, 'join': 3.0, 'find': 2.5, 'guidance': 2.5 },
    booster_phrases: { 'tell me about your mentorship program': 5, 'how to find a mentor': 4.5, 'can I join your mentorship program': 4.5, 'how to become a mentee': 4.5 }
 }],
]);