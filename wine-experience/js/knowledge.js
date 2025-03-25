// Wine Knowledge and Quiz JavaScript

// DOM Elements for Quiz
const startQuizButton = document.getElementById('start-quiz');
const quizIntro = document.getElementById('quiz-intro');
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const nextButton = document.getElementById('next-question');
const prevButton = document.getElementById('prev-question');
const currentQuestionSpan = document.getElementById('current-question');
const progressBar = document.getElementById('quiz-progress');
const quizResults = document.getElementById('quiz-results');
const resultScoreSpan = document.getElementById('result-score');
const resultMessageP = document.getElementById('result-message');
const restartQuizButton = document.getElementById('restart-quiz');

// Quiz Variables
let currentQuestion = 0;
let answers = [];
let score = 0;

// Quiz Questions
const questions = [
    {
        question: "Which of these is NOT a type of wine?",
        options: ["Merlot", "Chardonnay", "Bordeaux", "Zinfandel"],
        answer: 2, // Bordeaux (it's a region, not a grape)
        explanation: "Bordeaux is a famous wine region in France, not a type of wine. Merlot, Chardonnay, and Zinfandel are all grape varieties used to make wine."
    },
    {
        question: "Which country is known for producing Chianti wine?",
        options: ["France", "Italy", "Spain", "Germany"],
        answer: 1, // Italy
        explanation: "Chianti is a red wine produced in the Chianti region of Tuscany, Italy."
    },
    {
        question: "What gives red wine its color?",
        options: ["Added food coloring", "Grape juice", "Grape skins", "Aging in oak barrels"],
        answer: 2, // Grape skins
        explanation: "The color in red wine comes from the grape skins during the fermentation process. White wines have minimal contact with grape skins."
    },
    {
        question: "What does 'terroir' refer to in wine making?",
        options: ["A type of grape", "The soil, climate, and environment where grapes are grown", "A fermentation technique", "The age of the wine"],
        answer: 1, // The soil, climate, and environment
        explanation: "Terroir refers to the complete natural environment in which a wine is produced, including factors like soil, climate, and topography that give the wine its unique characteristics."
    },
    {
        question: "Which of these is a type of fortified wine?",
        options: ["Chardonnay", "Merlot", "Port", "Prosecco"],
        answer: 2, // Port
        explanation: "Port is a fortified wine from Portugal, meaning that grape spirits are added during fermentation. Chardonnay and Merlot are grape varieties, while Prosecco is a sparkling wine."
    },
    {
        question: "What is the primary grape variety used in traditional Champagne production?",
        options: ["Sauvignon Blanc", "Cabernet Sauvignon", "Chardonnay", "Pinot Noir"],
        answer: 3, // Pinot Noir
        explanation: "Pinot Noir is the most widely planted grape in the Champagne region, though Champagne often uses a blend of Pinot Noir, Chardonnay, and Pinot Meunier."
    },
    {
        question: "What does 'vintage' refer to on a wine label?",
        options: ["The age of the winery", "The year the grapes were harvested", "The region where the wine was made", "The type of grape used"],
        answer: 1, // The year the grapes were harvested
        explanation: "Vintage refers to the year in which the grapes for a particular wine were harvested."
    },
    {
        question: "What does it mean when a wine is described as 'dry'?",
        options: ["It's not juicy", "It contains no alcohol", "It lacks sweetness", "It has no aroma"],
        answer: 2, // It lacks sweetness
        explanation: "A dry wine has little to no residual sugar, meaning it's not sweet. The term does not refer to the liquid content, alcohol level, or aroma."
    },
    {
        question: "Which wine region is famous for Cabernet Sauvignon?",
        options: ["Champagne, France", "Burgundy, France", "Napa Valley, USA", "Rhine Valley, Germany"],
        answer: 2, // Napa Valley, USA
        explanation: "While Cabernet Sauvignon originated in Bordeaux, Napa Valley in California is particularly renowned for its exceptional Cabernet Sauvignon wines."
    },
    {
        question: "What should you look for when examining a wine's appearance?",
        options: ["The shape of the bottle", "Color, clarity, and viscosity", "The label design", "The cork quality"],
        answer: 1, // Color, clarity, and viscosity
        explanation: "When visually examining wine, you should assess its color, clarity (how transparent or opaque it is), and viscosity (how it clings to the glass when swirled)."
    }
];

