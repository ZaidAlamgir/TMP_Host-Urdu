---
layout: default
title: Home - The Urdu Post
description: "دی اردو پوسٹ (TMP News): بین الاقوامی سیاست، اہم عالمی امور، بریکنگ نیوز اور تجزیات کی سب سے معتبر اردو کوریج۔ باخبر رہیے غیر جانبدار اور سچی صحافت کے ساتھ。"
---
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Urdu Post",
  "url": "https://theurdupost.tmpnews.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://theurdupost.tmpnews.com/search.html?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
<style>
.support-cta-banner{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:1rem;background-color:#000 !important;border-bottom:none !important;padding:0.35rem 1.5rem !important;margin:0 auto 1.25rem auto;max-width:fit-content;border-radius:50px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);direction:rtl;}
.support-cta-banner p{margin:0 !important;font-family:'Noto Nastaliq Urdu','Jameel Noori Nastaleeq',sans-serif;font-size:0.85rem !important;color:#fff !important;font-weight:500}
.support-cta-button{background-color:#facc15 !important;color:#000 !important;padding:0.25rem 0.75rem !important;border-radius:20px !important;font-family:'Noto Nastaliq Urdu',sans-serif;font-size:0.75rem !important;font-weight:800 !important;text-decoration:none !important;white-space:nowrap;box-shadow:none !important;transition:opacity 0.2s}
.support-cta-button:hover{opacity:0.9;color:#000 !important}
@media (max-width:640px){.support-cta-banner{flex-direction:column;padding:0.6rem 1rem !important;gap:0.4rem;border-radius:0 !important;width:100% !important;max-width:100% !important;margin:0 0 1rem 0 !important;box-sizing:border-box}.support-cta-banner p{font-size:0.75rem !important;line-height:1.3;text-align:center}}

/* Category Filter Navigation Bar Styling */
.category-filters-nav-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
}

.category-filters-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    touch-action: pan-x pinch-zoom;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    user-select: none;
    -webkit-user-select: none;
    padding: 4px 4px 8px 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    cursor: grab;
}

.category-filters-container:active {
    cursor: grabbing;
}

.category-filters-container::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
}

.category-filters {
    display: flex;
    gap: 0.55rem;
    padding: 0 4px;
    white-space: nowrap;
    width: max-content;
    position: relative;
}

.filter-btn {
    flex-shrink: 0;
    scroll-snap-align: center;
    user-select: none;
    -webkit-user-select: none;
    background: #f1f5f9 !important;
    border: 1px solid #e2e8f0;
    color: #475569;
    padding: 6px 16px;
    border-radius: 9999px;
    font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', -apple-system, sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    outline: none;
    -webkit-tap-highlight-color: transparent;
}

.filter-btn:hover {
    background: #e2e8f0 !important;
    color: #0f172a;
    border-color: #cbd5e1;
    transform: translateY(-1px);
}

.filter-btn.active {
    background: #0073e6 !important;
    color: #ffffff !important;
    border-color: #0073e6 !important;
    box-shadow: 0 3px 10px rgba(0, 115, 230, 0.3);
    transform: translateY(-1px);
}

html.dark-mode .filter-btn {
    background: #1e293b !important;
    border-color: #334155;
    color: #94a3b8;
}

html.dark-mode .filter-btn:hover {
    background: #334155 !important;
    color: #ffffff;
    border-color: #475569;
}

html.dark-mode .filter-btn.active {
    background: #0073e6 !important;
    color: #ffffff !important;
    border-color: #0073e6 !important;
    box-shadow: 0 3px 12px rgba(0, 115, 230, 0.45);
}

/* Edge Fade Masks for intuitive swipe cues */
.category-filters-nav-wrapper::before,
.category-filters-nav-wrapper::after {
    content: '';
    position: absolute;
    top: 4px;
    bottom: 8px;
    width: 28px;
    pointer-events: none;
    z-index: 4;
    transition: opacity 0.25s ease;
}

.category-filters-nav-wrapper::before {
    left: 0;
    background: linear-gradient(to right, #ffffff 10%, transparent);
    opacity: 0;
    border-top-left-radius: 9999px;
    border-bottom-left-radius: 9999px;
}

.category-filters-nav-wrapper::after {
    right: 0;
    background: linear-gradient(to left, #ffffff 10%, transparent);
    opacity: 1;
    border-top-right-radius: 9999px;
    border-bottom-right-radius: 9999px;
}

.category-filters-nav-wrapper.can-scroll-left::before { opacity: 1; }
.category-filters-nav-wrapper.at-scroll-end::after { opacity: 0; }

html.dark-mode .category-filters-nav-wrapper::before {
    background: linear-gradient(to right, #111827 10%, transparent);
}
html.dark-mode .category-filters-nav-wrapper::after {
    background: linear-gradient(to left, #111827 10%, transparent);
}

.explore-hub-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #0073e6;
    color: #ffffff !important;
    padding: 10px 24px;
    border-radius: 9999px;
    font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', sans-serif;
    font-weight: 700;
    font-size: 0.88rem;
    text-decoration: none;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 12px rgba(0, 115, 230, 0.25);
    transition: all 0.2s ease;
}
.explore-hub-btn:hover {
    background-color: #005bb5;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 115, 230, 0.35);
}

.loader {
    display: none; margin: 1.5rem auto; 
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0073e6; 
    border-radius: 50%;
    width: 30px; height: 30px; 
    animation: spin 1s linear infinite;
}
.loader.visible { display: block; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Compact Subheadline container */
.subheadline-container {
    position: relative;
    max-height: 38px;
    overflow: hidden;
    margin-bottom: 0.35rem;
}
.subheadline-container::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 16px;
    background: linear-gradient(to bottom, rgba(255,255,255,0), #ffffff);
    pointer-events: none;
    z-index: 1;
}
html.dark-mode .subheadline-container::after {
    background: linear-gradient(to bottom, rgba(31,41,55,0), #1f2937);
}
</style>

<div class="support-cta-banner">
    <p>آزاد اور غیر جانبدار صحافت آج کے دور میں پہلے سے زیادہ ضروری ہے۔ دی اردو پوسٹ کا تعاون کریں۔</p>
    <a href="{{ '/support/' | relative_url }}" class="support-cta-button">تعاون کریں</a>
</div>

{% assign latest_post = site.posts.first %}
<main class="home-main" style="flex-grow: 1;">
    {% if latest_post %}
    <!-- Hero Latest Article Card -->
    <section class="top-story-section">
        <a href="{{ latest_post.url | relative_url }}" class="hero-spotlight-card">
            <div class="hero-image-pane">
                <img src="{{ latest_post.image | default: 'https://placehold.co/1200x800/e2e8f0/64748b?text=Image+Not+Available' }}" alt="{{ latest_post.image_description | default: 'Top story image' | escape }}" class="hero-cover-img" loading="eager">
                <div class="hero-live-badge-tag">
                    <span class="hero-pulse-dot"></span>
                    <span>تازہ ترین رپورٹ</span>
                </div>
            </div>
            <div class="hero-content-pane">
                <div class="hero-meta-row">
                    {% if latest_post.categories.first %}
                    <span class="hero-cat-tag">{{ latest_post.categories.first | replace: '-', ' ' | capitalize }}</span>
                    {% endif %}
                    <time class="hero-post-date"><i class="far fa-calendar-alt ml-1"></i>{{ latest_post.date | date: "%B %d, %Y" }}</time>
                </div>
                <h2 class="hero-spotlight-title">{{ latest_post.title }}</h2>
                <div class="hero-subheadline-container">
                    <p class="hero-spotlight-desc">{{ latest_post.subheadline | default: latest_post.content | strip_html | truncatewords: 28 }}</p>
                </div>
                <div class="hero-action-bar">
                    <div class="hero-author-line">
                        <span class="hero-author-avatar">{{ latest_post.writer | default: latest_post.author | default: 'TMP' | slice: 0 | upcase }}</span>
                        <div class="hero-author-details">
                            <span class="hero-author-name">{{ latest_post.writer | default: latest_post.author | default: 'TMP Staff' }}</span>
                            {% assign hero_words = latest_post.content | number_of_words %}
                            <span class="hero-read-duration">{{ hero_words | divided_by: 200 | plus: 1 }} منٹ کا مطالعہ</span>
                        </div>
                    </div>
                    <span class="hero-read-btn">
                        <span>مزید پڑھیں</span> <i class="fas fa-arrow-left mr-1"></i>
                    </span>
                </div>
            </div>
        </a>
    </section>
    {% endif %}

    <div class="content-wrapper">
        <hr class="section-divider">
        
        <!-- Live Filterable Latest Reports Grid -->
        <section class="content-section latest-reports-section">
            <div class="section-header-compact">
                <h2 class="section-title">تازہ ترین رپورٹس</h2>
            </div>
            
            <div class="category-filters-nav-wrapper" id="home-filters-nav-wrapper">
                <div class="category-filters-container" id="home-filters-container">
                    <div class="category-filters" id="home-filters-bar">
                        <button class="filter-btn active" data-tag="">تمام</button>
                        <button class="filter-btn" data-tag="world-politics">عالمی سیاست</button>
                        <button class="filter-btn" data-tag="indian-politics">ہندوستانی سیاست</button>
                        <button class="filter-btn" data-tag="muslim-world">عالمِ اسلام</button>
                        <button class="filter-btn" data-tag="technology">ٹیکنالوجی</button>
                        <button class="filter-btn" data-tag="medical-science">طبی سائنس</button>
                        <button class="filter-btn" data-tag="global-economy">عالمی معیشت</button>
                        <button class="filter-btn" data-tag="art-culture">فن و ثقافت</button>
                        <button class="filter-btn" data-tag="weather">موسم</button>
                        <button class="filter-btn" data-tag="sports">کھیل</button>
                        <button class="filter-btn" data-tag="national-news">قومی خبریں</button>
                        <button class="filter-btn" data-tag="international-news">بین الاقوامی</button>
                        <button class="filter-btn" data-tag="history">تاریخ</button>
                        <button class="filter-btn" data-tag="indian-muslims">ہندوستانی مسلمان</button>
                        <button class="filter-btn" data-tag="middle-east">مشرقِ وسطیٰ</button>
                        <button class="filter-btn" data-tag="climate">ماحولیات</button>
                        <button class="filter-btn" data-tag="defense">دفاع</button>
                        <button class="filter-btn" data-tag="south-asia">جنوبی ایشیا</button>
                        <button class="filter-btn" data-tag="africa">افریقہ</button>
                        <button class="filter-btn" data-tag="europe">یورپ</button>
                        <button class="filter-btn" data-tag="central-asia">وسطی ایشیا</button>
                        <button class="filter-btn" data-tag="crime-alert">کرائم الرٹ</button>
                        <button class="filter-btn" data-tag="south-east-asia">جنوب مشرقی ایشیا</button>
                        <button class="filter-btn" data-tag="east-asia">مشرقی ایشیا</button>
                        <button class="filter-btn" data-tag="north-america">شمالی امریکہ</button>
                        <button class="filter-btn" data-tag="south-america">جنوبی امریکہ</button>
                    </div>
                </div>
            </div>
            
            <!-- Horizontal Article Listing -->
            <div class="news-grid-full" id="home-articles-grid" style="min-height: 150px;">
                {% for post in site.posts limit: 8 offset: 1 %}
                {% assign post_words = post.content | number_of_words %}
                {% assign post_read_time = post_words | divided_by: 200 | plus: 1 %}
                <a href="{{ post.url | relative_url }}" class="news-card horizontal-news-card">
                    <div class="news-card-text">
                        <div class="news-card-top-row">
                            {% if post.categories.first %}
                            <span class="news-card-category-badge">{{ post.categories.first | replace: '-', ' ' | capitalize }}</span>
                            {% endif %}
                            <span class="news-card-date">{{ post.date | date: "%b %d, %Y" }}</span>
                        </div>
                        <h3 class="news-card-headline">{{ post.title }}</h3>
                        <div class="subheadline-container">
                            <p class="news-card-subheadline">{{ post.subheadline | default: post.content | strip_html | truncatewords: 20 }}</p>
                        </div>
                        <div class="news-card-footer-row">
                            <span class="read-more-text">مزید پڑھیں <i class="fas fa-arrow-left mr-1"></i></span>
                            <span class="news-card-read-time">{{ post_read_time }} منٹ کا مطالعہ</span>
                        </div>
                    </div>
                    <div class="news-card-image-wrapper">
                        <img src="{{ post.image | default: 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image' }}" alt="{{ post.image_description | default: post.title | escape }}" class="news-card-image" loading="lazy">
                    </div>
                </a>
                {% endfor %}
            </div>
            <div id="home-loader" class="loader"></div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <a href="{{ '/news/hub/' | relative_url }}" class="explore-hub-btn">مکمل نیوز ہب دیکھیں <i class="fas fa-arrow-left mr-1.5"></i></a>
            </div>
        </section>

        <hr class="section-divider">
        
        <section class="content-section features-section reveal-on-scroll">
            <div class="section-header-compact">
                <h2 class="section-title">ہمارے ساتھ کیوں جڑیں؟</h2>
                <p class="section-subtitle">علم کے تبادلے، تحقیق اور غیر جانبدارانہ تجزیے کے لیے ایک آزاد اور معتبر پلیٹ فارم۔</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon-bubble grad-bubble-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                    <h3 class="feature-title">اپنی آواز بلند کریں</h3>
                    <p class="feature-text">اپنے مضامین، گہری تحقیق اور خیالات کو دنیا بھر کے قارئین تک آسانی سے پہنچائیں۔</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-bubble grad-bubble-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <h3 class="feature-title">ماہرین سے رابطہ قائم کریں</h3>
                    <p class="feature-text">دنیا بھر کے جغرافیائی سیاسی تجزیہ کاروں، محققین اور سنجیدہ قارئین کے ساتھ تبادلہ خیال کریں۔</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-bubble grad-bubble-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                    </div>
                    <h3 class="feature-title">ہمیشہ باخبر رہیں</h3>
                    <p class="feature-text">ہمارے آزاد نیوز روم کی جانب سے فراہم کردہ بریکنگ عالمی خبروں اور فوری تجزیات سے باخبر رہیں۔</p>
                </div>
            </div>
        </section>
    </div>

    <section class="cta-section">
        <div class="cta-card reveal-on-scroll">
            <span class="cta-pill-badge"><i class="fas fa-feather-pointed ml-1.5"></i>ٹی ایم پی میں حصہ لیں</span>
            <h2 class="cta-heading">اپنا علم اور تجزیہ شیئر کریں</h2>
            <p class="cta-subheading">عالمی نامہ نگاروں، محققین اور مصنفین کے بڑھتے ہوئے نیٹ ورک میں شامل ہوں۔ اپنا نقطہ نظر پیش کریں اور بامقصد مکالمے کا آغاز کریں۔</p>
            <a id="cta-get-started" href="{{ '/post/' | relative_url }}" class="cta-button">
                <span>لکھنا شروع کریں</span> <i class="fas fa-arrow-left mr-2"></i>
            </a>
        </div>
    </section>
</main>

<script>
    (function() {
        function initHomePage() {
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
            
            const revealElements = document.querySelectorAll('.reveal-on-scroll');
            if (revealElements.length > 0) {
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('is-visible');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });
                    
                    revealElements.forEach(element => {
                        if (!element.classList.contains('is-visible')) {
                            observer.observe(element);
                        }
                    });
                } else {
                    revealElements.forEach(element => {
                        element.classList.add('is-visible');
                    });
                }
            }
        }

        document.addEventListener('turbo:load', initHomePage);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHomePage);
        } else {
            initHomePage();
        }
    })();
</script>
