import { Quiz } from './quiz.js';
import { SUBJECTS, DIFFICULTY_LEVELS } from './config.js';

export class QuizUI {
    constructor() {
        this.quiz = new Quiz();
        this.initializeElements();
        this.setupEventListeners();
        this.populateSubjects();
    }

    initializeElements() {
        this.elements = {
            setupContainer: document.getElementById('setup-container'),
            quizContainer: document.getElementById('quiz-container'),
            subjectSelect: document.getElementById('subject-select'),
            subtopicSelect: document.getElementById('subtopic-select'),
            difficultySelect: document.getElementById('difficulty-select'),
            difficultyInfo: document.getElementById('difficulty-info'),
            questionsSelect: document.getElementById('questions-select'),
            timeSelect: document.getElementById('time-select'),
            startQuizBtn: document.getElementById('start-quiz-btn'),
            questionText: document.getElementById('question-text'),
            imageContainer: document.getElementById('image-container'),
            questionImage: document.getElementById('question-image'),
            imageDescription: document.getElementById('image-description'),
            imageType: document.getElementById('image-type'),
            optionsContainer: document.getElementById('options-container'),
            timer: document.getElementById('timer'),
            currentQuestion: document.getElementById('current-question'),
            totalQuestions: document.getElementById('total-questions'),
            scoreContainer: document.getElementById('score-container'),
            totalAttempted: document.getElementById('total-attempted'),
            correctAnswers: document.getElementById('correct-answers'),
            wrongAnswers: document.getElementById('wrong-answers'),
            scorePercentage: document.getElementById('score-percentage'),
            restartBtn: document.getElementById('restart-btn'),
            nextBtn: document.getElementById('next-btn'),
            nextBtnContainer: document.getElementById('next-button-container'),
            loader: document.getElementById('loader')
        };
    }

    setupEventListeners() {
        this.elements.startQuizBtn.addEventListener('click', () => this.startQuiz());
        this.elements.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.subjectSelect.addEventListener('change', () => this.updateSubtopics());
        this.elements.difficultySelect.addEventListener('change', () => this.updateDifficultyInfo());
    }

    updateDifficultyInfo() {
        const difficulty = this.elements.difficultySelect.value;
        if (difficulty && DIFFICULTY_LEVELS[difficulty]) {
            this.elements.difficultyInfo.textContent = DIFFICULTY_LEVELS[difficulty];
            this.elements.difficultyInfo.classList.add('show');
        } else {
            this.elements.difficultyInfo.classList.remove('show');
        }
    }

