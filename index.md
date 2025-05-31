<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>707 Online English Learning Center</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            scroll-behavior: smooth;
        }
        .section {
            min-height: 100vh;
            padding: 2rem;
        }
        .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .nav-link {
            position: relative;
            transition: color 0.3s ease;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: #4F46E5;
            transition: width 0.3s ease;
        }
        .nav-link:hover::after {
            width: 100%;
        }
        .resource-link {
            transition: all 0.3s ease;
        }
        .resource-link:hover {
            transform: translateX(5px);
        }
        .hero-pattern {
            background-color: #f9fafb;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234f46e5' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-md fixed w-full z-10">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-book-reader text-indigo-600 text-2xl"></i>
                    <span class="text-xl font-bold text-gray-800">707 Online English</span>
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="nav-link text-gray-700 hover:text-indigo-600">Home</a>
                    <a href="#quiz" class="nav-link text-gray-700 hover:text-indigo-600">Quiz</a>
                    <a href="#games" class="nav-link text-gray-700 hover:text-indigo-600">Games</a>
                    <a href="#vocabulary" class="nav-link text-gray-700 hover:text-indigo-600">Vocabulary</a>
                    <a href="#writing" class="nav-link text-gray-700 hover:text-indigo-600">Writing</a>
                    <a href="#listening" class="nav-link text-gray-700 hover:text-indigo-600">Listening</a>
                    <a href="#reading" class="nav-link text-gray-700 hover:text-indigo-600">Reading</a>
                    <a href="#grammar" class="nav-link text-gray-700 hover:text-indigo-600">Grammar</a>
                </div>
                <div class="md:hidden">
                    <button id="mobile-menu-button" class="text-gray-500 hover:text-indigo-600 focus:outline-none">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        <!-- Mobile Navigation Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
            <div class="container mx-auto px-4 py-2">
                <a href="#home" class="block py-2 text-gray-700 hover:text-indigo-600">Home</a>
                <a href="#quiz" class="block py-2 text-gray-700 hover:text-indigo-600">Quiz</a>
                <a href="#games" class="block py-2 text-gray-700 hover:text-indigo-600">Games</a>
                <a href="#vocabulary" class="block py-2 text-gray-700 hover:text-indigo-600">Vocabulary</a>
                <a href="#writing" class="block py-2 text-gray-700 hover:text-indigo-600">Writing</a>
                <a href="#listening" class="block py-2 text-gray-700 hover:text-indigo-600">Listening</a>
                <a href="#reading" class="block py-2 text-gray-700 hover:text-indigo-600">Reading</a>
                <a href="#grammar" class="block py-2 text-gray-700 hover:text-indigo-600">Grammar</a>
            </div>
        </div>
    </nav>

    <!-- Home / Main Page -->
    <section id="home" class="section pt-24 hero-pattern">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Welcome to 707 Online English Learning Center</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Your trusted companion on the journey to English fluency</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome, Students and Parents!</h2>
                <div class="text-gray-600 mb-6">
                    <p class="mb-4">We're delighted to welcome you to the 707 Online English Learning Center. This interactive platform has been designed to support your English learning journey with a wealth of resources for both in-class study and independent practice at home.</p>
                    <p class="mb-4">Our site will be regularly updated with fresh materials, exercises, and learning tools to help you build confidence and proficiency in all areas of English language skills.</p>
                    <p>Whether you're preparing for exams like PET, KET, or FCE, looking to enhance your grammar knowledge, or simply wanting to practice through fun games and quizzes, we have resources tailored to meet your needs.</p>
                </div>
                
                <div class="bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500">
                    <p class="text-indigo-700"><i class="fas fa-lightbulb text-indigo-500 mr-2"></i> <strong>Learning Tip:</strong> Consistency is key! Even 15 minutes of daily practice can significantly improve your English skills over time.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">ESL Grammar Resources</h3>
                    <p class="text-gray-600 mb-4">Access comprehensive grammar explanations, exercises, and practice materials designed specifically for English language learners.</p>
                    <a href="#grammar" class="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
                        Explore Grammar Resources <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">PET/KET/FCE Study Resources</h3>
                    <p class="text-gray-600 mb-4">Prepare for your Cambridge English exams with our specialized materials, practice tests, and exam strategies.</p>
                    <a href="#quiz" class="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
                        Access Exam Resources <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">Learning Strategies</h3>
                    <p class="text-gray-600 mb-4">Discover effective techniques and approaches to enhance your language learning experience and maximize your progress.</p>
                    <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
                        Learn Study Tips <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-medium text-gray-700 mb-2">For Students:</h3>
                        <ul class="list-disc list-inside text-gray-600 space-y-2">
                            <li>Browse our resources by category using the navigation menu</li>
                            <li>Take a placement quiz to discover your current level</li>
                            <li>Set up a regular study schedule with a mix of activities</li>
                            <li>Track your progress with our interactive exercises</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-700 mb-2">For Parents:</h3>
                        <ul class="list-disc list-inside text-gray-600 space-y-2">
                            <li>Familiarize yourself with the available learning resources</li>
                            <li>Help establish a consistent learning routine at home</li>
                            <li>Encourage regular practice with our interactive tools</li>
                            <li>Check our parent guides for supporting language learning</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quiz Section -->
    <section id="quiz" class="section bg-gray-50 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Quiz Center</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Test your knowledge and track your progress with our collection of interactive quizzes</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Cambridge Exam Preparation</h3>
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">All Levels</span>
                    </div>
                    <p class="text-gray-600 mb-4">Practice with quiz formats designed to simulate PET, KET, and FCE exams. Get comfortable with the question types and timing.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Reading Comprehension Quiz</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Vocabulary Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Use of English Quiz</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Cambridge Quizzes <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Grammar Quizzes</h3>
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">All Levels</span>
                    </div>
                    <p class="text-gray-600 mb-4">Test your understanding of various grammar concepts with our interactive exercises and receive instant feedback.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Verb Tenses Quiz</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Prepositions Challenge</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Conditionals Quiz</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Grammar Quizzes <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Vocabulary Quizzes</h3>
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">All Levels</span>
                    </div>
                    <p class="text-gray-600 mb-4">Expand your vocabulary with quizzes covering different themes, common expressions, and exam-specific terminology.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Synonyms and Antonyms Quiz</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Phrasal Verbs Challenge</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Academic Word List Quiz</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Vocabulary Quizzes <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-8">
                <div class="flex items-center mb-6">
                    <div class="text-indigo-600 text-3xl mr-4">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800">Placement Tests</h3>
                </div>
                <p class="text-gray-600 mb-6">Not sure where to start? Take our comprehensive placement tests to determine your current English level and get recommendations for suitable learning materials.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="#" class="block bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-md transition">General English Placement Test</a>
                    <a href="#" class="block bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-md transition">Grammar Assessment</a>
                    <a href="#" class="block bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-md transition">Vocabulary Level Check</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Games Section -->
    <section id="games" class="section bg-white py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Fun Learning Games</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Make learning English enjoyable with our collection of interactive games</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <img class="w-16 h-16 mb-4" src="https://cdn-icons-png.flaticon.com/512/2822/2822617.png" alt="Vocabulary Games Icon">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Vocabulary Games</h3>
                    <p class="text-gray-600 mb-4">Expand your word knowledge through engaging, interactive vocabulary games.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Word Association Challenge</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Vocabulary Matching Game</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Word Builder Challenge</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Play Vocabulary Games <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <img class="w-16 h-16 mb-4" src="https://cdn-icons-png.flaticon.com/512/3721/3721906.png" alt="Grammar Games Icon">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Grammar Games</h3>
                    <p class="text-gray-600 mb-4">Practice grammar rules and structures in a fun, engaging way with these interactive games.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Sentence Builder</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Grammar Spot the Error</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Tense Challenge</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Play Grammar Games <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <img class="w-16 h-16 mb-4" src="https://cdn-icons-png.flaticon.com/512/2703/2703990.png" alt="Pronunciation Games Icon">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Pronunciation Games</h3>
                    <p class="text-gray-600 mb-4">Improve your English pronunciation with fun, interactive speaking games and activities.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Minimal Pairs Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Tongue Twisters Challenge</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-gamepad text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Intonation Patterns Game</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Play Pronunciation Games <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-indigo-50 rounded-lg shadow-lg p-8">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-2/3 mb-6 md:mb-0 md:mr-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Featured Game: Word Explorer Adventure</h3>
                        <p class="text-gray-600 mb-4">Embark on a language learning journey with our interactive Word Explorer Adventure game. Build your vocabulary while navigating through challenging language puzzles and activities.</p>
                        <ul class="mb-4 space-y-2">
                            <li class="flex items-center text-gray-700">
                                <i class="fas fa-check text-indigo-500 mr-2"></i>
                                Multiple difficulty levels for all learners
                            </li>
                            <li class="flex items-center text-gray-700">
                                <i class="fas fa-check text-indigo-500 mr-2"></i>
                                Track your progress and earn achievements
                            </li>
                            <li class="flex items-center text-gray-700">
                                <i class="fas fa-check text-indigo-500 mr-2"></i>
                                Challenge friends and classmates
                            </li>
                        </ul>
                        <a href="#" class="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition">
                            Play Now <i class="fas fa-play ml-2"></i>
                        </a>
                    </div>
                    <div class="md:w-1/3">
                        <img class="rounded-lg shadow-md mx-auto" src="https://cdn-icons-png.flaticon.com/512/2452/2452226.png" alt="Word Explorer Adventure" width="180">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Vocabulary Section -->
    <section id="vocabulary" class="section bg-gray-50 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Vocabulary Resources</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Expand your English vocabulary with our comprehensive resources</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Thematic Vocabulary Lists</h3>
                    <p class="text-gray-600 mb-4">Access word lists organized by themes to build vocabulary in specific areas.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Travel & Tourism Vocabulary</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Business English Terminology</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Academic Word List</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Vocabulary Lists <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-puzzle-piece"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Vocabulary Building Activities</h3>
                    <p class="text-gray-600 mb-4">Interactive exercises to help memorize and use new vocabulary effectively.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Word Association Exercises</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Contextual Usage Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Vocabulary Flashcards</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Activities <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Exam-Specific Vocabulary</h3>
                    <p class="text-gray-600 mb-4">Focus on vocabulary commonly tested in English proficiency exams.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Vocabulary List</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Essential Words</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Advanced Vocabulary</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View Exam Vocabulary <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Vocabulary Learning Strategies</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-50 p-4 rounded-md">
                        <h4 class="font-medium text-gray-800 mb-2">Effective Memorization Techniques</h4>
                        <ul class="space-y-2 text-gray-700">
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Word association and mind mapping
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Spaced repetition practice
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Contextual learning through stories
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Visual vocabulary building
                            </li>
                        </ul>
                        <a href="#" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800">Learn more</a>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-md">
                        <h4 class="font-medium text-gray-800 mb-2">Daily Vocabulary Practice</h4>
                        <ul class="space-y-2 text-gray-700">
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                "Word of the Day" practice
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Vocabulary journal keeping
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Using new words in conversations
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Vocabulary review schedule
                            </li>
                        </ul>
                        <a href="#" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800">Learn more</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Writing Section -->
    <section id="writing" class="section bg-white py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Writing Resources</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Improve your writing skills with our comprehensive resources and practice materials</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-pencil-alt"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Essay Writing Guides</h3>
                    <p class="text-gray-600 mb-4">Learn how to structure and write different types of essays for academic and exam purposes.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Opinion Essay Guide</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Descriptive Writing Tips</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Argumentative Essay Structure</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Writing Guides <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Correspondence Writing</h3>
                    <p class="text-gray-600 mb-4">Master formal and informal letters, emails, and other forms of written communication.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Formal Email Templates</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Informal Letter Writing</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Business Correspondence Guide</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View Correspondence Guides <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Exam Writing Practice</h3>
                    <p class="text-gray-600 mb-4">Prepare for the writing sections of English proficiency exams with practice tasks and sample answers.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Writing Tasks</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Writing Examples</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Writing Practice Tests</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View Exam Writing Practice <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Writing Improvement Tools</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-medium text-gray-800 mb-2">Common Writing Mistakes to Avoid</h4>
                        <ul class="space-y-2 text-gray-700">
                            <li class="flex items-center">
                                <i class="fas fa-times-circle text-red-500 mr-2"></i>
                                Run-on sentences and fragments
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-times-circle text-red-500 mr-2"></i>
                                Inconsistent tense usage
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-times-circle text-red-500 mr-2"></i>
                                Subject-verb agreement errors
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-times-circle text-red-500 mr-2"></i>
                                Overuse of passive voice
                            </li>
                        </ul>
                        <a href="#" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800">Full guide to common errors</a>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800 mb-2">Writing Enhancement Resources</h4>
                        <ul class="space-y-2 text-gray-700">
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Transitional phrase database
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Academic vocabulary builder
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Proofreading checklist
                            </li>
                            <li class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Style guide for different writing formats
                            </li>
                        </ul>
                        <a href="#" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800">Access writing resources</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Listening Section -->
    <section id="listening" class="section bg-gray-50 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Listening Resources</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Develop your listening skills with our audio materials and practice exercises</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Listening Comprehension</h3>
                    <p class="text-gray-600 mb-4">Practice understanding spoken English with audio clips and comprehension questions.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Everyday Conversations</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Academic Lectures</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">News Reports</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Access Listening Materials <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Pronunciation Practice</h3>
                    <p class="text-gray-600 mb-4">Improve your accent and pronunciation with focused listening and speaking exercises.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Minimal Pairs Exercises</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Intonation Patterns</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Connected Speech Practice</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Improve Your Pronunciation <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-award"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Exam Listening Practice</h3>
                    <p class="text-gray-600 mb-4">Prepare for the listening sections of English proficiency exams with practice tests.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Listening Tests</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Listening Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-volume-up text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Listening Exercises</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Practice Exam Listening <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-indigo-50 rounded-lg shadow-lg p-8">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-2/3 mb-6 md:mb-0 md:mr-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Tips for Improving Listening Skills</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">Daily Practice</h4>
                                <ul class="space-y-2 text-gray-700">
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Listen to English podcasts while commuting
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Watch English videos with subtitles
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Follow along with song lyrics
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">Active Listening</h4>
                                <ul class="space-y-2 text-gray-700">
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Take notes while listening
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Predict what speakers might say next
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-indigo-500 mr-2"></i>
                                        Practice summarizing what you've heard
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <a href="#" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">Download complete listening guide</a>
                    </div>
                    <div class="md:w-1/3">
                        <img class="rounded-lg shadow-md mx-auto" src="https://cdn-icons-png.flaticon.com/512/3214/3214721.png" alt="Listening Skills" width="180">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Reading Section -->
    <section id="reading" class="section bg-white py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Reading Resources</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Enhance your reading comprehension with our diverse collection of texts and exercises</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-book-reader"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Graded Reading Texts</h3>
                    <p class="text-gray-600 mb-4">Access reading materials organized by proficiency level with comprehension questions.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Beginner Level Stories</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Intermediate Articles</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Advanced Reading Passages</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Browse Reading Texts <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-glasses"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Reading Strategies</h3>
                    <p class="text-gray-600 mb-4">Learn effective techniques to improve reading speed and comprehension.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Skimming and Scanning</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Prediction Techniques</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Context Clue Analysis</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Explore Reading Strategies <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-gray-50 rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Exam Reading Practice</h3>
                    <p class="text-gray-600 mb-4">Prepare for the reading sections of English proficiency exams with practice tests.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Reading Tests</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Reading Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Reading Exercises</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Practice Exam Reading <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Featured Reading Materials</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="border-l-4 border-indigo-500 pl-4">
                        <h4 class="font-medium text-gray-800 mb-2">Short Stories Collection</h4>
                        <p class="text-gray-600 mb-3">A collection of engaging short stories with vocabulary notes and comprehension questions. Perfect for building reading fluency and enjoyment.</p>
                        <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                            Read Stories <i class="fas fa-book-open ml-2"></i>
                        </a>
                    </div>
                    <div class="border-l-4 border-indigo-500 pl-4">
                        <h4 class="font-medium text-gray-800 mb-2">News Articles for English Learners</h4>
                        <p class="text-gray-600 mb-3">Simplified news articles on current events, designed specifically for English language learners with supporting exercises.</p>
                        <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                            Read News Articles <i class="fas fa-newspaper ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Grammar Section -->
    <section id="grammar" class="section bg-gray-50 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Grammar Resources</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Master English grammar with clear explanations and plenty of practice exercises</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Grammar Explanations</h3>
                    <p class="text-gray-600 mb-4">Clear and comprehensive explanations of English grammar rules and structures.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Verb Tenses Guide</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Conditional Sentences</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Prepositions Explained</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        View All Grammar Topics <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-pencil-ruler"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Grammar Exercises</h3>
                    <p class="text-gray-600 mb-4">Interactive exercises and worksheets to practice and reinforce grammar concepts.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Articles Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Present Perfect Exercises</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">Reported Speech Worksheet</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Browse All Exercises <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6 card">
                    <div class="text-indigo-600 text-3xl mb-4">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Exam Grammar</h3>
                    <p class="text-gray-600 mb-4">Focus on grammar topics and structures commonly tested in English proficiency exams.</p>
                    <ul class="mb-4 space-y-2">
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">PET Grammar Checklist</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">KET Grammar Practice</a>
                        </li>
                        <li class="resource-link flex items-center text-gray-700">
                            <i class="fas fa-file-alt text-indigo-500 mr-2"></i>
                            <a href="#" class="hover:text-indigo-600">FCE Use of English Guide</a>
                        </li>
                    </ul>
                    <a href="#" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        Explore Exam Grammar <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>

            <div class="bg-indigo-50 rounded-lg shadow-lg p-8">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-2/3 mb-6 md:mb-0 md:mr-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Grammar Learning Pathways</h3>
                        <p class="text-gray-600 mb-6">Follow structured learning paths to progressively build your grammar knowledge from foundation to advanced levels.</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <a href="#" class="block bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition">
                                <span class="block font-medium text-gray-800 mb-1">Beginner Path</span>
                                <span class="text-sm text-gray-600">Basic structures</span>
                            </a>
                            <a href="#" class="block bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition">
                                <span class="block font-medium text-gray-800 mb-1">Intermediate Path</span>
                                <span class="text-sm text-gray-600">Complex structures</span>
                            </a>
                            <a href="#" class="block bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition">
                                <span class="block font-medium text-gray-800 mb-1">Advanced Path</span>
                                <span class="text-sm text-gray-600">Nuanced usage</span>
                            </a>
                        </div>
                    </div>
                    <div class="md:w-1/3">
                        <img class="rounded-lg shadow-md mx-auto" src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png" alt="Grammar Learning" width="180">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">707 Online English</h3>
                    <p class="text-gray-300">Your trusted companion on the journey to English fluency.</p>
                </div>
                <div>
                    <h4 class="text-lg font-medium mb-4">Quick Links</h4>
                    <ul class="space-y-2">
                        <li><a href="#home" class="text-gray-300 hover:text-white transition">Home</a></li>
                        <li><a href="#quiz" class="text-gray-300 hover:text-white transition">Quiz</a></li>
                        <li><a href="#games" class="text-gray-300 hover:text-white transition">Games</a></li>
                        <li><a href="#vocabulary" class="text-gray-300 hover:text-white transition">Vocabulary</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-medium mb-4">Resources</h4>
                    <ul class="space-y-2">
                        <li><a href="#writing" class="text-gray-300 hover:text-white transition">Writing</a></li>
                        <li><a href="#listening" class="text-gray-300 hover:text-white transition">Listening</a></li>
                        <li><a href="#reading" class="text-gray-300 hover:text-white transition">Reading</a></li>
                        <li><a href="#grammar" class="text-gray-300 hover:text-white transition">Grammar</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-medium mb-4">Contact Us</h4>
                    <ul class="space-y-2">
                        <li class="flex items-center text-gray-300">
                            <i class="fas fa-envelope mr-2"></i> contact@707english.com
                        </li>
                        <li class="flex items-center text-gray-300">
                            <i class="fas fa-phone mr-2"></i> +1 (234) 567-8900
                        </li>
                    </ul>
                    <div class="mt-4 flex space-x-4">
                        <a href="#" class="text-gray-300 hover:text-white transition">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-white transition">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-white transition">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-white transition">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2023 707 Online English Learning Center. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 70, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
                // Close mobile menu if it's open
                document.getElementById('mobile-menu').classList.add('hidden');
            });
        });
    </script>
</body>
</html>
