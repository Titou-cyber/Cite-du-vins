/**
 * La Cité Du Vin - Wine Knowledge & Education Module
 * 
 * This script powers the interactive wine education features including:
 * - Dynamic tabbed interface for different learning modules
 * - Interactive wine quiz with score tracking and visual feedback
 * - Animated glossary of wine terminology with filtering and search
 * - Interactive wine aroma wheel with detailed explanations
 * - Visual transition effects and scroll-based animations
 */

// DOM Elements for Tab Navigation
const tabButtons = document.querySelectorAll('.knowledge-tab');
const tabContents = document.querySelectorAll('.tab-pane');

// DOM Elements for Quiz
const startQuizButton = document.getElementById('start-quiz');
const quizIntro = document.getElementById('quiz-intro');
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const quizExplanationContainer = document.getElementById('quiz-explanation');
const nextButton = document.getElementById('next-question');
const prevButton = document.getElementById('prev-question');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const progressBar = document.getElementById('quiz-progress-bar');
const quizResults = document.getElementById('quiz-results');
const resultScoreSpan = document.getElementById('result-score');
const resultMessageP = document.getElementById('result-message');
const restartQuizButton = document.getElementById('restart-quiz');

// DOM Elements for Glossary
const glossaryContainer = document.getElementById('glossary-container');
const glossarySearch = document.getElementById('glossary-search');
const glossaryCategories = document.querySelectorAll('.glossary-category');
const glossaryCount = document.getElementById('glossary-count');

// DOM Elements for Aroma Wheel
const aromaWheel = document.getElementById('aroma-wheel');
const aromaSegments = document.querySelectorAll('.aroma-segment');
const aromaDescriptions = document.getElementById('aroma-descriptions');

// DOM Elements for Animations
const animateElements = document.querySelectorAll('.animate-on-scroll');

// Variables
let currentQuestion = 0;
let answers = [];
let score = 0;
let optionSelected = false;
let quizStarted = false;
let quizTimer;
let quizTimeLeft = 0;
let quizTimerInterval;
let isLoading = false;

