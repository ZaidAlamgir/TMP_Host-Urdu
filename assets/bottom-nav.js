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
        const loader = document.getElementById('home-loader');
        const filtersBar = document.getElementById('home-filters-bar');
        const CACHE_KEY = 'tmp_news_hub_v4';
        
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
                try {
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        homeArticlesList = JSON.parse(cachedData);
                        renderArticles(homeArticlesList.slice(1));
                        syncIndicator();
                    }
                } catch (cacheErr) {
                    console.warn("Failed to load cached homepage articles:", cacheErr);
                }
                
                const response = await fetch('/search.json');
                if (response.ok) {
                    const freshArticles = await response.json();
                    homeArticlesList = freshArticles;
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(freshArticles));
                    } catch (cacheErr) {
                        console.warn("Failed to cache fresh homepage articles:", cacheErr);
                    }
                    const activeBtn = filtersBar ? filtersBar.querySelector('.filter-btn.active') : null;
                    const tag = activeBtn ? activeBtn.getAttribute('data-tag') : '';
                    renderArticles(filterArticles(homeArticlesList.slice(1), tag));
                    syncIndicator();
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
                
                updateIndicator(btn);
                
                const tag = btn.getAttribute('data-tag');
                renderArticles(filterArticles(homeArticlesList.slice(1), tag));
            });
        }
        
        window.onresize = syncIndicator;
        
        setTimeout(() => {
            loadHomeArticles();
        }, 100);
    }

    function handlePageLoad() {
        highlightActiveLink();
        completeLoader();
        
        const homeGrid = document.getElementById('home-articles-grid');
        if (homeGrid) {
            initHomepageArticles(homeGrid);
        }
    }

    // --- 4. LISTENERS ---
    document.addEventListener('turbo:visit', startLoader);
    document.addEventListener('turbo:load', handlePageLoad);

    document.addEventListener('click', (e) => {
        const link = e.target.closest(CONFIG.linkSelector);
        if (link && !e.defaultPrevented) {
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

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        handlePageLoad();
    } else {
        document.addEventListener('DOMContentLoaded', handlePageLoad);
    }

})();