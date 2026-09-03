---
layout: default
title: Home - The Urdu Post
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
    <p>غیر جانبدار اور آزاد صحافت آج پہلے سے کہیں زیادہ ضروری ہے۔ TMPnews (The Urdu Post) کا ساتھ دیں۔</p>
    <a href="{{ '/support/' | relative_url }}" class="support-cta-button">تعاون کریں</a>
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
                <span class="hero-kicker">اہم ترین خبر</span>
                <h3 class="news-card-headline hero-headline" style="font-family:'Merriweather',serif;font-weight:900;margin-bottom:0.5rem;">{{ latest_post.title }}</h3>
                <div class="subheadline-container hero-subheadline-container">
                    <p class="news-card-subheadline">{{ latest_post.subheadline | default: latest_post.content | strip_html | truncatewords: 35 }}</p>
                </div>
                <span class="read-more-text">مزید پڑھیں &rarr;</span>
            </div>
        </a>
    </section>
    {% endif %}
    <div class="content-wrapper">
        <hr class="section-divider">
        
        <!-- Live Filterable Latest Reports Grid (NO reveal-on-scroll here so it is instantly visible) -->
        <section class="content-section latest-reports-section">
            <h2 class="section-title">تازہ رپورٹس</h2>
            <p class="section-subtitle">ملک و دنیا کی تازہ ترین خبروں، تجزیوں اور خصوصی رپورٹس سے باخبر رہیں۔</p>
            
            <div class="category-filters-container">
                <div class="category-filters" id="home-filters-bar">
                    <div class="filter-indicator" id="home-filter-indicator"></div>
                    <button class="filter-btn active" data-tag="">تمام</button>
                    <button class="filter-btn" data-tag="world-politics">عالمی سیاست</button>
                    <button class="filter-btn" data-tag="indian-politics">ہندوستانی سیاست</button>
                    <button class="filter-btn" data-tag="muslim-world">مسلم دنیا</button>
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
                    <button class="filter-btn" data-tag="middle-east">مشرق وسطیٰ</button>
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
            
            <div class="news-grid-full" id="home-articles-grid" style="min-height: 150px;"></div>
            <div id="home-loader" class="loader"></div>
            
            <div style="text-align: center; margin-top: 3rem;">
                <a href="{{ '/news/hub/' | relative_url }}" class="explore-hub-btn">پورا نیوز ہب دیکھیں &rarr;</a>
            </div>
        </section>

        <hr class="section-divider">
        
        <section class="content-section features-section reveal-on-scroll">
            <h2 class="section-title">ہم سے کیوں جڑیں؟</h2>
            <p class="section-subtitle">علم کا اشتراک کرنے اور بامقصد مباحثوں کو فروغ دینے کا پلیٹ فارم۔</p>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>
                    <h3>اپنی آواز بلند کریں</h3>
                    <p>اپنے مضامین، تحقیق اور آراء دنیا بھر کے قارئین تک باآسانی پہنچائیں۔</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                    <h3>ماہرین سے جڑیں</h3>
                    <p>مختلف شعبوں کے دانشوروں، محققین اور ماہرین کی کمیونٹی سے جڑیں۔</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/></svg></div>
                    <h3>باخبر رہیں</h3>
                    <p>ہمارے منتخب اور مستند تجزیات کے ساتھ ہمیشہ آگے رہیں۔</p>
                </div>
            </div>
        </section>
    </div>
    <section class="cta-section">
        <div class="cta-content reveal-on-scroll">
            <h1>اپنا علم اور خیالات شیئر کریں</h1>
            <p>دانشوروں، طلبہ اور ماہرین کی کمیونٹی کا حصہ بنیں۔ معلوماتی مضامین پڑھیں اور اپنی تحریر سے معاشرے کو آگاہ کریں۔</p>
            <a id="cta-get-started" href="{{ '/post/' | relative_url }}" class="cta-button">شروع کریں</a>
        </div>
    </section>
</main>

<script>
    (function() {
        function initHomePage() {
            // Check authentication state for CTA button
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
            
            // Initialize IntersectionObserver for scroll-reveal animations
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
                    // Fallback for browsers without IntersectionObserver
                    revealElements.forEach(element => {
                        element.classList.add('is-visible');
                    });
                }
            }
        }

        // Trigger on Turbo navigations
        document.addEventListener('turbo:load', initHomePage);

        // Trigger immediately or on DOMContentLoaded for initial page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHomePage);
        } else {
            initHomePage();
        }
    })();
</script>