// Quiz Questions with enhanced content
const questions = [
    {
        question: "Which of these is NOT a type of wine grape?",
        options: ["Merlot", "Chardonnay", "Bordeaux", "Zinfandel"],
        answer: 2, // Bordeaux (it's a region, not a grape)
        explanation: "Bordeaux is a famous wine region in France, not a grape variety. Merlot, Chardonnay, and Zinfandel are all grape varieties used to make wine. Bordeaux wines are typically blends of several grape varieties, particularly Cabernet Sauvignon and Merlot."
    },
    {
        question: "Which country is known for producing Chianti wine?",
        options: ["France", "Italy", "Spain", "Germany"],
        answer: 1, // Italy
        explanation: "Chianti is a red wine produced in the Chianti region of central Tuscany, Italy. It's primarily made from the Sangiovese grape variety and is known for its notes of cherry, dried herbs, and earth."
    },
    {
        question: "What gives red wine its color?",
        options: ["Added food coloring", "Grape juice", "Grape skins", "Aging in oak barrels"],
        answer: 2, // Grape skins
        explanation: "The color in red wine comes from pigments called anthocyanins found in the grape skins. During the fermentation process, the juice remains in contact with the skins, extracting color, tannins, and flavor compounds. White wines have minimal or no contact with grape skins."
    },
    {
        question: "What does 'terroir' refer to in wine making?",
        options: ["A type of grape", "The soil, climate, and environment where grapes are grown", "A fermentation technique", "The age of the wine"],
        answer: 1, // The soil, climate, and environment
        explanation: "Terroir refers to the complete natural environment in which a wine is produced, including factors like soil composition, climate, topography, and even farming practices. These environmental factors give the wine its unique characteristics and sense of place."
    },
    {
        question: "Which of these is a type of fortified wine?",
        options: ["Chardonnay", "Merlot", "Port", "Prosecco"],
        answer: 2, // Port
        explanation: "Port is a fortified wine from Portugal's Douro Valley. Fortified wines have spirits (usually brandy) added during fermentation, which stops the fermentation process, preserves some of the grape's natural sugars, and increases the alcohol content. Chardonnay and Merlot are grape varieties, while Prosecco is a sparkling wine."
    },
    {
        question: "Which grape variety is NOT traditionally used in Champagne production?",
        options: ["Chardonnay", "Pinot Noir", "Pinot Meunier", "Sauvignon Blanc"],
        answer: 3, // Sauvignon Blanc
        explanation: "Traditional Champagne production uses three main grape varieties: Chardonnay, Pinot Noir, and Pinot Meunier. Sauvignon Blanc is not traditionally used in Champagne production and is more commonly associated with regions like the Loire Valley, Bordeaux, and New Zealand."
    },
    {
        question: "What does 'vintage' refer to on a wine label?",
        options: ["The age of the winery", "The year the grapes were harvested", "The region where the wine was made", "The type of grape used"],
        answer: 1, // The year the grapes were harvested
        explanation: "Vintage refers to the year in which the grapes for a particular wine were harvested. This is significant because growing conditions vary from year to year, affecting the quality and character of the wine. Some years are considered better 'vintages' than others due to ideal growing conditions."
    },
    {
        question: "What does it mean when a wine is described as 'dry'?",
        options: ["It's not juicy", "It contains no alcohol", "It lacks sweetness", "It has no aroma"],
        answer: 2, // It lacks sweetness
        explanation: "A dry wine has little to no residual sugar, meaning it's not sweet. During fermentation, yeast converts grape sugar into alcohol. If all or most of the sugar is converted, the resulting wine is dry. The term has nothing to do with liquid content, alcohol level, or aroma."
    },
    {
        question: "Which wine region is famous for its Cabernet Sauvignon?",
        options: ["Champagne, France", "Burgundy, France", "Napa Valley, USA", "Rhine Valley, Germany"],
        answer: 2, // Napa Valley, USA
        explanation: "While Cabernet Sauvignon originated in Bordeaux, France, Napa Valley in California has become particularly renowned for producing exceptional Cabernet Sauvignon wines. The region's warm climate and diverse soils create ideal conditions for this grape variety, resulting in rich, full-bodied wines with intense dark fruit flavors."
    },
    {
        question: "What is the primary difference between Old World and New World wines?",
        options: ["The age of the vines", "The types of grapes used", "Geographic origin and winemaking tradition", "The shape of the bottles"],
        answer: 2, // Geographic origin and winemaking tradition
        explanation: "The primary difference between Old World (Europe, parts of Western Asia) and New World (Americas, Australia, South Africa) wines is geographic origin and winemaking philosophy. Old World regions tend to follow traditional practices with an emphasis on terroir, while New World regions often embrace innovation and may highlight varietal characteristics more prominently."
    },
    {
        question: "What is the ideal serving temperature for most red wines?",
        options: ["Room temperature (68-72°F/20-22°C)", "Slightly cool (60-65°F/15-18°C)", "Chilled (45-50°F/7-10°C)", "Cold (38-45°F/3-7°C)"],
        answer: 1, // Slightly cool
        explanation: "Contrary to common belief that red wine should be served at room temperature, most red wines are best served slightly cool at about 60-65°F (15-18°C). Full-bodied reds may be served at the higher end of this range, while lighter reds benefit from being slightly cooler. True room temperature is usually too warm and can make the wine taste overly alcoholic."
    },
    {
        question: "What process creates the bubbles in sparkling wine?",
        options: ["Adding carbonated water", "A second fermentation in the bottle or tank", "Artificially injecting carbon dioxide", "Pressing the grapes at high pressure"],
        answer: 1, // A second fermentation
        explanation: "The bubbles in sparkling wine come from a second fermentation process. After the still wine is made, additional yeast and sugar are added and the wine is sealed (in a bottle for traditional method or in a tank for Charmat method). The yeast consumes the sugar, producing more alcohol and carbon dioxide, which creates the bubbles."
    }
];

