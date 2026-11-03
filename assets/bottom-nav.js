(function() {
    // CONFIGURATION
    const CONFIG = {
        linkSelector: '.bottom-nav-link',
        activeClass: 'active',
        loaderId: 'android_progress_bar',
        headerSelector: '.header', 
        fallbackHeaderHeight: '51px' 
    };

    let homeArticlesList = [];

    function normalizePath(path) {
        return path.replace(/\/$/, "").replace(/\.html$/, ""); 
    }

    // --- 1. LOADER START ---
    function startLoader() {
        // NEW FIX: If Android App handles it natively, trigger it and SKIP the web loader!
        if (window.AndroidInterface && window.AndroidInterface.showLoadingAnimation) {
            window.AndroidInterface.showLoadingAnimation();
            return; // 🛑 EXIT HERE: Prevents the double animation
        }

        let bar = document.getElementById(CONFIG.loaderId);
        const header = document.querySelector(CONFIG.headerSelector);
        
        // Prevent "Double Firing"
        if (bar && bar.style.opacity === '1') {
            return;
        }

        if (!bar) {
            bar = document.createElement('div');
            bar.id = CONFIG.loaderId;
            bar.setAttribute('data-turbo-permanent', 'true');
            if (header) {
                header.appendChild(bar); 
            } else {
                document.body.appendChild(bar);
            }
        }

        if (header && bar.parentNode === header) {
            bar.style.cssText = `
                position: absolute; 
                bottom: 0; 
                left: 0; 
                height: 3px; 
                background-color: #0073e6; 
                z-index: 9999; 
                width: 0%; 
                opacity: 1; 
                pointer-events: none;
                transition: none;
            `;
            const headerStyle = window.getComputedStyle(header);
            if (headerStyle.position === 'static') {
                header.style.position = 'relative';
            }
        } else {
            bar.style.cssText = `
                position: fixed; 
                top: ${CONFIG.fallbackHeaderHeight}; 
                left: 0; 
                height: 3px; 
                background-color: #0073e6; 
                z-index: 9999; 
                width: 0%; 
                opacity: 1; 
                pointer-events: none;
                transition: none;
            `;
        }

        void bar.offsetWidth; // Force browser to paint

        // Animate to 30% instantly
        requestAnimationFrame(() => {
            bar.style.transition = 'width 0.4s ease-out';
            bar.style.width = '30%';
        });

        // Trickle to 85% smoothly while waiting for network
        setTimeout(() => {
            if (bar && bar.parentNode) {
                bar.style.transition = 'width 4s cubic-bezier(0.1, 0.8, 0.3, 1)';
                bar.style.width = '85%';
            }
        }, 400);
    }

    // --- 2. LOADER FINISH ---
    function completeLoader() {
        // ALWAYS wake up the post page if needed
        if (window.initPostPage && document.getElementById('recentPostsContainer')) {
            window.initPostPage();
        }
        // ALWAYS wake up the inshot / live feed page if needed
        if (window.initLiveFeed && document.getElementById('live-feed')) {
            window.initLiveFeed();
        }

        // NEW FIX: If Android App handles it natively, stop it and SKIP the web loader!
        if (window.AndroidInterface && window.AndroidInterface.stopLoadingAnimation) {
            window.AndroidInterface.stopLoadingAnimation();
            return; // 🛑 EXIT HERE: Prevents the double animation
        }

        let bar = document.getElementById(CONFIG.loaderId);
        let wasRecreated = false;

        // If Turbo wiped the bar out, recreate it with plenty of runway (60%)
        if (!bar) {
            bar = document.createElement('div');
            bar.id = CONFIG.loaderId;
            const header = document.querySelector(CONFIG.headerSelector);
            wasRecreated = true;
            
            if (header) {
                header.appendChild(bar);
                bar.style.cssText = `position: absolute; bottom: 0; left: 0; height: 3px; background-color: #0073e6; z-index: 9999; opacity: 1; pointer-events: none; transition: none; width: 60%;`;
            } else {
                document.body.appendChild(bar);
                bar.style.cssText = `position: fixed; top: ${CONFIG.fallbackHeaderHeight}; left: 0; height: 3px; background-color: #0073e6; z-index: 9999; opacity: 1; pointer-events: none; transition: none; width: 60%;`;
            }
        }

        void bar.offsetWidth; 

        // Wait a tiny moment to guarantee the browser painted the starting position
        setTimeout(() => {
            if (!bar) return;
            
            // Step 1: Smooth, visible push to 100% over half a second
            bar.style.transition = 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'; 
            bar.style.width = '100%';
            bar.style.opacity = '1'; 
            
            // Step 2: Wait until it completely hits the edge (500ms), THEN fade it out
            setTimeout(() => {
                if (bar) {
                    bar.style.transition = 'opacity 0.3s ease-out';
                    bar.style.opacity = '0'; 
                }
            }, 500);

            // Step 3: Cleanup and remove
            setTimeout(() => {
                if (bar && bar.parentNode) bar.remove();
            }, 800); 

        }, wasRecreated ? 20 : 0); 
    }

    // --- 3. LOGIC ---
    function highlightActiveLink() {
        const currentPath = normalizePath(window.location.pathname) || "/";
        const links = document.querySelectorAll(CONFIG.linkSelector);
        links.forEach(l => l.classList.remove(CONFIG.activeClass));

        let matchFound = false;

        const isArticlePage = currentPath.startsWith('/news/') && !currentPath.startsWith('/news/hub');
        
        if (isArticlePage) {
            const latestTab = document.getElementById('nav-articles') || document.querySelector(`${CONFIG.linkSelector}[href*="latest"]`);
            if (latestTab) {
                latestTab.classList.add(CONFIG.activeClass);
                matchFound = true;
            }
        }
        
        if (!matchFound) {
            links.forEach(link => {
                if (matchFound) return;
                const rawLinkPath = new URL(link.href, window.location.origin).pathname;
                const linkPath = normalizePath(rawLinkPath) || "/";

                if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                    link.classList.add(CONFIG.activeClass);
                    matchFound = true;
                }
            });
        }

        if (!matchFound) {
            const home = document.querySelector(`${CONFIG.linkSelector}[href="/"]`);
            if (home) home.classList.add(CONFIG.activeClass);
        }
    }

    // --- HOMEPAGE ARTICLES LOADER ---
    function initHomepageArticles(homeGrid) {
        if (!homeGrid || homeGrid._homeArticlesInitialized) return;
        homeGrid._homeArticlesInitialized = true;

        const loader = document.getElementById('home-loader');
        const filtersBar = document.getElementById('home-filters-bar');
        const filtersContainer = document.getElementById('home-filters-container');
        const filtersNavWrapper = document.getElementById('home-filters-nav-wrapper');
        const CACHE_KEY = 'tmp_news_hub_v4';

        function updateFilterScrollState() {
            if (!filtersContainer || !filtersNavWrapper) return;
            const scrollLeft = filtersContainer.scrollLeft;
            const maxScroll = filtersContainer.scrollWidth - filtersContainer.clientWidth;
            const canScrollLeft = scrollLeft > 10;
            const canScrollRight = scrollLeft < maxScroll - 10;

            filtersNavWrapper.classList.toggle('can-scroll-left', canScrollLeft);
            filtersNavWrapper.classList.toggle('at-scroll-end', !canScrollRight);
        }

        if (filtersContainer && !filtersContainer._scrollListenersAttached) {
            filtersContainer._scrollListenersAttached = true;
            filtersContainer.addEventListener('scroll', updateFilterScrollState, { passive: true });
            window.addEventListener('resize', updateFilterScrollState, { passive: true });
            setTimeout(updateFilterScrollState, 100);

            let isDown = false;
            let startX = 0;
            let scrollStart = 0;
            let hasDragged = false;

            filtersContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                hasDragged = false;
                startX = e.pageX - filtersContainer.offsetLeft;
                scrollStart = filtersContainer.scrollLeft;
            });

            filtersContainer.addEventListener('mouseleave', () => {
                isDown = false;
            });

            filtersContainer.addEventListener('mouseup', () => {
                isDown = false;
            });

            filtersContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                const x = e.pageX - filtersContainer.offsetLeft;
                const walk = (x - startX);
                if (Math.abs(walk) > 4) {
                    hasDragged = true;
                    e.preventDefault();
                    filtersContainer.scrollLeft = scrollStart - walk;
                }
            });

            filtersContainer.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                    hasDragged = false;
                }
            }, true);
        }
        
        function filterArticles(articles, tag) {
            if (!tag) return articles;
            return articles.filter(post => {
                const postTags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
                return postTags.includes(tag);
            });
        }
        
        function getHomeSkeletonHTML(count = 4) {
            return '<div class="skeleton-fade-wrapper" id="home-skeleton-wrapper" style="display:flex;flex-direction:column;width:100%;grid-column:1/-1;">' +
                Array.from({ length: count }).map(() => `
                <div class="skeleton-horizontal-card">
                    <div class="skeleton-text-pane">
                        <div>
                            <div class="skeleton-shimmer-box skeleton-pill-sm"></div>
                            <div class="skeleton-shimmer-box skeleton-line-title"></div>
                            <div class="skeleton-shimmer-box skeleton-line-title-short"></div>
                            <div class="skeleton-shimmer-box skeleton-line-desc"></div>
                            <div class="skeleton-shimmer-box skeleton-line-desc-short"></div>
                        </div>
                    </div>
                    <div class="skeleton-shimmer-box skeleton-image-pane"></div>
                </div>
            `).join('') + '</div>';
        }

        function renderArticles(articlesToRender, animate = false) {
            if (!articlesToRender || articlesToRender.length === 0) {
                homeGrid.innerHTML = '<p style="text-align:center;color:#64748b;grid-column:1/-1;padding:2.5rem 1rem;font-weight:600;">اس زمرے میں کوئی خبر دستیاب نہیں ہے۔</p>';
                return;
            }
            const animClass = animate ? 'content-fade-in' : '';
            const limit = articlesToRender.slice(0, 8);
            homeGrid.innerHTML = limit.map(post => {
                const image = post.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
                const alt = post.image_description || post.title || 'تصویر';
                const subheadline = post.subheadline || 'مکمل خبر پڑھنے کے لیے کلک کریں۔';
                let formattedDate = '';
                if (post.date) {
                    const d = new Date(post.date);
                    const options = { month: 'short', day: 'numeric', year: 'numeric' };
                    formattedDate = d.toLocaleDateString('ur', options);
                }
                const firstTag = post.tags ? post.tags.split(',')[0].trim().replace(/-/g, ' ') : '';
                return `
                <a href="${post.url}" class="news-card horizontal-news-card ${animClass}">
                    <div class="news-card-text">
                        <div class="news-card-top-row">
                            ${firstTag ? `<span class="news-card-category-badge">${firstTag}</span>` : ''}
                            ${formattedDate ? `<span class="news-card-date">${formattedDate}</span>` : ''}
                        </div>
                        <h3 class="news-card-headline">${post.title}</h3>
                        <div class="subheadline-container">
                            <p class="news-card-subheadline">${subheadline}</p>
                        </div>
                        <div class="news-card-footer-row">
                            <span class="read-more-text">مزید پڑھیں <i class="fas fa-arrow-left mr-1"></i></span>
                        </div>
                    </div>
                    <div class="news-card-image-wrapper">
                        <img src="${image}" alt="${alt}" class="news-card-image" loading="lazy">
                    </div>
                </a>`;
            }).join('');
        }
        
        async function loadHomeArticles() {
            let hasCache = false;
            const activeBtn = filtersBar ? filtersBar.querySelector('.filter-btn.active') : null;
            const tag = activeBtn ? activeBtn.getAttribute('data-tag') : '';
            const existingCards = homeGrid.querySelectorAll('.horizontal-news-card');
            const hasExistingCards = existingCards.length > 0;

            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    homeArticlesList = JSON.parse(cachedData);
                    if (Array.isArray(homeArticlesList) && homeArticlesList.length > 0) {
                        hasCache = true;
                        // ONLY re-render from cache if the DOM is completely empty (no static cards)
                        // If articles are already painted, DO NOT touch the DOM (prevents tab-switch flicker!)
                        if (!hasExistingCards && !tag) {
                            renderArticles(filterArticles(homeArticlesList.slice(1), tag), false);
                        }
                    }
                }
            } catch (cacheErr) {
                console.warn("Failed to load cached homepage articles:", cacheErr);
            }

            // Only show skeleton if NO cache exists AND grid has no existing cards
            if (!hasCache && !hasExistingCards && (!homeGrid.children || homeGrid.children.length === 0)) {
                homeGrid.innerHTML = getHomeSkeletonHTML(4);
            }

            try {
                const response = await fetch('/search.json');
                if (response.ok) {
                    const freshArticles = await response.json();
                    if (Array.isArray(freshArticles) && freshArticles.length > 0) {
                        const targetBatch = filterArticles(freshArticles.slice(1), tag).slice(0, 8);
                        const currentUrls = Array.from(homeGrid.querySelectorAll('.horizontal-news-card')).map(a => a.getAttribute('href'));
                        const newUrls = targetBatch.map(p => p.url);

                        const isDifferent = currentUrls.length !== newUrls.length || 
                            currentUrls.some((u, i) => u !== newUrls[i]);

                        homeArticlesList = freshArticles;
                        try {
                            localStorage.setItem(CACHE_KEY, JSON.stringify(freshArticles));
                        } catch (cacheErr) {}

                        // ONLY re-render if the articles in the DOM actually changed or skeleton is currently visible!
                        const skWrapper = document.getElementById('home-skeleton-wrapper');
                        if (isDifferent || skWrapper) {
                            if (skWrapper) {
                                skWrapper.classList.add('fade-out');
                                setTimeout(() => {
                                    renderArticles(targetBatch, true);
                                }, 180);
                            } else {
                                renderArticles(targetBatch, true);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load homepage articles:", e);
            } finally {
                if (loader) loader.classList.remove('visible');
            }
        }
        
        if (filtersBar && !filtersBar._listenerAttached) {
            filtersBar._listenerAttached = true;
            filtersBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                
                filtersBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                updateFilterScrollState();
                
                const tag = btn.getAttribute('data-tag');
                if (homeArticlesList && homeArticlesList.length > 0) {
                    renderArticles(filterArticles(homeArticlesList.slice(1), tag), true);
                } else {
                    homeGrid.innerHTML = getHomeSkeletonHTML(4);
                }
            });
        }
        
        setTimeout(() => {
            loadHomeArticles();
        }, 80);
    }

    function handlePageLoad() {
        highlightActiveLink();
        completeLoader();

        const latestUrl = document.body.getAttribute('data-latest-post-url');
        if (latestUrl) {
            const navArticles = document.getElementById('nav-articles');
            if (navArticles && !navArticles.href.includes(latestUrl)) {
                navArticles.href = latestUrl;
            }
        }
        
        const homeGrid = document.getElementById('home-articles-grid');
        if (homeGrid) {
            initHomepageArticles(homeGrid);
        }
    }

    // --- 4. LISTENERS ---
    document.addEventListener('turbo:visit', startLoader);
    document.addEventListener('turbo:load', handlePageLoad);
    if (!window._bottomNavInitialized) {
        window._bottomNavInitialized = true;
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            handlePageLoad();
        } else {
            document.addEventListener('DOMContentLoaded', handlePageLoad);
        }
    }

    function renderInshotSkeletonPreview() {
        const wrapper = document.querySelector('.main-content-wrapper') || document.querySelector('main');
        if (!wrapper) return;

        // Attach live.css dynamically if not already loaded in <head>
        if (!document.querySelector('link[href*="live.css"]')) {
            const linkEl = document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = '/assets/style/live.css';
            document.head.appendChild(linkEl);
        }

        const savedScroll = parseInt(sessionStorage.getItem('inshot_scroll_y')) || 0;
        const containerMinHeight = savedScroll > 80 ? `${savedScroll + window.innerHeight + 200}px` : 'auto';

        wrapper.innerHTML = `
            <div class="live-container inshot-page-container" style="min-height: ${containerMinHeight};">
                <header class="inshot-header">
                    <div class="inshot-badge-row">
                        <span class="inshot-live-badge">
                            <span class="live-pulse-dot"></span>
                            <span class="live-pulse-ring"></span>
                            TMPnews-Inshorts
                        </span>
                    </div>
                </header>
                <div id="new-posts-pill" class="new-posts-pill" style="display: none;"><i class="fas fa-arrow-up"></i><span>نئی اپڈیٹس دستیاب ہیں</span></div>
                <div id="live-feed-persistence-wrapper">
                    <div id="pinned-post-container"></div>
                    <div id="live-feed">
                        <div id="feed-skeleton-wrapper" class="skeleton-feed-wrapper">
                            <div class="skeleton-post">
                                <div class="live-post-content inshot-card-inner">
                                    <div class="live-post-meta inshot-card-meta">
                                        <div class="skeleton-shimmer skeleton-badge"></div>
                                        <div class="skeleton-shimmer skeleton-byline"></div>
                                    </div>
                                    <div class="skeleton-shimmer skeleton-title-long"></div>
                                    <div class="skeleton-shimmer skeleton-title-short"></div>
                                    <div class="skeleton-shimmer skeleton-text-full"></div>
                                    <div class="skeleton-shimmer skeleton-text-full"></div>
                                    <div class="skeleton-shimmer skeleton-text-short"></div>
                                    <div class="skeleton-footer">
                                        <div class="skeleton-footer-left">
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                        </div>
                                        <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="skeleton-post">
                                <div class="live-post-content inshot-card-inner">
                                    <div class="live-post-meta inshot-card-meta">
                                        <div class="skeleton-shimmer skeleton-badge"></div>
                                        <div class="skeleton-shimmer skeleton-byline"></div>
                                    </div>
                                    <div class="skeleton-shimmer skeleton-title-long"></div>
                                    <div class="skeleton-shimmer skeleton-image"></div>
                                    <div class="skeleton-shimmer skeleton-text-full"></div>
                                    <div class="skeleton-shimmer skeleton-text-short"></div>
                                    <div class="skeleton-footer">
                                        <div class="skeleton-footer-left">
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                        </div>
                                        <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="skeleton-post">
                                <div class="live-post-content inshot-card-inner">
                                    <div class="live-post-meta inshot-card-meta">
                                        <div class="skeleton-shimmer skeleton-badge"></div>
                                        <div class="skeleton-shimmer skeleton-byline"></div>
                                    </div>
                                    <div class="skeleton-shimmer skeleton-title-long"></div>
                                    <div class="skeleton-shimmer skeleton-title-short"></div>
                                    <div class="skeleton-shimmer skeleton-text-full"></div>
                                    <div class="skeleton-shimmer skeleton-text-short"></div>
                                    <div class="skeleton-footer">
                                        <div class="skeleton-footer-left">
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                            <div class="skeleton-shimmer skeleton-pill"></div>
                                        </div>
                                        <div class="skeleton-shimmer skeleton-pill skeleton-share"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="feed-posts-container" class="feed-posts-container fade-enter"></div>
                    </div>
                </div>
            </div>`;
        if (savedScroll > 80) {
            window.scrollTo(0, savedScroll);
        } else {
            window.scrollTo(0, 0);
        }
    }

    function prewarmInshotTab() {
        try {
            if (window.Turbo && window.Turbo.navigator && typeof window.Turbo.navigator.preloadURL === 'function') {
                const liveUrl = new URL('/live/', window.location.origin).href;
                window.Turbo.navigator.preloadURL(liveUrl);
            }
            // Background pre-fetch feed JSON into cache if not present
            const isHindi = document.documentElement.lang === 'hi' || window.location.pathname.includes('/hi');
            const isUrdu = document.documentElement.lang === 'ur' || window.location.pathname.includes('/ur');
            const langCode = isHindi ? 'hi' : (isUrdu ? 'ur' : 'en');
            const cacheKey = `cachedLiveFeed_${langCode}_v8`;
            if (!localStorage.getItem(cacheKey) && !sessionStorage.getItem(cacheKey)) {
                fetch(`https://data.tmpnews.com/feed.json?lang=${langCode}`, { cache: 'default' })
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (Array.isArray(data) && data.length > 0) {
                            const cachePayload = JSON.stringify({ timestamp: Date.now(), posts: data });
                            try { localStorage.setItem(cacheKey, cachePayload); } catch(e) {}
                            try { sessionStorage.setItem(cacheKey, cachePayload); } catch(e) {}
                        }
                    })
                    .catch(() => {});
            }
        } catch(e) {}
    }
    if ('requestIdleCallback' in window) {
        requestIdleCallback(prewarmInshotTab);
    } else {
        setTimeout(prewarmInshotTab, 600);
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest(CONFIG.linkSelector);
        if (link && !e.defaultPrevented) {
            const currentPath = normalizePath(window.location.pathname) || "/";
            // If user is already on Inshort tab and taps it again: scroll smoothly to top
            if (link.id === 'nav-live' && (currentPath === '/live' || currentPath.endsWith('/live'))) {
                e.preventDefault();
                sessionStorage.removeItem('inshot_active_post_id');
                sessionStorage.removeItem('inshot_scroll_y');
                sessionStorage.removeItem('inshot_post_offset');
                sessionStorage.removeItem('liveFeedScroll');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (window.flushPendingLivePosts) {
                    setTimeout(window.flushPendingLivePosts, 250);
                }
                return;
            }
            // If leaving live feed to another tab, capture scroll state immediately
            if (window.saveInshotScrollState && currentPath.includes('/live')) {
                window.saveInshotScrollState();
            }
            // If entering Inshort from another tab: immediately display dummy layout so user gets 0ms transition!
            if (link.id === 'nav-live' && !currentPath.includes('/live')) {
                renderInshotSkeletonPreview();
            }
            startLoader();
            document.querySelectorAll(CONFIG.linkSelector).forEach(l => l.classList.remove(CONFIG.activeClass));
            link.classList.add(CONFIG.activeClass);
        }
    });

    window.addEventListener('popstate', () => {
        highlightActiveLink();
        if (window.Turbo) {
            window.Turbo.visit(window.location.href, { action: "replace" });
        } else {
            window.location.reload();
        }
    });

    document.addEventListener('turbo:before-cache', () => {
        document.querySelectorAll(CONFIG.linkSelector).forEach(l => l.classList.remove(CONFIG.activeClass));
    });

})();