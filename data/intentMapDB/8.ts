import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_8: IntentMap = new Map([
 ['NETWORKING_EVENT_INFO', {
    keywords: { 'networking': 4.0, 'event': 4.0, 'meet': 3.5, 'connect': 3.0, 'professional': 3.0, 'opportunity': 3.0, 'social': 2.5 },
    booster_phrases: { 'what networking events are coming up': 5, 'are there any professional networking opportunities': 4.5, 'how can I meet other professionals': 4.5, 'information on networking events': 4.5 }
 }],
 ['CANCELLATION_POLICY_INQUIRY', {
    keywords: { 'cancellation': 4.0, 'policy': 4.0, 'refund': 3.5, 'fee': 3.0, 'rules': 3.0, 'terms': 2.5, 'penalty': 2.5 },
    booster_phrases: { 'what\'s your cancellation policy': 5, 'are there any cancellation fees': 4.5, 'what are the rules for cancellation': 4.5, 'inquiry about your cancellation terms': 4.5 }
 }],
 ['REFUND_POLICY_INQUIRY', {
    keywords: { 'refund': 4.0, 'policy': 4.0, 'return': 3.5, 'money back': 3.5, 'guarantee': 3.0, 'conditions': 3.0, 'process': 2.5 },
    booster_phrases: { 'what\'s your refund policy': 5, 'how can I get my money back': 4.5, 'do you have a money-back guarantee': 4.5, 'what are the conditions for a refund': 4.5 }
 }],
 ['CUSTOMER_SERVICE_ESCALATION', {
    keywords: { 'escalate': 4.0, 'customer service': 4.0, 'manager': 3.5, 'supervisor': 3.5, 'higher up': 3.0, 'resolve': 2.5, 'unsatisfied': 2.5 },
    booster_phrases: { 'I want to escalate this to a manager': 5, 'can I speak to a customer service supervisor': 4.5, 'I need to speak to someone higher up': 4.5, 'how to escalate my issue': 4.5 }
 }],
 ['LOST_PROPERTY_INQUIRY', {
    keywords: { 'lost': 4.0, 'property': 4.0, 'found': 3.5, 'item': 3.0, 'report': 3.0, 'retrieve': 3.0, 'belonging': 2.5 },
    booster_phrases: { 'I lost an item': 5, 'I\'m looking for lost property': 4.5, 'where do I report a lost item': 4.5, 'how to retrieve my lost belonging': 4.5 }
 }],
 ['DAMAGE_REPORT', {
    keywords: { 'damage': 4.0, 'report': 4.0, 'broken': 3.5, 'damaged': 3.5, 'property': 3.0, 'incident': 3.0, 'file': 2.5 },
    booster_phrases: { 'I want to report damage': 5, 'report a damaged property': 4.5, 'I found something broken': 4.5, 'how to file a damage report': 4.5 }
 }],
 ['COMPLIMENT_SUBMISSION', {
    keywords: { 'compliment': 4.0, 'praise': 3.5, 'good service': 3.5, 'positive': 3.0, 'feedback': 3.0, 'thank': 2.5, 'appreciate': 2.5 },
    booster_phrases: { 'I want to give a compliment': 5, 'I have positive feedback': 4.5, 'your service was excellent': 4.5, 'I want to praise X person/department': 4.5 }
 }],
 ['SUGGESTION_BOX_INQUIRY', {
    keywords: { 'suggestion': 4.0, 'box': 4.0, 'idea': 3.5, 'submit': 3.0, 'feedback': 3.0, 'improvement': 2.5, 'where': 2.5 },
    booster_phrases: { 'where is the suggestion box': 5, 'how can I submit an idea': 4.5, 'do you have a suggestion box': 4.5, 'how to provide improvement feedback': 4.5 }
 }],
 ['WEBINAR_REGISTRATION_HELP', {
    keywords: { 'webinar': 4.0, 'registration': 4.0, 'sign up': 3.5, 'enroll': 3.5, 'attend': 3.0, 'help': 2.5 },
    booster_phrases: { 'how do I register for the webinar': 5, 'help me sign up for the webinar': 4.5, 'enroll me in the webinar': 4.5, 'I need assistance with webinar registration': 4.5 }
 }],
 ['EVENT_CANCELLATION_INQUIRY', {
    keywords: { 'event': 4.0, 'cancellation': 4.0, 'cancelled': 3.5, 'postponed': 3.5, 'refund': 3.0, 'update': 2.5, 'status': 2.5 },
    booster_phrases: { 'is the event cancelled': 5, 'what\'s the status of the event cancellation': 4.5, 'has the event been postponed': 4.5, 'will I get a refund if the event is cancelled': 4.5 }
 }],
 ['TICKET_PURCHASE_INQUIRY', {
    keywords: { 'ticket': 4.0, 'purchase': 4.0, 'buy': 3.5, 'cost': 3.0, 'price': 3.0, 'event': 2.5, 'show': 2.5 },
    booster_phrases: { 'how to purchase tickets': 5, 'where can I buy tickets for the event': 4.5, 'what\'s the cost of a ticket': 4.5, 'how much are tickets for the show': 4.5 }
 }],
 ['SEATING_AVAILABILITY_INQUIRY', {
    keywords: { 'seating': 4.0, 'availability': 4.0, 'seats': 3.5, 'open': 3.0, 'available': 3.0, 'book': 2.5, 'reserve': 2.5 },
    booster_phrases: { 'what\'s the seating availability': 5, 'are there any open seats': 4.5, 'can I book seats for X time': 4.5, 'check seating availability': 4.5 }
 }],
 ['VENUE_INFORMATION', {
    keywords: { 'venue': 4.0, 'information': 4.0, 'address': 3.5, 'location': 3.5, 'directions': 3.0, 'map': 2.5, 'how to get there': 2.5 },
    booster_phrases: { 'what\'s the venue information': 5, 'where is the venue located': 4.5, 'directions to the venue': 4.5, 'how to get to the event venue': 4.5 }
 }],
 ['SPEAKER_BIO_REQUEST', {
    keywords: { 'speaker': 4.0, 'bio': 4.0, 'biography': 4.0, 'presenter': 3.5, 'profile': 3.0, 'information': 2.5, 'about': 2.5 },
    booster_phrases: { 'can I get the speaker\'s bio': 5, 'where can I find the presenter\'s biography': 4.5, 'tell me about the speaker\'s profile': 4.5, 'information about the speaker': 4.5 }
 }],
 ['POST_EVENT_FEEDBACK', {
    keywords: { 'post-event': 4.0, 'feedback': 4.0, 'survey': 3.5, 'review': 3.0, 'opinion': 2.5, 'experience': 2.5, 'event': 2.5 },
    booster_phrases: { 'how to give post-event feedback': 5, 'do you have a post-event survey': 4.5, 'I want to review the event': 4.5, 'share my experience about the event': 4.5 }
 }],
 ['VIRTUAL_EVENT_PLATFORM_INFO', {
    keywords: { 'virtual event': 4.0, 'platform': 4.0, 'access': 3.5, 'join': 3.0, 'how to': 2.5, 'link': 2.5, 'login': 2.5 },
    booster_phrases: { 'how to access the virtual event platform': 5, 'how do I join the virtual event': 4.5, 'where\'s the link for the virtual event': 4.5, 'how to login to the virtual event': 4.5 }
 }],
 ['EDUCATION_PROGRAMS', {
    keywords: { 'education': 4.0, 'programs': 4.0, 'study': 3.5, 'learn': 3.0, 'courses': 3.0, 'degrees': 3.0, 'online': 2.5, 'campus': 2.5 },
    booster_phrases: { 'what education programs do you offer': 5, 'tell me about your study programs': 4.5, 'do you have online courses': 4.5, 'what degrees can I pursue': 4.5 }
 }],
 ['STUDENT_FINANCIAL_AID', {
    keywords: { 'student': 4.0, 'financial aid': 4.0, 'grants': 3.5, 'loans': 3.5, 'scholarships': 3.5, 'apply': 3.0, 'eligibility': 3.0 },
    booster_phrases: { 'how to apply for student financial aid': 5, 'what grants are available for students': 4.5, 'tell me about student loans': 4.5, 'what are the eligibility for student scholarships': 4.5 }
 }],
 ['ADMISSION_REQUIREMENTS', {
    keywords: { 'admission': 4.0, 'requirements': 4.0, 'apply': 3.5, 'enroll': 3.0, 'prerequisites': 3.0, 'criteria': 3.0, 'documents': 2.5 },
    booster_phrases: { 'what are the admission requirements': 5, 'how to apply for admission': 4.5, 'what documents are needed for enrollment': 4.5, 'what are the prerequisites for admission': 4.5 }
 }],
 ['ACADEMIC_CALENDAR_INQUIRY', {
    keywords: { 'academic': 4.0, 'calendar': 4.0, 'dates': 3.5, 'semester': 3.0, 'term': 3.0, 'breaks': 2.5, 'holidays': 2.5, 'deadlines': 3.0 },
    booster_phrases: { 'where can I find the academic calendar': 5, 'what are the key academic dates': 4.5, 'when is the next semester break': 4.5, 'what are the academic deadlines': 4.5 }
 }],
 ['UNIVERSITY_FACILITIES_INFO', {
    keywords: { 'university': 4.0, 'facilities': 4.0, 'campus': 3.5, 'gym': 3.0, 'library': 3.0, 'sports': 3.0, 'dining': 3.0, 'available': 2.5 },
    booster_phrases: { 'what university facilities are available': 5, 'where is the campus gym': 4.5, 'tell me about the university library': 4.5, 'what dining facilities do you have': 4.5 }
 }],
 ['RESEARCH_ASSISTANCE', {
    keywords: { 'research': 4.0, 'assistance': 4.0, 'help': 3.5, 'support': 3.0, 'guidance': 3.0, 'data': 2.5, 'methodology': 2.5 },
    booster_phrases: { 'I need research assistance': 5, 'can you help me with my research': 4.5, 'do you offer research support': 4.5, 'guidance on research methodology': 4.5 }
 }],
 ['THESIS_DISSERTATION_HELP', {
    keywords: { 'thesis': 4.0, 'dissertation': 4.0, 'help': 3.5, 'write': 3.0, 'guidance': 3.0, 'support': 3.0, 'editing': 2.5 },
    booster_phrases: { 'I need help with my thesis': 5, 'can you provide dissertation guidance': 4.5, 'do you offer thesis writing support': 4.5, 'assistance with dissertation editing': 4.5 }
 }],
 ['GRADUATION_REQUIREMENTS_INQUIRY', {
    keywords: { 'graduation': 4.0, 'requirements': 4.0, 'degree': 3.5, 'complete': 3.0, 'eligibility': 3.0, 'courses': 2.5, 'credits': 2.5 },
    booster_phrases: { 'what are the graduation requirements': 5, 'how many credits do I need to graduate': 4.5, 'what courses are required for my degree': 4.5, 'am I eligible for graduation': 4.5 }
 }],
 ['TRANSCRIPT_REQUEST', {
    keywords: { 'transcript': 4.0, 'request': 4.0, 'official': 3.5, 'academic record': 3.5, 'order': 3.0, 'get': 2.5, 'send': 2.5 },
    booster_phrases: { 'how to request a transcript': 5, 'can I get an official transcript': 4.5, 'how to order my academic record': 4.5, 'send me my transcript': 4.5 }
 }],
 ['CAREER_FAIR_INFO', {
    keywords: { 'career fair': 4.0, 'job fair': 4.0, 'attend': 3.5, 'employer': 3.0, 'recruit': 3.0, 'schedule': 2.5, 'upcoming': 2.5 },
    booster_phrases: { 'when is the next career fair': 5, 'what companies will be at the job fair': 4.5, 'how to attend the career fair': 4.5, 'information on upcoming career fairs': 4.5 }
 }],
 ['STUDENT_ID_CARD_ISSUE', {
    keywords: { 'student id': 4.0, 'card': 4.0, 'issue': 3.5, 'lost': 3.0, 'replace': 3.0, 'problem': 2.5, 'access': 2.5 },
    booster_phrases: { 'I have an issue with my student ID card': 5, 'my student ID card is lost': 4.5, 'how to replace a broken student ID card': 4.5, 'I can\'t access with my student ID': 4.5 }
 }],
 ['COURSE_ADD_DROP_HELP', {
    keywords: { 'course': 4.0, 'add': 4.0, 'drop': 4.0, 'enroll': 3.5, 'register': 3.0, 'change': 2.5, 'schedule': 2.5 },
    booster_phrases: { 'how to add a course': 5, 'how to drop a course': 5, 'can I add a course late': 4.5, 'help with course registration changes': 4.5 }
 }],
 ['STUDENT_WELLNESS_SERVICES', {
    keywords: { 'student': 4.0, 'wellness': 4.0, 'mental health': 3.5, 'counseling': 3.5, 'health': 3.0, 'support': 3.0, 'stress': 2.5 },
    booster_phrases: { 'what student wellness services are available': 5, 'do you offer mental health counseling': 4.5, 'support for student stress': 4.5, 'information on student health services': 4.5 }
 }],
 ['ACADEMIC_ADVISING_INQUIRY', {
    keywords: { 'academic': 4.0, 'advising': 4.0, 'advisor': 3.5, 'meet': 3.0, 'schedule': 3.0, 'help': 2.5, 'course selection': 3.0 },
    booster_phrases: { 'how to schedule an academic advising appointment': 5, 'I need to meet with my academic advisor': 4.5, 'help with course selection': 4.5, 'inquiry about academic advising': 4.5 }
 }],
 ['STUDENT_ORGANIZATIONS_INFO', {
    keywords: { 'student': 4.0, 'organization': 4.0, 'club': 3.5, 'join': 3.0, 'activity': 3.0, 'groups': 2.5, 'extracurricular': 2.5 },
    booster_phrases: { 'what student organizations are there': 5, 'how to join a student club': 4.5, 'tell me about extracurricular activities': 4.5, 'information on student groups': 4.5 }
 }],
 ['PARKING_ON_CAMPUS_INQUIRY', {
    keywords: { 'parking': 4.0, 'campus': 4.0, 'permit': 3.5, 'rules': 3.0, 'cost': 3.0, 'student': 2.5, 'faculty': 2.5 },
    booster_phrases: { 'what are the parking rules on campus': 5, 'how to get a student parking permit': 4.5, 'what\'s the cost for campus parking': 4.5, 'information on parking at the university': 4.5 }
 }],
 ['UNIVERSITY_EVENTS_CALENDAR', {
    keywords: { 'university': 4.0, 'events': 4.0, 'calendar': 4.0, 'campus': 3.5, 'activities': 3.0, 'upcoming': 3.0, 'student': 2.5 },
    booster_phrases: { 'where can I find the university events calendar': 5, 'what upcoming campus events are there': 4.5, 'show me student activities on campus': 4.5, 'university events schedule': 4.5 }
 }],
 ['TUITION_FEE_INQUIRY', {
    keywords: { 'tuition': 4.0, 'fees': 4.0, 'cost': 3.5, 'price': 3.0, 'payment': 3.0, 'breakdown': 3.0, 'invoice': 2.5 },
    booster_phrases: { 'what are the tuition fees': 5, 'what\'s the total cost of tuition': 4.5, 'can I get a breakdown of fees': 4.5, 'inquiry about tuition payment': 4.5 }
 }],
 ['STUDENT_ACCOMMODATION_INQUIRY', {
    keywords: { 'student': 4.0, 'accommodation': 4.0, 'housing': 3.5, 'dorm': 3.5, 'residence': 3.0, 'apply': 2.5, 'cost': 2.5 },
    booster_phrases: { 'what are the student accommodation options': 5, 'how to apply for student housing': 4.5, 'tell me about dormitories': 4.5, 'what\'s the cost of student residence': 4.5 }
 }],
 ['COURSE_SYLLABUS_REQUEST', {
    keywords: { 'course': 4.0, 'syllabus': 4.0, 'outline': 3.5, 'download': 3.0, 'access': 3.0, 'info': 2.5, 'readings': 2.5 },
    booster_phrases: { 'where can I get the course syllabus': 5, 'can I download the syllabus for X course': 4.5, 'I need the course outline': 4.5, 'access course readings': 4.5 }
 }],
 ['FINANCIAL_AID_COUNSELING', {
    keywords: { 'financial aid': 4.0, 'counseling': 4.0, 'advice': 3.5, 'help': 3.0, 'guidance': 3.0, 'student': 2.5, 'scholarship': 2.5, 'loan': 2.5 },
    booster_phrases: { 'do you offer financial aid counseling': 5, 'I need financial aid advice': 4.5, 'can I get guidance on student loans': 4.5, 'help with financial aid applications': 4.5 }
 }],
 ['CAMPUS_MAP_REQUEST', {
    keywords: { 'campus': 4.0, 'map': 4.0, 'directions': 3.5, 'find': 3.0, 'building': 3.0, 'location': 2.5, 'navigate': 2.5 },
    booster_phrases: { 'can I get a campus map': 5, 'how to find X building on campus': 4.5, 'give me directions on campus': 4.5, 'help me navigate the university campus': 4.5 }
 }],
 ['DINING_OPTIONS_ON_CAMPUS', {
    keywords: { 'dining': 4.0, 'options': 4.0, 'on campus': 3.5, 'food': 3.0, 'cafeteria': 3.0, 'restaurant': 3.0, 'meal plan': 3.0 },
    booster_phrases: { 'what are the dining options on campus': 5, 'where can I find food on campus': 4.5, 'tell me about your meal plans': 4.5, 'campus cafeteria options': 4.5 }
 }],
 ['STUDENT_EMPLOYMENT_INQUIRY', {
    keywords: { 'student': 4.0, 'employment': 4.0, 'job': 3.5, 'work study': 3.5, 'on campus': 3.0, 'part-time': 3.0, 'opportunities': 3.0 },
    booster_phrases: { 'what student employment opportunities are available': 5, 'do you have work study programs': 4.5, 'how to find an on-campus job': 4.5, 'part-time jobs for students': 4.5 }
 }],
 ['HEALTH_SERVICES_INQUIRY', {
    keywords: { 'health services': 4.0, 'clinic': 3.5, 'medical': 3.0, 'doctor': 3.0, 'appointment': 3.0, 'on campus': 2.5, 'nurse': 2.5 },
    booster_phrases: { 'what health services are available on campus': 5, 'how to book an appointment with a doctor': 4.5, 'where is the campus clinic': 4.5, 'tell me about student health support': 4.5 }
 }],
 ['BOOKSTORE_HOURS_INQUIRY', {
    keywords: { 'bookstore': 4.0, 'hours': 4.0, 'open': 3.5, 'close': 3.5, 'when': 2.5, 'operating': 2.5, 'campus': 2.5 },
    booster_phrases: { 'what are the bookstore hours': 5, 'when is the campus bookstore open': 4.5, 'what time does the bookstore close': 4.5, 'is the bookstore open now': 4.5 }
 }],
 ['COUNSELING_SERVICES_INQUIRY', {
    keywords: { 'counseling': 4.0, 'services': 4.0, 'mental health': 3.5, 'therapy': 3.5, 'support': 3.0, 'appointment': 3.0, 'stress': 2.5 },
    booster_phrases: { 'what counseling services do you offer': 5, 'how to book a mental health appointment': 4.5, 'do you have therapy services': 4.5, 'support for stress and anxiety': 4.5 }
 }],
 ['STUDENT_DISABILITY_SUPPORT', {
    keywords: { 'student': 4.0, 'disability': 4.0, 'support': 4.0, 'accommodation': 3.5, 'special needs': 3.5, 'services': 3.0, 'help': 2.5 },
    booster_phrases: { 'what disability support services are available for students': 5, 'how can I get academic accommodation for a disability': 4.5, 'help for students with special needs': 4.5, 'information on disability services': 4.5 }
 }],
 ['INTERNATIONAL_STUDENT_SUPPORT', {
    keywords: { 'international student': 4.0, 'support': 4.0, 'visa': 3.5, 'immigration': 3.5, 'admission': 3.0, 'help': 2.5, 'orientation': 2.5 },
    booster_phrases: { 'what support is available for international students': 5, 'help with international student visa': 4.5, 'admission process for international students': 4.5, 'international student orientation information': 4.5 }
 }],
 ['TUTORING_SERVICES_INQUIRY', {
    keywords: { 'tutoring': 4.0, 'services': 4.0, 'help': 3.5, 'subject': 3.0, 'academic': 3.0, 'study': 2.5, 'support': 2.5 },
    booster_phrases: { 'do you offer tutoring services': 5, 'can I get help with X subject': 4.5, 'where can I find academic tutoring': 4.5, 'support for my studies': 4.5 }
 }],
 ['PRINTING_SERVICES_INQUIRY', {
    keywords: { 'printing': 4.0, 'services': 4.0, 'print': 3.5, 'cost': 3.0, 'location': 3.0, 'student': 2.5, 'pages': 2.5 },
    booster_phrases: { 'where are the student printing services': 5, 'how much does it cost to print': 4.5, 'how to print on campus': 4.5, 'printing options for students': 4.5 }
 }],
 ['STUDENT_LOAN_INQUIRY', {
    keywords: { 'student loan': 4.0, 'loan': 4.0, 'apply': 3.5, 'repayment': 3.5, 'interest': 3.0, 'eligibility': 3.0, 'help': 2.5 },
    booster_phrases: { 'how to apply for a student loan': 5, 'what are the student loan repayment options': 4.5, 'what\'s the interest rate for student loans': 4.5, 'am I eligible for a student loan': 4.5 }
 }],
 ['VETERAN_STUDENT_SUPPORT', {
    keywords: { 'veteran': 4.0, 'student': 4.0, 'support': 4.0, 'benefits': 3.5, 'military': 3.5, 'help': 3.0, 'resources': 3.0 },
    booster_phrases: { 'what support is available for veteran students': 5, 'help with veteran student benefits': 4.5, 'resources for military students': 4.5, 'veteran student services': 4.5 }
 }],
 ['CAMPUS_SAFETY_INQUIRY', {
    keywords: { 'campus': 4.0, 'safety': 4.0, 'security': 3.5, 'emergency': 3.0, 'report': 3.0, 'safe': 2.5, 'procedures': 2.5 },
    booster_phrases: { 'what are your campus safety measures': 5, 'how to report an emergency on campus': 4.5, 'tell me about campus security': 4.5, 'what are the safety procedures': 4.5 }
 }],
 ['LOST_FOUND_INQUIRY', {
    keywords: { 'lost': 4.0, 'found': 4.0, 'item': 3.5, 'belonging': 3.0, 'report': 3.0, 'retrieve': 3.0, 'where': 2.5 },
    booster_phrases: { 'I lost something on campus': 5, 'where is the lost and found': 4.5, 'how to report a lost item': 4.5, 'how to retrieve a found item': 4.5 }
 }],
 ['STUDENT_CONDUCT_POLICY', {
    keywords: { 'student': 4.0, 'conduct': 4.0, 'policy': 4.0, 'rules': 3.5, 'behavior': 3.0, 'disciplinary': 3.0, 'expectations': 2.5 },
    booster_phrases: { 'what is the student conduct policy': 5, 'what are the rules for student behavior': 4.5, 'tell me about disciplinary procedures': 4.5, 'what are the student expectations': 4.5 }
 }],
 ['STUDENT_COMPLAINT_PROCESS', {
    keywords: { 'student': 4.0, 'complaint': 4.0, 'process': 4.0, 'file': 3.5, 'report': 3.0, 'issue': 2.5, 'grievance': 3.0 },
    booster_phrases: { 'how to file a student complaint': 5, 'what\'s the student complaint process': 4.5, 'how to report an issue as a student': 4.5, 'how to file a grievance': 4.5 }
 }],
]);