// Glossary Terms with enhanced descriptions
const glossaryTerms = [
    {
        term: "Acidity",
        definition: "The tart or sour taste in wine that makes it refreshing and provides structure. Wines with good acidity feel crisp and lively on the palate. It's an essential component for a wine's balance and longevity.",
        category: "Tasting"
    },
    {
        term: "Aeration",
        definition: "The process of allowing wine to breathe by exposing it to air, which can enhance aromas and flavors, particularly in young, tannic red wines.",
        category: "Serving"
    },
    {
        term: "Aging",
        definition: "The process of maturing wine over time, either in barrels, tanks, or bottles. Proper aging can improve a wine's complexity, integration, and smoothness.",
        category: "Production"
    },
    {
        term: "Appellation",
        definition: "A legally defined and protected geographical indication used to identify where grapes for a wine were grown. Appellations often come with specific regulations about grape varieties and winemaking practices.",
        category: "Regions"
    },
    {
        term: "Body",
        definition: "The perception of weight and fullness of a wine in your mouth, typically described as light, medium, or full. Body is influenced by alcohol content, sugar, and overall concentration.",
        category: "Tasting"
    },
    {
        term: "Bouquet",
        definition: "The complex aromas that develop in wines as they age, distinct from the primary grape aromas. These secondary and tertiary aromas might include notes of leather, earth, or dried fruits.",
        category: "Tasting"
    },
    {
        term: "Corked",
        definition: "A wine fault caused by a contaminated cork, resulting in musty, moldy aromas. Technically called 'cork taint,' it's caused by a compound called TCA and makes the wine undrinkable.",
        category: "Faults"
    },
    {
        term: "Decanting",
        definition: "The process of pouring wine from its bottle into another container (a decanter) to separate it from sediment and/or expose it to oxygen to enhance flavors and aromas.",
        category: "Serving"
    },
    {
        term: "Fermentation",
        definition: "The process where yeasts convert grape sugars into alcohol and carbon dioxide. This biological process transforms grape juice into wine.",
        category: "Production"
    },
    {
        term: "Finish",
        definition: "The taste and sensations that linger after swallowing wine. A long, pleasant finish is often a sign of high-quality wine.",
        category: "Tasting"
    },
    {
        term: "Legs",
        definition: "The streams of wine that run down the side of a glass after swirling, indicating alcohol content. Also called 'tears,' they're formed by the interaction of alcohol and surface tension.",
        category: "Tasting"
    },
    {
        term: "Malolactic Fermentation",
        definition: "A secondary fermentation process in which tart malic acid is converted to softer lactic acid, creating a creamier mouthfeel. Common in red wines and some white wines like Chardonnay.",
        category: "Production"
    },
    {
        term: "Nose",
        definition: "The aroma or bouquet of a wine, detected through smell. Professional tasters spend significant time evaluating a wine's nose before tasting.",
        category: "Tasting"
    },
    {
        term: "Oxidation",
        definition: "The chemical reaction that occurs when wine is exposed to oxygen. In small amounts, it can benefit a wine; excessive oxidation leads to a stale, flat wine.",
        category: "Faults"
    },
    {
        term: "Tannins",
        definition: "Compounds that create a drying, astringent sensation in the mouth, mainly found in red wines. They come primarily from grape skins, seeds, and stems, as well as oak aging.",
        category: "Tasting"
    },
    {
        term: "Terroir",
        definition: "The complete natural environment in which a wine is produced, including soil, climate, and topography. This French concept suggests that these environmental factors give wines their unique character.",
        category: "Regions"
    },
    {
        term: "Varietal",
        definition: "A wine named after the primary grape variety used to make it. In the US, a wine must contain at least 75% of the stated variety to be labeled as such.",
        category: "Wine Types"
    },
    {
        term: "Vintage",
        definition: "The year in which a wine's grapes were harvested. This is important because growing conditions vary year to year, affecting wine quality and character.",
        category: "Production"
    },
    {
        term: "Viticulture",
        definition: "The science, study, and production of grapes specifically for winemaking. It includes vineyard management practices that affect grape quality.",
        category: "Production"
    },
    {
        term: "Sommelier",
        definition: "A trained wine professional who specializes in all aspects of wine service and food pairing. Top sommeliers often earn certifications through rigorous testing programs.",
        category: "Profession"
    }
];

