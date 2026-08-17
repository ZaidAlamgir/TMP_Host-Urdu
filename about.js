(function() {
    function initAboutPage() {
        try {
            const header = document.querySelector('.header');
            const heroSection = document.querySelector('.hero-about');
            const fadeElements = document.querySelectorAll('.fade-in');

            // Safety Check: If we are not on the About page, stop.
            if (!heroSection) {
                // Clean up scroll handler if navigating away
                window.removeEventListener('scroll', window.aboutScrollHandler);
                if (header) header.classList.remove('header-solid');
                return;
            }

            // --- Animation Logic ---
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            fadeElements.forEach(el => {
                el.classList.remove('visible'); 
                observer.observe(el);
            });

            // --- Header Logic ---
            if (header) {
                window.removeEventListener('scroll', window.aboutScrollHandler);
                
                window.aboutScrollHandler = () => {
                    try {
                        const currentHero = document.querySelector('.hero-about');
                        const currentHeader = document.querySelector('.header');
                        if (currentHero && currentHeader) {
                            if (window.scrollY > currentHero.offsetHeight - currentHeader.offsetHeight) {
                                currentHeader.classList.add('header-solid');
                            } else {
                                currentHeader.classList.remove('header-solid');
                            }
                        }
                    } catch (err) {
                        console.warn("Error in about scroll handler:", err);
                    }
                };

                window.addEventListener('scroll', window.aboutScrollHandler);
                window.aboutScrollHandler(); // Run once immediately
            }
        } catch (e) {
            console.error("Error in initAboutPage:", e);
        }
    }

    // Trigger on Standard Load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAboutPage);
    } else {
        initAboutPage();
    }

    // Trigger on Turbo Load
    document.addEventListener('turbo:load', initAboutPage);
    document.addEventListener('turbolinks:load', initAboutPage);

    // Clean up when page transitions away
    document.addEventListener('turbo:before-cache', () => {
        window.removeEventListener('scroll', window.aboutScrollHandler);
        const header = document.querySelector('.header');
        if (header) header.classList.remove('header-solid');
    });
})();