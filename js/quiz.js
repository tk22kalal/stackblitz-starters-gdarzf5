import { fetchFromAPI } from './api.js';

export class Quiz {
    constructor() {
        this.currentQuestion = null;
        this.score = 0;
        this.timer = null;
        this.timeLimit = 0;
        this.questionLimit = 0;
        this.questionsAnswered = 0;
        this.wrongAnswers = 0;
        this.difficulty = '';
    }

    async generateQuestion(subject) {
        if (this.questionLimit && this.questionsAnswered >= this.questionLimit) {
            return null;
        }

        const isImageQuestion = Math.random() < 0.3;
        const difficultyContext = this.getDifficultyContext();

        const prompt = isImageQuestion ? 
            `Generate a ${this.difficulty.toLowerCase()} level medical image-based multiple choice question about ${subject}. ${difficultyContext}

            Use ONLY these reliable image URLs:

            For X-rays:
            - "https://prod-images-static.radiopaedia.org/images/1371172/af08e0c0339071b8f054f4cadcf2a0_big_gallery.jpg" (Chest X-ray)
            - "https://prod-images-static.radiopaedia.org/images/28246228/e4c6cf_big_gallery.jpeg" (Bone X-ray)
            
            For MRI:
            - "https://prod-images-static.radiopaedia.org/images/5280173/fe9a7363cf0ea8fb834f7e018574ba_big_gallery.jpg" (Brain MRI)
            - "https://prod-images-static.radiopaedia.org/images/25776534/b18f0c1340c4d69c59e203d3afb6f1_big_gallery.jpeg" (Spine MRI)
            
            For CT:
            - "https://prod-images-static.radiopaedia.org/images/57157212/b8caf1f67df132834dd37c2eb0c676_big_gallery.jpeg" (Chest CT)
            - "https://prod-images-static.radiopaedia.org/images/26061948/127b4f32c7f02aa5e3035147bd2d5d_big_gallery.jpeg" (Abdominal CT)

            Format the response exactly as follows:
            {
                "question": "Looking at this [type of image], what is the diagnosis/finding?",
                "imageUrl": "USE_ONE_OF_THE_ABOVE_URLS",
                "imageDescription": "Detailed description of what the image shows",
                "imageType": "Type of medical image (X-ray/MRI/CT)",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctIndex": correct_option_index_here,
                "isImageQuestion": true
            }` :
            `Generate a ${this.difficulty.toLowerCase()} level multiple choice question about ${subject}. ${difficultyContext}
            Format the response exactly as follows:
            {
                "question": "The question text here",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctIndex": correct_option_index_here,
                "isImageQuestion": false
            }`;

        try {
            const response = await fetchFromAPI(prompt);
            const parsedResponse = JSON.parse(response);
            
            if (parsedResponse.isImageQuestion) {
                const validDomain = "radiopaedia.org";
                if (!parsedResponse.imageUrl.includes(validDomain)) {
                    return {
                        question: parsedResponse.question.replace("[type of image]", "").trim(),
                        options: parsedResponse.options,
                        correctIndex: parsedResponse.correctIndex,
                        isImageQuestion: false
                    };
                }
            }
            
            return parsedResponse;
        } catch (error) {
            return {
                question: 'Failed to load question. Please try again.',
                options: ['Error', 'Error', 'Error', 'Error'],
                correctIndex: 0,
                isImageQuestion: false
            };
        }
    }

    getDifficultyContext() {
        switch (this.difficulty) {
            case 'Easy':
                return 'Base the question on standard textbooks like BD Chaurasia, Guyton, Harper, etc.';
            case 'Medium':
                return 'Make it a NEET PG level question covering both clinical and non-clinical topics.';
            case 'Hard':
                return 'Make it an advanced NEET PG or INICET level clinical question.';
            default:
                return '';
        }
    }

    async getExplanation(question, options, correctIndex, isImageQuestion = false, imageDescription = '') {
        const prompt = `
        For this ${this.difficulty.toLowerCase()} level medical question and its options:
        ${isImageQuestion ? `Image Description: ${imageDescription}\n` : ''}
        Question: "${question}"
        Options: ${options.map((opt, i) => `${i + 1}. ${opt}`).join(', ')}
        Correct Answer: ${options[correctIndex]}

        Please provide a point-wise explanation in this exact format:
        CORRECT ANSWER (${options[correctIndex]}):
        • Point 1 about why it's correct
        • Point 2 about why it's correct

        WHY OTHER OPTIONS ARE INCORRECT:
        ${options.map((opt, i) => i !== correctIndex ? `${opt}:
        • Point 1 why it's wrong
        • Point 2 why it's wrong` : '').filter(Boolean).join('\n\n')}
        `;

        try {
            return await fetchFromAPI(prompt);
        } catch (error) {
            return 'Failed to load explanation.';
        }
    }

    async askDoubt(doubt, question, isImageQuestion = false, imageDescription = '') {
        const prompt = `
        Regarding this ${this.difficulty.toLowerCase()} level medical question:
        ${isImageQuestion ? `Image Description: ${imageDescription}\n` : ''}
        "${question}"
        
        User's doubt: "${doubt}"
        
        Please provide a clear, detailed explanation addressing this specific doubt in the context of the question.
        Focus on medical accuracy and explain in a way that's helpful for medical students.
        `;

        try {
            return await fetchFromAPI(prompt);
        } catch (error) {
            return 'Failed to get answer. Please try again.';
        }
    }

    getResults() {
        return {
            total: this.questionsAnswered,
            correct: this.score,
            wrong: this.wrongAnswers,
            percentage: this.questionsAnswered > 0 
                ? Math.round((this.score / this.questionsAnswered) * 100) 
                : 0
        };
    }
}