// Aroma Wheel Descriptions
const aromaCategories = {
    'fruit': {
        title: 'Fruit Aromas',
        desc: 'Fruit aromas in wine can range from fresh to dried, including berries, stone fruits, citrus, and tropical notes. Red wines often feature red and black fruits, while white wines lean toward citrus, orchard, and tropical fruits.',
        examples: 'Cherry, Blackberry, Lemon, Apple, Peach, Pineapple'
    },
    'floral': {
        title: 'Floral Aromas',
        desc: 'Floral notes add delicate aromatic qualities to wines. These are more common in white wines and some lighter reds like Pinot Noir.',
        examples: 'Rose, Violet, Jasmine, Orange Blossom, Lavender, Honeysuckle'
    },
    'spice': {
        title: 'Spice Aromas',
        desc: 'Spice notes can come from the grape variety itself or from oak aging. They add complexity and warmth to a wine\'s profile.',
        examples: 'Black Pepper, Cinnamon, Clove, Nutmeg, Vanilla, Licorice'
    },
    'earth': {
        title: 'Earth Aromas',
        desc: 'Earthy notes often reflect the terroir of a wine and are particularly prominent in Old World wines. These add depth and complexity.',
        examples: 'Forest Floor, Mushroom, Wet Stone, Potting Soil, Leather, Tobacco'
    },
    'oak': {
        title: 'Oak & Toast Aromas',
        desc: 'These aromas come from aging wine in oak barrels. The intensity depends on factors like barrel age, toast level, and aging time.',
        examples: 'Vanilla, Smoke, Cedar, Coffee, Chocolate, Caramel, Coconut'
    },
    'mineral': {
        title: 'Mineral Aromas',
        desc: 'Mineral notes are often associated with specific soil types and can give wines a distinctive character and sense of place.',
        examples: 'Flint, Chalk, Slate, Saline, Wet Stone, Petrichor'
    }
};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the wine knowledge application
 */
function initialize() {
    console.log('Initializing Wine Knowledge Module');
    
    // Set up tab navigation
    setupTabs();
    
    // Set up quiz if quiz elements exist
    if (startQuizButton && quizIntro) {
        initQuiz();
    }
    
    // Set up glossary if glossary elements exist
    if (glossaryContainer && glossaryCategories) {
        setupGlossary();
    }
    
    // Set up aroma wheel if it exists
    if (aromaWheel && aromaSegments) {
        setupAromaWheel();
    }
    
    // Set up scroll reveal animations
    setupScrollAnimations();
}

/**
 * Set up tab navigation with smooth transitions
 */
function setupTabs() {
    if (!tabButtons.length || !tabContents.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get target tab
            const targetTab = button.getAttribute('data-tab');
            
            // Skip if already active
            if (button.classList.contains('active')) return;
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button with animation
            button.classList.add('active');
            
            // Hide all tab contents with fade out
            tabContents.forEach(content => {
                content.classList.add('tab-fade-out');
                
                setTimeout(() => {
                    content.classList.remove('active');
                    content.classList.remove('tab-fade-out');
                    content.style.display = 'none';
                }, 200);
            });
            
            // Show target tab content with fade in
            setTimeout(() => {
                const tabContent = document.getElementById(`${targetTab}-tab-content`);
                if (tabContent) {
                    tabContent.classList.add('active');
                    tabContent.style.display = 'block';
                    tabContent.classList.add('tab-fade-in');
                    
                    setTimeout(() => {
                        tabContent.classList.remove('tab-fade-in');
                    }, 200);
                }
            }, 210);
        });
    });
    
    // Set initial tab visibility
    tabContents.forEach((content, index) => {
        if (index === 0) {
            content.style.display = 'block';
            content.classList.add('active');
        } else {
            content.style.display = 'none';
        }
    });
}

/**
 * Initialize Quiz functionality
 */
function initQuiz() {
    // Set up event listeners
    startQuizButton.addEventListener('click', startQuiz);
    
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
    
    // Update total questions display
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = questions.length;
    }
    
    // Preload quiz content for faster transitions
    preloadQuizContent();
}

/**
 * Preload quiz content for faster transitions
 */
