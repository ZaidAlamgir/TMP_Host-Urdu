---
layout: default
title: Home - The Muslim Post
---
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Muslim Post",
  "url": "https://www.tmpnews.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.tmpnews.com/search.html?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
<style>
.support-cta-banner{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:1rem;background-color:#000 !important;border-bottom:none !important;padding:0.35rem 1.5rem !important;margin:0 auto 1.5rem auto;max-width:fit-content;border-radius:50px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
.support-cta-banner p{margin:0 !important;font-family:'Inter',sans-serif;font-size:0.85rem !important;color:#fff !important;font-weight:500}
.support-cta-button{background-color:#facc15 !important;color:#000 !important;padding:0.25rem 0.75rem !important;border-radius:20px !important;font-family:'Inter',sans-serif;font-size:0.75rem !important;font-weight:800 !important;text-decoration:none !important;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;box-shadow:none !important;transition:opacity 0.2s}
.support-cta-button:hover{opacity:0.9;color:#000 !important}
@media (max-width:640px){.support-cta-banner{flex-direction:column;padding:0.75rem 1rem !important;gap:0.5rem;border-radius:0 !important;width:100% !important;max-width:100% !important;margin:0 0 1.5rem 0 !important;box-sizing:border-box}.support-cta-banner p{font-size:0.75rem !important;line-height:1.3;text-align:center}}

/* Category Filters Tab Bar Styling */
.category-filters-container {
    width: 100%;
    margin-bottom: 2rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 6px;
}

/* Hide scrollbar on mobile devices, keep on desktop */
@media (max-width: 767px) {
    .category-filters-container::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
    }
    .category-filters-container {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
}
@media (min-width: 768px) {
    .category-filters-container::-webkit-scrollbar {
        height: 5px;
    }
    .category-filters-container::-webkit-scrollbar-track {
        background: transparent;
    }
    .category-filters-container::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
    html.dark-mode .category-filters-container::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.15);
    }
}

.category-filters {
    display: flex;
    gap: 1.5rem;
    padding: 0 4px 8px 4px;
    white-space: nowrap;
    width: max-content;
    position: relative;
}
.filter-btn {
    background: transparent !important;
    border: none;
    outline: none;
    padding: 6px 0;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    transition: color 0.2s ease;
    border-radius: 0;
}
.filter-btn:hover {
    color: #111827;
}
.filter-btn.active {
    color: #0073e6;
}
html.dark-mode .filter-btn {
    color: #9ca3af;
}
html.dark-mode .filter-btn:hover {
    color: #ffffff;
}
html.dark-mode .filter-btn.active {
    color: #0073e6;
}

/* Sliding Underline Indicator */
.filter-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background-color: #0073e6;
    border-radius: 3px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 1;
    width: 0;
}

.explore-hub-btn {
    display: inline-block;
    background-color: #0073e6;
    color: #ffffff !important;
    padding: 12px 28px;
    border-radius: 30px;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 12px rgba(0, 115, 230, 0.2);
    transition: all 0.2s ease;
}
.explore-hub-btn:hover {
    background-color: #005bb5;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 115, 230, 0.3);
}

/* Premium CSS Gradients for Category Cards */
.category-card-gradient {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff !important;
    font-weight: 800;
    font-size: 1.5rem;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    text-align: center;
    padding: 1rem;
    box-sizing: border-box;
}
.grad-politics { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
.grad-indian-politics { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); }
.grad-muslim-world { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); }
.grad-technology { background: linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%); }
.grad-medical { background: linear-gradient(135deg, #9f1239 0%, #f43f5e 100%); }
.grad-economy { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); }
.grad-art { background: linear-gradient(135deg, #c2410c 0%, #f97316 100%); }
.grad-weather { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); }
.grad-sports { background: linear-gradient(135deg, #166534 0%, #22c55e 100%); }
.grad-national { background: linear-gradient(135deg, #881337 0%, #e11d48 100%); }
.grad-international { background: linear-gradient(135deg, #1e293b 0%, #475569 100%); }
.grad-history { background: linear-gradient(135deg, #78350f 0%, #d97706 100%); }
.grad-indian-muslims { background: linear-gradient(135deg, #14532d 0%, #15803d 100%); }
.grad-middle-east { background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%); }
.grad-climate { background: linear-gradient(135deg, #064e3b 0%, #059669 100%); }
.grad-defense { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); }
.grad-south-asia { background: linear-gradient(135deg, #92400e 0%, #d97706 100%); }
.grad-africa { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); }
.grad-europe { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); }
.grad-central-asia { background: linear-gradient(135deg, #115e59 0%, #14b8a6 100%); }
.grad-crime { background: linear-gradient(135deg, #991b1b 0%, #ef4444 100%); }
.grad-south-east { background: linear-gradient(135deg, #065f46 0%, #0ea5e9 100%); }
.grad-east-asia { background: linear-gradient(135deg, #881337 0%, #ea580c 100%); }
.grad-north-america { background: linear-gradient(135deg, #1e3a8a 0%, #475569 100%); }
.grad-south-america { background: linear-gradient(135deg, #065f46 0%, #f59e0b 100%); }

.loader {
    display: none; margin: 2rem auto; 
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0073e6; 
    border-radius: 50%;
    width: 32px; height: 32px; 
    animation: spin 1s linear infinite;
}
.loader.visible { display: block; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Dark mode fixes for subheadline container */
.subheadline-container {
    position: relative;
    max-height: 36px;
    overflow: hidden;
    margin-bottom: 0.75rem;
}
.subheadline-container::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 24px;
    background: linear-gradient(to bottom, rgba(255,255,255,0), #ffffff);
    pointer-events: none;
    z-index: 1;
}
html.dark-mode .subheadline-container::after {
    background: linear-gradient(to bottom, rgba(31,41,55,0), #1f2937);
}
</style>
<div class="support-cta-banner">
    <p>Independent journalism is more important than ever. Please consider supporting The Muslim Post today.</p>
    <a href="{{ '/support/' | relative_url }}" class="support-cta-button">Support TMP</a>
</div>
{% assign latest_post = site.posts.first %}
<main class="home-main" style="flex-grow: 1;">
    {% if latest_post %}
    <section class="top-story-section">
        <a href="{{ latest_post.url | relative_url }}" class="news-card hero-news-card">
            <div class="news-card-image-wrapper hero-news-card-image-wrapper">
                <img src="{{ latest_post.image | default: 'https://placehold.co/1200x800/e2e8f0/64748b?text=Image+Not+Available' }}" alt="{{ latest_post.image_description | default: 'Top story image' | escape }}" class="news-card-image" loading="eager">
                <p class="news-card-date">{{ latest_post.date | date: "%B %d, %Y" }}</p>
            </div>
            <div class="news-card-text hero-news-card-text">
                <span class="hero-kicker">Lead Story</span>
                <h3 class="news-card-headline hero-headline" style="font-family:'Merriweather',serif;font-weight:900;margin-bottom:0.5rem;">{{ latest_post.title }}</h3>
                <div class="subheadline-container hero-subheadline-container">
                    <p class="news-card-subheadline">{{ latest_post.subheadline | default: latest_post.content | strip_html | truncatewords: 35 }}</p>
                </div>
                <span class="read-more-text">Read More &rarr;</span>
            </div>
        </a>
    </section>
    {% endif %}
    <div class="content-wrapper">
        <hr class="section-divider">
        
        <!-- Live Filterable Latest Reports Grid (NO reveal-on-scroll here so it is instantly visible) -->
        <section class="content-section latest-reports-section">
            <h2 class="section-title">Latest Reports</h2>
            <p class="section-subtitle">Stay informed with our latest news coverage, analysis, and regional stories.</p>
            
            <div class="category-filters-container">
                <div class="category-filters" id="home-filters-bar">
                    <div class="filter-indicator" id="home-filter-indicator"></div>
                    <button class="filter-btn active" data-tag="">All</button>
                    <button class="filter-btn" data-tag="world-politics">World Politics</button>
                    <button class="filter-btn" data-tag="indian-politics">Indian Politics</button>
                    <button class="filter-btn" data-tag="muslim-world">Muslim World</button>
                    <button class="filter-btn" data-tag="technology">Technology</button>
                    <button class="filter-btn" data-tag="medical-science">Medical Science</button>
                    <button class="filter-btn" data-tag="global-economy">Global Economy</button>
                    <button class="filter-btn" data-tag="art-culture">Art & Culture</button>
                    <button class="filter-btn" data-tag="weather">Weather</button>
                    <button class="filter-btn" data-tag="sports">Sports</button>
                    <button class="filter-btn" data-tag="national-news">National News</button>
                    <button class="filter-btn" data-tag="international-news">International News</button>
                    <button class="filter-btn" data-tag="history">History</button>
                    <button class="filter-btn" data-tag="indian-muslims">Indian Muslims</button>
                    <button class="filter-btn" data-tag="middle-east">Middle East</button>
                    <button class="filter-btn" data-tag="climate">Climate</button>
                    <button class="filter-btn" data-tag="defense">Defense</button>
                    <button class="filter-btn" data-tag="south-asia">South Asia</button>
                    <button class="filter-btn" data-tag="africa">Africa</button>
                    <button class="filter-btn" data-tag="europe">Europe</button>
                    <button class="filter-btn" data-tag="central-asia">Central Asia</button>
                    <button class="filter-btn" data-tag="crime-alert">Crime Alert</button>
                    <button class="filter-btn" data-tag="south-east-asia">Southeast Asia</button>
                    <button class="filter-btn" data-tag="east-asia">East Asia</button>
                    <button class="filter-btn" data-tag="north-america">North America</button>
                    <button class="filter-btn" data-tag="south-america">South America</button>
                </div>
            </div>
            
            <div class="news-grid-full" id="home-articles-grid" style="min-height: 150px;"></div>
            <div id="home-loader" class="loader"></div>
            
            <div style="text-align: center; margin-top: 3rem;">
                <a href="{{ '/news/hub/' | relative_url }}" class="explore-hub-btn">Explore Full News Hub</a>
            </div>
        </section>

        <hr class="section-divider">
        
        <section class="content-section features-section reveal-on-scroll">
            <h2 class="section-title">Why Join Us?</h2>
            <p class="section-subtitle">A platform designed for sharing knowledge and fostering discussion.</p>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>
                    <h3>Share Your Voice</h3>
                    <p>Easily post your articles, research, and opinions for a global audience.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                    <h3>Engage with Peers</h3>
                    <p>Connect with a community of experts and enthusiasts in various fields.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/></svg></div>
                    <h3>Stay Updated</h3>
                    <p>Follow the latest trends and discussions with our curated news section.</p>
                </div>
            </div>
        </section>
    </div>
    <section class="cta-section">
        <div class="cta-content reveal-on-scroll">
            <h1>Share Your Knowledge</h1>
            <p>Join a community of thinkers, learners, and experts. Discover insightful posts and contribute your own perspective.</p>
            <a id="cta-get-started" href="{{ '/post/' | relative_url }}" class="cta-button">Get Started</a>
        </div>
    </section>
</main>

<script>
    document.addEventListener('turbo:load', () => {
        const getStartedBtn = document.getElementById('cta-get-started');
        if (getStartedBtn) {
            let cachedUser = null;
            try {
                cachedUser = localStorage.getItem('cachedUser');
            } catch (e) {
                console.warn("localStorage is disabled or not accessible:", e);
            }
            if (!cachedUser) {
                getStartedBtn.href = "{{ 'auth.html' | relative_url }}";
            }
        }
    });
    
    document.addEventListener('turbo:load', () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('.reveal-on-scroll').forEach(element => {
            observer.observe(element);
        });
    });

    // Homepage dynamic latest reports grid and categories filter
    document.addEventListener('turbo:load', () => {
        const homeGrid = document.getElementById('home-articles-grid');
        if (!homeGrid || homeGrid._initialized) return;
        homeGrid._initialized = true;
        const loader = document.getElementById('home-loader');
        const filtersBar = document.getElementById('home-filters-bar');
        const CACHE_KEY = 'tmp_news_hub_v4';
        
        let allArticles = [];
        
        function filterArticles(articles, tag) {
            if (!tag) return articles;
            return articles.filter(post => {
                const postTags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
                return postTags.includes(tag);
            });
        }
        
        function renderArticles(articlesToRender) {
            if (!articlesToRender || articlesToRender.length === 0) {
                homeGrid.innerHTML = '<p style="text-align:center;color:#606770;grid-column:1/-1;padding:2rem;">No articles found in this category.</p>';
                return;
            }
            // Limit to 6 articles on homepage
            const limit = articlesToRender.slice(0, 6);
            homeGrid.innerHTML = limit.map(post => {
                const image = post.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
                const alt = post.image_description || 'Article image';
                const subheadline = post.subheadline || 'Click to read more.';
                let formattedDate = '';
                if (post.date) {
                    const d = new Date(post.date);
                    const options = { month: 'long', day: 'numeric', year: 'numeric' };
                    formattedDate = d.toLocaleDateString('en-US', options);
                }
                return `
                <a href="${post.url}" class="news-card fade-in">
                    <div class="news-card-image-wrapper">
                        <img src="${image}" alt="${alt}" class="news-card-image" loading="lazy">
                        ${formattedDate ? `<p class="news-card-date">${formattedDate}</p>` : ''}
                    </div>
                    <div class="news-card-text">
                        <h3 class="news-card-headline" style="font-family:'Merriweather',serif;font-weight:900;font-size:1.15rem;margin-bottom:0.5rem;">${post.title}</h3>
                        <div class="subheadline-container">
                            <p class="news-card-subheadline" style="font-size:0.95rem;color:#606770;line-height:1.5;margin:0;">${subheadline}</p>
                        </div>
                        <span class="read-more-text" style="font-size:0.85rem;font-weight:800;color:#0073e6;text-transform:uppercase;margin-top:auto;">Read More &#8594;</span>
                    </div>
                </a>`;
            }).join('');
        }
        
        function updateIndicator(activeBtn) {
            const indicator = document.getElementById('home-filter-indicator');
            if (!indicator || !activeBtn) return;
            const rect = activeBtn.getBoundingClientRect();
            const leftOffset = activeBtn.offsetLeft;
            indicator.style.width = `${rect.width}px`;
            indicator.style.transform = `translateX(${leftOffset}px)`;
        }
        
        function syncIndicator() {
            const activeBtn = filtersBar ? filtersBar.querySelector('.filter-btn.active') : null;
            if (activeBtn) {
                setTimeout(() => {
                    updateIndicator(activeBtn);
                }, 50);
            }
        }
        
        async function loadHomeArticles() {
            if (loader) loader.classList.add('visible');
            try {
                // Try cache first with try-catch block to prevent SecurityError in Incognito mode
                try {
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        allArticles = JSON.parse(cachedData);
                        renderArticles(allArticles.slice(1));
                        syncIndicator();
                    }
                } catch (cacheErr) {
                    console.warn("Failed to load cached homepage articles:", cacheErr);
                }
                
                // Fetch fresh
                const response = await fetch('{{ "/search.json" | relative_url }}');
                if (response.ok) {
                    const freshArticles = await response.json();
                    allArticles = freshArticles;
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(freshArticles));
                    } catch (cacheErr) {
                        console.warn("Failed to cache fresh homepage articles:", cacheErr);
                    }
                    // Re-render, skipping the absolute latest one
                    const activeBtn = filtersBar ? filtersBar.querySelector('.filter-btn.active') : null;
                    const tag = activeBtn ? activeBtn.getAttribute('data-tag') : '';
                    renderArticles(filterArticles(allArticles.slice(1), tag));
                    syncIndicator();
                }
            } catch (e) {
                console.error("Failed to load homepage articles:", e);
            } finally {
                if (loader) loader.classList.remove('visible');
            }
        }
        
        if (filtersBar) {
            filtersBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                
                filtersBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                updateIndicator(btn);
                
                const tag = btn.getAttribute('data-tag');
                renderArticles(filterArticles(allArticles.slice(1), tag));
            });
        }
        
        // Listen for window resize to adjust indicator positioning
        window.addEventListener('resize', syncIndicator);
        
        loadHomeArticles();
    });
</script>