// Initialize Quiz
document.addEventListener('DOMContentLoaded', initQuiz);

function initQuiz() {
    // Set up event listeners
    if (startQuizButton) {
        startQuizButton.addEventListener('click', startQuiz);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', goToNextQuestion);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', goToPrevQuestion);
    }
    
    if (restartQuizButton) {
        restartQuizButton.addEventListener('click', restartQuiz);
    }
    
    // Initialize answers array
    answers = new Array(questions.length).fill(null);
}

// Start the quiz
function startQuiz() {
    quizIntro.classList.add('d-none');
    quizContainer.classList.remove('d-none');
    quizResults.classList.add('d-none');
    
    currentQuestion = 0;
    answers = new Array(questions.length).fill(null);
    
    displayQuestion();
}

// Display current question
function displayQuestion() {
    // Update question number and progress bar
    currentQuestionSpan.textContent = currentQuestion + 1;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    
    // Display question and options
    const question = questions[currentQuestion];
    
    questionContainer.innerHTML = `
        <h4 class="question mb-4">${question.question}</h4>
        <div class="options">
            ${question.options.map((option, index) => `
                <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="question-option" id="option-${index}" value="${index}" ${answers[currentQuestion] === index ? 'checked' : ''}>
                    <label class="form-check-label" for="option-${index}">
                        ${option}
                    </label>
                </div>
            `).join('')}
        </div>
        ${answers[currentQuestion] !== null ? `
            <div class="mt-4 p-3 ${answers[currentQuestion] === question.answer ? 'bg-success' : 'bg-danger'} text-white rounded">
                <p class="mb-0">
                    ${answers[currentQuestion] === question.answer 
                        ? '<strong>Correct!</strong>' 
                        : `<strong>Incorrect.</strong> The correct answer is: ${question.options[question.answer]}`
                    }
                </p>
                <p class="mt-2 mb-0">${question.explanation}</p>
            </div>
        ` : ''}
    `;
    
    // Set up event listeners for radio buttons
    const radioButtons = questionContainer.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            answers[currentQuestion] = parseInt(radio.value);
            displayQuestion(); // Refresh to show feedback
        });
    });
    
    // Show/hide previous/next buttons
    if (currentQuestion === 0) {
        prevButton.classList.add('d-none');
    } else {
        prevButton.classList.remove('d-none');
    }
    
    if (currentQuestion === questions.length - 1) {
        nextButton.textContent = 'Finish Quiz';
    } else {
        nextButton.textContent = 'Next';
    }
}

// Go to next question
function goToNextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

// Go to previous question
function goToPrevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// Finish the quiz and show results
function finishQuiz() {
    // Calculate score
    score = 0;
    questions.forEach((question, index) => {
        if (answers[index] === question.answer) {
            score++;
        }
    });
    
    // Update UI
    quizContainer.classList.add('d-none');
    quizResults.classList.remove('d-none');
    
    resultScoreSpan.textContent = score;
    
    // Set result message
    let message = '';
    if (score <= 3) {
        message = "Wine Novice: You're just starting your wine journey. Keep learning!";
    } else if (score <= 6) {
        message = "Wine Enthusiast: You have a good foundation of wine knowledge. Keep exploring!";
    } else if (score <= 9) {
        message = "Wine Aficionado: Impressive knowledge of wine! You know your grapes well.";
    } else {
        message = "Wine Master: Outstanding! You have expert-level wine knowledge.";
    }
    
    resultMessageP.textContent = message;
}

// Restart the quiz
function restartQuiz() {
    startQuiz();
}