function preloadQuizContent() {
    // Create hidden container for preloading
    const preloadContainer = document.createElement('div');
    preloadContainer.style.display = 'none';
    document.body.appendChild(preloadContainer);
    
    // Preload question content
    questions.forEach((question) => {
        const preloadQuestion = document.createElement('div');
        preloadQuestion.innerHTML = `
            <h4 class="question mb-4">${question.question}</h4>
            <div class="options">
                ${question.options.map((option, optIndex) => `
                    <div class="quiz-option" data-index="${optIndex}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
        preloadContainer.appendChild(preloadQuestion);
    });
    
    // Cleanup after preloading
    setTimeout(() => {
        document.body.removeChild(preloadContainer);
    }, 1000);
}

/**
 * Start the quiz
 */
function startQuiz() {
    if (isLoading) return;
    isLoading = true;
    
    // Show loading animation
    if (quizIntro) {
        quizIntro.innerHTML = `
            <div class="text-center">
                <div class="spinner">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                </div>
                <p class="mt-3">Preparing your wine knowledge quiz...</p>
            </div>
        `;
    }
    
    // Simulate loading for smoother transition
    setTimeout(() => {
        quizIntro.classList.add('slide-out');
        
        setTimeout(() => {
            quizIntro.classList.add('d-none');
            quizIntro.classList.remove('slide-out');
            quizContainer.classList.remove('d-none');
            quizContainer.classList.add('slide-in');
            
            setTimeout(() => {
                quizContainer.classList.remove('slide-in');
                isLoading = false;
            }, 300);
        }, 300);
        
        // Reset quiz state
        quizStarted = true;
        currentQuestion = 0;
        answers = new Array(questions.length).fill(null);
        score = 0;
        
        // Start timer if enabled
        if (document.getElementById('quiz-timer')) {
            startQuizTimer();
        }
        
        // Display first question
        displayQuestion();
    }, 800);
}

/**
 * Start quiz timer
 */
