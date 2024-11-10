export const API_KEY = "AIzaSyA6crBKIIcjw6WbG-jaobiswZXnpxYJ0T4";
export const API_URLS = {
    text: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
    vision: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-vision:generateText?key=${API_KEY}`
};

export const DIFFICULTY_LEVELS = {
    'Easy': 'Questions based on standard textbooks like BD Chaurasia, Guyton, Harper, etc.',
    'Medium': 'NEET PG level questions covering both clinical and non-clinical topics',
    'Hard': 'Advanced NEET PG and INICET level clinical questions'
};

export const SUBJECTS = {
    'Anatomy': [
        'Complete Anatomy',
        'Upper Limb',
        'Lower Limb',
        'Histology'
    ],
    'Radiology': [
        'Radiology'
    ],
    'Biochemistry': [
        'Complete Biochemistry'
    ],
    'Pathology': [
        'Complete Pathology'
    ],
    'Pharmacology': [
        'Complete Pharmacology'
    ],
    'Microbiology': [
        'Complete Microbiology'
    ]
};