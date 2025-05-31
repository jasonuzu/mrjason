<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>707 Online English Learning Center</title>
    <style>
        /* Global Styles */
        :root {
            --primary-color: #3498db;
            --secondary-color: #2ecc71;
            --accent-color: #e74c3c;
            --light-color: #ecf0f1;
            --dark-color: #2c3e50;
            --font-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-main);
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header Styles */
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo h1 {
            font-size: 1.8rem;
            font-weight: 700;
        }
        
        .logo span {
            font-weight: 300;
        }
        
        /* Navigation */
        nav ul {
            display: flex;
            list-style: none;
            gap: 1.5rem;
        }
        
        nav a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 0.5rem 0.8rem;
            border-radius: 4px;
        }
        
        nav a:hover, nav a.active {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-align: center;
            padding: 3rem 1rem;
        }
        
        .hero h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.2rem;
            max-width: 800px;
            margin: 0 auto 1.5rem;
        }
        
        .btn {
            display: inline-block;
            background-color: white;
            color: var(--primary-color);
            padding: 0.8rem 1.5rem;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 0.5rem;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        
        /* Main Content */
        main {
            padding: 3rem 0;
        }
        
        .section-title {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
        }
        
        .section-title h2 {
            font-size: 2rem;
            color: var(--dark-color);
        }
        
        .section-title::after {
            content: '';
            display: block;
            width: 80px;
            height: 4px;
            background-color: var(--secondary-color);
            margin: 0.5rem auto;
        }
        
        /* Features */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .feature-card {
            background-color: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }
        
        .feature-card h3 {
            font-size: 1.3rem;
            color: var(--primary-color);
            margin-bottom: 0.8rem;
        }
        
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--secondary-color);
        }
        
        /* Resources Section */
        .resources-section {
            background-color: var(--light-color);
            padding: 3rem 0;
        }
        
        .resource-links {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .resource-link {
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        
        .resource-link:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }
        
        .resource-img {
            height: 150px;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--primary-color);
        }
        
        .resource-content {
            padding: 1.2rem;
        }
        
        .resource-content h3 {
            color: var(--dark-color);
            margin-bottom: 0.5rem;
        }
        
        .resource-content p {
            margin-bottom: 1rem;
            font-size: 0.95rem;
        }
        
        /* Page Content */
        .page-content {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        
        .resource-list {
            list-style: none;
            margin: 1.5rem 0;
        }
        
        .resource-list li {
            margin-bottom: 1rem;
            border-left: 4px solid var(--secondary-color);
            padding-left: 1rem;
        }
        
        .resource-list a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
            display: block;
        }
        
        .resource-list a:hover {
            color: var(--secondary-color);
            transform: translateX(5px);
        }
        
        .resource-category {
            margin: 2.5rem 0;
        }
        
        .resource-category h3 {
            color: var(--dark-color);
            margin-bottom: 1rem;
            border-bottom: 2px solid var(--light-color);
            padding-bottom: 0.5rem;
        }
        
        /* Call to Action */
        .cta-section {
            text-align: center;
            padding: 3rem 0;
            background-color: var(--dark-color);
            color: white;
        }
        
        /* Footer */
        footer {
            background-color: var(--dark-color);
            color: white;
            padding: 2rem 0 1rem;
            text-align: center;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin: 1rem 0;
        }
        
        .footer-links a {
            color: var(--light-color);
            text-decoration: none;
            transition: all 0.2s ease;
        }
        
        .footer-links a:hover {
            color: var(--secondary-color);
        }
        
        .copyright {
            font-size: 0.9rem;
            margin-top: 2rem;
            color: rgba(255,255,255,0.7);
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
            }
            
            nav ul {
                margin-top: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .hero h2 {
                font-size: 2rem;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header id="home">
        <div class="container header-content">
            <div class="logo">
                <h1>707 <span>Online English Learning Center</span></h1>
            </div>
            <nav>
                <ul>
                    <li><a href="index.html" class="active">Home</a></li>
                    <li><a href="707_quiz_page.html">Quiz</a></li>
                    <li><a href="707_games_page.html">Games</a></li>
                    <li><a href="vocabulary.html">Vocabulary</a></li>
                    <li><a href="707_writing_page.html">Writing</a></li>
                    <li><a href="707_listening_page.html">Listening</a></li>
                    <li><a href="707_reading_page.html">Reading</a></li>
                    <li><a href="707_grammar_page.html">Grammar</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h2>Welcome to 707 Online English Learning Center</h2>
            <p>Helping students of all ages and levels improve their English skills through interactive resources, practices, and learning materials.</p>
            <div>
                <a href="#resources" class="btn">Explore Resources</a>
                <a href="#features" class="btn">Learning Features</a>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main>
        <!-- Welcome Section -->
        <section class="container">
            <div class="section-title">
                <h2>Welcome Students and Parents!</h2>
            </div>
            <div class="page-content">
                <p>Welcome to the 707 Online English Learning Center! This site is designed to support your English language journey with a wealth of resources for both in-class and independent study.</p>
                
                <p>Our goal is to make learning English engaging, effective, and enjoyable. Whether you're a beginner just starting your language journey or an advanced learner looking to refine your skills, we have resources tailored to your needs.</p>
                
                <p>This site will be regularly updated with new materials, exercises, and learning tools to support your progress. Be sure to check back often for the latest additions!</p>

                <div class="section-title" id="features" style="margin-top: 2rem;">
                    <h2>Learning Features</h2>
                </div>
                
                <div class="features">
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h3>Interactive Quizzes</h3>
                        <p>Test your knowledge with our interactive quizzes covering various aspects of English learning, from grammar to vocabulary.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">🎮</div>
                        <h3>Educational Games</h3>
                        <p>Make learning fun with our collection of educational games designed to reinforce your English skills while having fun.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📚</div>
                        <h3>Comprehensive Resources</h3>
                        <p>Access a wide range of resources for vocabulary, grammar, writing, listening, and reading to support your English development.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Resources Section -->
        <section class="resources-section" id="resources">
            <div class="container">
                <div class="section-title">
                    <h2>Quick Links to Resources</h2>
                </div>
                
                <div class="resource-links">
                    <div class="resource-link">
                        <div class="resource-img">📋</div>
                        <div class="resource-content">
                            <h3>ESL Grammar Resources</h3>
                            <p>Comprehensive grammar guides, exercises, and explanations to help you master English grammar.</p>
                            <a href="grammar.html" class="btn">Explore</a>
                        </div>
                    </div>
                    
                    <div class="resource-link">
                        <div class="resource-img">📘</div>
                        <div class="resource-content">
                            <h3>PET/KET/FCE Study Resources</h3>
                            <p>Preparation materials for Cambridge English qualifications including practice tests and exam strategies.</p>
                            <a href="#" class="btn">Explore</a>
                        </div>
                    </div>
                    
                    <div class="resource-link">
                        <div class="resource-img">💡</div>
                        <div class="resource-content">
                            <h3>Learning Strategies</h3>
                            <p>Effective techniques and approaches to help you learn English more efficiently and retain knowledge better.</p>
                            <a href="#" class="btn">Explore</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="index.html">Home</a>
                <a href="quiz.html">Quiz</a>
                <a href="games.html">Games</a>
                <a href="vocabulary.html">Vocabulary</a>
                <a href="writing.html">Writing</a>
                <a href="listening.html">Listening</a>
                <a href="reading.html">Reading</a>
                <a href="grammar.html">Grammar</a>
            </div>
            <p class="copyright">© 2025 707 Online English Learning Center. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
