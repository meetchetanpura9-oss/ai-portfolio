import re

SPAM_KEYWORDS = [
    r"crypto", r"bitcoin", r"casino", r"seo service", r"seo ranking", r"marketing agency", 
    r"increase traffic", r"grow traffic", r"rich quick", r"lottery", r"viagra", r"loans", 
    r"earn money", r"passive income", r"investment opportunity", r"click here", r"free gift"
]

HIRING_KEYWORDS = [
    r"hire", r"hiring", r"salary", r"job", r"recruiter", r"contract", r"full-time", 
    r"part-time", r"opportunity", r"open position", r"resume", r"interview", 
    r"talent acquisition", r"freelance", r"remote position", r"headhunter"
]

COLLAB_KEYWORDS = [
    r"partner", r"collaborate", r"collaboration", r"co-founder", r"joint venture", 
    r"team up", r"integration", r"partnership", r"mutual benefit", r"startup idea"
]

CONSULT_KEYWORDS = [
    r"consult", r"consultation", r"advise", r"help", r"audit", r"guidance", 
    r"architecture", r"recommend", r"system design", r"strategy", r"how to build",
    r"explain", r"troubleshoot"
]

def classify_inquiry(message: str, service: str) -> str:
    """
    Analyzes message body and selected service to auto-tag client inquiries.
    Returns: 'spam', 'hiring', 'collaboration', 'consultation', or 'general'
    """
    text = (message + " " + service).lower()
    
    # 1. Check for Spam
    # Check for heavy links or URLs and spam keywords
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
    if len(urls) >= 2:
        return "spam"
        
    for kw in SPAM_KEYWORDS:
        if re.search(r'\b' + kw + r'\b', text):
            return "spam"
            
    # 2. Check for Hiring / Job Opportunities
    for kw in HIRING_KEYWORDS:
        if re.search(r'\b' + kw + r'\b', text):
            return "hiring"
            
    # 3. Check for Collaboration / Partnerships
    for kw in COLLAB_KEYWORDS:
        if re.search(r'\b' + kw + r'\b', text):
            return "collaboration"
            
    # 4. Check for Consultations / Professional Services
    for kw in CONSULT_KEYWORDS:
        if re.search(r'\b' + kw + r'\b', text):
            return "consultation"
            
    # 5. Default
    return "general"
