import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_6: IntentMap = new Map([
 ['THIRD_PARTY_INTEGRATION_INQUIRY', {
    keywords: { 'third party': 4.0, 'integration': 4.0, 'connect': 3.5, 'link': 3.0, 'compatibility': 3.0, 'partner': 2.5 },
    booster_phrases: { 'do you have third-party integrations': 5, 'can I connect with X platform': 4.5, 'is this compatible with Y service': 4.5, 'what third-party services can I integrate': 4.5 }
 }],
 ['CANCEL_MEMBERSHIP', {
    keywords: { 'cancel': 4.0, 'membership': 4.0, 'subscription': 3.5, 'opt out': 3.0, 'end': 2.5, 'quit': 2.5 },
    booster_phrases: { 'how do I cancel my membership': 5, 'cancel my subscription': 4.5, 'opt out of membership': 4.5, 'end my membership': 4.5 }
 }],
 ['MEMBERSHIP_BENEFITS_INQUIRY', {
    keywords: { 'membership': 4.0, 'benefits': 4.0, 'perks': 3.5, 'advantages': 3.5, 'what': 2.0, 'included': 2.5, 'get': 2.5 },
    booster_phrases: { 'what are the membership benefits': 5, 'what perks are included with membership': 4.5, 'what advantages do I get with my membership': 4.5, 'tell me about membership benefits': 4.5 }
 }],
 ['COURSE_REGISTRATION', {
    keywords: { 'course': 4.0, 'register': 4.0, 'enroll': 3.5, 'sign up': 3.5, 'join': 2.5, 'program': 2.5 },
    booster_phrases: { 'how do I register for a course': 5, 'enroll in this program': 4.5, 'sign up for the course': 4.5, 'how to join a course': 4.5 }
 }],
 ['COURSE_PREREQUISITES_INQUIRY', {
    keywords: { 'course': 4.0, 'prerequisites': 4.0, 'requirements': 3.5, 'needed': 3.0, 'prior': 2.5, 'knowledge': 2.5, 'skills': 2.5 },
    booster_phrases: { 'what are the prerequisites for this course': 5, 'what\'s needed before taking this course': 4.5, 'are there any prior requirements for the course': 4.5, 'what knowledge is needed for this course': 4.5 }
 }],
 ['LECTURE_SCHEDULE_INQUIRY', {
    keywords: { 'lecture': 4.0, 'schedule': 4.0, 'class': 3.5, 'time': 3.0, 'days': 3.0, 'timetable': 3.5, 'when': 2.5 },
    booster_phrases: { 'what\'s the lecture schedule': 5, 'when are the classes for this course': 4.5, 'what\'s the timetable for lectures': 4.5, 'what days are the lectures held': 4.5 }
 }],
 ['EXAM_DATES_INQUIRY', {
    keywords: { 'exam': 4.0, 'dates': 4.0, 'schedule': 3.5, 'test': 3.0, 'when': 2.5, 'midterm': 3.0, 'final': 3.0 },
    booster_phrases: { 'what are the exam dates': 5, 'when is the midterm exam': 4.5, 'what\'s the schedule for final exams': 4.5, 'when are the tests': 4.5 }
 }],
 ['RESEARCH_PAPER_CITATION_HELP', {
    keywords: { 'research paper': 4.0, 'citation': 4.0, 'cite': 3.5, 'reference': 3.5, 'format': 3.0, 'style': 3.0, 'help': 2.5 },
    booster_phrases: { 'how to cite a research paper': 5, 'help with research paper citations': 4.5, 'what\'s the correct citation format': 4.5, 'how to reference a research paper': 4.5 }
 }],
 ['LAB_HOURS_INQUIRY', {
    keywords: { 'lab': 4.0, 'hours': 4.0, 'open': 3.5, 'close': 3.5, 'when': 2.5, 'operating': 2.5 },
    booster_phrases: { 'what are the lab hours': 5, 'when is the lab open': 4.5, 'what time does the lab close': 4.5, 'what are the operating hours for the lab': 4.5 }
 }],
 ['STUDENT_SUPPORT_SERVICES', {
    keywords: { 'student': 4.0, 'support': 4.0, 'services': 3.5, 'help': 3.0, 'assistance': 3.0, 'academic': 2.5, 'counseling': 3.0, 'tutoring': 3.0 },
    booster_phrases: { 'what student support services are available': 5, 'do you offer academic assistance': 4.5, 'is there counseling for students': 4.5, 'how can students get support': 4.5 }
 }],
 ['INTERNSHIP_OPPORTUNITIES', {
    keywords: { 'internship': 4.0, 'opportunities': 4.0, 'apply': 3.5, 'program': 3.0, 'find': 2.5, 'student': 2.5 },
    booster_phrases: { 'are there any internship opportunities': 5, 'how to apply for an internship': 4.5, 'what internship programs do you have': 4.5, 'where can students find internships': 4.5 }
 }],
 ['ALUMNI_NETWORK_INQUIRY', {
    keywords: { 'alumni': 4.0, 'network': 4.0, 'connect': 3.5, 'join': 3.0, 'benefits': 3.0, 'events': 2.5, 'graduates': 2.5 },
    booster_phrases: { 'tell me about your alumni network': 5, 'how can I connect with alumni': 4.5, 'what are the benefits of joining the alumni network': 4.5, 'do you have alumni events': 4.5 }
 }],
 ['RESEARCH_GRANT_INQUIRY', {
    keywords: { 'research': 4.0, 'grant': 4.0, 'funding': 3.5, 'apply': 3.0, 'opportunity': 3.0, 'secure': 2.5, 'proposal': 2.5 },
    booster_phrases: { 'how to apply for a research grant': 5, 'what research grant opportunities are available': 4.5, 'how to secure funding for research': 4.5, 'inquiry about research grants': 4.5 }
 }],
 ['SCHOLARSHIP_INQUIRY', {
    keywords: { 'scholarship': 4.0, 'financial aid': 3.5, 'apply': 3.0, 'eligibility': 3.0, 'requirements': 3.0, 'tuition': 2.5, 'fund': 2.5 },
    booster_phrases: { 'how to apply for a scholarship': 5, 'what are the scholarship requirements': 4.5, 'am I eligible for financial aid': 4.5, 'where can I find scholarships': 4.5 }
 }],
 ['UNIVERSITY_APPLICATION_STATUS', {
    keywords: { 'university': 4.0, 'application': 4.0, 'status': 4.0, 'check': 3.5, 'admission': 3.0, 'update': 2.5, 'pending': 2.5 },
    booster_phrases: { 'what\'s the status of my university application': 5, 'check my admission application status': 4.5, 'any updates on my university application': 4.5, 'is my university application pending': 4.5 }
 }],
 ['TRANSFER_CREDITS_INQUIRY', {
    keywords: { 'transfer': 4.0, 'credits': 4.0, 'course': 3.5, 'count': 3.0, 'apply': 2.5, 'how to': 2.5 },
    booster_phrases: { 'how to transfer credits': 5, 'will my course credits transfer': 4.5, 'how many credits can I transfer': 4.5, 'can I apply previous credits': 4.5 }
 }],
 ['STUDENT_HOUSING_INQUIRY', {
    keywords: { 'student': 4.0, 'housing': 4.0, 'dorm': 3.5, 'accommodation': 3.5, 'residence': 3.0, 'apply': 2.5, 'cost': 2.5, 'living': 2.5 },
    booster_phrases: { 'tell me about student housing': 5, 'how to apply for dorms': 4.5, 'what\'s the cost of student accommodation': 4.5, 'is there on-campus housing': 4.5 }
 }],
 ['CAMPUS_TOUR_REQUEST', {
    keywords: { 'campus': 4.0, 'tour': 4.0, 'visit': 3.5, 'schedule': 3.0, 'book': 3.0, 'see': 2.5, 'university': 2.5 },
    booster_phrases: { 'how can I request a campus tour': 5, 'schedule a university visit': 4.5, 'book a campus tour': 4.5, 'can I see the campus': 4.5 }
 }],
 ['LIBRARY_HOURS_INQUIRY', {
    keywords: { 'library': 4.0, 'hours': 4.0, 'open': 3.5, 'close': 3.5, 'when': 2.5, 'operating': 2.5, 'study': 2.5 },
    booster_phrases: { 'what are the library hours': 5, 'when is the library open until': 4.5, 'what time does the library close': 4.5, 'is the library open now': 4.5 }
 }],
 ['IT_SUPPORT_REQUEST', {
    keywords: { 'it': 4.0, 'support': 4.0, 'tech': 3.5, 'help desk': 3.5, 'computer': 3.0, 'network': 3.0, 'email': 3.0, 'wifi': 3.0, 'issue': 2.5, 'problem': 2.5 },
    booster_phrases: { 'I need IT support': 5, 'how to contact the tech help desk': 4.5, 'I have a computer problem': 4.5, 'my wifi isn\'t working': 4.5 }
 }],
 ['EMAIL_SETUP_ASSISTANCE', {
    keywords: { 'email': 4.0, 'setup': 4.0, 'configure': 3.5, 'account': 3.0, 'outlook': 3.0, 'gmail': 3.0, 'help': 2.5 },
    booster_phrases: { 'how do I set up my email': 5, 'help configuring my email account': 4.5, 'setup email for Outlook': 4.5, 'I need email setup assistance': 4.5 }
 }],
 ['WIFI_CONNECTION_HELP', {
    keywords: { 'wifi': 4.0, 'connection': 4.0, 'internet': 3.5, 'connect': 3.0, 'problem': 2.5, 'no signal': 2.5, 'fix': 2.5 },
    booster_phrases: { 'how to connect to wifi': 5, 'my internet connection isn\'t working': 4.5, 'I have no wifi signal': 4.5, 'help connecting to wifi': 4.5 }
 }],
 ['PASSWORD_SYNC_ISSUE', {
    keywords: { 'password': 4.0, 'sync': 4.0, 'issue': 3.5, 'not working': 3.0, 'problem': 3.0, 'update': 2.5, 'across devices': 2.5 },
    booster_phrases: { 'my password isn\'t syncing': 5, 'I have a password sync issue': 4.5, 'why isn\'t my password updating across devices': 4.5, 'problem with password synchronization': 4.5 }
 }],
 ['SOFTWARE_INSTALLATION_HELP', {
    keywords: { 'software': 4.0, 'install': 4.0, 'installation': 4.0, 'setup': 3.5, 'problem': 3.0, 'error': 3.0, 'guide': 2.5 },
    booster_phrases: { 'how to install software X': 5, 'I need help with software installation': 4.5, 'I\'m having a problem installing software': 4.5, 'guide for software setup': 4.5 }
 }],
 ['HARDWARE_REPAIR_INQUIRY', {
    keywords: { 'hardware': 4.0, 'repair': 4.0, 'fix': 3.5, 'device': 3.0, 'computer': 3.0, 'warranty': 3.0, 'cost': 2.5 },
    booster_phrases: { 'how to get hardware repaired': 5, 'can you fix my device': 4.5, 'what\'s the cost of hardware repair': 4.5, 'is this covered under warranty for repair': 4.5 }
 }],
 ['NETWORK_ISSUE_REPORT', {
    keywords: { 'network': 4.0, 'issue': 4.0, 'problem': 3.5, 'connection': 3.5, 'internet': 3.0, 'slow': 3.0, 'down': 3.0, 'report': 2.5 },
    booster_phrases: { 'I want to report a network issue': 5, 'my internet connection is slow': 4.5, 'the network is down': 4.5, 'I\'m having a network problem': 4.5 }
 }],
 ['ACCOUNT_RESET_ASSISTANCE', {
    keywords: { 'account': 4.0, 'reset': 4.0, 'restore': 3.5, 'recover': 3.5, 'login': 3.0, 'access': 2.5, 'help': 2.0 },
    booster_phrases: { 'how do I reset my account': 5, 'help me restore my account': 4.5, 'I can\'t log in, need account reset': 4.5, 'recover my account access': 4.5 }
 }],
 ['DATA_RECOVERY_INQUIRY', {
    keywords: { 'data': 4.0, 'recovery': 4.0, 'recover': 3.5, 'lost': 3.0, 'deleted': 3.0, 'files': 3.0, 'restore': 3.0, 'backup': 2.5 },
    booster_phrases: { 'how to recover lost data': 5, 'can you help me restore my files': 4.5, 'I deleted my data by mistake': 4.5, 'do you offer data recovery services': 4.5 }
 }],
 ['PRINTER_SETUP_HELP', {
    keywords: { 'printer': 4.0, 'setup': 4.0, 'install': 3.5, 'configure': 3.5, 'connect': 3.0, 'wireless': 3.0, 'help': 2.5 },
    booster_phrases: { 'how do I set up my printer': 5, 'help with printer installation': 4.5, 'configure a wireless printer': 4.5, 'I need printer setup assistance': 4.5 }
 }],
 ['SOFTWARE_LICENSE_INQUIRY', {
    keywords: { 'software': 4.0, 'license': 4.0, 'key': 3.5, 'activate': 3.5, 'renewal': 3.0, 'purchase': 3.0, 'expire': 2.5 },
    booster_phrases: { 'how to activate my software license': 5, 'where can I find my license key': 4.5, 'when does my software license expire': 4.5, 'how to purchase a software license': 4.5 }
 }],
 ['SECURITY_BREACH_INQUIRY', {
    keywords: { 'security': 4.0, 'breach': 4.0, 'hack': 3.5, 'compromised': 3.5, 'data': 3.0, 'personal': 3.0, 'incident': 3.0, 'report': 2.5 },
    booster_phrases: { 'have you had a security breach': 5, 'my account might be compromised': 4.5, 'report a security incident': 4.5, 'is my personal data at risk': 4.5 }
 }],
 ['WEBSITE_NAVIGATION_HELP', {
    keywords: { 'website': 4.0, 'navigation': 4.0, 'find': 3.5, 'where': 3.0, 'locate': 3.0, 'page': 2.5, 'menu': 2.5, 'lost': 2.5 },
    booster_phrases: { 'how to navigate your website': 5, 'I can\'t find the X page': 4.5, 'where is the main menu': 4.5, 'I\'m lost on your website': 4.5 }
 }],
 ['ACCESSIBILITY_FEATURES_INQUIRY', {
    keywords: { 'accessibility': 4.0, 'features': 4.0, 'screen reader': 3.5, 'font size': 3.0, 'contrast': 3.0, 'blind': 2.5, 'disabled': 2.5 },
    booster_phrases: { 'what accessibility features do you offer': 5, 'do you support screen readers': 4.5, 'can I change the font size': 4.5, 'what are your accessibility options': 4.5 }
 }],
 ['CAREER_PATH_ADVICE', {
    keywords: { 'career': 4.0, 'path': 4.0, 'advice': 4.0, 'guidance': 3.5, 'direction': 3.0, 'future': 2.5, 'grow': 2.5 },
    booster_phrases: { 'can you advise me on my career path': 5, 'I need guidance on my career direction': 4.5, 'what\'s the best career path for X': 4.5, 'how to grow my career': 4.5 }
 }],
 ['PERFORMANCE_REVIEW_TIPS', {
    keywords: { 'performance review': 4.0, 'tips': 4.0, 'prepare': 3.5, 'feedback': 3.0, 'annual': 2.5, 'evaluation': 2.5 },
    booster_phrases: { 'give me tips for a performance review': 5, 'how to prepare for my annual review': 4.5, 'advice on performance feedback': 4.5, 'tips for a successful performance evaluation': 4.5 }
 }],
 ['EMPLOYEE_HANDBOOK_ACCESS', {
    keywords: { 'employee': 4.0, 'handbook': 4.0, 'manual': 3.5, 'access': 3.0, 'find': 2.5, 'policy': 2.5, 'rules': 2.5 },
    booster_phrases: { 'how can I access the employee handbook': 5, 'where can I find the employee manual': 4.5, 'I need to see company policies': 4.5, 'access to employee rules': 4.5 }
 }],
 ['HR_POLICY_INQUIRY', {
    keywords: { 'hr': 4.0, 'policy': 4.0, 'human resources': 3.5, 'vacation': 3.0, 'sick leave': 3.0, 'leave of absence': 3.5, 'benefits': 3.0 },
    booster_phrases: { 'what\'s your HR policy on vacation': 5, 'tell me about your sick leave policy': 4.5, 'inquiry about leave of absence policy': 4.5, 'what are the human resources policies': 4.5 }
 }],
 ['EXPENSE_REPORT_HELP', {
    keywords: { 'expense report': 4.0, 'submit': 3.5, 'fill out': 3.0, 'reimbursement': 3.5, 'receipts': 3.0, 'help': 2.5 },
    booster_phrases: { 'how do I submit an expense report': 5, 'help filling out my expense report': 4.5, 'how to get reimbursement for expenses': 4.5, 'where to upload receipts for expense report': 4.5 }
 }],
 ['PAYROLL_INQUIRY', {
    keywords: { 'payroll': 4.0, 'paycheck': 3.5, 'salary': 3.0, 'deductions': 3.0, 'direct deposit': 3.0, 'tax': 2.5, 'wage': 2.5 },
    booster_phrases: { 'I have a payroll inquiry': 5, 'when is my next paycheck': 4.5, 'what are my salary deductions': 4.5, 'how to set up direct deposit': 4.5 }
 }],
 ['TRAINING_REGISTRATION_HELP', {
    keywords: { 'training': 4.0, 'registration': 4.0, 'sign up': 3.5, 'enroll': 3.5, 'course': 3.0, 'workshop': 3.0, 'help': 2.5 },
    booster_phrases: { 'how to register for training': 5, 'help me sign up for the training course': 4.5, 'enroll me in the workshop': 4.5, 'I need assistance with training registration': 4.5 }
 }],
 ['CORPORATE_EVENTS_INFO', {
    keywords: { 'corporate': 4.0, 'events': 4.0, 'company': 3.5, 'party': 3.0, 'outing': 3.0, 'holiday': 2.5, 'calendar': 2.5 },
    booster_phrases: { 'what corporate events are coming up': 5, 'tell me about company outings': 4.5, 'where is the corporate events calendar': 4.5, 'any upcoming holiday parties': 4.5 }
 }],
 ['IT_EQUIPMENT_REQUEST', {
    keywords: { 'it': 4.0, 'equipment': 4.0, 'request': 4.0, 'laptop': 3.5, 'monitor': 3.5, 'peripherals': 3.0, 'new': 2.5, 'order': 2.5 },
    booster_phrases: { 'how to request IT equipment': 5, 'I need a new laptop': 4.5, 'can I order a monitor': 4.5, 'request for computer peripherals': 4.5 }
 }],
 ['SOFTWARE_REQUEST', {
    keywords: { 'software': 4.0, 'request': 4.0, 'install': 3.5, 'new': 2.5, 'program': 2.5, 'application': 2.5 },
    booster_phrases: { 'how to request new software': 5, 'can you install this program for me': 4.5, 'I need a new software application': 4.5, 'request for software installation': 4.5 }
 }],
 ['TRAVEL_POLICY_INQUIRY', {
    keywords: { 'travel': 4.0, 'policy': 4.0, 'expense': 3.5, 'reimbursement': 3.5, 'booking': 3.0, 'business trip': 3.0, 'rules': 2.5 },
    booster_phrases: { 'what\'s the company travel policy': 5, 'how to get travel expense reimbursement': 4.5, 'rules for business trip booking': 4.5, 'inquiry about travel policy': 4.5 }
 }],
 ['MEETING_ROOM_BOOKING', {
    keywords: { 'meeting room': 4.0, 'book': 4.0, 'reserve': 3.5, 'conference room': 3.5, 'schedule': 3.0, 'available': 2.5, 'room': 2.5 },
    booster_phrases: { 'how to book a meeting room': 5, 'reserve a conference room': 4.5, 'is the meeting room available at X time': 4.5, 'schedule a room booking': 4.5 }
 }],
 ['COFFEE_MACHINE_PROBLEM', {
    keywords: { 'coffee machine': 4.0, 'problem': 4.0, 'broken': 3.5, 'not working': 3.5, 'fix': 3.0, 'empty': 2.5, 'refill': 2.5 },
    booster_phrases: { 'the coffee machine is broken': 5, 'the coffee machine isn\'t working': 4.5, 'how to fix the coffee machine': 4.5, 'the coffee machine is empty': 4.5 }
 }],
 ['OFFICE_SUPPLIES_REQUEST', {
    keywords: { 'office supplies': 4.0, 'request': 4.0, 'order': 3.5, 'need': 3.0, 'printer ink': 3.0, 'paper': 3.0, 'pens': 3.0 },
    booster_phrases: { 'how to request office supplies': 5, 'I need to order printer ink': 4.5, 'can I get more paper': 4.5, 'request for office supplies': 4.5 }
 }],
 ['BUILDING_MAINTENANCE_REQUEST', {
    keywords: { 'building': 4.0, 'maintenance': 4.0, 'request': 4.0, 'repair': 3.5, 'issue': 3.0, 'broken': 3.0, 'light': 2.5, 'ac': 2.5, 'heating': 2.5 },
    booster_phrases: { 'I need to request building maintenance': 5, 'the AC is not working': 4.5, 'report a broken light fixture': 4.5, 'request for building repair': 4.5 }
 }],
 ['PARKING_PERMIT_INQUIRY', {
    keywords: { 'parking': 4.0, 'permit': 4.0, 'apply': 3.5, 'cost': 3.0, 'renew': 3.0, 'rules': 2.5, 'where': 2.5 },
    booster_phrases: { 'how to apply for a parking permit': 5, 'what\'s the cost of a parking permit': 4.5, 'how to renew my parking permit': 4.5, 'where are the parking rules': 4.5 }
 }],
 ['ACCESS_CARD_ISSUE', {
    keywords: { 'access card': 4.0, 'issue': 4.0, 'not working': 3.5, 'lost': 3.0, 'replace': 3.0, 'faulty': 3.0, 'entry': 2.5 },
    booster_phrases: { 'my access card isn\'t working': 5, 'I lost my access card': 4.5, 'how to replace a faulty access card': 4.5, 'I\'m having an access card issue': 4.5 }
 }],
 ['LOCKER_INQUIRY', {
    keywords: { 'locker': 4.0, 'assign': 3.5, 'available': 3.0, 'use': 2.5, 'rent': 2.5, 'storage': 2.5 },
    booster_phrases: { 'how to get a locker assigned': 5, 'are there any lockers available': 4.5, 'can I use a locker': 4.5, 'inquiry about locker rental': 4.5 }
 }],
]);