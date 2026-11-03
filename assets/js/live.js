(function() {
    function safeJSONParse(dataStr, fallback = []) {
        if (!dataStr) return fallback;
        try { 
            const parsed = JSON.parse(dataStr);
            return parsed !== null ? parsed : fallback;
        } catch (e) { 
            console.warn("Cleared corrupted local data.");
            return fallback; 
        }
    }

    // --- Unified Liked State Management (Unique Star Design + Guaranteed User Confirmation) ---
    const LIKE_TITLES = {
        liked: 'اسٹار کیا گیا (اسٹار ختم کرنے کے لیے کلک کریں)',
        unliked: 'اس اپ ڈیٹ کو اسٹار کریں'
    };

    function getOrCreateClientId() {
        let cid = localStorage.getItem('anonClientId');
        if (!cid) {
            cid = 'anon-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
            try { localStorage.setItem('anonClientId', cid); } catch(e) {}
        }
        return cid;
    }

    function getLikedPostIds() {
        return new Set(safeJSONParse(localStorage.getItem('likedLivePosts'), []).map(String));
    }

    function isPostLiked(postId) {
        if (!postId && postId !== 0) return false;
        return getLikedPostIds().has(String(postId));
    }

    function setPostLiked(postId, liked) {
        if (!postId && postId !== 0) return;
        const idStr = String(postId);
        const set = getLikedPostIds();
        if (liked) {
            set.add(idStr);
        } else {
            set.delete(idStr);
        }
        try {
            localStorage.setItem('likedLivePosts', JSON.stringify(Array.from(set)));
        } catch(e) {}
    }

    window._userLikedPostsPending = window._userLikedPostsPending || new Map();

    function calculateDisplayLikes(postId, serverCount) {
        serverCount = (typeof serverCount === 'number' && !isNaN(serverCount)) ? serverCount : 0;
        const idStr = String(postId);
        const isLiked = isPostLiked(idStr);
        const pending = window._userLikedPostsPending ? window._userLikedPostsPending.get(idStr) : null;

        if (pending) {
            if (pending.liked) {
                if (serverCount <= pending.baseServer) {
                    return pending.baseServer + 1;
                }
                return serverCount;
            } else {
                if (serverCount >= pending.baseServer && pending.baseServer > 0) {
                    return Math.max(0, serverCount - 1);
                }
                return serverCount;
            }
        }

        // If user already liked this post in localStorage, count must never drop to 0
        if (isLiked && serverCount === 0) {
            return 1;
        }
        return serverCount;
    }

    function updateAllLikeButtonsForPost(postId, isLiked, newCount) {
        const idStr = String(postId);
        const btns = document.querySelectorAll(`.like-btn[data-post-id="${idStr}"]`);
        btns.forEach(btn => {
            btn.setAttribute('data-liked', isLiked ? 'true' : 'false');
            if (isLiked) {
                btn.classList.add('is-liked');
                btn.setAttribute('title', LIKE_TITLES.liked);
                btn.setAttribute('aria-label', LIKE_TITLES.liked);
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('is-liked');
                btn.setAttribute('title', LIKE_TITLES.unliked);
                btn.setAttribute('aria-label', LIKE_TITLES.unliked);
                btn.setAttribute('aria-pressed', 'false');
            }
            const icon = btn.querySelector('i, svg');
            if (icon) {
                if (icon.tagName.toLowerCase() === 'svg') {
                    if (isLiked) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                    } else {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                    }
                } else {
                    icon.className = isLiked ? 'fa-solid fa-star' : 'fa-regular fa-star';
                }
            }
            const countSpan = btn.querySelector('.like-count');
            if (countSpan && typeof newCount === 'number') {
                countSpan.textContent = newCount;
            }
        });

        const separateSpans = document.querySelectorAll(`[id="like-count-${idStr}"]`);
        separateSpans.forEach(span => {
            if (typeof newCount === 'number') {
                span.textContent = newCount;
            }
        });
    }

    function sendLikePing(url) {
        if (navigator.sendBeacon) {
            try {
                const blob = new Blob([], { type: 'text/plain' });
                if (navigator.sendBeacon(url, blob)) return;
            } catch(e) {}
        }
        fetch(url, { method: 'POST', cache: 'no-store', keepalive: true }).catch(() => {
            fetch(url, { method: 'GET', cache: 'no-store', keepalive: true }).catch(() => {});
        });
    }

    function updateCachedFeedPostLikes(postId, newCount) {
        const idStr = String(postId);
        try {
            if (window._cachedLiveFeedObj) {
                const posts = Array.isArray(window._cachedLiveFeedObj)
                    ? window._cachedLiveFeedObj
                    : (window._cachedLiveFeedObj.posts || []);
                const post = posts.find(p => String(p.id) === idStr);
                if (post) {
                    post.like_count = newCount;
                }
            }
            const cacheKeys = ['cachedLiveFeed_en_v8', 'cachedLiveFeed_hi_v8', 'cachedLiveFeed_ur_v8'];
            for (const key of cacheKeys) {
                const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
                if (raw) {
                    const parsed = safeJSONParse(raw, null);
                    if (parsed && Array.isArray(parsed.posts)) {
                        const post = parsed.posts.find(p => String(p.id) === idStr);
                        if (post) {
                            post.like_count = newCount;
                            const updated = JSON.stringify(parsed);
                            sessionStorage.setItem(key, updated);
                            localStorage.setItem(key, updated);
                        }
                    }
                }
            }
        } catch(e) {}
    }
    function copyLiveLink(url, btn) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showLiveCopyFeedback(btn);
            }).catch(() => {
                fallbackLiveCopy(url, btn);
            });
        } else {
            fallbackLiveCopy(url, btn);
        }
    }

    function fallbackLiveCopy(url, btn) {
        try {
            const input = document.createElement('input');
            input.value = url;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showLiveCopyFeedback(btn);
        } catch (e) {
            prompt("Copy this link:", url);
        }
    }

    function showLiveCopyFeedback(btn) {
        if (!btn) return;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-2 text-emerald-500"></i>Copied!';
        btn.style.pointerEvents = 'none';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.pointerEvents = 'auto';
        }, 2000);
    }

    // --- Performance & UX: User Interaction Tracking (Dominance over programmatic scroll) ---
    let userHasManuallyScrolled = false;
    const markUserScroll = () => {
        userHasManuallyScrolled = true;
    };
    // Only genuine scroll gestures mark manual scroll (never clicks, taps, or pointerdown)
    window.addEventListener('wheel', markUserScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', markUserScroll, { passive: true, capture: true });
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'].includes(e.key)) {
            userHasManuallyScrolled = true;
        }
    }, { passive: true, capture: true });

    function safeScrollTo(y, behavior = 'instant') {
        if (userHasManuallyScrolled) return;
        try {
            window.scrollTo({ top: Math.max(0, y), behavior });
        } catch(e) {
            window.scrollTo(0, Math.max(0, y));
        }
    }

    function scrollToTargetPost(postId, scrollY, offset = 0) {
        if (userHasManuallyScrolled) return;
        let finalY = 0;
        let targetEl = null;

        if (postId) {
            targetEl = document.getElementById(postId);
            if (targetEl) {
                const postTop = targetEl.getBoundingClientRect().top + window.scrollY;
                finalY = Math.max(0, postTop - 56 + offset - 20);
            } else if (scrollY > 0) {
                finalY = scrollY;
            }
        } else if (scrollY > 0) {
            finalY = scrollY;
        }

        if (finalY <= 0 || userHasManuallyScrolled) return;

        // Instant anchor (0ms) - matching BBC / Al Jazeera international live standard (no delayed jump)
        safeScrollTo(finalY, 'instant');
    }

    // --- Performance: Deduplication & Timeout for External Network Calls (Points 3 & 12) ---
    let inFlightFeedPromise = null;
    async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch(err) {
            clearTimeout(timer);
            throw err;
        }
    }

    function deduplicatedFetchFeed(url, options = {}, timeoutMs = 8000) {
        if (inFlightFeedPromise) return inFlightFeedPromise;
        inFlightFeedPromise = fetchWithTimeout(url, options, timeoutMs).finally(() => {
            inFlightFeedPromise = null;
        });
        return inFlightFeedPromise;
    }

    window.copyLivePostDirectLink = function(e, postId) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const btn = e ? (e.currentTarget || (e.target && e.target.closest('button'))) : null;
        const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
        copyLiveLink(postUrl, btn);
    };

    document.addEventListener('click', function(e) {
        // --- Live Post Share Handler ---
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            const postId = shareBtn.dataset.postId;
            // CRITICAL GUARD: Only handle share buttons belonging to live posts
            // Regular article share buttons (e.g. #native-share-button) or buttons without a valid postId
            // must NOT be intercepted by the live feed script!
            if (!postId || postId === "undefined" || shareBtn.id === 'native-share-button' || !shareBtn.closest('#live-feed, #live-feed-persistence-wrapper, #pinned-post-container, .live-post')) {
                return;
            }
            e.preventDefault();
            const postHeadline = shareBtn.dataset.postHeadline;
            const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
            const shareText = `Live Update: ${postHeadline || 'Live Update'}`; 
            if (window.AndroidInterface && typeof window.AndroidInterface.share === 'function') { 
                window.AndroidInterface.share(postHeadline || 'Live Update', shareText, postUrl); 
            } else if (navigator.share) { 
                navigator.share({ title: postHeadline || 'Live Update', text: shareText, url: postUrl }).catch(err => {
                    if (err.name !== 'AbortError') copyLiveLink(postUrl, shareBtn);
                }); 
            } else { 
                copyLiveLink(postUrl, shareBtn); 
            }
            return;
        }

        // --- Live Post Like Handler (Instant Optimistic UI + Guaranteed User Confirmation + Robust Counting) ---
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const now = Date.now();
            window._lastLikeTapTime = window._lastLikeTapTime || 0;
            if (now - window._lastLikeTapTime < 280) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            window._lastLikeTapTime = now;

            const postId = likeBtn.dataset.postId;
            if (!postId || postId === "undefined" || !likeBtn.closest('#live-feed, #live-feed-persistence-wrapper, #pinned-post-container, .live-post')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();

            const postIdStr = String(postId);
            const isCurrentlyLiked = isPostLiked(postIdStr);
            const isNowLiked = !isCurrentlyLiked;

            // 1. Calculate new count instantly based on current UI display
            const likeCountSpan = likeBtn.querySelector('.like-count') || document.getElementById(`like-count-${postIdStr}`);
            const currentCount = likeCountSpan ? (parseInt(likeCountSpan.textContent.replace(/,/g, '')) || 0) : 0;
            const newCount = isNowLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

            // 2. Persist user liked state in localStorage immediately
            setPostLiked(postIdStr, isNowLiked);

            // 3. Record pending state for intelligent server reconciliation
            window._userLikedPostsPending = window._userLikedPostsPending || new Map();
            window._userLikedPostsPending.set(postIdStr, {
                liked: isNowLiked,
                baseServer: currentCount,
                timestamp: Date.now()
            });

            // 4. Update ALL matching buttons & counts across the entire page (pinned card + regular feed)
            updateAllLikeButtonsForPost(postIdStr, isNowLiked, newCount);

            // 5. Tactile pop animations
            likeBtn.classList.remove('animate-pop');
            void likeBtn.offsetWidth;
            likeBtn.classList.add('animate-pop');

            if (likeCountSpan) {
                likeCountSpan.classList.remove('count-pop');
                void likeCountSpan.offsetWidth;
                likeCountSpan.classList.add('count-pop');
            }

            // 6. Update cached feed in memory / storage so tab swapping retains exact count
            updateCachedFeedPostLikes(postIdStr, newCount);

            // 7. Background async sync to worker (Fire-and-forget, never blocking UI)
            const action = isNowLiked ? 'increment' : 'decrement';
            const ANALYTICS_WRITE_URL = 'https://data.tmpnews.com/feed.json';
            const clientId = getOrCreateClientId();
            const endpoint = `${ANALYTICS_WRITE_URL}?log=like&post_id=${postIdStr}&action=${action}&client_id=${clientId}`;

            sendLikePing(endpoint);
            return;
        }
    });

    // --- NEW: Desktop Drag-to-Scroll Functionality ---
    let isDraggingCarousel = false;
    let carouselStartX, carouselScrollLeft;
    let currentCarousel = null;

    document.addEventListener('mousedown', (e) => {
        const track = e.target.closest('.carousel-track');
        if (!track) return;
        isDraggingCarousel = true;
        currentCarousel = track;
        currentCarousel.style.cursor = 'grabbing';
        currentCarousel.style.scrollSnapType = 'none'; // Disable snapping while dragging for smooth movement
        carouselStartX = e.pageX - currentCarousel.offsetLeft;
        carouselScrollLeft = currentCarousel.scrollLeft;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingCarousel || !currentCarousel) return;
        e.preventDefault(); // Prevents default browser image dragging/text selection
        const x = e.pageX - currentCarousel.offsetLeft;
        const walk = (x - carouselStartX) * 1.5; // Scroll speed multiplier
        currentCarousel.scrollLeft = carouselScrollLeft - walk;
    });

    const stopCarouselDrag = () => {
        if (!isDraggingCarousel || !currentCarousel) return;
        isDraggingCarousel = false;
        currentCarousel.style.cursor = 'grab';
        currentCarousel.style.scrollSnapType = 'x mandatory'; // Re-enable snapping so it locks into place
        currentCarousel = null;
    };

    document.addEventListener('mouseup', stopCarouselDrag);
    document.addEventListener('mouseleave', stopCarouselDrag);
    
    // --- UPDATED: Accurate Carousel Counter with Peek Offset ---
    window.updateCarouselCounter = function(track, total) {
        let slide = track.querySelector('.carousel-slide');
        if (!slide) return;
        // Calculate offset based on slide width + gap (8px)
        let snapWidth = slide.offsetWidth + 8;
        let index = Math.round(track.scrollLeft / snapWidth);
        // Prevent index from exceeding bounds on over-scroll bounce
        index = Math.max(0, Math.min(index, total - 1));
        
        let counter = track.parentElement.querySelector('.image-counter');
        if (counter) {
            counter.innerText = (index + 1) + '/' + total;
        }
    };

    window.currentTranslatingPostId = null;
    const SEPARATOR_TOKEN = "|||||"; 
    window.requestLivePostTranslation = function(postId, lang) {
        if (window.currentTranslatingPostId) { console.log("Translation already in progress."); return; }
        if (window.AndroidTranslator) {
            window.currentTranslatingPostId = postId;
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                const controls = postElement.querySelector('.live-translation-controls');
                if(controls) controls.style.opacity = '0.5';
                const headlineEl = postElement.querySelector('.live-post-headline');
                const contentDiv = postElement.querySelector('.post-body');
                if (!postElement.dataset.originalHeadline) postElement.dataset.originalHeadline = headlineEl ? headlineEl.innerText : "";
                if (!postElement.dataset.originalBody) {
                    let cleanText = "";
                    contentDiv.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) cleanText += node.textContent;
                        else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('translated-text-block')) cleanText += node.innerText + "\n"; 
                    });
                    postElement.dataset.originalBody = cleanText.trim();
                }
                const combinedText = postElement.dataset.originalHeadline + SEPARATOR_TOKEN + postElement.dataset.originalBody;
                window.AndroidTranslator.requestTranslation(combinedText, lang);
            }
        } else { console.log("Android Translator Interface not found."); }
    };
    window.updateTranslationProgress = function(isProcessing) {
        if (window.currentTranslatingPostId) {
            const postElement = document.getElementById(`post-${window.currentTranslatingPostId}`);
            if (postElement) {
                const progressBar = postElement.querySelector('.translation-progress-container');
                const processingText = postElement.querySelector('.processing-text');
                const btns = postElement.querySelector('.live-translation-controls');
                if (isProcessing) {
                    if (progressBar) progressBar.style.display = 'block';
                    if (processingText) processingText.style.display = 'block';
                    if (btns) { btns.style.opacity = '0.5'; btns.style.pointerEvents = 'none'; }
                } else {
                    if (progressBar) progressBar.style.display = 'none';
                    if (processingText) processingText.style.display = 'none';
                    if (btns) { btns.style.opacity = '1'; btns.style.pointerEvents = 'auto'; }
                    window.currentTranslatingPostId = null;
                }
            }
        }
    };
    window.updateContentWithTranslation = function(translatedText) {
        if (window.currentTranslatingPostId) {
            const postElement = document.getElementById(`post-${window.currentTranslatingPostId}`);
            if (postElement) {
                const contentDiv = postElement.querySelector('.post-body');
                const existingTrans = contentDiv.querySelectorAll('.translated-text-block');
                existingTrans.forEach(el => el.remove());

                let transHeadline = "";
                let transBody = translatedText;
                if (translatedText.includes("|||||")) {
                    const parts = translatedText.split("|||||");
                    transHeadline = parts[0].trim();
                    transBody = parts[1].trim();
                }
                transBody = transBody.replace(/\|\|\|\|\|/g, "");
                const translationContainer = document.createElement('div');
                translationContainer.className = 'translated-text-block';
                translationContainer.innerHTML = `<div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#1e40af; margin-bottom:8px; letter-spacing:0.05em;">Translated Content</div><div class="translated-headline">${transHeadline}</div><div style="line-height:1.65;">${transBody.replace(/\n/g, '<br>')}</div>`;
                contentDiv.appendChild(translationContainer);
                const controls = postElement.querySelector('.live-translation-controls');
                if(controls) controls.style.opacity = '1';
            }
        }
    };
    function animateCountUp(element, startValue, endValue, duration = 800) {
        if (startValue === endValue) { element.textContent = endValue; return; }
        let startTime = null;
        const easeOutQuad = t => t * (2 - t);
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / duration, 1);
            const easedT = easeOutQuad(t);
            const currentValue = Math.floor(easedT * (endValue - startValue) + startValue);
            element.textContent = currentValue;
            if (t < 1) { requestAnimationFrame(step); } else { element.textContent = endValue; }
        };
        requestAnimationFrame(step);
    }
    function initLiveFeed() {
        if (window.AndroidTranslator) {
            console.log("Android App Detected: Enabling Native Features");
            document.body.classList.add('android-app-view');
        }
        const pinnedPostContainer = document.getElementById('pinned-post-container');
        const liveFeed = document.getElementById('live-feed');
        if (!liveFeed) return; 

        const SUPABASE_URL = 'https://ofszjurrajwtbwlfckhi.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mc3pqdXJyYWp3dGJ3bGZja2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDk2MzgsImV4cCI6MjA3NDk4NTYzOH0.kKafp8dEL7V0Y10-oNbjluYblA03a0V_OqB9XOBd9SA';
        let supabaseClient;
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        const LIVE_FEED_URL = 'https://data.tmpnews.com/feed.json?lang=ur';
        const archiveBtn = document.getElementById('archive-btn');
        const noMorePostsMsg = document.getElementById('no-more-posts-msg');
        const INITIAL_LOAD_COUNT = 60; 
        const SUBSEQUENT_LOAD_COUNT = 60;
        const CACHE_KEY = 'cachedLiveFeed_ur_v8';
        const PREFETCH_KEY = 'prefetchedLiveFeed_ur_v8';
        const PREFETCH_TIMESTAMP_KEY = 'prefetchedLiveFeedTimestamp_ur_v8';
        const CACHE_TTL_MS = 60000; // 60s Stale-While-Revalidate cache validity

        // State declarations initialized before any usage
        let allPosts = []; 
        let loadedPostsCount = 0;
        let pendingPostsQueue = [];
        let isSyncing = false;
        let isScrollThrottled = false;

        const viewedPosts = new Set(safeJSONParse(sessionStorage.getItem('viewedLivePosts'), []));
        const likedPosts = new Set(safeJSONParse(localStorage.getItem('likedLivePosts'), []));
        const animatedPosts = new Set(safeJSONParse(sessionStorage.getItem('animatedLivePosts'), []));
        window._optimisticLikeDeltas = window._optimisticLikeDeltas || new Map();
        if (!localStorage.getItem('anonClientId')) {
            localStorage.setItem('anonClientId', 'anon-' + Date.now() + Math.random().toString(36).substring(2, 9));
        }

        function getPostsContainer() {
            let container = document.getElementById('feed-posts-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'feed-posts-container';
                container.className = 'feed-posts-container';
                liveFeed.appendChild(container);
            }
            return container;
        }

        function saveFeedToCache(data) {
            try {
                const payload = JSON.stringify({
                    timestamp: Date.now(),
                    posts: data
                });
                sessionStorage.setItem(CACHE_KEY, payload);
                localStorage.setItem(CACHE_KEY, payload);
                window._cachedLiveFeedObj = { timestamp: Date.now(), posts: data };
            } catch(e) {}
        }

        function getFeedFromCache() {
            let raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) {
                raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    try { sessionStorage.setItem(CACHE_KEY, raw); } catch(e) {}
                }
            }
            if (!raw) return null;
            const parsed = safeJSONParse(raw, null);
            if (!parsed) return null;
            if (Array.isArray(parsed)) {
                return { timestamp: 0, posts: parsed };
            }
            if (parsed && Array.isArray(parsed.posts)) {
                return parsed;
            }
            return null;
        }

        function parseContent(content) {
            if (!content) return '';
            const placeholders = [];
            let tempContent = content;

            // --- 0. MULTI-IMAGE CAROUSEL EXTRACTION ---
            let images = [];
            let replacedFirst = false;

            // Extract HTML figure images
            tempContent = tempContent.replace(/<figure class="post-image">[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?(?:<figcaption>(.*?)<\/figcaption>[\s\S]*?)?<\/figure>/gi, (match, src, caption) => {
                images.push({ src, caption: caption ? caption.replace(/<[^>]+>/g, '') : '' });
                return '__IMG_TOKEN__';
            });

            // Extract Markdown images
            tempContent = tempContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
                images.push({ src, caption: (alt && alt.toLowerCase() !== 'image') ? alt : '' });
                return '__IMG_TOKEN__';
            });

            if (images.length > 0) {
                let sliderHtml = '';
                if (images.length === 1) {
                    let img = images[0];
                    let captionHTML = img.caption ? `<p class="media-caption image-caption">${img.caption}</p>` : '';
                    sliderHtml = `<div class="my-4"><img src="${img.src}" alt="${img.caption}" loading="lazy" decoding="async" class="my-0 mx-auto rounded-none">${captionHTML}</div>`;
                } else {
                    sliderHtml = `
                    <div class="image-carousel-container" style="position: relative; max-width: 100%; margin: 1.5rem 0;">
                        <div class="image-counter" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; z-index: 10; pointer-events: none; backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            1/${images.length}
                        </div>
                        <div class="carousel-track" onscroll="window.updateCarouselCounter(this, ${images.length})" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; gap: 8px; padding-right: 10%; cursor: grab;">
                            ${images.map((img, i) => `
                                <div class="carousel-slide" style="flex: 0 0 92%; scroll-snap-align: start; position: relative; background: #111; display: flex; flex-direction: column; justify-content: center; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <img src="${img.src}" alt="${img.caption}" loading="lazy" decoding="async" draggable="false" class="my-0 mx-auto rounded-none" style="width: 100%; max-height: 60vh; display: block; object-fit: contain;">
                                    ${img.caption ? `<div class="carousel-caption-wrapper" style="padding: 8px 12px;"><p class="media-caption image-caption" style="margin: 0 !important;">${img.caption}</p></div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <style>.carousel-track::-webkit-scrollbar { display: none; }</style>
                    </div>`;
                }
                placeholders.push(sliderHtml);
                let pIndex = placeholders.length - 1;
                
                tempContent = tempContent.replace(/__IMG_TOKEN__/g, () => {
                    if (!replacedFirst) {
                        replacedFirst = true;
                        return `\n\n__PLACEHOLDER_${pIndex}__\n\n`;
                    }
                    return ''; 
                });
            }

            // 1. --- BUTTON & HTML PROTECTION PASS ---
            tempContent = tempContent.replace(/<a\s+([^>]*\bclass=["'][^"']*\bbutton\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs, innerText) => {
                const cleanText = innerText.replace(/<[^>]+>/g, '').trim();
                const isPlayStore = attrs.includes('play.google.com') || /app|download|play/i.test(cleanText);
                const icon = isPlayStore ? '<i class="fab fa-google-play mr-2"></i>' : '<i class="fas fa-external-link-alt mr-2"></i>';
                const cleanAttrs = attrs
                    .replace(/class=["'][^"']*["']/gi, 'class="professional-btn app-download-btn"')
                    .replace(/style=["'][^"']*["']/gi, '');
                
                const btnHtml = `<div class="post-btn-wrapper text-center my-4"><a ${cleanAttrs} rel="noopener noreferrer">${icon}<span>${cleanText || 'لنک کھولیں'}</span></a></div>`;
                placeholders.push(btnHtml);
                return `\n\n__PLACEHOLDER_${placeholders.length - 1}__\n\n`;
            });

            const htmlBlocks = [
                /<div class="embed-container">[\s\S]*?<\/div>\s*<\/div>/gi,
                /<div class="telegram-embed-placeholder"[^>]*>[\s\S]*?<\/div>/gi,
                /<div class="table-container[^>]*>[\s\S]*?<\/table><\/div>/gi
            ];

            htmlBlocks.forEach(pattern => {
                tempContent = tempContent.replace(pattern, match => {
                    let styledMatch = match
                        .replace(/<div class="embed-container">/gi, '<div class="my-4" style="display: flex; flex-direction: column; align-items: center; width: 100%;">')
                        .replace(/<div class="embed-caption">/gi, '<p class="media-caption" style="width: 100%;">')
                        .replace(/<\/div>\s*<\/div>/gi, '</p></div>');
                    
                    placeholders.push(styledMatch);
                    return `\n\n__PLACEHOLDER_${placeholders.length - 1}__\n\n`;
                });
            });

            // 2. --- LEGACY JUNK CLEANER ---
            tempContent = tempContent
                .replace(/&nbsp;/gi, ' ')  
                .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n\n') 
                .replace(/<div[^>]*>/gi, '\n\n')           
                .replace(/<\/div>/gi, '')                 
                .replace(/<br\s*\/?>/gi, '\n')             
                .replace(/\n{3,}/g, '\n\n')                
                .trim();                                   

            // 3. --- SOCIAL MEDIA EMBED EXTRACTION ---
            const allKeywords = 'link-button|twitter-video|twitter|instagram-video|instagram|facebook|youtube|tiktok|linkedin|reddit|telegram';
            const regex = new RegExp(`\\[(${allKeywords})\\|?(.*)\\]\\((.*)\\)|\\[WIDGET\\|(.*)\\|(.*)\\]([\\s\\S]*?)(?=\\n\\n|$)`, 'g');
            tempContent = tempContent.replace(regex, (match, socialType, socialDesc, socialUrl, widgetType, widgetCaption, widgetContent) => {
                let htmlBlock = '';
                if (widgetType) {
                    const caption = widgetCaption ? `<p class="media-caption">${widgetCaption}</p>` : '';
                    htmlBlock = `<div class="my-4 widget-container" data-type="${widgetType}" style="max-width: 600px; margin: 1.5rem auto;">${widgetContent}</div>${caption}`;
                } else if (socialType) {
                    const caption = socialDesc ? `<p class="media-caption">${socialDesc}</p>` : '';
                    const url = socialUrl;
                    switch (socialType) {
                        case 'link-button': {
                            const isPlay = url.includes('play.google.com') || /app|download|play/i.test(socialDesc || '');
                            const icon = isPlay ? '<i class="fab fa-google-play mr-2"></i>' : '<i class="fas fa-external-link-alt mr-2"></i>';
                            htmlBlock = `<div class="post-btn-wrapper text-center my-4"><a href="${url}" target="_blank" rel="noopener noreferrer" class="professional-btn app-download-btn">${icon}<span>${socialDesc || 'Open Link'}</span></a></div>`;
                            break;
                        }
                        case 'twitter': htmlBlock = `<div class="my-4"><blockquote class="twitter-tweet" data-dnt="true" data-theme="light"><a href="${url.replace('x.com', 'twitter.com')}">View Post on X</a></blockquote>${caption}</div>`; break;
                        case 'twitter-video': 
                            let cleanTwUrl = url.replace('x.com', 'twitter.com').split('?')[0];
                            if (!cleanTwUrl.startsWith('http')) cleanTwUrl = 'https://' + cleanTwUrl;
                            htmlBlock = `<div class="my-4" style="display: flex; justify-content: center; width: 100%;">
                                <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
                                    <a href="${cleanTwUrl}">Loading embedded X post...</a>
                                </blockquote>
                            </div>${caption}`; 
                            break;
                        case 'instagram': htmlBlock = `<div class="my-4"><blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>${caption}</div>`; break;
                        case 'instagram-video': const igMatch = url.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/); if (igMatch && igMatch[2]) { htmlBlock = `<div class="instagram-video-container my-4"><iframe src="https://www.instagram.com/p/${igMatch[2]}/embed" frameborder="0" scrolling="no" allowtransparency="true"></iframe></div>${caption}</div>`; } else { htmlBlock = `<div class="my-4"><blockquote class("instagram-media") data-instgrm-captioned data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>${caption}</div>`; } break;
                        case 'facebook': htmlBlock = `<div class="my-4"><div class="fb-post" data-href="${url}" data-width="auto" data-show-text="true"></div>${caption}</div>`; break;
                        case 'youtube': const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/); if (ytMatch && ytMatch[1]) { htmlBlock = `<div class="responsive-iframe-container responsive-iframe-container-16x9 my-4"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1" allowfullscreen></iframe></div>${caption}`; } break;
                        case 'tiktok': htmlBlock = `<div class="my-4"><blockquote class="tiktok-embed" cite="${url}" data-embed-from="embed_page"> <section></section> </blockquote>${caption}</div>`; break;
                        case 'linkedin': htmlBlock = `<div class="my-4"><div class="linkedin-post" data-href="${url}"></div>${caption}</div>`; break;
                        case 'reddit': htmlBlock = `<div class="my-4"><blockquote class="reddit-embed-bq" data-embed-height="500"><a href="${url}">Post</a></blockquote>${caption}</div>`; break;
                        case 'telegram': 
                            const tgMatch = url.match(/t\.me\/([a-zA-Z0-9_]+\/\d+)/); 
                            if (tgMatch && tgMatch[1]) { 
                                htmlBlock = `<div class="my-4" style="display: flex; flex-direction: column; align-items: center; width: 100%;"><div class="telegram-embed-placeholder" data-tg-post="${tgMatch[1]}"></div>${caption}</div>`; 
                            } 
                            break;
                    }
                }
                placeholders.push(htmlBlock);
                return `__PLACEHOLDER_${placeholders.length - 1}__`;
            });

            // 4. --- FORMATTING AND PARAGRAPH WRAPPING ---
            const processedText = tempContent.replace(/\r\n/g, '\n').split(/\n\s*\n/).map(p => {
                const trimmed = p.trim();
                if (trimmed.startsWith('__PLACEHOLDER_')) return p;
                if (trimmed === '') return '';
                if (trimmed.startsWith('<div class="table-container"') || trimmed.startsWith('<table')) { return p; }
                
                p = p.replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
                     .replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>')
                     .replace(/<u>(.*?)<\/u>/gi, '<span class="rich-underline">$1</span>')
                     .replace(/<font color=["']?([^"'>]+)["']?>(.*?)<\/font>/gi, '<span style="color: $1;">$2</span>');
                
                return p.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>').trim() === '' ? '' : `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }).join('');

            // 5. --- RESTORE PLACEHOLDERS ---
            return processedText.replace(/__PLACEHOLDER_(\d+)__/g, (match, index) => placeholders[parseInt(index, 10)]);
        }

        function renderTelegramEmbeds() {
            const placeholders = document.querySelectorAll('.telegram-embed-placeholder');
            placeholders.forEach(container => {
                if (container.dataset.rendered) return; 
                const tgPostPath = container.getAttribute('data-tg-post');
                if (tgPostPath) {
                    container.dataset.rendered = "true"; 
                    const cleanPath = tgPostPath.replace(/^https?:\/\/(?:t\.me|telegram\.dog|telegram\.me)\//, '').replace(/^\/+/, '');
                    
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://telegram.dog/${cleanPath}?embed=1&userpic=true`;
                    iframe.width = "100%";
                    iframe.height = "420";
                    iframe.frameBorder = "0";
                    iframe.scrolling = "no";
                    iframe.style.border = "none";
                    iframe.style.overflow = "hidden";
                    iframe.style.width = "100%";
                    iframe.style.minHeight = "280px";
                    iframe.style.maxWidth = "550px";
                    iframe.style.margin = "0 auto";
                    iframe.style.display = "block";
                    iframe.style.borderRadius = "8px";
                    iframe.setAttribute('allowtransparency', 'true');
                    iframe.setAttribute('allowfullscreen', 'true');
                    
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'telegram-embed-footer';
                    fallbackDiv.style.cssText = 'text-align: center; margin-top: 6px; font-size: 13px; width: 100%;';
                    fallbackDiv.innerHTML = `<a href="https://t.me/${cleanPath}" target="_blank" rel="noopener noreferrer" style="color: #229ED9; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="#229ED9"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg> Open in Telegram</a>`;

                    container.style.cssText = 'width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 12px auto;';
                    container.innerHTML = '';
                    container.appendChild(iframe);
                    container.appendChild(fallbackDiv);
                }
            });
        }

        if (!window._telegramResizeListenerAdded) {
            window._telegramResizeListenerAdded = true;
            window.addEventListener('message', function(event) {
                if (!event.data || (typeof event.origin === 'string' && !event.origin.includes('telegram') && !event.origin.includes('t.me'))) return;
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    if (data && data.event === 'resize' && data.height) {
                        const iframes = document.querySelectorAll('.telegram-embed-placeholder iframe');
                        iframes.forEach(f => {
                            if (f.contentWindow === event.source) {
                                f.style.height = data.height + 'px';
                            }
                        });
                    }
                } catch (e) {}
            });
        }

        function loadSocialScripts() {
            const scripts = { instagram: '//www.instagram.com/embed.js', facebook: 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0', tiktok: 'https://www.tiktok.com/embed.js', reddit: 'https://embed.reddit.com/widgets.js', telegram: 'https://telegram.org/js/telegram-widget.js?22', linkedin: 'https://platform.linkedin.com/Voyager/js/posts/embed.js' };
            
            renderTelegramEmbeds();
            
            if (document.querySelector('.twitter-tweet')) {
                window.twttr = (function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0],
                    t = window.twttr || {};
                    if (d.getElementById(id)) return t;
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "https://platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);
                    t._e = [];
                    t.ready = function(f) { t._e.push(f); };
                    return t;
                }(document, "script", "twitter-wjs"));

                setTimeout(() => {
                    if (window.twttr && window.twttr.widgets) {
                        window.twttr.widgets.load();
                    }
                }, 300);
            }
            if (document.querySelector('.instagram-media')) {
                if (!document.querySelector(`script[src="${scripts.instagram}"]`)) { 
                    const s = document.createElement('script'); s.src = scripts.instagram; s.async = true; 
                    s.onload = () => { if (window.instgrm?.Embeds) window.instgrm.Embeds.process(); };
                    document.body.appendChild(s); 
                } else if (window.instgrm?.Embeds) window.instgrm.Embeds.process();
            }
            if (document.querySelector('.fb-post')) {
                if (!document.querySelector(`script[src*="connect.facebook.net"]`)) { 
                    const s = document.createElement('script'); s.src = scripts.facebook; s.async = true; s.defer = true; s.crossOrigin = "anonymous"; 
                    document.body.appendChild(s); 
                } else if (window.FB?.XFBML) window.FB.XFBML.parse();
            }
            if (document.querySelector('.tiktok-embed') && !document.querySelector(`script[src="${scripts.tiktok}"]`)) { const s = document.createElement('script'); s.src = scripts.tiktok; s.async = true; document.body.appendChild(s); }
            if (document.querySelector('.reddit-embed-bq') && !document.querySelector(`script[src="${scripts.reddit}"]`)) { const s = document.createElement('script'); s.src = scripts.reddit; s.async = true; s.charset="UTF-8"; document.body.appendChild(s); }
            if (document.querySelector('.telegram-post') && !document.querySelector(`script[src="${scripts.telegram}"]`)) { const s = document.createElement('script'); s.src = scripts.telegram; s.async = true; document.body.appendChild(s); }
            if (document.querySelector('.linkedin-post') && !document.querySelector(`script[src="${scripts.linkedin}"]`)) { const s = document.createElement('script'); s.src = scripts.linkedin; s.async = true; document.body.appendChild(s); }
        }

        const ANALYTICS_WRITE_URL = 'https://data.tmpnews.com/feed.json';
        async function incrementViewCount(postId) {
            if (viewedPosts.has(postId)) return;
            viewedPosts.add(postId);
            sessionStorage.setItem('viewedLivePosts', JSON.stringify(Array.from(viewedPosts)));
            fetch(`${ANALYTICS_WRITE_URL}?log=view&post_id=${postId}&client_id=${localStorage.getItem('anonClientId')}`, { method: 'GET', cache: 'no-store' })
                .then(() => console.log(`View logged for ${postId}`))
                .catch(error => { console.error("View log failed:", error); viewedPosts.delete(postId); sessionStorage.setItem('viewedLivePosts', JSON.stringify(Array.from(viewedPosts))); });
        }

        function extractLangContent(raw, lang = 'en') {
            if (!raw) return '';
            const tagMap = {
                'en': ['english', 'en'],
                'hi': ['hindi', 'hi'],
                'ur': ['urdu', 'ur']
            };
            const tags = tagMap[lang] || [lang];

            for (const t of tags) {
                const tagRegex = new RegExp(`(?:<${t}[^>]*>)([\\s\\S]*?)(?:<\\/${t}>)`, 'i');
                const match = raw.match(tagRegex);
                if (match && match[1].trim()) {
                    let clean = match[1].trim();
                    clean = clean.replace(/<(?:hindi|hi|urdu|ur)[^>]*>[\s\S]*?<\/(?:hindi|hi|urdu|ur)>/gi, '');
                    clean = clean.replace(/<!--(?:hindi|hi|urdu|ur)-->[\s\S]*?<!--\/(?:hindi|hi|urdu|ur)-->/gi, '');
                    return clean.trim();
                }
            }

            for (const t of tags) {
                const commentRegex = new RegExp(`<!--${t}-->([\\s\\S]*?)<!--\\/${t}-->`, 'i');
                const match = raw.match(commentRegex);
                if (match && match[1].trim()) {
                    let clean = match[1].trim();
                    clean = clean.replace(/<(?:hindi|hi|urdu|ur)[^>]*>[\s\S]*?<\/(?:hindi|hi|urdu|ur)>/gi, '');
                    clean = clean.replace(/<!--(?:hindi|hi|urdu|ur)-->[\s\S]*?<!--\/(?:hindi|hi|urdu|ur)-->/gi, '');
                    return clean.trim();
                }
            }

            if (lang === 'en') {
                let clean = raw;
                clean = clean.replace(/<(?:hindi|hi|urdu|ur)[^>]*>[\s\S]*?<\/(?:hindi|hi|urdu|ur)>/gi, '');
                clean = clean.replace(/<!--(?:hindi|hi|urdu|ur)-->[\s\S]*?<!--\/(?:hindi|hi|urdu|ur)-->/gi, '');
                clean = clean.replace(/<\/?(?:english|en)>/gi, '');
                clean = clean.replace(/<!--\/?(?:english|en)-->/gi, '');

                const textOnly = clean.replace(/<[^>]*>/g, '').trim();
                const devanagari = /[\u0900-\u097F]/;
                const arabicUrdu = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
                if ((devanagari.test(textOnly) || arabicUrdu.test(textOnly)) && !/[a-zA-Z]/.test(textOnly)) {
                    return '';
                }
                return clean.trim();
            }

            return '';
        }

        function hasUrduTranslation(postData) {
            if (!postData) return false;
            if (postData.lang && postData.lang !== 'en') return false;
            if (postData.parent_id) return false;

            const enHeadline = extractLangContent(postData.headline, 'en');
            const enContent = extractLangContent(postData.content, 'en');

            const cleanHeadline = (enHeadline || '').replace(/<[^>]*>/g, '').trim();
            const cleanContent = (enContent || '').replace(/<[^>]*>/g, '').trim();

            const hasLatinHeadline = /[a-zA-Z]/.test(cleanHeadline);
            const hasLatinContent = /[a-zA-Z]/.test(cleanContent);
            const hasMedia = Boolean(enContent && (
                enContent.includes('<img') || 
                enContent.includes('telegram-embed-placeholder') || 
                enContent.includes('data-tg-post') || 
                enContent.includes('telegram') || 
                enContent.includes('twitter') || 
                enContent.includes('iframe')
            ));

            const devanagari = /[\u0900-\u097F]/;
            const arabicUrdu = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
            const textOnly = (cleanHeadline + ' ' + cleanContent).trim();

            if ((devanagari.test(textOnly) || arabicUrdu.test(textOnly)) && !/[a-zA-Z]/.test(textOnly)) {
                return false;
            }

            return Boolean(hasLatinHeadline || hasLatinContent || hasMedia || postData.lang === 'en');
        }

        function formatRelativeTime(dateString) {
            if (!dateString) return '';
            const now = new Date();
            const postDate = new Date(dateString);
            const diffInSeconds = Math.floor((now - postDate) / 1000);
            if (isNaN(diffInSeconds)) return '';
            if (diffInSeconds < 60) return 'Just now';
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h ago`;
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays}d ago`;
            return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        function renderPost(postData, container, insertAtTop = false) {
            if (!hasUrduTranslation(postData)) return;

            const postHeadline = extractLangContent(postData.headline, 'en');
            const postContent = extractLangContent(postData.content, 'en');
            if (!postHeadline && !postContent) return;

            const postElement = document.createElement('div');
            postElement.className = 'live-post inshot-card aljazeera-live-item';
            postElement.id = `post-${postData.id}`; 
            if (insertAtTop) postElement.classList.add('new-post-animation');
            if (postData.is_pinned) postElement.classList.add('is-pinned');

            const authorName = postData.author_name || 'دی اردو پوسٹ';
            const dateObj = new Date(postData.timestamp);
            const formattedTime = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
            const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('ur-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const formattedFullDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleString('ur-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';
            const relativeTime = formatRelativeTime(postData.timestamp) || formattedFullDate;
            const initialViewCount = postData.view_count || 0;
            const isAlreadyLiked = isPostLiked(postData.id);
            const initialLikeCount = calculateDisplayLikes(postData.id, postData.like_count);

            let tagsList = Array.isArray(postData.tags)
                ? postData.tags
                : (typeof postData.tags === 'string' && postData.tags.trim().startsWith('[')
                    ? safeJSONParse(postData.tags, [])
                    : (postData.tags ? [postData.tags] : []));
            let tagsHTML = tagsList.length > 0 ? '<div class="tags-container inshot-tags">' + tagsList.map(tag => `<a href="#" class="tag-badge inshot-tag-pill">#${tag}</a>`).join('') + '</div>' : '';
            let pinnedBadgeHTML = postData.is_pinned ? `<div class="inshot-pinned-pill pinned-badge"><i class="fas fa-thumbtack text-amber-500 mr-1.5"></i><span>پن</span></div>` : '';
            
            const progressBarHTML = `<div class="processing-text app-only-feature" style="display: none !important;">Downloading model & translating...</div><div class="translation-progress-container app-only-feature" style="display: none !important;"><div class="translation-progress-bar"></div></div>`;
            const translationButtonsHTML = `<div class="live-translation-controls app-only-feature" style="display: none !important;"><button class="translate-chip-btn hindi" onclick="requestLivePostTranslation('${postData.id}', 'hi')">Hindi</button><button class="translate-chip-btn" onclick="requestLivePostTranslation('${postData.id}', 'ur')">Urdu</button></div>`;
            const likeBtnClass = isAlreadyLiked ? "like-btn inshot-pill-btn inshot-like-btn is-liked" : "like-btn inshot-pill-btn inshot-like-btn";
            const starIconClass = isAlreadyLiked ? "fa-solid fa-star" : "fa-regular fa-star";
            const likeTitle = isAlreadyLiked ? LIKE_TITLES.liked : LIKE_TITLES.unliked;
            const ariaPressed = isAlreadyLiked ? "true" : "false";

            const headlineHTML = postHeadline ? `<h2 class="live-post-headline inshot-card-headline">${postHeadline}</h2>` : '';
            const bodyHTML = postContent ? `<div class="post-body inshot-card-body">${parseContent(postContent)}</div>` : '';
            const safeHeadlineAttr = (postHeadline || 'Live Update').replace(/"/g, '&quot;');

            postElement.innerHTML = `<div class="live-post-content inshot-card-inner">
                <div class="live-post-meta inshot-card-meta">
                    <div class="liveblog-time-row">
                        <span class="liveblog-time-badge" title="${formattedFullDate}">
                            <span class="liveblog-dot"></span>
                            <span class="live-post-time liveblog-time-text">${formattedTime || relativeTime}</span>
                            ${formattedDate ? `<span class="liveblog-date-sep">•</span><span class="live-post-date liveblog-date-text">${formattedDate}</span>` : ''}
                        </span>
                        <div class="liveblog-author-byline">
                            <span class="liveblog-byline-label">از</span>
                            <span class="live-post-author liveblog-author-name">${authorName}</span>
                            <span class="liveblog-verified-check" title="تصدیق شدہ نامہ نگار"><i class="fas fa-check-circle"></i></span>
                        </div>
                    </div>
                    ${pinnedBadgeHTML}
                </div>
                ${headlineHTML}
                ${bodyHTML}
                ${tagsHTML}${progressBarHTML}${translationButtonsHTML}
                <div class="post-footer inshot-card-footer">
                    <div class="post-stats inshot-stats-pills" data-post-id="${postData.id}">
                        <button class="${likeBtnClass}" data-post-id="${postData.id}" title="${likeTitle}" aria-label="${likeTitle}" aria-pressed="${ariaPressed}">
                            <i class="${starIconClass}"></i>
                            <span id="like-count-${postData.id}" class="like-count inshot-count">${initialLikeCount}</span>
                        </button>
                        <div class="inshot-pill-btn inshot-view-pill" title="Total views">
                            <i class="fas fa-eye text-gray-400"></i>
                            <span id="view-count-${postData.id}" class="inshot-count">${initialViewCount}</span>
                        </div>
                    </div>
                    <div class="inshot-footer-actions">
                        <button class="share-btn inshot-pill-btn inshot-share-btn" data-post-id="${postData.id}" data-post-headline="${safeHeadlineAttr}" title="Share this dispatch">
                            <i class="fas fa-share-alt mr-1.5"></i><span>شیئر</span>
                        </button>
                    </div>
                </div>
            </div>`;
            
            if (insertAtTop) { 
                container.prepend(postElement); 
            } else { 
                container.appendChild(postElement); 
            }
            renderTelegramEmbeds();
            incrementViewCount(postData.id);
            setTimeout(() => { 
                const likeCountSpan = document.getElementById(`like-count-${postData.id}`);
                const viewCountSpan = document.getElementById(`view-count-${postData.id}`);
                if (!animatedPosts.has(postData.id)) {
                    if (likeCountSpan && !isPostLiked(postData.id)) {
                        if (initialLikeCount > 0) animateCountUp(likeCountSpan, 0, initialLikeCount);
                    }
                    if (viewCountSpan && initialViewCount > 0) {
                        animateCountUp(viewCountSpan, 0, initialViewCount);
                    }
                    animatedPosts.add(postData.id);
                    sessionStorage.setItem('animatedLivePosts', JSON.stringify(Array.from(animatedPosts)));
                }
            }, 100);
        }

        // Smooth Accordion Slide-Down for newly prepended dispatches (Al Jazeera style)
        function prependNewPostWithAlJazeeraSlide(postData, container) {
            renderPost(postData, container, true);
            const postElement = document.getElementById(`post-${postData.id}`);
            if (!postElement) return;

            postElement.classList.add('aljazeera-slide-down');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    postElement.classList.add('is-expanded');
                });
            });

            setTimeout(() => {
                postElement.classList.remove('aljazeera-slide-down', 'is-expanded');
                postElement.style.maxHeight = '';
                postElement.style.overflow = '';
            }, 750);
        }
        window.prependNewPostWithAlJazeeraSlide = prependNewPostWithAlJazeeraSlide;

        function queueNewPosts(newPosts) {
            newPosts.forEach(p => {
                if (!pendingPostsQueue.find(existing => String(existing.id) === String(p.id))) {
                    pendingPostsQueue.unshift(p);
                }
            });
            const pill = document.getElementById('new-posts-pill');
            if (pill) {
                pill.style.display = 'inline-flex';
                const span = pill.querySelector('span');
                if (span) {
                    span.textContent = `${pendingPostsQueue.length} new update${pendingPostsQueue.length > 1 ? 's' : ''}`;
                }
                pill.classList.add('is-visible');
            }
        }

        function flushPendingPosts() {
            if (pendingPostsQueue.length === 0) return;
            const postsContainer = getPostsContainer();
            const pill = document.getElementById('new-posts-pill');
            if (pill) {
                pill.classList.remove('is-visible');
                setTimeout(() => { pill.style.display = 'none'; }, 300);
            }
            const toRender = [...pendingPostsQueue];
            pendingPostsQueue = [];
            for (let i = toRender.length - 1; i >= 0; i--) {
                const p = toRender[i];
                if (!document.getElementById(`post-${p.id}`)) {
                    prependNewPostWithAlJazeeraSlide(p, postsContainer);
                    loadedPostsCount++;
                }
            }
            setTimeout(loadSocialScripts, 250);
        }
        window.flushPendingLivePosts = flushPendingPosts;

        const newPostsPill = document.getElementById('new-posts-pill');
        if (newPostsPill) {
            newPostsPill.onclick = function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(flushPendingPosts, 250);
            };
        }

        async function syncFreshPostsInBackground() {
            if (isSyncing) return;
            isSyncing = true;
            try {
                const freshData = await deduplicatedFetchFeed(LIVE_FEED_URL, { cache: 'default' }, 8000);
                if (!Array.isArray(freshData)) return;

                saveFeedToCache(freshData);
                const freshUrdu = freshData.filter(p => hasUrduTranslation(p));

                // 1. Pinned post sync
                const freshPinned = freshUrdu.find(p => p.is_pinned);
                const currentPinnedEl = pinnedPostContainer ? pinnedPostContainer.querySelector('.live-post') : null;
                const currentPinnedId = currentPinnedEl ? currentPinnedEl.id.replace('post-', '') : null;

                if (freshPinned && pinnedPostContainer) {
                    if (!currentPinnedId || String(freshPinned.id) !== String(currentPinnedId)) {
                        pinnedPostContainer.innerHTML = '';
                        renderPost(freshPinned, pinnedPostContainer, false);
                    }
                } else if (currentPinnedEl && pinnedPostContainer) {
                    pinnedPostContainer.innerHTML = '';
                }

                // 2. Regular posts sync (Zero CLS: Never displace user when reading down below)
                const freshRegular = freshUrdu.filter(p => !p.is_pinned);
                if (allPosts.length > 0 && freshRegular.length > 0) {
                    const currentTopId = allPosts[0]?.id;
                    const newPostsToPrepend = [];
                    for (const p of freshRegular) {
                        if (String(p.id) === String(currentTopId)) break;
                        if (!document.getElementById(`post-${p.id}`)) {
                            newPostsToPrepend.push(p);
                        }
                    }
                    if (newPostsToPrepend.length > 0) {
                        const isAtTop = (window.scrollY <= 120) && !userHasManuallyScrolled;
                        if (isAtTop) {
                            for (let i = newPostsToPrepend.length - 1; i >= 0; i--) {
                                const newP = newPostsToPrepend[i];
                                prependNewPostWithAlJazeeraSlide(newP, getPostsContainer());
                                allPosts.unshift(newP);
                                loadedPostsCount++;
                            }
                            setTimeout(loadSocialScripts, 250);
                        } else {
                            for (let i = newPostsToPrepend.length - 1; i >= 0; i--) {
                                allPosts.unshift(newPostsToPrepend[i]);
                            }
                            queueNewPosts(newPostsToPrepend);
                        }
                    }
                }

                // 3. In-place stats sync (respects user's optimistic likes & keeps visual confirmation accurate)
                for (const p of freshUrdu) {
                    const postIdStr = String(p.id);
                    const isLiked = isPostLiked(postIdStr);
                    const finalLikes = calculateDisplayLikes(postIdStr, p.like_count);

                    updateAllLikeButtonsForPost(postIdStr, isLiked, finalLikes);

                    const viewSpan = document.getElementById(`view-count-${p.id}`);
                    if (viewSpan && typeof p.view_count === 'number') {
                        viewSpan.textContent = p.view_count;
                    }
                }
            } catch(err) {
                console.warn('Background live sync error:', err);
            } finally {
                isSyncing = false;
            }
        }

        async function fetchFullFeed(forceCacheBypass = false) {
             const prefetchedData = localStorage.getItem(PREFETCH_KEY);
             if (prefetchedData) {
                localStorage.removeItem(PREFETCH_KEY);
                localStorage.removeItem(PREFETCH_TIMESTAMP_KEY);
                const parsed = safeJSONParse(prefetchedData, null);
                if (Array.isArray(parsed)) {
                    allPosts = parsed.filter(p => hasUrduTranslation(p));
                    saveFeedToCache(parsed);
                    return allPosts;
                }
             }
             if (!forceCacheBypass) {
                 const cached = getFeedFromCache();
                 if (cached && Array.isArray(cached.posts)) {
                     const isFresh = (Date.now() - cached.timestamp) < CACHE_TTL_MS;
                     if (isFresh) {
                         allPosts = cached.posts.filter(p => hasUrduTranslation(p));
                         return allPosts;
                     }
                     allPosts = cached.posts.filter(p => hasUrduTranslation(p));
                     setTimeout(() => syncFreshPostsInBackground(), 50);
                     return allPosts;
                 }
             }
             try {
                 const fetchUrl = forceCacheBypass 
                     ? `${LIVE_FEED_URL}${LIVE_FEED_URL.includes('?') ? '&' : '?'}refresh=1`
                     : LIVE_FEED_URL;
                 const fetchOptions = forceCacheBypass ? {
                     cache: 'no-cache',
                     headers: {
                         'Cache-Control': 'no-cache, no-store, must-revalidate',
                         'Pragma': 'no-cache'
                     }
                 } : {
                     cache: 'default'
                 };
                 const data = await deduplicatedFetchFeed(fetchUrl, fetchOptions, 8000);
                 if (!Array.isArray(data)) throw new Error("API did not return an array.");
                 saveFeedToCache(data); 
                 allPosts = data.filter(p => hasUrduTranslation(p));
                 return allPosts;
             } catch (error) { 
                 console.error('Error fetching feed:', error); 
                 const cached = getFeedFromCache();
                 if (cached && Array.isArray(cached.posts)) {
                     allPosts = cached.posts.filter(p => hasUrduTranslation(p));
                     return allPosts;
                 }
                 return []; 
             }
        }

        async function loadMorePosts(isFullRefresh = false) {
             const loadMoreBtn = document.getElementById('load-more-btn');
             const feedControls = document.getElementById('feed-controls');
             if (!loadMoreBtn) return;
             const postsContainer = getPostsContainer();
             loadedPostsCount = postsContainer.querySelectorAll('.live-post:not(.skeleton-post)').length;

             if (isFullRefresh) {
                animatedPosts.clear();
                sessionStorage.removeItem('animatedLivePosts');
                if (pinnedPostContainer) pinnedPostContainer.innerHTML = '';
                postsContainer.innerHTML = '';
                loadedPostsCount = 0;
             }
             loadMoreBtn.disabled = true;
             loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>اپڈیٹس لوڈ ہو رہی ہیں...';

             if (allPosts.length === 0 || isFullRefresh) {
                 const fullFeed = await fetchFullFeed(isFullRefresh);
                 const urduFeed = fullFeed.filter(p => hasUrduTranslation(p));
                 if (urduFeed.length === 0) {
                     const skeletonWrapper = liveFeed.querySelector('.skeleton-feed-wrapper');
                     if (skeletonWrapper) skeletonWrapper.remove();
                     postsContainer.innerHTML = '';
                     if (feedControls) feedControls.style.display = 'block';
                     loadMoreBtn.style.display = 'none'; 
                     noMorePostsMsg.textContent = "No updates have been posted yet."; 
                     noMorePostsMsg.style.display = 'block';
                     return;
                 }

                 const pinned = urduFeed.find(p => p.is_pinned);
                 if (pinned && pinnedPostContainer && (isFullRefresh || pinnedPostContainer.innerHTML.trim() === '')) {
                     pinnedPostContainer.innerHTML = '';
                     renderPost(pinned, pinnedPostContainer, false);
                 }
                 allPosts = urduFeed.filter(p => !p.is_pinned); 

                 let initialLimit = INITIAL_LOAD_COUNT;
                 if (savedPostId && allPosts.length > 0) {
                     const targetIdx = allPosts.findIndex(p => `post-${p.id}` === savedPostId);
                     if (targetIdx >= 0) {
                         initialLimit = Math.min(allPosts.length, targetIdx + 20);
                     }
                 }

                 postsContainer.innerHTML = '';
                 const batch = allPosts.slice(0, initialLimit);
                 batch.forEach(post => renderPost(post, postsContainer, false));
                 loadedPostsCount = batch.length;
                 try { sessionStorage.setItem('inshot_loaded_count', loadedPostsCount); } catch(e) {}
                 loadSocialScripts();

                 // Smoothly glide to target post if opening at top, or anchor immediately
                 if (!userHasManuallyScrolled) {
                     scrollToTargetPost(savedPostId, savedScrollY, savedOffset, true);
                 }

                 // Smooth cross-fade from skeleton to posts
                 const skeletonWrapper = liveFeed.querySelector('.skeleton-feed-wrapper');
                 if (skeletonWrapper) {
                     skeletonWrapper.classList.add('overlay-transition', 'fade-out');
                     postsContainer.classList.add('fade-active');
                     setTimeout(() => {
                         if (skeletonWrapper && skeletonWrapper.parentNode) {
                             skeletonWrapper.remove();
                         }
                         postsContainer.classList.remove('fade-enter');
                         postsContainer.style.opacity = '1';
                         postsContainer.style.transform = 'none';
                     }, 200);
                 } else {
                     postsContainer.classList.add('fade-active');
                     postsContainer.classList.remove('fade-enter');
                     postsContainer.style.opacity = '1';
                     postsContainer.style.transform = 'none';
                 }
             } else {
                 if (loadedPostsCount >= allPosts.length) {
                     if (feedControls) feedControls.style.display = 'block';
                     loadMoreBtn.style.display = 'none'; 
                     archiveBtn.style.display = 'inline-block'; 
                     noMorePostsMsg.style.display = 'block';
                     return;
                 }
                 const startIndex = loadedPostsCount;
                 const limit = SUBSEQUENT_LOAD_COUNT;
                 const batch = allPosts.slice(startIndex, startIndex + limit);
                 batch.forEach(post => {
                     renderPost(post, postsContainer, false);
                     const el = document.getElementById(`post-${post.id}`);
                     if (el) el.classList.add('inshot-card-enter');
                 });
                 loadedPostsCount += batch.length;
                 try { sessionStorage.setItem('inshot_loaded_count', loadedPostsCount); } catch(e) {}
                 loadSocialScripts();
             }

             if (feedControls) feedControls.style.display = 'block';
             if (loadedPostsCount >= allPosts.length) {
                 loadMoreBtn.style.display = 'none'; 
                 archiveBtn.style.display = 'inline-block'; 
                 noMorePostsMsg.style.display = 'block';
             } else {
                 loadMoreBtn.disabled = false; 
                 loadMoreBtn.innerHTML = '<i class="fas fa-history mr-2"></i>پچھلی اپڈیٹس لوڈ کریں'; 
                 loadMoreBtn.style.display = 'inline-block'; 
                 archiveBtn.style.display = 'none'; 
                 noMorePostsMsg.style.display = 'none';
             }
        }
        window.triggerLoadMoreLivePosts = (e) => {
            if(e) e.preventDefault();
            loadMorePosts(false);
        };

        function saveInshotScrollState() {
            const pathname = window.location.pathname;
            if (!pathname.includes('/live')) return;

            const liveFeedEl = document.getElementById('live-feed');
            if (!liveFeedEl) return;

            const postsContainer = document.getElementById('feed-posts-container') || liveFeedEl;
            const posts = postsContainer.querySelectorAll('.live-post:not(.skeleton-post)');
            const scrollY = window.scrollY;

            if (scrollY <= 80) {
                sessionStorage.removeItem('inshot_active_post_id');
                sessionStorage.setItem('inshot_scroll_y', '0');
                sessionStorage.removeItem('inshot_post_offset');
                sessionStorage.setItem('liveFeedScroll', '0');
                return;
            }

            sessionStorage.setItem('inshot_scroll_y', String(Math.round(scrollY)));
            sessionStorage.setItem('liveFeedScroll', String(Math.round(scrollY)));

            if (posts.length === 0) return;

            const headerHeight = 56;
            const viewportReferenceY = scrollY + headerHeight + 20;
            let currentPostId = null;
            let currentOffset = 0;

            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                const top = post.getBoundingClientRect().top + scrollY;
                const bottom = top + post.offsetHeight;
                if (viewportReferenceY >= top && viewportReferenceY <= bottom) {
                    currentPostId = post.id;
                    currentOffset = viewportReferenceY - top;
                    break;
                }
            }

            if (!currentPostId && posts.length > 0) {
                if (scrollY < posts[0].offsetTop) {
                    currentPostId = posts[0].id;
                    currentOffset = 0;
                } else {
                    currentPostId = posts[posts.length - 1].id;
                    currentOffset = 0;
                }
            }

            if (currentPostId) {
                sessionStorage.setItem('inshot_active_post_id', currentPostId);
                sessionStorage.setItem('inshot_post_offset', String(Math.round(currentOffset)));
            }
        }
        window.saveInshotScrollState = saveInshotScrollState;

        function handleFeedScroll() {
            if (pendingPostsQueue && pendingPostsQueue.length > 0 && window.scrollY <= 40) {
                flushPendingPosts();
            }
            if (isScrollThrottled) return;
            isScrollThrottled = true;
            requestAnimationFrame(() => {
                isScrollThrottled = false;
                saveInshotScrollState();
            });
        }
        window.addEventListener('scroll', handleFeedScroll, { passive: true });
        document.addEventListener('turbo:before-visit', saveInshotScrollState);
        document.addEventListener('turbo:before-cache', saveInshotScrollState);
        window.addEventListener('pagehide', saveInshotScrollState);

        // Supabase Real-time Channel Listener
        if (window._activeLiveChannel && supabaseClient) {
            try { supabaseClient.removeChannel(window._activeLiveChannel); } catch(e) {}
        }
        if (typeof supabase !== 'undefined' && supabaseClient) {
            window._activeLiveChannel = supabaseClient.channel('live_updates_listener_' + Date.now())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'live_posts' }, (payload) => {
                    const newPostData = payload.new;
                    if (newPostData && ((newPostData.lang && newPostData.lang !== 'en') || newPostData.parent_id)) {
                        return;
                    }
                    sessionStorage.removeItem(CACHE_KEY); 
                    localStorage.removeItem(PREFETCH_KEY); 
                    
                    if (payload.eventType === 'INSERT') {
                        if (hasUrduTranslation(newPostData)) {
                            if (!newPostData.is_pinned) {
                                const isAtTop = (window.scrollY <= 120) && !userHasManuallyScrolled;
                                if (isAtTop) {
                                    prependNewPostWithAlJazeeraSlide(newPostData, getPostsContainer()); 
                                    allPosts.unshift(newPostData);
                                    loadedPostsCount++;
                                    setTimeout(loadSocialScripts, 250); 
                                } else {
                                    allPosts.unshift(newPostData);
                                    queueNewPosts([newPostData]);
                                }
                            } else { 
                                loadMorePosts(true); 
                            }
                        }
                    } 
                    else if (payload.eventType === 'UPDATE') {
                        const existingElement = document.getElementById(`post-${newPostData.id}`);
                        if (!existingElement) {
                            if (hasUrduTranslation(newPostData)) {
                                if (newPostData.is_pinned) {
                                    loadMorePosts(true);
                                } else {
                                    prependNewPostWithAlJazeeraSlide(newPostData, getPostsContainer());
                                    allPosts.unshift(newPostData);
                                    loadedPostsCount++;
                                    setTimeout(loadSocialScripts, 250);
                                }
                            }
                        } else {
                            const currentIsPinned = existingElement.classList.contains('is-pinned');
                            const newIsPinned = newPostData.is_pinned;

                            if (newIsPinned !== currentIsPinned) { 
                                loadMorePosts(true); 
                            }
                            else {
                                const hlEl = existingElement.querySelector('.live-post-headline');
                                const bodyEl = existingElement.querySelector('.post-body');
                                const newHl = extractLangContent(newPostData.headline, 'en');
                                const newCnt = extractLangContent(newPostData.content, 'en');
                                
                                if (hlEl && newHl) {
                                    hlEl.textContent = newHl;
                                }
                                if (bodyEl && newCnt) {
                                    const parsedCnt = parseContent(newCnt);
                                    if (parsedCnt) {
                                        bodyEl.innerHTML = parsedCnt;
                                        renderTelegramEmbeds();
                                    }
                                }

                                const likeCountSpan = existingElement.querySelector(`#like-count-${newPostData.id}`);
                                const viewCountSpan = existingElement.querySelector(`#view-count-${newPostData.id}`);
                                
                                if (likeCountSpan) {
                                    const postIdStr = String(newPostData.id);
                                    const isLiked = isPostLiked(postIdStr);
                                    const finalLikes = calculateDisplayLikes(postIdStr, newPostData.like_count);
                                    updateAllLikeButtonsForPost(postIdStr, isLiked, finalLikes);
                                }
                                if (viewCountSpan) {
                                    const currentViews = parseInt(viewCountSpan.textContent.replace(/,/g, '')) || 0;
                                    animateCountUp(viewCountSpan, currentViews, newPostData.view_count);
                                }
                            }
                        }
                    }
                    else if (payload.eventType === 'DELETE') {
                        const elementToRemove = document.getElementById(`post-${payload.old.id}`);
                        if (elementToRemove) elementToRemove.remove();
                        allPosts = allPosts.filter(p => p.id !== payload.old.id);
                        loadedPostsCount = document.querySelectorAll('#live-feed .live-post:not(.skeleton-post)').length; 
                        if (payload.old.is_pinned) loadMorePosts(true);
                    }
                }).subscribe();
        }

        // Auto-refresh fallback
        if (window._livePeriodicSyncTimer) {
            clearInterval(window._livePeriodicSyncTimer);
        }
        window._livePeriodicSyncTimer = setInterval(() => {
            if (!document.hidden) {
                syncFreshPostsInBackground();
            }
        }, 30000);

        // Android Pull-to-Refresh Controller hook
        window.AndroidController = window.AndroidController || {};
        window.AndroidController.refreshContent = function() {
            sessionStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(PREFETCH_KEY);
            localStorage.removeItem(PREFETCH_TIMESTAMP_KEY);
            loadMorePosts(true).then(() => {
                if (window.AndroidInterface && typeof window.AndroidInterface.stopLoadingAnimation === 'function') {
                    window.AndroidInterface.stopLoadingAnimation();
                }
            }).catch(() => {
                if (window.AndroidInterface && typeof window.AndroidInterface.stopLoadingAnimation === 'function') {
                    window.AndroidInterface.stopLoadingAnimation();
                }
            });
        };

        // --- MAIN INITIALIZATION FLOW ---
        userHasManuallyScrolled = false;

        const isTurboVisit = window._liveFeedEverVisited === true;
        window._liveFeedEverVisited = true;

        const searchStr = (window.location && window.location.search) ? window.location.search : '';
        const hashStr = (window.location && window.location.hash) ? window.location.hash : '';
        const hasForcedQuery = searchStr.includes('refresh') || 
                               searchStr.includes('nocache') || 
                               hashStr.includes('refresh');

        if (hasForcedQuery) {
            sessionStorage.removeItem('inshot_active_post_id');
            sessionStorage.removeItem('inshot_scroll_y');
            sessionStorage.removeItem('inshot_post_offset');
            sessionStorage.removeItem('inshot_loaded_count');
            sessionStorage.removeItem(CACHE_KEY);
        }

        const savedPostId = !hasForcedQuery ? (hashStr.startsWith('#post-') ? hashStr.slice(1) : sessionStorage.getItem('inshot_active_post_id')) : null;
        const savedScrollY = !hasForcedQuery ? (parseInt(sessionStorage.getItem('inshot_scroll_y')) || 0) : 0;
        const savedOffset = !hasForcedQuery ? (parseInt(sessionStorage.getItem('inshot_post_offset')) || 0) : 0;

        const cached = getFeedFromCache();
        const hasCachedPosts = !hasForcedQuery && cached && Array.isArray(cached.posts) && cached.posts.length > 0;

        const initialSkeletonWrapper = liveFeed.querySelector('.skeleton-feed-wrapper');
        const postsContainerEl = getPostsContainer();

        if (hasCachedPosts) {
            const urduFeed = cached.posts.filter(p => hasUrduTranslation(p));
            const pinned = urduFeed.find(p => p.is_pinned);
            if (pinned && pinnedPostContainer) {
                pinnedPostContainer.innerHTML = '';
                renderPost(pinned, pinnedPostContainer, false);
            }
            allPosts = urduFeed.filter(p => !p.is_pinned);

            const savedLoadedCount = parseInt(sessionStorage.getItem('inshot_loaded_count')) || INITIAL_LOAD_COUNT;
            let initialLimit = Math.max(INITIAL_LOAD_COUNT, savedLoadedCount);
            if (savedPostId && allPosts.length > 0) {
                const targetIdx = allPosts.findIndex(p => `post-${p.id}` === savedPostId);
                if (targetIdx >= 0) {
                    initialLimit = Math.max(initialLimit, targetIdx + 15);
                }
            }
            initialLimit = Math.min(allPosts.length, initialLimit);

            postsContainerEl.innerHTML = '';
            const batch = allPosts.slice(0, initialLimit);
            batch.forEach(post => renderPost(post, postsContainerEl, false));
            loadedPostsCount = batch.length;
            sessionStorage.setItem('inshot_loaded_count', loadedPostsCount);

            // Anchor scroll position immediately without fighting user
            // Smoothly glide to target post with scroll animation when returning to Inshort
            scrollToTargetPost(savedPostId, savedScrollY, savedOffset, true);

            // Smooth cross-fade from dummy skeleton to cached content
            if (initialSkeletonWrapper) {
                initialSkeletonWrapper.classList.add('overlay-transition', 'fade-out');
                postsContainerEl.classList.add('fade-active');
                setTimeout(() => {
                    if (initialSkeletonWrapper && initialSkeletonWrapper.parentNode) {
                        initialSkeletonWrapper.remove();
                    }
                    postsContainerEl.classList.remove('fade-enter');
                    postsContainerEl.style.opacity = '1';
                    postsContainerEl.style.transform = 'none';
                }, 180);
            } else {
                postsContainerEl.classList.remove('fade-enter');
                postsContainerEl.classList.add('fade-active');
                postsContainerEl.style.opacity = '1';
                postsContainerEl.style.transform = 'none';
            }

            const feedControls = document.getElementById('feed-controls');
            if (feedControls) feedControls.style.display = 'block';
            const loadMoreBtn = document.getElementById('load-more-btn');
            const archiveBtn = document.getElementById('archive-btn');
            const noMorePostsMsg = document.getElementById('no-more-posts');
            if (loadMoreBtn) {
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = '<i class="fas fa-history mr-2"></i>پچھلی اپڈیٹس لوڈ کریں';
                loadMoreBtn.style.display = (loadedPostsCount >= allPosts.length) ? 'none' : 'inline-block';
            }
            if (archiveBtn) archiveBtn.style.display = (loadedPostsCount >= allPosts.length) ? 'inline-block' : 'none';
            if (noMorePostsMsg) noMorePostsMsg.style.display = (loadedPostsCount >= allPosts.length) ? 'block' : 'none';

            setTimeout(loadSocialScripts, 100);
            setTimeout(() => syncFreshPostsInBackground(), 60);
        } else {
            // Cold load (or forced refresh)
            return loadMorePosts(true);
        }
    }
    window.initLiveFeed = initLiveFeed;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiveFeed);
    } else {
        initLiveFeed();
    }
    document.addEventListener('turbo:load', () => {
        if (document.getElementById('live-feed')) {
            initLiveFeed();
        }
    });
})();