function startQuizTimer() {
    const timerEl = document.getElementById('quiz-timer');
    if (!timerEl) return;
    
    // Clear any existing timer
    if (quizTimerInterval) {
        clearInterval(quizTimerInterval);
    }
    
    // Set timer for 10 minutes
    quizTimeLeft = 10 * 60;
    updateTimerDisplay();
    
    quizTimerInterval = setInterval(() => {
        quizTimeLeft--;
        
        if (quizTimeLeft <= 0) {
            clearInterval(quizTimerInterval);
            
            // Time's up - finish quiz
            finishQuiz(true);
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (!timerEl) return;
    
    const minutes = Math.floor(quizTimeLeft / 60);
    const seconds = quizTimeLeft % 60;
    
    timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Add warning class when time is running low
    if (quizTimeLeft <= 60) {
        timerEl.classList.add('timer-warning');
    } else {
        timerEl.classList.remove('timer-warning');
    }
}

/**
 * Display current question with animation
 */
function displayQuestion() {
    // Update question number and progress bar
    if (currentQuestionSpan) {
        currentQuestionSpan.textContent = currentQuestion + 1;
    }
    
    if (progressBar) {
        const progress = ((currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Reset option selected flag
    optionSelected = answers[currentQuestion] !== null;
    
    // Enable/disable next button based on selection
    if (nextButton) {
        nextButton.disabled = !optionSelected;
    }
    
    // Fade out current question
    if (questionContainer) {
        questionContainer.classList.add('question-fade-out');
        
        setTimeout(() => {
            // Get current question
            const question = questions[currentQuestion];
            
            // Create question HTML
            questionContainer.innerHTML = `
                <h4 class="question mb-4">${question.question}</h4>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option ${answers[currentQuestion] === index ? 
                            (answers[currentQuestion] === question.answer ? 'correct' : 'incorrect') : ''}" 
                            data-index="${index}">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Set up event listeners for options
            const questionOptions = questionContainer.querySelectorAll('.quiz-option');
            questionOptions.forEach(option => {
                option.addEventListener('click', () => {
                    selectOption(option, questionOptions);
                });
            });
            
            // If answer already selected, show explanation
            if (answers[currentQuestion] !== null) {
                displayExplanation(answers[currentQuestion] === question.answer);
            } else {
                if (quizExplanationContainer) {
                    quizExplanationContainer.classList.add('d-none');
                }
            }
            
            // Show/hide previous/next buttons
            if (prevButton) {
                if (currentQuestion === 0) {
                    prevButton.classList.add('d-none');
                } else {
                    prevButton.classList.remove('d-none');
                }
            }
            
            if (nextButton) {
                if (currentQuestion === questions.length - 1) {
                    nextButton.textContent = 'Finish Quiz';
                    nextButton.classList.add('btn-finish');
                } else {
                    nextButton.textContent = 'Next Question';
                    nextButton.classList.remove('btn-finish');
                }
            }
            
            // Fade in new question
            questionContainer.classList.remove('question-fade-out');
            questionContainer.classList.add('question-fade-in');
            
            setTimeout(() => {
                questionContainer.classList.remove('question-fade-in');
            }, 300);
        }, 300);
    }
}

/**
 * Handle option selection
 * @param {HTMLElement} selectedOption - The selected option element
 * @param {NodeList} allOptions - All option elements
 */
function selectOption(selectedOption, allOptions) {
    // Get current question
    const question = questions[currentQuestion];
    
    // Clear previous selections
    allOptions.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Set current selection
    const selectedIndex = parseInt(selectedOption.getAttribute('data-index'));
    answers[currentQuestion] = selectedIndex;
    
    // Add appropriate classes
    if (selectedIndex === question.answer) {
        selectedOption.classList.add('selected', 'correct');
    } else {
        selectedOption.classList.add('selected', 'incorrect');
        // Find and mark correct answer
        allOptions[question.answer].classList.add('correct');
    }
    
    // Show explanation
    displayExplanation(selectedIndex === question.answer);
    
    // Enable next button
    optionSelected = true;
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.classList.add('pulse-once');
        setTimeout(() => {
            nextButton.classList.remove('pulse-once');
        }, 1000);
    }
}

/**
 * Display explanation for current question
 * @param {boolean} isCorrect - Whether the answer is correct
 */
function displayExplanation(isCorrect) {
    if (!quizExplanationContainer) return;
    
    const question = questions[currentQuestion];
    
    quizExplanationContainer.innerHTML = `
        <p class="font-weight-bold mb-2">
            ${isCorrect ? '<i class="fas fa-check-circle"></i> Correct!' : 
                        `<i class="fas fa-times-circle"></i> Incorrect. The correct answer is: ${question.options[question.answer]}`}
        </p>
        <p class="mb-0">${question.explanation}</p>
    `;
    
    quizExplanationContainer.classList.remove('d-none', 'correct', 'incorrect');
    
    // Fade in explanation
    quizExplanationContainer.classList.add('explanation-fade-in');
    quizExplanationContainer.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
        quizExplanationContainer.classList.remove('explanation-fade-in');
    }, 300);
}

/**
 * Go to next question
 */
function goToNextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

/**
 * Go to previous question
 */
function goToPrevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

/**
 * Finish the quiz and show results
 * @param {boolean} timeExpired - Whether the quiz time expired
 */
function finishQuiz(timeExpired = false) {
    // Stop timer if active
    if (quizTimerInterval) {
        clearInterval(quizTimerInterval);
        quizTimerInterval = null;
    }
    
    // Calculate score
    score = 0;
    questions.forEach((question, index) => {
        if (answers[index] === question.answer) {
            score++;
        }
    });
    
    // Update UI with animation
    if (quizContainer && quizResults) {
        quizContainer.classList.add('slide-out');
        
        setTimeout(() => {
            quizContainer.classList.add('d-none');
            quizContainer.classList.remove('slide-out');
            quizResults.classList.remove('d-none');
            quizResults.classList.add('slide-in');
            
            setTimeout(() => {
                quizResults.classList.remove('slide-in');
            }, 300);
        }, 300);
    }
    
    // Calculate percentage
    const scorePercentage = Math.round((score / questions.length) * 100);
    
    // Update result elements
    if (resultScoreSpan) {
        resultScoreSpan.textContent = score;
    }
    
    if (document.getElementById('total-questions')) {
        document.getElementById('total-questions').textContent = questions.length;
    }
    
    if (document.getElementById('score-percentage')) {
        document.getElementById('score-percentage').textContent = scorePercentage;
    }
    
    // Update circular progress
    const circularProgress = document.querySelector('.result-progress');
    if (circularProgress) {
        circularProgress.style.setProperty('--progress', `${scorePercentage}%`);
    }
    
    // Set result message
    if (resultMessageP) {
        let message = '';
        if (timeExpired) {
            message = "Time's up! Here's how you did:";
        } else if (score <= 3) {
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
    
    // Show quiz statistics
    updateQuizStatistics();
}

/**
 * Update quiz statistics display
 */
function updateQuizStatistics() {
    const statsContainer = document.getElementById('quiz-statistics');
    if (!statsContainer) return;
    
    // Calculate statistics
    const answeredQuestions = answers.filter(answer => answer !== null).length;
    const correctAnswers = answers.reduce((count, answer, index) => {
        return count + (answer === questions[index].answer ? 1 : 0);
    }, 0);
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const unansweredQuestions = answers.filter(answer => answer === null).length;
    
    // Create statistics content
    statsContainer.innerHTML = `
        <div class="stats-item">
            <div class="stat-circle correct">
                <span>${correctAnswers}</span>
            </div>
            <p>Correct</p>
        </div>
        <div class="stats-item">
            <div class="stat-circle incorrect">
                <span>${incorrectAnswers}</span>
            </div>
            <p>Incorrect</p>
        </div>
        <div class="stats-item">
            <div class="stat-circle unanswered">
                <span>${unansweredQuestions}</span>
            </div>
            <p>Unanswered</p>
        </div>
    `;
    
    // Add animation class
    statsContainer.querySelectorAll('.stat-circle').forEach((circle, index) => {
        setTimeout(() => {
            circle.classList.add('stat-circle-animate');
        }, index * 200);
    });
}

/**
 * Restart the quiz
 */
function restartQuiz() {
    // Reset quiz state
    quizStarted = false;
    currentQuestion = 0;
    answers = new Array(questions.length).fill(null);
    score = 0;
    optionSelected = false;
    
    // Reset progress bar
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    // Hide results, show intro with animation
    if (quizResults && quizIntro) {
        quizResults.classList.add('slide-out');
        
        setTimeout(() => {
            quizResults.classList.add('d-none');
            quizResults.classList.remove('slide-out');
            quizIntro.classList.remove('d-none');
            quizIntro.classList.add('slide-in');
            
            setTimeout(() => {
                quizIntro.classList.remove('slide-in');
            }, 300);
        }, 300);
    }
}

/**
 * Set up glossary filtering and search
 */
function setupGlossary() {
    if (!glossaryContainer) return;
    
    // Populate glossary initially
    populateGlossary(glossaryTerms, glossaryContainer);
    
    // Update term count
    if (glossaryCount) {
        glossaryCount.textContent = glossaryTerms.length;
    }
    
    // Set up search functionality
    if (glossarySearch) {
        glossarySearch.addEventListener('input', () => {
            const searchTerm = glossarySearch.value.toLowerCase();
            const activeCategory = document.querySelector('.glossary-category.active')?.getAttribute('data-category') || 'all';
            
            filterGlossary(searchTerm, activeCategory);
        });
    }
    
    // Set up category filters
    if (glossaryCategories.length > 0) {
        glossaryCategories.forEach(filter => {
            filter.addEventListener('click', () => {
                // Toggle active class
                glossaryCategories.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                const category = filter.getAttribute('data-category');
                const searchTerm = glossarySearch ? glossarySearch.value.toLowerCase() : '';
                
                filterGlossary(searchTerm, category);
            });
        });
    }
}

/**
 * Populate glossary with terms
 * @param {Array} terms - Glossary terms to display
 * @param {HTMLElement} container - Container element
 */
function populateGlossary(terms, container) {
    container.innerHTML = '';
    
    if (terms.length === 0) {
        container.innerHTML = `
            <div class="glossary-empty">
                <i class="fas fa-search"></i>
                <p>No matching terms found.</p>
            </div>
        `;
        return;
    }
    
    // Sort terms alphabetically
    terms.sort((a, b) => a.term.localeCompare(b.term));
    
    let currentLetter = '';
    let letterGroup;
    
    terms.forEach((term, index) => {
        // Create letter divider if needed
        const firstLetter = term.term.charAt(0).toUpperCase();
        
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            
            letterGroup = document.createElement('div');
            letterGroup.className = 'glossary-letter-group fade-in';
            letterGroup.style.animationDelay = `${index * 0.05}s`;
            
            letterGroup.innerHTML = `
                <div class="letter-divider">
                    <span>${currentLetter}</span>
                </div>
            `;
            
            container.appendChild(letterGroup);
        }
        
        // Create term element
        const termElement = document.createElement('div');
        termElement.className = 'glossary-term fade-in';
        termElement.style.animationDelay = `${index * 0.05}s`;
        
        termElement.innerHTML = `
            <dt>
                ${term.term}
                <span class="term-category">${term.category}</span>
            </dt>
            <dd>${term.definition}</dd>
        `;
        
        letterGroup.appendChild(termElement);
    });
}

/**
 * Filter glossary by search term and category
 * @param {string} searchTerm - Search term
 * @param {string} category - Category filter
 */
function filterGlossary(searchTerm, category) {
    if (!glossaryContainer) return;
    
    // Apply filters
    let filteredTerms = glossaryTerms;
    
    // Filter by category
    if (category && category !== 'all') {
        filteredTerms = filteredTerms.filter(term => term.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredTerms = filteredTerms.filter(term => 
            term.term.toLowerCase().includes(searchTerm) || 
            term.definition.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update term count
    if (glossaryCount) {
        glossaryCount.textContent = filteredTerms.length;
    }
    
    // Display filtered terms
    populateGlossary(filteredTerms, glossaryContainer);
}

/**
 * Set up wine aroma wheel
 */
function setupAromaWheel() {
    if (!aromaWheel || !aromaSegments) return;
    
    // Set up click handlers for segments
    aromaSegments.forEach(segment => {
        segment.addEventListener('click', () => {
            // Toggle active state
            aromaSegments.forEach(s => s.classList.remove('active'));
            segment.classList.add('active');
            
            // Get aroma category
            const category = segment.getAttribute('data-category');
            
            // Update description
            if (aromaDescriptions) {
                const aroma = aromaCategories[category] || {
                    title: 'Select a category',
                    desc: 'Click on a segment of the aroma wheel to learn about different wine aroma categories.',
                    examples: ''
                };
                
                aromaDescriptions.innerHTML = `
                    <h4>${aroma.title}</h4>
                    <p>${aroma.desc}</p>
                    ${aroma.examples ? `<p class="aroma-examples"><strong>Examples:</strong> ${aroma.examples}</p>` : ''}
                `;
                
                aromaDescriptions.classList.add('fade-in');
                setTimeout(() => {
                    aromaDescriptions.classList.remove('fade-in');
                }, 500);
            }
        });
    });
}

/**
 * Set up scroll animations
 */
function setupScrollAnimations() {
    if (!animateElements.length) return;
    
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements
        animateElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animateElements.forEach(element => {
            element.classList.add('animated');
        });
    }
}

/**
 * Reset glossary filters - exposed for HTML access
 */
window.resetGlossaryFilters = function() {
    if (glossarySearch) {
        glossarySearch.value = '';
    }
    
    if (glossaryCategories.length > 0) {
        glossaryCategories.forEach(filter => {
            filter.classList.remove('active');
        });
        
        // Set 'All' category active
        const allFilter = document.querySelector('.glossary-category[data-category="all"]');
        if (allFilter) {
            allFilter.classList.add('active');
        }
    }
    
    // Reset filters
    filterGlossary('', 'all');
};

/**
 * Show a specific aroma category - exposed for HTML access
 * @param {string} category - Aroma category to display
 */
window.showAromaCategory = function(category) {
    const segment = document.querySelector(`.aroma-segment[data-category="${category}"]`);
    if (segment) {
        segment.click();
    }
};

/**
 * Show a notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
window.showNotification = function(message, type = 'info', duration = 4000) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add click handler to close button
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Auto-dismiss after duration
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
};