    populateSubjects() {
        for (const subject in SUBJECTS) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            this.elements.subjectSelect.appendChild(option);
        }
    }

    updateSubtopics() {
        const subject = this.elements.subjectSelect.value;
        this.elements.subtopicSelect.innerHTML = '<option value="">Choose a sub-topic...</option>';
        
        if (subject && SUBJECTS[subject]) {
            SUBJECTS[subject].forEach(subtopic => {
                const option = document.createElement('option');
                option.value = subtopic;
                option.textContent = subtopic;
                this.elements.subtopicSelect.appendChild(option);
            });
            this.elements.subtopicSelect.disabled = false;
        } else {
            this.elements.subtopicSelect.disabled = true;
        }
    }

    async startQuiz() {
        const subject = this.elements.subtopicSelect.value || this.elements.subjectSelect.value;
        const difficulty = this.elements.difficultySelect.value;
        if (!subject || !difficulty) return;

        this.quiz.questionLimit = parseInt(this.elements.questionsSelect.value) || 0;
        this.quiz.timeLimit = parseInt(this.elements.timeSelect.value) || 0;
        this.quiz.difficulty = difficulty;
        
        this.elements.setupContainer.classList.add('hidden');
        this.elements.quizContainer.classList.remove('hidden');
        this.elements.totalQuestions.textContent = this.quiz.questionLimit || '∞';
        
        await this.nextQuestion();
    }

    restartQuiz() {
        this.quiz = new Quiz();
        this.elements.scoreContainer.classList.add('hidden');
        this.elements.setupContainer.classList.remove('hidden');
        this.elements.quizContainer.classList.add('hidden');
        this.elements.nextBtnContainer.classList.add('hidden');
    }

    async nextQuestion() {
        this.elements.loader.classList.remove('hidden');
        this.elements.nextBtnContainer.classList.add('hidden');
        
        const subject = this.elements.subtopicSelect.value || this.elements.subjectSelect.value;
        const question = await this.quiz.generateQuestion(subject);
        
        if (!question) {
            this.showResults();
            return;
        }

        this.quiz.currentQuestion = question;
        this.elements.loader.classList.add('hidden');
        this.elements.questionText.textContent = question.question;
        this.elements.currentQuestion.textContent = this.quiz.questionsAnswered + 1;

        if (question.isImageQuestion) {
            this.elements.imageType.textContent = question.imageType;
            this.elements.imageDescription.textContent = question.imageDescription;
            this.elements.imageType.classList.remove('hidden');
            this.elements.imageDescription.classList.remove('hidden');
            this.elements.imageContainer.classList.remove('hidden');
            
            if (question.imageUrl) {
                this.elements.questionImage.src = question.imageUrl;
                this.elements.questionImage.alt = question.imageDescription;
                this.elements.questionImage.classList.remove('hidden');
            }
        } else {
            this.elements.imageType.classList.add('hidden');
            this.elements.imageDescription.classList.add('hidden');
            this.elements.imageContainer.classList.add('hidden');
            this.elements.questionImage.classList.add('hidden');
        }
        
        this.elements.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(index));
            this.elements.optionsContainer.appendChild(button);
        });

        if (this.quiz.timeLimit) {
            this.startTimer();
        }
    }

    selectAnswer(selectedIndex) {
        if (this.quiz.timer) {
            clearInterval(this.quiz.timer);
            this.elements.timer.textContent = '';
        }

        const options = this.elements.optionsContainer.children;
        for (let option of options) {
            option.disabled = true;
        }

        const correctIndex = this.quiz.currentQuestion.correctIndex;
        options[correctIndex].classList.add('correct');
        
        if (selectedIndex === correctIndex) {
            this.quiz.score++;
        } else {
            options[selectedIndex].classList.add('wrong');
            this.quiz.wrongAnswers++;
        }

        this.quiz.questionsAnswered++;
        this.showExplanation();
        this.elements.nextBtnContainer.classList.remove('hidden');
    }

    startTimer() {
        let timeLeft = this.quiz.timeLimit;
        this.elements.timer.textContent = `Time left: ${timeLeft}s`;
        
        if (this.quiz.timer) {
            clearInterval(this.quiz.timer);
        }

        this.quiz.timer = setInterval(() => {
            timeLeft--;
            this.elements.timer.textContent = `Time left: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(this.quiz.timer);
                const options = this.elements.optionsContainer.children;
                const unselectedOption = Array.from(options).find(opt => !opt.classList.contains('selected'));
                if (unselectedOption) {
                    this.selectAnswer(Array.from(options).indexOf(unselectedOption));
                }
            }
        }, 1000);
    }

    showResults() {
        const results = this.quiz.getResults();
        this.elements.totalAttempted.textContent = results.total;
        this.elements.correctAnswers.textContent = results.correct;
        this.elements.wrongAnswers.textContent = results.wrong;
        this.elements.scorePercentage.textContent = `${results.percentage}%`;
        this.elements.scoreContainer.classList.remove('hidden');
    }

    async showExplanation() {
        const currentQuestion = this.quiz.currentQuestion;
        const explanation = await this.quiz.getExplanation(
            currentQuestion.question,
            currentQuestion.options,
            currentQuestion.correctIndex,
            currentQuestion.isImageQuestion,
            currentQuestion.imageDescription
        );

        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `
            <h3><b>Explanation</b></h3>
            <div class="explanation-content">
                <pre></pre>
            </div>
            <div class="doubt-section">
                <h4><b>Have a doubt?</b></h4>
                <div class="doubt-input-container">
                    <textarea 
                        placeholder="Type your doubt here related to this question..."
                        class="doubt-input"
                    ></textarea>
                    <button class="ask-doubt-btn">Ask Doubt</button>
                </div>
                <div class="doubt-answer hidden"></div>
            </div>
        `;

        const existingExplanation = document.querySelector('.explanation');
        if (existingExplanation) {
            existingExplanation.remove();
        }

        this.elements.optionsContainer.after(explanationDiv);
        
        const pre = explanationDiv.querySelector('pre');
        const words = explanation.split(' ');
        let currentIndex = 0;

        const renderNextWord = () => {
            if (currentIndex < words.length) {
                pre.textContent += words[currentIndex] + ' ';
                currentIndex++;
                setTimeout(renderNextWord, 50);
            }
        };

        renderNextWord();
        this.setupDoubtHandling(explanationDiv);
    }

    setupDoubtHandling(explanationDiv) {
        const doubtBtn = explanationDiv.querySelector('.ask-doubt-btn');
        const doubtInput = explanationDiv.querySelector('.doubt-input');
        const doubtAnswer = explanationDiv.querySelector('.doubt-answer');

        doubtBtn.addEventListener('click', async () => {
            const doubt = doubtInput.value.trim();
            if (!doubt) return;

            doubtBtn.disabled = true;
            doubtBtn.textContent = 'Getting answer...';
            doubtAnswer.innerHTML = '<h4><b>Answer to your doubt:</b></h4><p></p>';
            doubtAnswer.classList.remove('hidden');

            const answer = await this.quiz.askDoubt(
                doubt, 
                this.quiz.currentQuestion.question,
                this.quiz.currentQuestion.isImageQuestion,
                this.quiz.currentQuestion.imageDescription
            );
            
            const p = doubtAnswer.querySelector('p');
            const words = answer.split(' ');
            let currentIndex = 0;

            const renderNextWord = () => {
                if (currentIndex < words.length) {
                    p.textContent += words[currentIndex] + ' ';
                    currentIndex++;
                    setTimeout(renderNextWord, 50);
                }
            };

            renderNextWord();
            doubtBtn.disabled = false;
            doubtBtn.textContent = 'Ask Doubt';
        });
    }
}