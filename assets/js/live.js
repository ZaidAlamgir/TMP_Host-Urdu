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

        // --- Live Post Like Handler ---
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const postId = likeBtn.dataset.postId;
            if (!postId || postId === "undefined" || !likeBtn.closest('#live-feed, #live-feed-persistence-wrapper, #pinned-post-container, .live-post')) {
                return;
            }
            e.preventDefault();
            const postIdStr = String(postId);
            const postElement = document.getElementById(`post-${postId}`);
            const likedPosts = new Set(safeJSONParse(localStorage.getItem('likedLivePosts'), []));
            const isCurrentlyLiked = likedPosts.has(postIdStr);
            const isNowLiked = !isCurrentlyLiked;
            if (isNowLiked) {
                likeBtn.classList.add('is-liked');
                likedPosts.add(postIdStr);
            } else {
                likeBtn.classList.remove('is-liked');
                likedPosts.delete(postIdStr);
            }
            likeBtn.classList.remove('animate-pop');
            void likeBtn.offsetWidth;
            likeBtn.classList.add('animate-pop');
            localStorage.setItem('likedLivePosts', JSON.stringify(Array.from(likedPosts)));
            if (postElement) {
                const likeCountSpan = postElement.querySelector(`#like-count-${postId}`);
                if (likeCountSpan) {
                    let currentCount = parseInt(likeCountSpan.textContent.replace(/,/g, '')) || 0;
                    const newCount = isNowLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
                    animateCountUp(likeCountSpan, currentCount, newCount, 300);
                }
            }
            const action = isNowLiked ? 'increment' : 'decrement';
            const ANALYTICS_WRITE_URL = 'https://data.tmpnews.com/feed.json'; 
            fetch(`${ANALYTICS_WRITE_URL}?log=like&post_id=${postId}&action=${action}&client_id=${localStorage.getItem('anonClientId')}`, { method: 'GET', cache: 'no-store' })
                .catch(error => {
                    console.error("Like sync failed.", error);
                    if (isNowLiked) {
                        likeBtn.classList.remove('is-liked');
                        likedPosts.delete(postIdStr);
                    } else {
                        likeBtn.classList.add('is-liked');
                        likedPosts.add(postIdStr);
                    }
                    localStorage.setItem('likedLivePosts', JSON.stringify(Array.from(likedPosts)));
                });
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
        document.addEventListener('turbo:before-visit', () => {
            sessionStorage.setItem('liveFeedScroll', window.scrollY);
        }, { once: true });
        const SUPABASE_URL = 'https://ofszjurrajwtbwlfckhi.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mc3pqdXJyYWp3dGJ3bGZja2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDk2MzgsImV4cCI6MjA3NDk4NTYzOH0.kKafp8dEL7V0Y10-oNbjluYblA03a0V_OqB9XOBd9SA';
        let supabaseClient;
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        const LIVE_FEED_URL = 'https://data.tmpnews.com/feed.json?lang=ur';
        const archiveBtn = document.getElementById('archive-btn');
        const noMorePostsMsg = document.getElementById('no-more-posts-msg');
        const INITIAL_LOAD_COUNT = 80; 
        const SUBSEQUENT_LOAD_COUNT = 80;
        const CACHE_KEY = 'cachedLiveFeed_ur_v7';
        const PREFETCH_KEY = 'prefetchedLiveFeed_ur_v7';
        const PREFETCH_TIMESTAMP_KEY = 'prefetchedLiveFeedTimestamp_ur_v7';
        const CACHE_TTL_MS = 15000; // 15 seconds max client cache validity

        // Detect if the user initiated a hard refresh or standard page reload
        const isPageReload = (function() {
            try {
                if (window.performance) {
                    if (performance.getEntriesByType) {
                        const nav = performance.getEntriesByType('navigation')[0];
                        if (nav && (nav.type === 'reload' || nav.type === 'back_forward')) {
                            return nav.type === 'reload';
                        }
                    }
                    if (performance.navigation && performance.navigation.type === 1) {
                        return true;
                    }
                }
            } catch(e) {}
            return false;
        })();
        const hasForcedQuery = window.location.search.includes('refresh') || 
                               window.location.search.includes('nocache') || 
                               window.location.hash.includes('refresh');

        // Immediately purge cache on reload or forced query
        if (isPageReload || hasForcedQuery) {
            sessionStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(PREFETCH_KEY);
            localStorage.removeItem(PREFETCH_TIMESTAMP_KEY);
        }

        try {
            sessionStorage.removeItem('cachedLiveFeed');
            sessionStorage.removeItem('cachedLiveFeed_ur_v2');
            sessionStorage.removeItem('cachedLiveFeed_ur_v3');
            sessionStorage.removeItem('cachedLiveFeed_ur_v4');
            sessionStorage.removeItem('cachedLiveFeed_ur_v5');
            sessionStorage.removeItem('cachedLiveFeed_ur_v6');
            localStorage.removeItem('prefetchedLiveFeed');
            localStorage.removeItem('prefetchedLiveFeed_ur_v2');
            localStorage.removeItem('prefetchedLiveFeed_ur_v3');
            localStorage.removeItem('prefetchedLiveFeed_ur_v4');
            localStorage.removeItem('prefetchedLiveFeed_ur_v5');
            localStorage.removeItem('prefetchedLiveFeed_ur_v6');
            localStorage.removeItem('prefetchedLiveFeedTimestamp');
            localStorage.removeItem('prefetchedLiveFeedTimestamp_ur_v2');
            localStorage.removeItem('prefetchedLiveFeedTimestamp_ur_v3');
            localStorage.removeItem('prefetchedLiveFeedTimestamp_ur_v4');
            localStorage.removeItem('prefetchedLiveFeedTimestamp_ur_v5');
            localStorage.removeItem('prefetchedLiveFeedTimestamp_ur_v6');
        } catch (e) {}

        function saveFeedToCache(data) {
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    posts: data
                }));
            } catch(e) {}
        }

        function getFeedFromCache() {
            const raw = sessionStorage.getItem(CACHE_KEY);
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

        let allPosts = []; 
        let loadedPostsCount = 0;
        const viewedPosts = new Set(safeJSONParse(sessionStorage.getItem('viewedLivePosts'), []));
        const likedPosts = new Set(safeJSONParse(localStorage.getItem('likedLivePosts'), []));
        const animatedPosts = new Set(safeJSONParse(sessionStorage.getItem('animatedLivePosts'), []));
        if (!localStorage.getItem('anonClientId')) { localStorage.setItem('anonClientId', 'anon-' + Date.now() + Math.random().toString(36).substring(2, 9)); }
        
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
                    let captionHTML = img.caption ? `<p class="media-caption">${img.caption}</p>` : '';
                    sliderHtml = `<div class="my-4"><img src="${img.src}" alt="${img.caption}" class="my-0 mx-auto rounded-none">${captionHTML}</div>`;
                } else {
                    // --- UPDATED: YouTube Style Peek-A-Boo Carousel ---
                    // Added cursor: grab to the track, and draggable="false" to images
                    sliderHtml = `
                    <div class="image-carousel-container" style="position: relative; max-width: 100%; margin: 1.5rem 0;">
                        <div class="image-counter" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; z-index: 10; pointer-events: none; backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            1/${images.length}
                        </div>
                        <div class="carousel-track" onscroll="window.updateCarouselCounter(this, ${images.length})" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; gap: 8px; padding-right: 10%; cursor: grab;">
                            ${images.map((img, i) => `
                                <div class="carousel-slide" style="flex: 0 0 92%; scroll-snap-align: start; position: relative; background: #111; display: flex; flex-direction: column; justify-content: center; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <img src="${img.src}" alt="${img.caption}" draggable="false" class="my-0 mx-auto rounded-none" style="width: 100%; max-height: 60vh; display: block; object-fit: contain;">
                                    ${img.caption ? `<div style="background: white; padding: 12px;"><p class="media-caption" style="margin: 0; font-size: 0.85rem; color: var(--text-muted); text-align: left;">${img.caption}</p></div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <style>.carousel-track::-webkit-scrollbar { display: none; }</style>
                    </div>`;
                }
                placeholders.push(sliderHtml);
                let pIndex = placeholders.length - 1;
                
                // Replace ONLY the first instance with the carousel, delete the rest
                tempContent = tempContent.replace(/__IMG_TOKEN__/g, () => {
                    if (!replacedFirst) {
                        replacedFirst = true;
                        return `\n\n__PLACEHOLDER_${pIndex}__\n\n`;
                    }
                    return ''; 
                });
            }

            // 1. --- NEW HTML PROTECTION PASS ---
            const htmlBlocks = [
                /<div class="embed-container">[\s\S]*?<\/div>\s*<\/div>/gi,
                /<div class="telegram-embed-placeholder"[^>]*>[\s\S]*?<\/div>/gi,
                /<div class="table-container[^>]*>[\s\S]*?<\/table><\/div>/gi,
                /<a href="[^"]+" class="button"[^>]*>[\s\S]*?<\/a>/gi
            ];

            htmlBlocks.forEach(pattern => {
                tempContent = tempContent.replace(pattern, match => {
                    let styledMatch = match
                        .replace(/<div class="embed-container">/gi, '<div class="my-4" style="display: flex; flex-direction: column; align-items: center; width: 100%;">')
                        .replace(/<div class="embed-caption">/gi, '<p class="media-caption" style="width: 100%;">')
                        .replace(/<\/div>\s*<\/div>/gi, '</p></div>') 
                        .replace(/class="button"/gi, 'class="professional-btn" style="display: inline-block; text-decoration: none; width: auto; min-width: 200px; margin: 1.5rem 0;"');
                    
                    placeholders.push(styledMatch);
                    return `\n\n__PLACEHOLDER_${placeholders.length - 1}__\n\n`;
                });
            });

            // 2. --- LEGACY JUNK CLEANER (DO NOT REMOVE) ---
            tempContent = tempContent
                .replace(/&nbsp;/gi, ' ')  
                .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n\n') 
                .replace(/<div[^>]*>/gi, '\n\n')           
                .replace(/<\/div>/gi, '')                 
                .replace(/<br\s*\/?>/gi, '\n')             
                .replace(/\n{3,}/g, '\n\n')                
                .trim();                                   

            // 3. --- LEGACY MARKDOWN EXTRACTION ---
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
                        case 'link-button': htmlBlock = `<div class="my-4 text-center"><a href="${url}" target="_blank" class="professional-btn" style="display: inline-block; text-decoration: none; width: auto; min-width: 200px;">${socialDesc || 'Open Link'} <i class="fas fa-external-link-alt ml-2"></i></a></div>`; break;
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

        // Function to find placeholders and inject the Telegram widget / responsive embed
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
        function extractLangContent(raw, lang = 'ur') {
            if (!raw) return '';
            const tagMap = {
                'ur': ['urdu', 'ur'],
                'hi': ['hindi', 'hi'],
                'en': ['english', 'en']
            };
            const tags = tagMap[lang] || [lang];

            // 1. Try XML-style tags like <urdu>...</urdu> or <ur>...</ur>
            for (const t of tags) {
                const tagRegex = new RegExp(`(?:<${t}[^>]*>)([\\s\\S]*?)(?:<\\/${t}>|(?=<(?:hindi|hi|urdu|ur|english|en)|<!--|$))`, 'i');
                const match = raw.match(tagRegex);
                if (match && match[1].trim()) {
                    let clean = match[1].trim();
                    clean = clean.replace(/<(?:hindi|hi|english|en)[^>]*>[\s\S]*?<\/(?:hindi|hi|english|en)>/gi, '');
                    clean = clean.replace(/<!--(?:hindi|hi|english|en)-->[\s\S]*?<!--\/(?:hindi|hi|english|en)-->/gi, '');
                    clean = clean.replace(/<\/?(?:hindi|hi|urdu|ur|english|en)[^>]*>/gi, '');
                    clean = clean.replace(/<!--\/?(?:hindi|hi|urdu|ur|english|en)-->/gi, '');
                    return clean.trim();
                }
            }

            // 2. Try HTML comments like <!--ur-->...<!--/ur-->
            for (const t of tags) {
                const commentRegex = new RegExp(`<!--${t}-->([\\s\\S]*?)<!--\\/${t}-->`, 'i');
                const match = raw.match(commentRegex);
                if (match && match[1].trim()) {
                    let clean = match[1].trim();
                    clean = clean.replace(/<(?:hindi|hi|english|en)[^>]*>[\s\S]*?<\/(?:hindi|hi|english|en)>/gi, '');
                    clean = clean.replace(/<!--(?:hindi|hi|english|en)-->[\s\S]*?<!--\/(?:hindi|hi|english|en)-->/gi, '');
                    clean = clean.replace(/<\/?(?:hindi|hi|urdu|ur|english|en)[^>]*>/gi, '');
                    clean = clean.replace(/<!--\/?(?:hindi|hi|urdu|ur|english|en)-->/gi, '');
                    return clean.trim();
                }
            }

            // 3. For English ONLY (when requested explicitly):
            if (lang === 'en') {
                let clean = raw;
                clean = clean.replace(/<(?:hindi|hi|urdu|ur)[^>]*>[\s\S]*?<\/(?:hindi|hi|urdu|ur)>/gi, '');
                clean = clean.replace(/<!--(?:hindi|hi|urdu|ur)-->[\s\S]*?<!--\/(?:hindi|hi|urdu|ur)-->/gi, '');
                clean = clean.replace(/<\/?(?:english|en)>/gi, '');
                clean = clean.replace(/<!--\/?(?:english|en)-->/gi, '');
                return clean.trim();
            }

            // Fallback for standalone media embeds (like Telegram, images, videos) that have no text story to translate
            const hasMediaTag = /telegram-embed-placeholder|data-tg-post|<img|twitter-tweet|iframe/i.test(raw);
            const hasExplicitOtherLang = /<(?:hindi|hi)>|<!--(?:hindi|hi)-->/i.test(raw);
            const textOnly = raw.replace(/<[^>]*>/g, '').trim();
            // If it is pure media without explicit Hindi block and without long English body text (< 60 chars, e.g. generic caption)
            if (hasMediaTag && !hasExplicitOtherLang && textOnly.length < 60) {
                let clean = raw.replace(/<(?:hindi|hi|english|en)[^>]*>[\s\S]*?<\/(?:hindi|hi|english|en)>/gi, '');
                clean = clean.replace(/<!--(?:hindi|hi|english|en)-->[\s\S]*?<!--\/(?:hindi|hi|english|en)-->/gi, '');
                return clean.trim();
            }

            // For Urdu: if no translation block exists, NEVER leak raw text or English/Hindi!
            return '';
        }

        function hasUrduTranslation(postData) {
            if (!postData) return false;
            // Native Urdu entry from new sync architecture
            if (postData.lang === 'ur') return true;
            // Exclude child translations belonging to other languages
            if (postData.lang && postData.lang !== 'ur' && postData.parent_id) return false;
            if (postData.lang === 'hi') return false;

            const urHeadline = extractLangContent(postData.headline, 'ur');
            const urContent = extractLangContent(postData.content, 'ur');

            const cleanHeadline = (urHeadline || '').replace(/<[^>]*>/g, '').trim();
            const cleanContent = (urContent || '').replace(/<[^>]*>/g, '').trim();

            const devanagari = /[\u0900-\u097F]/;
            const arabicUrdu = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
            const textOnly = (cleanHeadline + ' ' + cleanContent).trim();

            // Strictly exclude if visible text has Hindi Devanagari script and NO Urdu
            if (devanagari.test(textOnly) && !arabicUrdu.test(textOnly)) {
                return false;
            }

            const hasUrdu = arabicUrdu.test(cleanHeadline) || arabicUrdu.test(cleanContent);
            const hasMedia = Boolean(urContent && (
                urContent.includes('<img') || 
                urContent.includes('telegram-embed-placeholder') || 
                urContent.includes('data-tg-post') || 
                urContent.includes('telegram') || 
                urContent.includes('twitter') || 
                urContent.includes('iframe')
            ));

            return Boolean(hasUrdu || hasMedia);
        }

        function renderPost(postData, container, insertAtTop = false) {
            // STRICT RULE: If the post does not contain an Urdu translation, completely hide it
            if (!hasUrduTranslation(postData)) {
                return;
            }

            const postHeadline = postData.lang === 'ur' ? (postData.headline || '') : extractLangContent(postData.headline, 'ur');
            const postContent = postData.lang === 'ur' ? (postData.content || '') : extractLangContent(postData.content, 'ur');

            if (!postHeadline && !postContent) {
                return;
            }

            const postElement = document.createElement('div');
            postElement.className = 'live-post';
            postElement.id = `post-${postData.id}`; 
            if (insertAtTop) postElement.classList.add('new-post-animation');
            if (postData.is_pinned) postElement.classList.add('is-pinned');

            let tagsHTML = postData.tags?.length > 0 ? '<div class="tags-container">' + postData.tags.map(tag => `<a href="#" class="tag-badge">#${tag}</a>`).join('') + '</div>' : '';
            let pinnedBadgeHTML = postData.is_pinned ? `<span class="pinned-badge"><i class="fas fa-thumbtack fa-xs"></i><span class="ml-1.5">پِن شدہ</span></span>` : '';
            const logoSVG = `<svg class="post-author-logo" viewBox="0 0 200 200" aria-hidden="true"><rect x="50" y="50" width="100" height="100" class="square"/><circle cx="100" cy="100" r="80" fill="none" stroke-width="8" class="static-circle"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="tmp-text">TMP</text></svg>`;
            const formattedDate = new Date(postData.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            const initialViewCount = postData.view_count || 0;
            const initialLikeCount = postData.like_count || 0;

            const isAlreadyLiked = likedPosts.has(String(postData.id));
            const likeBtnClass = isAlreadyLiked ? "like-btn is-liked" : "like-btn";

            const headlineHTML = postHeadline ? `<h2 class="live-post-headline">${postHeadline}</h2>` : '';
            const bodyHTML = postContent ? `<div class="post-body">${parseContent(postContent)}</div>` : '';

            postElement.innerHTML = `<div class="live-post-content">
                <div class="live-post-meta">
                    <div class="live-post-author-group">${logoSVG}<span class="live-post-author">${postData.author_name}</span></div>
                    <span class="live-post-time">${formattedDate}</span>${pinnedBadgeHTML}
                </div>
                ${headlineHTML}
                ${bodyHTML}
                ${tagsHTML}
                <div class="post-footer">
                    <div class="post-stats" data-post-id="${postData.id}">
                        <button class="${likeBtnClass}" data-post-id="${postData.id}" title="Like">
                            <i class="fas fa-star"></i>
                        </button>
                        <span id="like-count-${postData.id}" class="like-count" style="margin-left:0.5rem;">${initialLikeCount}</span>
                        <div class="stat-item" style="margin-left: 1rem;"><i class="fas fa-eye" style="color:var(--text-muted);"></i><span id="view-count-${postData.id}" style="margin-left:0.5rem;">${initialViewCount}</span></div>
                    </div>
                    <button class="share-btn" data-post-id="${postData.id}" data-post-headline="${postHeadline || 'Live Update'}"><i class="fas fa-share-alt mr-2"></i>شیئر</button>
                </div>
            </div>`;
            if (insertAtTop) { container.prepend(postElement); } else { container.appendChild(postElement); }
            renderTelegramEmbeds();
            incrementViewCount(postData.id);
            setTimeout(() => { 
                const likeCountSpan = document.getElementById(`like-count-${postData.id}`);
                const viewCountSpan = document.getElementById(`view-count-${postData.id}`);
                if (!animatedPosts.has(postData.id)) {
                    if(likeCountSpan) animateCountUp(likeCountSpan, 0, initialLikeCount);
                    if(viewCountSpan) animateCountUp(viewCountSpan, 0, initialViewCount);
                    animatedPosts.add(postData.id);
                    sessionStorage.setItem('animatedLivePosts', JSON.stringify(Array.from(animatedPosts)));
                }
            }, 100);
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
                     // Stale-While-Revalidate: Return cached posts for instant render, but revalidate immediately in background
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
                 const response = await fetch(fetchUrl, fetchOptions); 
                 if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                 const data = await response.json();
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

        let isSyncing = false;
        async function syncFreshPostsInBackground() {
            if (isSyncing) return;
            isSyncing = true;
            try {
                const response = await fetch(LIVE_FEED_URL, {
                    cache: 'default'
                });
                if (!response.ok) return;
                const freshData = await response.json();
                if (!Array.isArray(freshData)) return;

                saveFeedToCache(freshData);
                const freshUrdu = freshData.filter(p => hasUrduTranslation(p));

                // 1. Pinned post sync
                const freshPinned = freshUrdu.find(p => p.is_pinned);
                const currentPinnedEl = pinnedPostContainer.querySelector('.live-post');
                const currentPinnedId = currentPinnedEl ? currentPinnedEl.id.replace('post-', '') : null;

                if (freshPinned) {
                    if (!currentPinnedId || String(freshPinned.id) !== String(currentPinnedId)) {
                        pinnedPostContainer.innerHTML = '';
                        renderPost(freshPinned, pinnedPostContainer, false);
                    }
                } else if (currentPinnedEl) {
                    pinnedPostContainer.innerHTML = '';
                }

                // 2. Regular posts sync (prepend any new posts)
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
                        for (let i = newPostsToPrepend.length - 1; i >= 0; i--) {
                            renderPost(newPostsToPrepend[i], liveFeed, true);
                            allPosts.unshift(newPostsToPrepend[i]);
                            loadedPostsCount++;
                        }
                        setTimeout(loadSocialScripts, 200);
                    }
                } else if (allPosts.length === 0 && freshRegular.length > 0) {
                    allPosts = freshRegular;
                    loadMorePosts(true);
                }
            } catch(err) {
                console.warn('Background live sync error:', err);
            } finally {
                isSyncing = false;
            }
        }

        async function loadMorePosts(isFullRefresh = false) {
             const loadMoreBtn = document.getElementById('load-more-btn');
             if (!loadMoreBtn) return;
             loadedPostsCount = document.querySelectorAll('#live-feed .live-post').length;
             if (isFullRefresh) {
                animatedPosts.clear();
                sessionStorage.removeItem('animatedLivePosts');
                pinnedPostContainer.innerHTML = '';
                liveFeed.innerHTML = '';
                loadedPostsCount = 0;
             }
             loadMoreBtn.disabled = true;
             loadMoreBtn.textContent = 'لوڈ ہو رہا ہے...';
             if (allPosts.length === 0 || isFullRefresh) {
                 const fullFeed = await fetchFullFeed(isFullRefresh);
                 const urduFeed = fullFeed.filter(p => hasUrduTranslation(p));
                 if (urduFeed.length === 0) {
                    liveFeed.innerHTML = '';
                    loadMoreBtn.style.display = 'none'; 
                    noMorePostsMsg.textContent = "فی الحال کوئی لائیو اپڈیٹ دستیاب نہیں ہے۔"; 
                    noMorePostsMsg.style.display = 'block';
                    return;
                 }
                 const pinned = urduFeed.find(p => p.is_pinned);
                 if (pinned && (isFullRefresh || pinnedPostContainer.innerHTML.trim() === '')) {
                     pinnedPostContainer.innerHTML = '';
                     renderPost(pinned, pinnedPostContainer, false);
                 }
                 allPosts = urduFeed.filter(p => !p.is_pinned); 
             }
            if (loadedPostsCount === 0 && liveFeed.innerHTML.includes('loader')) {
                liveFeed.innerHTML = ''; 
            }
            if (loadedPostsCount >= allPosts.length) {
                loadMoreBtn.style.display = 'none'; 
                archiveBtn.style.display = 'inline-block'; 
                noMorePostsMsg.style.display = 'block';
                return;
            }
            const startIndex = loadedPostsCount;
            const limit = (loadedPostsCount === 0) ? INITIAL_LOAD_COUNT : SUBSEQUENT_LOAD_COUNT;
            const endIndex = startIndex + limit;
            const batch = allPosts.slice(startIndex, endIndex);
            batch.forEach(post => renderPost(post, liveFeed, false));
            loadedPostsCount += batch.length;
            loadSocialScripts();
            if (startIndex === 0) {
                const savedScroll = sessionStorage.getItem('liveFeedScroll');
                if (savedScroll) {
                    setTimeout(() => window.scrollTo(0, parseInt(savedScroll)), 50);
                }
            }
            if (loadedPostsCount >= allPosts.length) {
                loadMoreBtn.style.display = 'none'; archiveBtn.style.display = 'inline-block'; noMorePostsMsg.style.display = 'block';
            } else {
                loadMoreBtn.disabled = false; 
                loadMoreBtn.textContent = 'پچھلی اپڈیٹس لوڈ کریں'; 
                loadMoreBtn.style.display = 'inline-block'; 
                archiveBtn.style.display = 'none'; 
                noMorePostsMsg.style.display = 'none';
            }
        }
        window.triggerLoadMoreLivePosts = (e) => {
            if(e) e.preventDefault();
            loadMorePosts(false);
        };
        
        if (window._activeLiveChannel && supabaseClient) {
            try { supabaseClient.removeChannel(window._activeLiveChannel); } catch(e) {}
        }
        if (typeof supabase !== 'undefined' && supabaseClient) {
            window._activeLiveChannel = supabaseClient.channel('live_updates_listener_ur_' + Date.now())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'live_posts' }, (payload) => {
                    const newPostData = payload.new;
                    
                    // Strictly ignore posts that do not belong to Urdu
                    if (newPostData && (newPostData.lang === 'hi' || (newPostData.parent_id && newPostData.lang !== 'ur'))) {
                        return;
                    }
                    if (newPostData && newPostData.lang === 'en' && !hasUrduTranslation(newPostData)) {
                        return;
                    }

                    sessionStorage.removeItem(CACHE_KEY); 
                    localStorage.removeItem(PREFETCH_KEY); 
                    
                    if (payload.eventType === 'INSERT') {
                        if (hasUrduTranslation(newPostData)) {
                            if (!newPostData.is_pinned) {
                                renderPost(newPostData, liveFeed, true); 
                                allPosts.unshift(newPostData);
                                loadedPostsCount++;
                                setTimeout(loadSocialScripts, 200); 
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
                                    renderPost(newPostData, liveFeed, true);
                                    allPosts.unshift(newPostData);
                                    loadedPostsCount++;
                                    setTimeout(loadSocialScripts, 200);
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
                                
                                const newHl = newPostData.lang === 'ur' ? (newPostData.headline || '') : extractLangContent(newPostData.headline, 'ur');
                                const newCnt = newPostData.lang === 'ur' ? (newPostData.content || '') : extractLangContent(newPostData.content, 'ur');
                                
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
                                    const currentLikes = parseInt(likeCountSpan.textContent.replace(/,/g, '')) || 0;
                                    animateCountUp(likeCountSpan, currentLikes, newPostData.like_count);
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
                        loadedPostsCount = document.querySelectorAll('#live-feed .live-post').length; 
                        if (payload.old.is_pinned) loadMorePosts(true);
                    }
                }).subscribe();
        } else {
            console.warn("Supabase SDK blocked or failed to load. Real-time live updates disabled.");
        }
        
        // Auto-refresh fallback (e.g. if Supabase websocket gets dropped or blocked):
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

        const totalPostsOnScreen = document.querySelectorAll('#live-feed .live-post').length;
        if (isPageReload || hasForcedQuery) {
            loadMorePosts(true);
        } else if (totalPostsOnScreen > 0) {
            const cached = getFeedFromCache();
            if (cached && Array.isArray(cached.posts)) { 
                const fullFeed = cached.posts;
                const loadMoreBtn = document.getElementById('load-more-btn');
                allPosts = fullFeed.filter(p => !p.is_pinned && hasUrduTranslation(p)); 
                
                if (allPosts.length > 0 && totalPostsOnScreen >= allPosts.length) {
                     if(loadMoreBtn) loadMoreBtn.style.display = 'none'; archiveBtn.style.display = 'inline-block'; noMorePostsMsg.style.display = 'block';
                } else {
                     if(loadMoreBtn) { loadMoreBtn.style.display = 'inline-block'; loadMoreBtn.disabled = false; loadMoreBtn.textContent = 'پچھلی اپڈیٹس لوڈ کریں'; }
                }
            }
            const stuckLoader = liveFeed.querySelector('.loader');
            if (stuckLoader) stuckLoader.remove();
            const savedScroll = sessionStorage.getItem('liveFeedScroll');
            if (savedScroll) {
                setTimeout(() => window.scrollTo(0, parseInt(savedScroll)), 0);
            }
            setTimeout(loadSocialScripts, 100);
            setTimeout(() => syncFreshPostsInBackground(), 50);
        } else {
            setTimeout(() => loadMorePosts(false), 100);
        }
    }
    initLiveFeed();
})();