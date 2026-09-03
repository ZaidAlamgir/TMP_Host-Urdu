(function() {
    // =============================================================================
    // THE MUSLIM POST — HEADER INJECTOR (Smart Persistent Version)
    // =============================================================================

    const PATHS = {
        ROOT: '/',
        AUTH: '/auth.html',
        PROFILE: '/profile/',
        ABOUT: '/about/',
        TERMS: '/terms/',
        CMS: '/cms.html',
        NEWS_HUB: '/news/hub/'
    };

    // --- HELPER: FINISH LOADING ANIMATION (Optimized) ---
    function completeLoadingAnimation() {
        // Use querySelectorAll to catch duplicates if multiple were injected
        const bars = document.querySelectorAll('#android_progress_bar');
        
        bars.forEach(bar => {
            bar.style.width = '100%';
            requestAnimationFrame(() => {
                bar.style.opacity = '0';
                bar.style.transition = 'width 0.2s ease-out, opacity 0.2s ease';
                setTimeout(() => { 
                    if (bar.parentElement) bar.parentElement.removeChild(bar); 
                }, 250);
            });
        });
    }

    // --- NEW: PREVENT TURBO CACHE DUPLICATION ---
    // Remove the progress bar completely before Turbo caches the page state
    document.addEventListener("turbo:before-cache", function() {
        const bars = document.querySelectorAll('#android_progress_bar');
        bars.forEach(bar => {
            if (bar.parentElement) {
                bar.parentElement.removeChild(bar);
            }
        });
    });

    // --- HELPER: GENERATE USER COLOR ---
    function generateColorForUser(userId) {
        const colors = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047', '#7cb342', '#c0ca33', '#ffb300', '#fb8c00', '#f4511e', '#6d4c41', '#757575', '#546e7a'];
        let hash = 0;
        if (!userId || userId.length === 0) return colors[0];
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }

    function generateCategoryDropdownHTML() {
        const categories = [
            // Original Categories
            { name: "عالمی سیاست", tag: "world-politics" },
            { name: "ہندوستانی سیاست", tag: "indian-politics" },
            { name: "مسلم دنیا", tag: "muslim-world" },
            { name: "ٹیکنالوجی", tag: "technology" },
            { name: "طبی سائنس", tag: "medical-science" },
            { name: "عالمی معیشت", tag: "global-economy" },
            { name: "فن و ثقافت", tag: "art-culture" },
            { name: "موسم", tag: "weather" },
            { name: "کھیل", tag: "sports" },
            { name: "قومی خبریں", tag: "national-news" },
            { name: "بین الاقوامی", tag: "international-news" },
            // New Categories
            { name: "تاریخ", tag: "history" },
            { name: "ہندوستانی مسلمان", tag: "indian-muslims" },
            { name: "مشرق وسطیٰ", tag: "middle-east" },
            { name: "ماحولیات", tag: "climate" },
            { name: "دفاع", tag: "defense" },
            { name: "جنوبی ایشیا", tag: "south-asia" },
            { name: "افریقہ", tag: "africa" },
            { name: "یورپ", tag: "europe" },
            { name: "وسطی ایشیا", tag: "central-asia" },
            { name: "کرائم الرٹ", tag: "crime-alert" },
            { name: "جنوب مشرقی ایشیا", tag: "south-east-asia" },
            { name: "مشرقی ایشیا", tag: "east-asia" },
            { name: "شمالی امریکہ", tag: "north-america" },
            { name: "جنوبی امریکہ", tag: "south-america" }
        ];
        
        let dropdownHTML = `<ul class="categories-dropdown">`;
        dropdownHTML += `<li><a href="${PATHS.NEWS_HUB}">تمام زمرے</a></li>`;
        categories.forEach(cat => {
            dropdownHTML += `<li><a href="${PATHS.NEWS_HUB}?tag=${cat.tag}">${cat.name}</a></li>`;
        });
        dropdownHTML += `</ul>`;
        return dropdownHTML;
    }

    function updateProfileUI(user) {
        const isUserLoggedIn = !!user;
        const loginIconSvg = document.getElementById('login-icon-svg');
        const profilePicContainer = document.getElementById('profile-pic-container');
        const profileInitialCircle = document.getElementById('profile-initial-circle');
        const profilePicImg = document.getElementById('profile-pic-img');
        const userLink = document.querySelector('.header-right .user-icon-link');

        if (userLink) {
            userLink.href = isUserLoggedIn ? PATHS.PROFILE : PATHS.AUTH;
        }

        if (isUserLoggedIn && user) {
            if (loginIconSvg) loginIconSvg.style.display = 'none';
            if (profilePicContainer) profilePicContainer.style.display = 'flex';

            if (user.photoURL) {
                if (profilePicImg) {
                    profilePicImg.src = user.photoURL;
                    profilePicImg.style.display = 'block';
                }
                if (profileInitialCircle) profileInitialCircle.style.display = 'none';
            } else {
                if (profilePicImg) profilePicImg.style.display = 'none';
                if (profileInitialCircle) {
                    const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
                    profileInitialCircle.textContent = initial;
                    profileInitialCircle.style.backgroundColor = generateColorForUser(user.uid || user.id);
                    profileInitialCircle.style.display = 'flex';
                }
            }
        } else {
            if (loginIconSvg) loginIconSvg.style.display = 'block';
            if (profilePicContainer) profilePicContainer.style.display = 'none';
        }
    }

    // --- RENDER FUNCTION: SUPABASE/PUBLIC HEADER ---
    function renderSupabaseHeader(user) {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) return;

        const existingHeader = headerPlaceholder.querySelector('.header');
        if (existingHeader && existingHeader.dataset.headerType === 'public') {
            updateProfileUI(user);
            return; 
        }

        const isUserLoggedIn = !!user;
        const mainIconLink = isUserLoggedIn ? PATHS.PROFILE : PATHS.AUTH;
        const categoryDropdown = generateCategoryDropdownHTML();
        const isInsideApp = typeof window.AndroidInterface !== 'undefined';
        
        const settingsMenuItemHTML = isInsideApp ? `
            <a href="#" id="app-settings-menu-item" class="app-settings-link">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
            </a>
        ` : '';

        const supabaseHeaderHTML = `
            <header class="header" data-header-type="public">
                <div class="header-content">
                    <div class="header-left">
                        <button class="index-menu-button" id="index-menu-btn" title="Open Index">
                            <svg id="index-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            <svg id="index-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="header-center">
                        <a href="${PATHS.ROOT}" class="logo">
                            <svg class="vector-animation" width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
                                <defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                                <rect x="50" y="50" width="100" height="100" fill="#3498db" class="square"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" class="tmp-text">TMP</text>
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" stroke-width="2"/>
                            </svg>
                            <span class="logo-text">The Urdu Post</span>
                        </a>
                    </div>
                    <div class="header-right">
                        <a href="${mainIconLink}" class="user-icon-link">
                            <div id="login-icon-svg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M6 18c0-3 6-3 6-3s6 0 6 3"></path></svg>
                            </div>
                            <div id="profile-pic-container" style="display: none;">
                                <img id="profile-pic-img" src="" alt="Profile" style="display: none; width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                                <div id="profile-initial-circle" style="display: none; width: 30px; height: 30px; border-radius: 50%; justify-content: center; align-items: center; font-size: 1rem; font-weight: bold; color: white;"></div>
                            </div>
                        </a>
                    </div>
                </div>
            </header>
            <div class="index-menu-overlay" id="index-menu-overlay">
                <div class="index-menu-content">
                    <div class="search-box-container">
                        <input type="text" id="index-search-box" class="index-search-box" placeholder="خبریں یا ٹیگز تلاش کریں...">
                        <span class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
                    </div>
                    <ul id="index-results-list"></ul>
                    <div class="index-main-nav">
                        <a href="${PATHS.ROOT}" class="home-link-with-logo">
                            <span>ہوم</span>
                            <svg class="menu-home-logo" viewBox="0 0 200 200" aria-hidden="true">
                                <rect x="50" y="50" width="100" height="100" fill="#3498db" class="square"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" class="tmp-text">TMP</text>
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" stroke-width="4"/>
                            </svg>
                        </a>
                        <div class="nav-item-dropdown"> <span class="dropdown-toggle">زمرے</span>
                            ${categoryDropdown}
                        </div>
                        <a href="${PATHS.ABOUT}">ہمارے بارے میں</a>
                        <a href="${PATHS.TERMS}">شرائط و ضوابط</a>
                         ${settingsMenuItemHTML}
                    </div>
                </div>
            </div>
        `;

        headerPlaceholder.innerHTML = supabaseHeaderHTML;
        updateProfileUI(user);
        attachMenuLogic(); 
    }

    // --- RENDER FUNCTION: WRITER (CMS) HEADER ---
    function renderWriterHeader() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) return;
        
        const existingHeader = headerPlaceholder.querySelector('.header');
        if (existingHeader && existingHeader.dataset.headerType === 'writer') return;

        const categoryDropdown = generateCategoryDropdownHTML();
        const isInsideApp = typeof window.AndroidInterface !== 'undefined';
        
        const settingsMenuItemHTML = isInsideApp ? `
            <a href="#" id="app-settings-menu-item" class="app-settings-link">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
            </a>
        ` : '';

        const writerHeaderHTML = `
            <header class="header" data-header-type="writer">
                <div class="header-content">
                    <div class="header-left">
                        <button class="index-menu-button" id="index-menu-btn" title="Open Menu">
                            <svg id="index-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            <svg id="index-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="header-center">
                        <a href="${PATHS.ROOT}" class="logo">
                             <svg class="vector-animation" width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
                                <defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                                <rect x="50" y="50" width="100" height="100" fill="#3498db" class="square"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" class="tmp-text">TMP</text>
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" stroke-width="2"/>
                            </svg>
                            <span class="logo-text">The Urdu Post</span>
                        </a>
                    </div>
                    <div class="header-right">
                        <a id="writer-login-btn" class="user-icon-link" href="#" title="Writer Login">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </a>
                    </div>
                </div>
            </header>
            <div class="index-menu-overlay" id="index-menu-overlay">
                <div class="index-menu-content">
                    <div class="search-box-container">
                        <input type="text" id="index-search-box" class="index-search-box" placeholder="خبریں یا ٹیگز تلاش کریں...">
                        <span class="search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>
                    <ul id="index-results-list"></ul>
                    <div class="index-main-nav">
                        <a href="${PATHS.ROOT}" class="home-link-with-logo">
                            <span>ہوم</span>
                            <svg class="menu-home-logo" viewBox="0 0 200 200" aria-hidden="true">
                                <rect x="50" y="50" width="100" height="100" fill="#3498db" class="square"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" class="tmp-text">TMP</text>
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" stroke-width="4"/>
                            </svg>
                        </a>
                        <div class="nav-item-dropdown"> <span class="dropdown-toggle">زمرے</span>
                            ${categoryDropdown}
                        </div>
                        <a href="${PATHS.ABOUT}">ہمارے بارے میں</a>
                        <a href="${PATHS.TERMS}">شرائط و ضوابط</a>
                        ${settingsMenuItemHTML}
                    </div>
                </div>
            </div>
        `;
        headerPlaceholder.innerHTML = writerHeaderHTML;

        const writerLoginBtn = document.getElementById('writer-login-btn');
        if (writerLoginBtn) {
            writerLoginBtn.addEventListener('click', (event) => {
                event.preventDefault();
                showCustomConfirm("ADMIN NOTICE: This login is for authorized writers only. Press OK to continue.", () => {
                    window.location.href = PATHS.CMS;
                });
            });
        }

        attachMenuLogic();
    }

    function attachMenuLogic() {
        const indexMenuBtn = document.getElementById('index-menu-btn');
        if (indexMenuBtn && indexMenuBtn.dataset.listenerAttached === 'true') return;
        
        const indexMenuOverlay = document.getElementById('index-menu-overlay');
        const searchBox = document.getElementById('index-search-box');
        const resultsList = document.getElementById('index-results-list');
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownContainer = document.querySelector('.nav-item-dropdown');
        let allPosts = [];

        async function getPostData() {
            if (allPosts.length === 0) {
                try {
                    let searchUrl = `${PATHS.ROOT}search.json`.replace('//', '/'); 
                    let response = await fetch(searchUrl);
                    if (!response.ok) throw new Error("Status " + response.status);
                    allPosts = await response.json();
                } catch (error) { console.error("Search load error:", error); }
            }
            return allPosts;
        }

        function renderPosts(posts) {
            if (!resultsList) return;
            resultsList.innerHTML = '';
            if (posts.length === 0) {
                resultsList.innerHTML = '<li><a href="#">No results found.</a></li>';
                resultsList.classList.add('has-results');
                return;
            }
            resultsList.classList.add('has-results');
            posts.slice(0, 10).forEach(post => {
                const listItem = document.createElement('li');
                let safeUrl = post.url;
                if (!safeUrl.startsWith('/')) safeUrl = '/' + safeUrl;
                listItem.innerHTML = `<a href="${safeUrl}">${post.title}</a>`;
                resultsList.appendChild(listItem);
            });
        }

        function openMenu() {
            getPostData().then(posts => renderPosts(posts.slice(0, 5)));
            if(searchBox) searchBox.value = '';
            if(indexMenuBtn) indexMenuBtn.classList.add('active');
            if(indexMenuOverlay) indexMenuOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            document.documentElement.classList.add('menu-open');
        }

        function closeMenu() {
            if(indexMenuBtn) indexMenuBtn.classList.remove('active');
            if(indexMenuOverlay) indexMenuOverlay.classList.remove('active');
            if (dropdownContainer) dropdownContainer.classList.remove('open');
            if (resultsList) resultsList.classList.remove('has-results');
            document.body.classList.remove('menu-open');
            document.documentElement.classList.remove('menu-open');
        }

        if (indexMenuBtn) {
            indexMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                indexMenuBtn.classList.contains('active') ? closeMenu() : openMenu();
            });
            indexMenuBtn.dataset.listenerAttached = 'true';
        }

        if (indexMenuOverlay) {
            indexMenuOverlay.addEventListener('click', (e) => {
                if (e.target === indexMenuOverlay) closeMenu();
            });
        }

        const allNavLinks = document.querySelectorAll('.index-main-nav a');
        allNavLinks.forEach(link => {
             link.addEventListener('click', () => {
                 closeMenu();
             });
        });
        
        if (resultsList) {
            resultsList.addEventListener('click', (e) => {
                if (e.target.closest('a')) {
                    closeMenu();
                }
            });
        }

        if (searchBox) {
            searchBox.addEventListener('input', async (e) => {
                const query = e.target.value.toLowerCase().trim();
                const posts = await getPostData();
                const filteredPosts = query.length < 2
                    ? posts.slice(0, 5)
                    : posts.filter(post =>
                        (post.title && post.title.toLowerCase().includes(query)) ||
                        (post.tags && post.tags.toLowerCase().includes(query))
                    );
                renderPosts(filteredPosts);
            });
        }

        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (dropdownContainer) dropdownContainer.classList.toggle('open');
            });
        }
        
        const categoryLinks = document.querySelectorAll('.categories-dropdown li a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', () => { closeMenu(); });
        });

        const settingsLink = document.getElementById('app-settings-menu-item');
        if (settingsLink && typeof window.AndroidInterface !== 'undefined') {
            settingsLink.addEventListener('click', (event) => {
                event.preventDefault();
                try {
                    window.AndroidInterface.openAppSettings();
                    closeMenu();
                } catch (e) { console.error("Error calling AndroidInterface:", e); }
            });
        }
    }

    function initializeSupabaseHeader(forceRerender = false) {
        const CACHED_USER_KEY = 'cachedUser';
        let cachedUser = null;
        try {
            const cachedData = localStorage.getItem(CACHED_USER_KEY);
            if (cachedData) cachedUser = JSON.parse(cachedData);
        } catch (error) { localStorage.removeItem(CACHED_USER_KEY); }

        renderSupabaseHeader(cachedUser);

        const SUPABASE_URL = 'https://yfrqnghduttudqbnodwr.supabase.co'; 
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnFuZ2hkdXR0dWRxYm5vZHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDc3MTgsImV4cCI6MjA3NDEyMzcxOH0.i7JCX74CnE7pvZnBpCbuz6ajmSgIlA9Mx0FhlPJjzxU';
        
        if (window.supabase) {
             // FIX: Apply Singleton Pattern to prevent infinite loop on Turbo loads
             if (!window.supabaseClient) {
                 window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                 
                 // Attach the onAuthStateChange listener ONLY once
                 window.supabaseClient.auth.onAuthStateChange((event, session) => {
                     const user = session?.user;
                     if (user) {
                         const userToCache = {
                             uid: user.id,
                             displayName: user.user_metadata?.full_name,
                             email: user.email,
                             photoURL: user.user_metadata?.avatar_url
                         };
                         localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userToCache));
                         renderSupabaseHeader(userToCache); 
                     } else {
                         localStorage.removeItem(CACHED_USER_KEY);
                         renderSupabaseHeader(null); 
                     }
                 });
             }
        }
    }

    function initHeaderFlow(forceRerender = false) {
        if (typeof window.AndroidInterface !== 'undefined') {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) headerPlaceholder.innerHTML = '';
            return;
        }

        const pathname = window.location.pathname;
        const skipHeaderPages = [PATHS.AUTH, '/auth-callback.html', '/callback.html'];

        if (skipHeaderPages.some(page => pathname.endsWith(page))) {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) headerPlaceholder.innerHTML = '';
            return;
        }

        const isWriterPage = pathname.endsWith(PATHS.CMS) || pathname.endsWith('/liveCMS.html');

        if (isWriterPage) {
            renderWriterHeader();
        } else {
            initializeSupabaseHeader(forceRerender);
        }
    }
    document.addEventListener('turbo:load', function() {
        initHeaderFlow();
        completeLoadingAnimation(); 
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
       initHeaderFlow(); 
    } else {
       document.addEventListener('DOMContentLoaded', () => initHeaderFlow());
    }

})();