import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_9: IntentMap = new Map([
 ['ACADEMIC_INTEGRITY_POLICY', {
    keywords: { 'academic': 4.0, 'integrity': 4.0, 'policy': 4.0, 'plagiarism': 3.5, 'cheating': 3.5, 'rules': 3.0, 'honor code': 3.0 },
    booster_phrases: { 'what is the academic integrity policy': 5, 'tell me about plagiarism rules': 4.5, 'what\'s the honor code for students': 4.5, 'rules against cheating': 4.5 }
 }],
 ['RESEARCH_ETHICS_INQUIRY', {
    keywords: { 'research': 4.0, 'ethics': 4.0, 'guidelines': 3.5, 'policy': 3.0, 'approval': 3.0, 'human subjects': 3.5, 'animal research': 3.5 },
    booster_phrases: { 'what are the research ethics guidelines': 5, 'how to get ethical approval for research': 4.5, 'policy on human subjects research': 4.5, 'information on animal research ethics': 4.5 }
 }],
 ['FACULTY_DIRECTORY_INQUIRY', {
    keywords: { 'faculty': 4.0, 'directory': 4.0, 'contact': 3.5, 'professor': 3.0, 'staff': 3.0, 'find': 2.5, 'email': 2.5 },
    booster_phrases: { 'where can I find the faculty directory': 5, 'how to contact a professor': 4.5, 'find faculty contact information': 4.5, 'access staff directory': 4.5 }
 }],
 ['COURSE_EVALUATION_FEEDBACK', {
    keywords: { 'course': 4.0, 'evaluation': 4.0, 'feedback': 4.0, 'submit': 3.5, 'review': 3.0, 'instructor': 3.0, 'comment': 2.5 },
    booster_phrases: { 'how to submit course evaluation feedback': 5, 'where can I leave feedback for my course': 4.5, 'how to review my instructor': 4.5, 'provide comments on course evaluation': 4.5 }
 }],
 ['CLASSROOM_TECHNOLOGY_SUPPORT', {
    keywords: { 'classroom': 4.0, 'technology': 4.0, 'support': 4.0, 'projector': 3.5, 'computer': 3.0, 'audio': 3.0, 'help': 2.5, 'issue': 2.5 },
    booster_phrases: { 'I need classroom technology support': 5, 'help with the projector in the classroom': 4.5, 'I\'m having an audio issue in class': 4.5, 'technical support for classrooms': 4.5 }
 }],
 ['STUDENT_EMAIL_ACCESS', {
    keywords: { 'student': 4.0, 'email': 4.0, 'access': 4.0, 'login': 3.5, 'portal': 3.0, 'university': 2.5, 'account': 2.5 },
    booster_phrases: { 'how to access my student email': 5, 'login to my university email account': 4.5, 'where is the student email portal': 4.5, 'can I access my student email': 4.5 }
 }],
 ['VPN_SETUP_HELP', {
    keywords: { 'vpn': 4.0, 'setup': 4.0, 'configure': 3.5, 'connect': 3.0, 'access': 3.0, 'network': 2.5, 'remote': 2.5, 'help': 2.0 },
    booster_phrases: { 'how do I set up VPN': 5, 'help configuring my VPN connection': 4.5, 'how to access the network remotely via VPN': 4.5, 'I need VPN setup assistance': 4.5 }
 }],
 ['FILE_STORAGE_SOLUTIONS', {
    keywords: { 'file storage': 4.0, 'cloud': 3.5, 'drive': 3.0, 'share': 3.0, 'save': 2.5, 'access': 2.5, 'document': 2.5, 'solution': 2.5 },
    booster_phrases: { 'what file storage solutions do you offer': 5, 'do you have cloud storage': 4.5, 'how to share documents securely': 4.5, 'access my files from the cloud': 4.5 }
 }],
 ['SOFTWARE_TROUBLESHOOTING', {
    keywords: { 'software': 4.0, 'troubleshooting': 4.0, 'fix': 3.5, 'problem': 3.0, 'issue': 3.0, 'error': 3.0, 'not working': 3.0, 'diagnose': 2.5 },
    booster_phrases: { 'how to troubleshoot software X': 5, 'help me fix a software problem': 4.5, 'my software is not working': 4.5, 'diagnose a software error': 4.5 }
 }],
 ['HARDWARE_INSTALLATION_HELP', {
    keywords: { 'hardware': 4.0, 'installation': 4.0, 'install': 3.5, 'setup': 3.5, 'component': 3.0, 'device': 3.0, 'help': 2.5, 'guide': 2.5 },
    booster_phrases: { 'how to install new hardware': 5, 'help with hardware setup': 4.5, 'guide for device installation': 4.5, 'I need assistance installing a component': 4.5 }
 }],
 ['NETWORK_CONFIGURATION_HELP', {
    keywords: { 'network': 4.0, 'configuration': 4.0, 'setup': 3.5, 'internet': 3.0, 'router': 3.0, 'wifi': 3.0, 'connect': 2.5, 'help': 2.0 },
    booster_phrases: { 'how to configure my network': 5, 'help with internet setup': 4.5, 'how to connect to the router': 4.5, 'I need network configuration assistance': 4.5 }
 }],
 ['EMAIL_SPAM_FILTER_HELP', {
    keywords: { 'email': 4.0, 'spam': 4.0, 'filter': 4.0, 'block': 3.5, 'junk': 3.0, 'whitelist': 3.0, 'settings': 2.5, 'problem': 2.5 },
    booster_phrases: { 'how to set up email spam filter': 5, 'my email is getting too much spam': 4.5, 'how to block junk email': 4.5, 'help with email spam settings': 4.5 }
 }],
 ['VIRUS_MALWARE_REMOVAL', {
    keywords: { 'virus': 4.0, 'malware': 4.0, 'remove': 3.5, 'clean': 3.0, 'scan': 3.0, 'computer': 2.5, 'infected': 2.5, 'protection': 2.5 },
    booster_phrases: { 'how to remove a virus from my computer': 5, 'help with malware removal': 4.5, 'scan my computer for viruses': 4.5, 'my computer is infected with malware': 4.5 }
 }],
 ['DATA_BACKUP_SOLUTION', {
    keywords: { 'data': 4.0, 'backup': 4.0, 'solution': 4.0, 'store': 3.5, 'save': 3.0, 'recover': 3.0, 'cloud': 2.5, 'external drive': 2.5 },
    booster_phrases: { 'what data backup solutions do you recommend': 5, 'how to backup my files to the cloud': 4.5, 'how to save data to an external drive': 4.5, 'help me set up a data backup': 4.5 }
 }],
 ['SOFTWARE_LICENSE_ACTIVATION', {
    keywords: { 'software': 4.0, 'license': 4.0, 'activation': 4.0, 'key': 3.5, 'activate': 3.5, 'install': 3.0, 'problem': 2.5, 'error': 2.5 },
    booster_phrases: { 'how to activate my software license': 5, 'I\'m having a problem with license activation': 4.5, 'where do I enter my license key': 4.5, 'error activating software': 4.5 }
 }],
 ['REMOTE_ACCESS_HELP', {
    keywords: { 'remote access': 4.0, 'connect': 3.5, 'work from home': 3.5, 'vpn': 3.0, 'desktop': 3.0, 'help': 2.5, 'issue': 2.5 },
    booster_phrases: { 'how to set up remote access': 5, 'help connecting to my work desktop remotely': 4.5, 'I\'m having an issue with remote access': 4.5, 'how to work from home with remote access': 4.5 }
 }],
 ['CYBERSECURITY_ADVICE', {
    keywords: { 'cybersecurity': 4.0, 'advice': 4.0, 'protection': 3.5, 'online safety': 3.5, 'threats': 3.0, 'phishing': 3.0, 'security': 3.0, 'tips': 2.5 },
    booster_phrases: { 'give me cybersecurity advice': 5, 'how to protect myself online': 4.5, 'tips for cybersecurity': 4.5, 'how to avoid phishing attacks': 4.5 }
 }],
 ['PASSWORD_SECURITY_TIPS', {
    keywords: { 'password': 4.0, 'security': 4.0, 'tips': 4.0, 'strong': 3.5, 'safe': 3.0, 'create': 2.5, 'manage': 2.5, 'protection': 2.5 },
    booster_phrases: { 'give me password security tips': 5, 'how to create a strong password': 4.5, 'tips for managing passwords safely': 4.5, 'best practices for password protection': 4.5 }
 }],
 ['PHISHING_SCAM_REPORT', {
    keywords: { 'phishing': 4.0, 'scam': 4.0, 'report': 4.0, 'email': 3.5, 'fraud': 3.5, 'suspicious': 3.0, 'fake': 3.0, 'alert': 2.5 },
    booster_phrases: { 'I want to report a phishing scam': 5, 'I received a suspicious email': 4.5, 'how to report online fraud': 4.5, 'I think this is a fake website': 4.5 }
 }],
 ['TWO_FACTOR_AUTHENTICATION_HELP', {
    keywords: { 'two-factor authentication': 4.0, '2fa': 4.0, 'setup': 3.5, 'enable': 3.0, 'disable': 3.0, 'problem': 2.5, 'login': 2.5, 'security': 2.5 },
    booster_phrases: { 'how to set up two-factor authentication': 5, 'I\'m having a problem with 2FA login': 4.5, 'how to enable two-factor authentication': 4.5, 'help with 2FA security': 4.5 }
 }],
 ['SOFTWARE_COMPATIBILITY_INQUIRY', {
    keywords: { 'software': 4.0, 'compatibility': 4.0, 'compatible': 3.5, 'run': 3.0, 'system': 3.0, 'operating system': 3.0, 'version': 2.5 },
    booster_phrases: { 'is this software compatible with my system': 5, 'can this software run on X operating system': 4.5, 'what version is compatible with Y': 4.5, 'software compatibility check': 4.5 }
 }],
 ['DEVICE_DRIVER_ISSUE', {
    keywords: { 'device': 4.0, 'driver': 4.0, 'issue': 4.0, 'problem': 3.5, 'update': 3.0, 'install': 3.0, 'not working': 3.0, 'recognize': 2.5 },
    booster_phrases: { 'I have a device driver issue': 5, 'my device driver isn\'t working': 4.5, 'how to update a device driver': 4.5, 'my computer isn\'t recognizing the device': 4.5 }
 }],
 ['STORAGE_SPACE_INQUIRY', {
    keywords: { 'storage': 4.0, 'space': 4.0, 'full': 3.5, 'free up': 3.0, 'hard drive': 3.0, 'disk': 3.0, 'memory': 2.5, 'capacity': 2.5 },
    booster_phrases: { 'how much storage space do I have': 5, 'my hard drive is full': 4.5, 'how to free up storage space': 4.5, 'what\'s the disk capacity': 4.5 }
 }],
 ['INTERNET_SPEED_TEST', {
    keywords: { 'internet': 4.0, 'speed': 4.0, 'test': 4.0, 'slow': 3.5, 'connection': 3.0, 'check': 2.5, 'measure': 2.5 },
    booster_phrases: { 'can you run an internet speed test': 5, 'my internet is slow, check speed': 4.5, 'how to measure my internet connection speed': 4.5, 'perform an internet speed test': 4.5 }
 }],
 ['SOFTWARE_UNINSTALL_HELP', {
    keywords: { 'software': 4.0, 'uninstall': 4.0, 'remove': 3.5, 'delete': 3.0, 'program': 2.5, 'application': 2.5, 'help': 2.0 },
    booster_phrases: { 'how to uninstall software': 5, 'help me remove this program': 4.5, 'how to delete an application from my computer': 4.5, 'I need help uninstalling software': 4.5 }
 }],
 ['PERIPHERAL_CONNECTION_HELP', {
    keywords: { 'peripheral': 4.0, 'connection': 4.0, 'printer': 3.5, 'keyboard': 3.5, 'mouse': 3.5, 'monitor': 3.5, 'connect': 3.0, 'problem': 2.5 },
    booster_phrases: { 'how to connect my printer': 5, 'my keyboard isn\'t connecting': 4.5, 'help with monitor connection': 4.5, 'I have a peripheral connection problem': 4.5 }
 }],
 ['SYSTEM_CRASH_REPORT', {
    keywords: { 'system': 4.0, 'crash': 4.0, 'report': 4.0, 'computer': 3.5, 'freeze': 3.0, 'blue screen': 3.5, 'shutdown': 3.0, 'problem': 2.5 },
    booster_phrases: { 'my system crashed': 5, 'I want to report a computer freeze': 4.5, 'I got a blue screen error': 4.5, 'my computer keeps shutting down': 4.5 }
 }],
 ['SOFTWARE_PERFORMANCE_ISSUE', {
    keywords: { 'software': 4.0, 'performance': 4.0, 'slow': 3.5, 'lagging': 3.5, 'crashing': 3.0, 'issue': 3.0, 'optimize': 2.5, 'speed up': 2.5 },
    booster_phrases: { 'my software is performing slowly': 5, 'the application is lagging': 4.5, 'software keeps crashing': 4.5, 'how to optimize software performance': 4.5 }
 }],
 ['ONLINE_ACCOUNT_SECURITY', {
    keywords: { 'online account': 4.0, 'security': 4.0, 'protect': 3.5, 'safe': 3.0, 'hack': 3.0, 'compromised': 3.0, 'tips': 2.5 },
    booster_phrases: { 'how to keep my online account secure': 5, 'tips for online account safety': 4.5, 'my online account might be hacked': 4.5, 'how to protect my online accounts': 4.5 }
 }],
 ['DATA_BREACH_NOTIFICATION', {
    keywords: { 'data breach': 4.0, 'notification': 4.0, 'personal info': 3.5, 'compromised': 3.5, 'exposed': 3.0, 'alert': 2.5, 'warn': 2.5 },
    booster_phrases: { 'I received a data breach notification': 5, 'was my personal info compromised in a data breach': 4.5, 'alert me about any data breaches': 4.5, 'my data might be exposed': 4.5 }
 }],
 ['SOCIAL_MEDIA_PRIVACY_SETTINGS', {
    keywords: { 'social media': 4.0, 'privacy': 4.0, 'settings': 4.0, 'control': 3.5, 'personal info': 3.0, 'public': 2.5, 'restrict': 2.5, 'share': 2.5 },
    booster_phrases: { 'how to adjust social media privacy settings': 5, 'how to control my personal info on social media': 4.5, 'make my social media private': 4.5, 'how to restrict what I share on social media': 4.5 }
 }],
 ['ONLINE_FRAUD_REPORT', {
    keywords: { 'online fraud': 4.0, 'report': 4.0, 'scam': 3.5, 'fake': 3.0, 'fraudulent': 3.0, 'transaction': 3.0, 'stolen money': 3.5, 'suspicious': 2.5 },
    booster_phrases: { 'how to report online fraud': 5, 'I was a victim of an online scam': 4.5, 'report a fraudulent transaction': 4.5, 'my money was stolen online': 4.5 }
 }],
 ['IDENTITY_THEFT_ASSISTANCE', {
    keywords: { 'identity theft': 4.0, 'assistance': 4.0, 'report': 3.5, 'stolen identity': 3.5, 'recover': 3.0, 'help': 2.5, 'protect': 2.5 },
    booster_phrases: { 'I need identity theft assistance': 5, 'how to report stolen identity': 4.5, 'help me recover from identity theft': 4.5, 'how to protect myself from identity theft': 4.5 }
 }],
 ['SMART_HOME_DEVICE_SETUP', {
    keywords: { 'smart home': 4.0, 'device': 4.0, 'setup': 4.0, 'install': 3.5, 'configure': 3.5, 'connect': 3.0, 'hub': 2.5, 'automate': 2.5, 'help': 2.0 },
    booster_phrases: { 'how to set up my smart home device': 5, 'help me install a smart home hub': 4.5, 'how to configure smart home automation': 4.5, 'I need assistance with smart home device setup': 4.5 }
 }],
 ['VIRTUAL_ASSISTANT_COMMANDS', {
    keywords: { 'virtual assistant': 4.0, 'commands': 4.0, 'speak to': 3.5, 'ask': 3.0, 'tell': 2.5, 'do': 2.0, 'what can': 2.0 },
    booster_phrases: { 'what commands can I use with the virtual assistant': 5, 'what can your virtual assistant do': 4.5, 'how to speak to the virtual assistant': 4.5, 'what questions can I ask the virtual assistant': 4.5 }
 }],
 ['ROBOTICS_INQUIRY', {
    keywords: { 'robotics': 4.0, 'robot': 4.0, 'ai': 3.5, 'automation': 3.5, 'technology': 3.0, 'future': 2.5, 'development': 2.5 },
    booster_phrases: { 'tell me about robotics': 5, 'what\'s new in robot technology': 4.5, 'how does robotics work': 4.5, 'future of automation and robotics': 4.5 }
 }],
 ['MACHINE_LEARNING_EXPLANATION', {
    keywords: { 'machine learning': 4.0, 'ai': 3.5, 'explain': 3.5, 'concept': 3.0, 'how it works': 3.0, 'algorithm': 3.0, 'data': 2.5, 'learn': 2.5 },
    booster_phrases: { 'explain machine learning to me': 5, 'how does machine learning work': 4.5, 'what are machine learning algorithms': 4.5, 'tell me about the concept of machine learning': 4.5 }
 }],
 ['NATURAL_LANGUAGE_PROCESSING_INFO', {
    keywords: { 'natural language processing': 4.0, 'nlp': 4.0, 'ai': 3.5, 'language': 3.0, 'understand': 3.0, 'text': 2.5, 'speech': 2.5, 'how it works': 2.5 },
    booster_phrases: { 'tell me about natural language processing': 5, 'what is NLP': 4.5, 'how does AI understand human language': 4.5, 'information on text and speech processing': 4.5 }
 }],
 ['COMPUTER_VISION_INQUIRY', {
    keywords: { 'computer vision': 4.0, 'ai': 3.5, 'image': 3.0, 'video': 3.0, 'recognize': 3.0, 'analyze': 3.0, 'how it works': 2.5 },
    booster_phrases: { 'what is computer vision': 5, 'how does AI recognize images': 4.5, 'tell me about computer vision applications': 4.5, 'information on video analysis by AI': 4.5 }
 }],
 ['DEEP_LEARNING_EXPLANATION', {
    keywords: { 'deep learning': 4.0, 'ai': 3.5, 'neural network': 3.5, 'explain': 3.0, 'how it works': 3.0, 'concept': 2.5, 'algorithm': 2.5 },
    booster_phrases: { 'explain deep learning to me': 5, 'what is a neural network': 4.5, 'how does deep learning work': 4.5, 'tell me about deep learning algorithms': 4.5 }
 }],
 ['AI_ETHICS_INQUIRY', {
    keywords: { 'ai ethics': 4.0, 'ethics': 4.0, 'responsible ai': 3.5, 'bias': 3.0, 'fairness': 3.0, 'transparency': 3.0, 'impact': 2.5 },
    booster_phrases: { 'tell me about AI ethics': 5, 'what is responsible AI': 4.5, 'how do you address bias in AI': 4.5, 'information on fairness and transparency in AI': 4.5 }
 }],
 ['FUTURE_OF_AI_DISCUSSION', {
    keywords: { 'future': 4.0, 'ai': 4.0, 'impact': 3.5, 'predict': 3.0, 'trend': 3.0, 'development': 2.5, 'society': 2.5, 'jobs': 2.5 },
    booster_phrases: { 'what\'s the future of AI': 5, 'how will AI impact society': 4.5, 'what are the trends in AI development': 4.5, 'how will AI affect jobs': 4.5 }
 }],
 ['AI_IN_DAILY_LIFE', {
    keywords: { 'ai': 4.0, 'daily life': 4.0, 'everyday': 3.5, 'use': 3.0, 'example': 3.0, 'common': 2.5, 'application': 2.5 },
    booster_phrases: { 'how is AI used in daily life': 5, 'give me examples of AI in everyday use': 4.5, 'what are common AI applications': 4.5, 'how does AI affect my daily life': 4.5 }
 }],
 ['AI_FOR_BUSINESS', {
    keywords: { 'ai': 4.0, 'business': 4.0, 'enterprise': 3.5, 'solution': 3.0, 'implement': 3.0, 'benefit': 3.0, 'company': 2.5, 'grow': 2.5 },
    booster_phrases: { 'how can AI help my business': 5, 'what AI solutions are there for enterprises': 4.5, 'how to implement AI in my company': 4.5, 'benefits of AI for business growth': 4.5 }
 }],
 ['AI_LEARNING_RESOURCES', {
    keywords: { 'ai': 4.0, 'learning': 4.0, 'resources': 4.0, 'study': 3.5, 'course': 3.0, 'book': 3.0, 'tutorial': 3.0, 'where to learn': 2.5 },
    booster_phrases: { 'where can I find AI learning resources': 5, 'recommend courses for learning AI': 4.5, 'what books should I read for AI': 4.5, 'do you have AI tutorials': 4.5 }
 }],
 ['AI_CAREER_ADVICE', {
    keywords: { 'ai': 4.0, 'career': 4.0, 'advice': 4.0, 'job': 3.5, 'path': 3.0, 'skills': 3.0, 'future': 2.5, 'grow': 2.5 },
    booster_phrases: { 'can you give me AI career advice': 5, 'what job paths are there in AI': 4.5, 'what skills are needed for an AI career': 4.5, 'how to grow in an AI career': 4.5 }
 }],
 ['AI_RESEARCH_PAPERS', {
    keywords: { 'ai': 4.0, 'research': 4.0, 'papers': 4.0, 'publication': 3.5, 'latest': 3.0, 'study': 3.0, 'find': 2.5 },
    booster_phrases: { 'where can I find AI research papers': 5, 'show me the latest AI publications': 4.5, 'do you have any AI studies': 4.5, 'find research papers on AI': 4.5 }
 }],
 ['AI_CONFERENCE_INFO', {
    keywords: { 'ai': 4.0, 'conference': 4.0, 'event': 3.5, 'summit': 3.0, 'webinar': 3.0, 'attend': 2.5, 'upcoming': 2.5 },
    booster_phrases: { 'what AI conferences are coming up': 5, 'tell me about AI summits': 4.5, 'are there any upcoming AI webinars': 4.5, 'how to attend an AI conference': 4.5 }
 }],
 ['AI_TOOL_RECOMMENDATION', {
    keywords: { 'ai': 4.0, 'tool': 4.0, 'recommendation': 4.0, 'software': 3.5, 'platform': 3.5, 'best': 3.0, 'use': 2.5 },
    booster_phrases: { 'recommend an AI tool': 5, 'what\'s the best AI software': 4.5, 'suggest an AI platform for X task': 4.5, 'what AI tools should I use': 4.5 }
 }],
 ['AI_PROJECT_IDEAS', {
    keywords: { 'ai': 4.0, 'project': 4.0, 'ideas': 4.0, 'starter': 3.5, 'beginner': 3.5, 'develop': 3.0, 'build': 3.0, 'example': 2.5 },
    booster_phrases: { 'give me AI project ideas': 5, 'what are some beginner AI projects': 4.5, 'AI project ideas for learning': 4.5, 'help me find an AI project to build': 4.5 }
 }],
 ['AI_CERTIFICATION_INQUIRY', {
    keywords: { 'ai': 4.0, 'certification': 4.0, 'certified': 3.5, 'course': 3.0, 'program': 3.0, 'exam': 2.5, 'get': 2.5 },
    booster_phrases: { 'how to get AI certified': 5, 'what AI certification courses are available': 4.5, 'tell me about AI certification programs': 4.5, 'how to pass an AI certification exam': 4.5 }
 }],
]);